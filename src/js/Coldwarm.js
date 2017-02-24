import CSInterface from 'csinterface';
import { ColorGrid, ColorGridColor } from './ColorGrid';
import { Settings } from './Settings';

export default class Coldwarm {
  static init() {
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this._settings = new Settings();
    this._csInterface = new CSInterface();
    this.settings.load();
    this._grid = new ColorGrid(this.settings, '#coldwarm-left-panel', 5);
    this.grid.color = new ColorGridColor(0x1D, 0xDF, 0xAB, 1);
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
  }

  get settings() {
    return this._settings;
  }

  get csInterface() {
    return this._csInterface;
  }

  get grid() {
    return this._grid;
  }
}
