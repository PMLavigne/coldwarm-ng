import CSInterface from 'csinterface';
import ColorGrid from './ColorGrid';

export default class Coldwarm {
  constructor() {
    this.grid = new ColorGrid('#coldwarm-left-panel');
    this.csInterface = null;
  }

  init() {
    this.csInterface = new CSInterface();
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
  }
}
