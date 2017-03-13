// @flow

import ColorGridColor from './ColorGridColor';
import { RGBColorInfo } from './ColorTypes';

const ColorChangeBindEvents = [
  'set ',
  'setd',
  'Exch',
  'Rset'
];


export type PhotoshopColorType = 'foreground' | 'background';

export type ContextMenu = {
  id?: string,
  label: string,
  enabled?: bool,
  checkable?: bool,
  checked?: bool,
  icon?: string,
  menu?: Array<ContextMenu>
};

export default class Backend {
  static getEventIdFromJsonEvent(eventString: ?string): string {
    if (!eventString) {
      throw new Error('No data returned from photoshopCallback');
    }
    const splitData = (eventString || '').replace(/ver[1],/, '');

    if (!splitData) {
      throw new Error('No data returned from photoshopCallback');
    }

    const parsedData = JSON.parse(splitData);

    if (!parsedData.eventID) {
      throw new Error('Invalid data returned from photoshopCallback');
    }

    return parsedData.eventID;
  }

  static getEventIdFromOldEvent(eventData: ?string): string {
    if (!eventData) {
      throw new Error('No data returned from photoshopCallback');
    }
    const splitData = (eventData || '').split(',');

    if (!splitData) {
      throw new Error('No data returned from photoshopCallback');
    }

    const eventId = splitData[0];

    if (!eventId) {
      throw new Error('Invalid data returned from photoshopCallback');
    }

    return eventId;
  }

  _csInterface: CSInterface = new CSInterface();
  _appVersion: Version;
  _extensionId: string;
  _stringIdCache: Map<string, number> = new Map();
  _typeIdCache: Map<number, string> = new Map();

  onColorChange: ?Function = null;

  constructor(onColorChange?: Function) {
    this.onColorChange = onColorChange;
  }

  get extensionId(): string {
    if (!this._extensionId) {
      this._extensionId = this.csInterface.getExtensionID();
    }
    return this._extensionId;
  }

  get csInterface(): CSInterface {
    return this._csInterface;
  }

  get appVersion(): Version {
    if (this._appVersion) {
      return this._appVersion;
    }

    const versionNumber = this.csInterface.getHostEnvironment().appVersion;
    if (!versionNumber) {
      this._appVersion = {
        major: 0,
        minor: 0,
        micro: 0
      };
      console.error('Failed to get appVersion from host environment!');
      return this._appVersion;
    }

    const parsed = /^(\d+)(?:\.(\d+)(?:\.(\d+))?)?.*?$/.exec(versionNumber);
    if (!parsed) {
      this._appVersion = {
        major: 0,
        minor: 0,
        micro: 0
      };
      console.error(`Failed to parse appVersion ${versionNumber}`);
      return this._appVersion;
    }

    this._appVersion = {
      major: Number(parsed[1]),
      minor: Number(parsed[2] || '0'),
      micro: Number(parsed[3] || '0')
    };

    return this._appVersion;
  }

  getHostEnvironment(): HostEnvironment {
    return this.csInterface.getHostEnvironment();
  }

  getForegroundColor(): Promise<ColorGridColor> {
    return this.getColor('foreground');
  }

  getBackgroundColor(): Promise<ColorGridColor> {
    return this.getColor('background');
  }

  getColor(type: PhotoshopColorType = 'foreground'): Promise<ColorGridColor> {
    return new Promise((resolve, reject) => {
      this.csInterface.evalScript(`getColor('${type}');`, (color: string) => {
        if (!color) {
          reject('No color returned');
          return;
        }
        if (color === 'EvalScript error.') {
          reject('Unspecified error occurred');
          return;
        }
        const parsed: RGBColorInfo = JSON.parse(color);
        resolve(new ColorGridColor(parsed));
      });
    });
  }

  setForegroundColor(color: ColorGridColor): Promise<void> {
    return this.setColor('foreground', color);
  }

  setBackgroundColor(color: ColorGridColor): Promise<void> {
    return this.setColor('background', color);
  }

  setColor(type: PhotoshopColorType = 'foreground', color: ColorGridColor): Promise<void> {
    return new Promise((resolve) => {
      this.csInterface.evalScript(`setColor('${type}', ${JSON.stringify(color.color.toRgb())})`, () => resolve());
    });
  }

  convertTypeId(id: number | string): Promise<string> {
    return new Promise((resolve) => {
      const intId = parseInt(id, 10);

      const cached = this._typeIdCache.get(intId);
      if (cached !== null && cached !== undefined) {
        resolve(cached);
        return;
      }
      this.csInterface.evalScript(`app.typeIDToStringID(${intId});`, (converted: string) => {
        this._stringIdCache.set(converted, intId);
        this._typeIdCache.set(intId, converted);
        resolve(converted);
      });
    });
  }

  convertStringId(id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const cached = this._stringIdCache.get(id);
      if (cached !== null && cached !== undefined) {
        resolve(cached);
        return;
      }
      this.csInterface.evalScript(`charIDToTypeID('${id}');`, (converted: string) => {
        if (converted === 'EvalScript error.') {
          console.error(`WARN: Got ${converted} for ID ${id}`);
          reject(converted);
          return;
        }
        const numeric = parseInt(converted, 10);
        this._stringIdCache.set(id, numeric);
        this._typeIdCache.set(numeric, id);
        resolve(numeric);
      });
    });
  }

  registerThemeChangeHandler(handler: Function): void {
    this.csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, handler);
  }

  updateContextMenuItem(menuId: string, enabled?: bool = true, checked?: bool | number = false) {
    this.csInterface.updateContextMenuItem(menuId, enabled, !!checked);
  }

  setContextMenu(menu: ContextMenu | Array<ContextMenu>, onSelectedCallback: (id: string) => void) {
    let menuJSON: string;

    if (Array.isArray(menu)) {
      menuJSON = JSON.stringify({
        menu
      });
    } else {
      menuJSON = JSON.stringify({
        menu: [menu]
      });
    }

    this.csInterface.setContextMenuByJSON(menuJSON, onSelectedCallback);
  }

  photoshopCallback(e: CSEvent): void {
    this.processEvent(e)
        .catch((err) => {
          console.error('Error processing photoshop callback:', err);
        });
  }

  async processEvent(e: CSEvent): Promise<void> {
    const eventID = this.appVersion.major >= 16 ? Backend.getEventIdFromJsonEvent(e.data) :
                                                  Backend.getEventIdFromOldEvent(e.data);
    const idString = await this.convertTypeId(eventID);

    if (!ColorChangeBindEvents.find(ev => idString.trim() === ev.trim())) {
      console.log(`Ignoring unexpected event: ${idString}`);
      return;
    }

    if (this.onColorChange !== null && this.onColorChange !== undefined) {
      this.onColorChange();
    }
  }

  makePersistent(enable: bool = true): void {
    const event = enable ? new CSEvent('com.adobe.PhotoshopPersistent', 'APPLICATION')
                         : new CSEvent('com.adobe.PhotoshopUnPersistent', 'APPLICATION');
    event.extensionId = this.extensionId;
    this.csInterface.dispatchEvent(event);
  }

  async registerEvents(enable: bool = true): Promise<void> {
    const types = await Promise.all(ColorChangeBindEvents.map(async str => this.convertStringId(str)));

    types.forEach((curEvent) => {
      if (curEvent === 'EvalScript error.') {
        return;
      }
      const event = enable ? new CSEvent('com.adobe.PhotoshopRegisterEvent', 'APPLICATION')
                           : new CSEvent('com.adobe.PhotoshopUnRegisterEvent', 'APPLICATION');
      event.extensionId = this.extensionId;
      event.data = `${curEvent}`;
      this.csInterface.dispatchEvent(event);
    });
  }

  registerCallback(): void {
    if (this.appVersion.major >= 16) {
      // New way, as of Photoshop 2015
      this.csInterface.addEventListener(`com.adobe.PhotoshopJSONCallback${this.extensionId}`,
                                        e => this.photoshopCallback(e));
    } else {
      // Old way
      this.csInterface.addEventListener('com.adobe.PhotoshopCallback', e => this.photoshopCallback(e));
    }
  }

  async register(): Promise<void> {
    this.makePersistent();
    this.registerCallback();
    await this.registerEvents();
  }

  async unregister(): Promise<void> {
    this.makePersistent(false);
    await this.registerEvents(false);
  }

}
