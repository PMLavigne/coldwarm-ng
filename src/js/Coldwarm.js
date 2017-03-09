// @flow

import $ from 'jquery';
import Backend from './Backend';
import ColorGrid from './ColorGrid';
import ColorColumn from './ColorColumn';
import { Settings } from './Settings';
import SettingsPanel from './SettingsPanel';
import ContextMenu from './ContextMenu';
import Theme from './Theme';

export default class Coldwarm {

  static _instance: Coldwarm;

  static init(): void {
    Coldwarm._instance = new Coldwarm();
    Settings.onSettingChange = Coldwarm._instance.onSettingChange.bind(Coldwarm._instance);
  }

  _backend: Backend;
  _grid: ColorGrid;
  _column: ColorColumn;
  _settingsPanel: SettingsPanel;
  _theme: Theme;

  constructor() {
    this._backend = new Backend(() => this.refreshColor());
    this._grid = new ColorGrid('#coldwarm-left-panel', color => this.backend.setForegroundColor(color));
    this._column = new ColorColumn('#coldwarm-right-panel', color => this.backend.setForegroundColor(color));
    this._settingsPanel = new SettingsPanel('#coldwarm-settings-panel');
    this._theme = new Theme(this.backend);
    this.bindEvents();
    this.settingsPanel.init();
    this.backend
        .register()
        .catch(err => console.error('Error setting up Backend: ', err))
        .then(async () => this.refreshColor())
        .then(() => console.log(`Initialized ${this.backend.extensionId}`));
  }

  get backend(): Backend {
    return this._backend;
  }

  get grid(): ColorGrid {
    return this._grid;
  }

  get column(): ColorColumn {
    return this._column;
  }

  get settingsPanel(): SettingsPanel {
    return this._settingsPanel;
  }

  get contextMenuEntries(): Array<{name: string, id: string, action: Function}> {
    return [{
      name: 'Settings',
      id: 'settings',
      action: () => this.settingsPanel.show()
    }];
  }

  get theme(): Theme {
    return this._theme;
  }

  async refreshColor(): Promise<void> {
    const newColor = await this.backend.getForegroundColor();
    this.grid.color = newColor;
    this.column.color = newColor;
  }

  async redraw(): Promise<void> {
    this.grid.renderGrid();
    this.column.render();
    await this.refreshColor();
  }

  onSettingChange(): void {
    this.redraw()
        .catch(err => console.error('Error reloading Coldwarm: ', err));
  }

  bindEvents(): void {
    $('.coldwarm-body').on('contextmenu', (e: MouseEvent) => {
      ContextMenu.open(e, this.contextMenuEntries);
      return false;
    });
  }

}
