import CSInterface from 'csinterface';
import themeManager from 'thememanager';
import { ColorGrid, ColorGridColor } from './ColorGrid';


const ColorChangeBindEvents = [
  'set ',
  'setd',
  'Exch',
  'Rset'
];

export default class Coldwarm {
  static init() {
    themeManager.init();
    Coldwarm.instance = new Coldwarm();
  }


  static getEventIdFromJsonEvent(eventString) {
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

  static getEventIdFromOldEvent(eventData) {
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

  constructor() {
    this._csInterface = new CSInterface();
    this._appVersion = null;
    this._stringIdCache = {};
    this._typeIdCache = {};
    this._grid = new ColorGrid('#coldwarm-left-panel', color => this.setForegroundColor(color));
    this.register()
        .then(async () => this.refreshColor())
        .then(() => console.log(`Initialized ${this.csInterface.getExtensionID()}`));
  }

  get csInterface() {
    return this._csInterface;
  }

  get appVersion() {
    if (this._appVersion === null) {
      const versionNumber = this.csInterface.getHostEnvironment().appVersion;
      if (!versionNumber) {
        this._appVersion = {
          major: 0,
          minor: 0,
          patch: 0
        };
        console.error('Failed to get appVersion from host environment!');
      } else {
        const parsed = /^(\d+)(?:\.(\d+)(?:\.(\d+))?)?.*?$/.exec(versionNumber);
        if (!parsed) {
          this._appVersion = {
            major: 0,
            minor: 0,
            patch: 0
          };
          console.error(`Failed to parse appVersion ${versionNumber}`);
        } else {
          this._appVersion = {
            major: Number(parsed[1]),
            minor: Number(parsed[2] || '0'),
            patch: Number(parsed[3] || '0')
          };
        }
      }
    }

    return this._appVersion;
  }

  get grid() {
    return this._grid;
  }

  async refreshColor() {
    try {
      const color = await this.getForegroundColor();
      this.grid.color = new ColorGridColor(color.red, color.green, color.blue, color.alpha);
    } catch (err) {
      console.error('Error loading color: ');
      console.error(err);
    }
  }

  async getForegroundColor() {
    return this.getColor('foreground');
  }

  async getBackgroundColor() {
    return this.getColor('background');
  }

  async getColor(type = 'foreground') {
    return new Promise((resolve, reject) => {
      this.csInterface.evalScript(`getColor('${type}');`, (color) => {
        if (!color) {
          reject('No color returned');
          return;
        }
        if (color === 'EvalScript error.') {
          reject('Unspecified error occurred');
          return;
        }
        resolve(JSON.parse(color));
      });
    });
  }

  async setForegroundColor(color) {
    return this.setColor('foreground', color);
  }

  async setBackgroundColor(color) {
    return this.setColor('background', color);
  }

  async setColor(type = 'foreground', color = null) {
    return new Promise((resolve) => {
      const toSet = color || this.grid.color;
      console.log(`Selected color: ${toSet.toRoundedRGBA().join(', ')}`);
      this.csInterface.evalScript(`setColor('${type}', ${toSet.toRoundedRGBA().join(', ')});`, () => {
        resolve();
      });
    });
  }

  async convertTypeId(id) {
    return new Promise((resolve) => {
      if (this._typeIdCache[id]) {
        resolve(this._typeIdCache[id]);
        return;
      }
      this.csInterface.evalScript(`app.typeIDToStringID(${Number(id)});`, (converted) => {
        this._stringIdCache[converted] = id;
        this._typeIdCache[id] = converted;
        resolve(converted);
      });
    });
  }

  async convertStringId(id) {
    return new Promise((resolve) => {
      if (this._stringIdCache[id]) {
        resolve(this._stringIdCache[id]);
        return;
      }
      this.csInterface.evalScript(`charIDToTypeID('${id}');`, (converted) => {
        if (converted === 'EvalScript error.') {
          console.error(`WARN: Got ${converted} for ID ${id}`);
          resolve(converted);
          return;
        }
        this._stringIdCache[id] = converted;
        this._typeIdCache[converted] = id;
        resolve(converted);
      });
    });
  }

  photoshopCallback(e) {
    try {
      const eventID = this.appVersion.major >= 16 ? Coldwarm.getEventIdFromJsonEvent(e.data) :
                                                    Coldwarm.getEventIdFromOldEvent(e.data);


      this.convertTypeId(eventID)
          .then((id) => {
            if (ColorChangeBindEvents.find(ev => id.trim() === ev.trim())) {
              this.refreshColor();
            } else {
              console.log(`Ignoring unexpected event: ${id}`);
            }
          });
    } catch (err) {
      console.error('Error processing photoshop callback:', err);
    }
  }


  makePersistent() {
    const event = new CSEvent('com.adobe.PhotoshopPersistent', 'APPLICATION');
    event.extensionId = this.csInterface.getExtensionID();
    this.csInterface.dispatchEvent(event);
  }

  async register() {
    this.makePersistent();

    if (this.appVersion.major >= 16) {
      // New way, as of Photoshop 2015
      this.csInterface.addEventListener(`com.adobe.PhotoshopJSONCallback${this.csInterface.getExtensionID()}`,
                                        e => this.photoshopCallback(e));
    } else {
      // Old way
      this.csInterface.addEventListener('com.adobe.PhotoshopCallback}',
                                        e => this.photoshopCallback(e));
    }

    const types = (await Promise.all(ColorChangeBindEvents.map(str => this.convertStringId(str))));

    types.forEach((curEvent) => {
      if (curEvent === 'EvalScript error.') {
        return;
      }
      const event = new CSEvent('com.adobe.PhotoshopRegisterEvent', 'APPLICATION');
      event.extensionId = this.csInterface.getExtensionID();
      event.data = `${curEvent}`;
      this.csInterface.dispatchEvent(event);
    });
  }
}
