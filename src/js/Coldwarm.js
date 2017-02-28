import CSInterface from 'csinterface';
import { ColorGrid, ColorGridColor } from './ColorGrid';


export default class Coldwarm {
  static init() {
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this._csInterface = new CSInterface();
    this._stringIdCache = {};
    this._typeIdCache = {};
    this._grid = new ColorGrid('#coldwarm-left-panel', 5);
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
    this.register(true).then(() => console.log('Done'));
  }

  get csInterface() {
    return this._csInterface;
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

  async getColor(type) {
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

  async convertTypeId(id) {
    return new Promise((resolve) => {
      if (this._typeIdCache[id]) {
        resolve(this._typeIdCache[id]);
        return;
      }
      this.csInterface.evalScript(`typeIDToStringID(${Number(id)});`, (converted) => {
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
      this.csInterface.evalScript(`charIDToTypeID('${id.replace(/'/g, '\\\'')}');`, (converted) => {
        this._stringIdCache[id] = converted;
        this._typeIdCache[converted] = id;
        resolve(converted);
      });
    });
  }

  photoshopCallback(e) {
    const splitData = (e.data || '').split(',');

    if (!splitData) {
      console.error('No data returned from photoshopCallback');
      return;
    }

    this.convertTypeId(splitData[0])
        .then((id) => {
          switch (id.trim()) {
            case 'set':
            case 'setd':
            case 'dlDocInfoChanged':
              this.refreshColor();
              break;
            default:
              console.log(`Ignoring event: ${id}`);
              break;
          }
        });
  }

  async register(inOn) {
    let event;
    if (inOn) {
      event = new CSEvent('com.adobe.PhotoshopRegisterEvent', 'APPLICATION');
    } else {
      event = new CSEvent('com.adobe.PhotoshopUnRegisterEvent', 'APPLICATION');
    }
    event.extensionId = 'codes.patrick.coldwarm-ng';

    event.data = (await Promise.all([
      this.convertStringId('set'),
      this.convertStringId('setd'),
      this.convertStringId('dlDocInfoChanged')
    ])).join(',');
    this.csInterface.addEventListener('PhotoshopCallback', e => this.photoshopCallback(e));
    this.csInterface.dispatchEvent(event);
  }
}
