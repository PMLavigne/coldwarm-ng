import CSInterface from 'csinterface';
import { ColorGrid, ColorGridColor } from './ColorGrid';

export default class Coldwarm {
  static init() {
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this.csInterface = new CSInterface();
    this.grid = new ColorGrid('#coldwarm-left-panel', 5);
    this.grid.setColor(new ColorGridColor(0x1D, 0xDF, 0xAB, 1));
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
  }
}
