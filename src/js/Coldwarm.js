
import themeManager from 'thememanager';
import Backend from './Backend';
import { ColorGrid } from './ColorGrid';


export default class Coldwarm {
  static init() {
    themeManager.init();
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this._backend = new Backend(() => this.refreshColor());
    this._grid = new ColorGrid('#coldwarm-left-panel', color => this.backend.setForegroundColor(color));

    this.backend
        .register()
        .catch(err => console.error('Error setting up Backend: ', err))
        .then(async () => this.refreshColor())
        .then(() => console.log(`Initialized ${this.backend.extensionId}`));
  }

  get backend() {
    return this._backend;
  }

  get grid() {
    return this._grid;
  }

  async refreshColor() {
    try {
      this.grid.color = await this.backend.getForegroundColor();
    } catch (err) {
      console.error('Error loading color: ');
      console.error(err);
    }
  }

}
