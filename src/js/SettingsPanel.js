import $ from 'jquery';
import { Settings } from './Settings';

export default class SettingsPanel {
  constructor(panelSelector, backend) {
    this.$el = $(panelSelector);
    this._backend = backend;

    if (!this.$el || !this.$el.length) {
      console.error(`Can't find settings panel to bind to using selector ${panelSelector}`);
    }
  }

  get backend() {
    return this._backend;
  }

  init() {
    this.$closeBttn = this.$el.find('#closeBttn');
    this.$defaultBttn = this.$el.find('#resetDefaults');
    this.$saturationControl = this.$el.find('#showSaturationControl');
    this.$gridSizeControl = this.$el.find('#gridSizeControl');
    this.$temperatureStepControl = this.$el.find('#temperatureStepControl');
    this.$luminanceStepControl = this.$el.find('#luminanceStepControl');
    this.$saturationStepControl = this.$el.find('#saturationStepControl');

    this.$closeBttn.on('click', () => this.hide());
    this.$defaultBttn.on('click', () => {
      Settings.clear();
      this.load();
    });

    this.$saturationControl.on('change', e => Settings.set('showSaturation', e.currentTarget.checked));
    this.$gridSizeControl.on('change', e => Settings.set('gridSize', $(e.currentTarget).val()));
    this.$temperatureStepControl.on('change', e => Settings.set('temperatureStep', $(e.currentTarget).val()));
    this.$luminanceStepControl.on('change', e => Settings.set('luminanceStep', $(e.currentTarget).val()));
    this.$saturationStepControl.on('change', e => Settings.set('saturationStep', $(e.currentTarget).val()));
    this.load();
  }

  load() {
    this.$gridSizeControl.val(Settings.getNumber('gridSize'));
    this.$saturationControl.prop('checked', Settings.getBool('showSaturation') ? 'checked' : '');
    this.$temperatureStepControl.val(Settings.getNumber('temperatureStep'));
    this.$luminanceStepControl.val(Settings.getNumber('luminanceStep'));
    this.$saturationStepControl.val(Settings.getNumber('saturationStep'));
  }

  show() {
    this.$el.addClass('active');
    this.backend.csInterface.updateContextMenuItem('settings', false, false);
  }

  hide() {
    this.$el.removeClass('active');
    this.backend.csInterface.updateContextMenuItem('settings', true, false);
  }
}
