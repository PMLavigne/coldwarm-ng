import CSInterface from 'csinterface';
import ColorGridColor from './ColorGridColor';

const ColorChangeBindEvents = [
  'set ',
  'setd',
  'Exch',
  'Rset'
];

export default class Backend {
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

  constructor(onColorChange = null) {
    this._csInterface = new CSInterface();
    this._appVersion = null;
    this._stringIdCache = {};
    this._typeIdCache = {};
    this.onColorChange = onColorChange;
  }

  get extensionId() {
    if (!this._extensionId) {
      this._extensionId = this.csInterface.getExtensionID();
    }
    return this._extensionId;
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
        const parsed = JSON.parse(color);
        resolve(new ColorGridColor(parsed.red, parsed.green, parsed.blue, parsed.alpha));
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
      this.csInterface.evalScript(`setColor('${type}', ${toSet.roundedRGBA.join(', ')});`, () => {
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
    this.processEvent(e)
        .catch((err) => {
          console.error('Error processing photoshop callback:', err);
        });
  }

  async processEvent(e) {
    const eventID = this.appVersion.major >= 16 ? Backend.getEventIdFromJsonEvent(e.data) :
                                                  Backend.getEventIdFromOldEvent(e.data);
    const idString = await this.convertTypeId(eventID);

    if (this.onColorChange) {
      if (ColorChangeBindEvents.find(ev => idString.trim() === ev.trim())) {
        this.onColorChange();
      } else {
        console.log(`Ignoring unexpected event: ${idString}`);
      }
    }
  }

  makePersistent(enable = true) {
    const event = enable ? new CSEvent('com.adobe.PhotoshopPersistent', 'APPLICATION')
                         : new CSEvent('com.adobe.PhotoshopUnPersistent', 'APPLICATION');
    event.extensionId = this.extensionId;
    this.csInterface.dispatchEvent(event);
  }

  async registerEvents(enable = true) {
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

  registerCallback() {
    if (this.appVersion.major >= 16) {
      // New way, as of Photoshop 2015
      this.csInterface.addEventListener(`com.adobe.PhotoshopJSONCallback${this.extensionId}`,
                                        e => this.photoshopCallback(e));
    } else {
      // Old way
      this.csInterface.addEventListener('com.adobe.PhotoshopCallback', e => this.photoshopCallback(e));
    }
  }

  async register() {
    this.makePersistent();
    this.registerCallback();
    await this.registerEvents();
  }

  async unregister() {
    this.makePersistent(false);
    await this.registerEvents(false);
  }

}
