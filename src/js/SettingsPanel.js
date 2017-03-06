import $ from 'jquery';
import { Settings } from './Settings';

export default class SettingsPanel {
  constructor(panelSelector) {
    this.$el = $(panelSelector);

    if (!this.$el || !this.$el.length) {
      console.error(`Can't find settings panel to bind to using selector ${panelSelector}`);
    }
  }

  init() {
    this.$closeBttn = this.$el.find('#closeBttn');
    this.$defaultBttn = this.$el.find('#resetDefaults');
    this.$saturationControl = this.$el.find('#showSaturationControl');
    this.$gridSizeControl = this.$el.find('#gridSizeControl');

    this.$closeBttn.on('click', () => this.hide());
    this.$defaultBttn.on('click', () => {
      Settings.clear();
      this.load();
    });

    this.$saturationControl.on('change', e => Settings.set('showSaturation', e.currentTarget.checked));
    this.$gridSizeControl.on('change', e => Settings.set('gridSize', $(e.currentTarget).val()));

    this.load();
  }

  load() {
    this.$gridSizeControl.val(Settings.get('gridSize'));
    this.$saturationControl.prop('checked', Settings.get('showSaturation') ? 'checked' : '');
    this.show();
  }

  show() {
    this.$el.addClass('active');
  }

  hide() {
    this.$el.removeClass('active');
  }
}
