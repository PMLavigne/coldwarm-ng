
import themeManager from 'thememanager';
import Backend from './Backend';
import ColorGrid from './ColorGrid';
import ColorColumn from './ColorColumn';


export default class Coldwarm {
  static init() {
    themeManager.init();
    Coldwarm.instance = new Coldwarm();
  }

  constructor() {
    this._backend = new Backend(() => this.refreshColor());
    this._grid = new ColorGrid('#coldwarm-left-panel', color => this.backend.setForegroundColor(color));
    this._column = new ColorColumn('#coldwarm-right-panel', color => this.backend.setForegroundColor(color));

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

  get column() {
    return this._column;
  }

  async refreshColor() {
    try {
      const newColor = await this.backend.getForegroundColor();
      this.grid.color = newColor;
      this.column.color = newColor;
    } catch (err) {
      console.error('Error loading color: ');
      console.error(err);
    }
  }

}
