import $ from 'jquery';
import themeManager from 'thememanager';
import Backend from './Backend';
import ColorGrid from './ColorGrid';
import ColorColumn from './ColorColumn';
import { Settings } from './Settings';
import SettingsPanel from './SettingsPanel';
import ContextMenu from './ContextMenu';


export default class Coldwarm {
  static init() {
    themeManager.init();
    Coldwarm.instance = new Coldwarm();
    Settings.onSettingChange = Coldwarm.instance.onSettingChange.bind(Coldwarm.instance);
  }

  constructor() {
    this._backend = new Backend(() => this.refreshColor());
    this._grid = new ColorGrid('#coldwarm-left-panel', color => this.backend.setForegroundColor(color));
    this._column = new ColorColumn('#coldwarm-right-panel', color => this.backend.setForegroundColor(color));
    this._settingsPanel = new SettingsPanel('#coldwarm-settings-panel');
    this.bindEvents();
    this.settingsPanel.init();
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

  get settingsPanel() {
    return this._settingsPanel;
  }

  get contextMenuEntries() {
    return [{
      name: 'Settings',
      id: 'settings',
      action: () => this.settingsPanel.show()
    }];
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

  async redraw() {
    this.grid.renderGrid();
    this.column.render();
    await this.refreshColor();
  }

  onSettingChange() {
    console.log('onSettingChange');
    this.redraw()
        .catch(err => console.error('Error reloading Coldwarm: ', err));
  }

  bindEvents() {
    $('.coldwarm-body').on('contextmenu', (e) => {
      ContextMenu.open(e, this.contextMenuEntries);
      return false;
    });
  }

}
