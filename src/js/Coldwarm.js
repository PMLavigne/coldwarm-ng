import CSInterface from 'csinterface';
import { ColorGrid, ColorGridColor } from './ColorGrid';


export default class Coldwarm {
  static init() {
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this._csInterface = new CSInterface();
    this.csInterface.addEventListener('colorImported', e => this.colorImported(e));
    this._grid = new ColorGrid('#coldwarm-left-panel', 5);
    this.grid.color = new ColorGridColor(0x1D, 0xDF, 0xAB, 1);
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
  }

  get csInterface() {
    return this._csInterface;
  }


  get grid() {
    return this._grid;
  }

  getForegroundColor() {
    this.csInterface.evalScript('getForegroundColorRGB();');
  }

  colorImported(e) {
    console.log('Color imported: ');
    console.log(e);
  }
}
