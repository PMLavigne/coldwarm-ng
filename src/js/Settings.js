import * as $ from 'jquery';

export const KEY_PREFIX = 'codes.patrick.coldwarm-ng.';

export const SettingDefaults = {
  gridSize: 5,
  temperatureStep: 12,
  luminanceStep: 12,
  showSaturation: true,
  saturationMaxStep: 1
};

export class Setting {
  static parse(key, serializedValue) {
    const newSetting = new Setting(key);
    newSetting.deserialize(serializedValue);
    return newSetting;
  }

  constructor(key, value = null) {
    this._key = key;
    this.value = value;
  }

  get key() {
    return this._key;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this._type = $.type(value);
  }

  get type() {
    return this._type || 'undefined';
  }

  serialize() {
    let objString = '';

    switch (this.type) {
      case 'function':
      case 'error':
      case 'undefined':
      case 'null':
      default:
        break;

      case 'boolean':
      case 'number':
      case 'string':
        objString = this.value.toString();
        break;

      case 'date':
        objString = this.value.getTime().toString();
        break;

      case 'array':
      case 'object':
        objString = JSON.stringify(this.value);
        break;
    }

    return `${this.type}:${objString}`;
  }

  deserialize(string) {
    if (!string || string.indexOf(':') === -1) {
      throw new Error(`Invalid settings string: ${string}`);
    }

    const breakAt = string.indexOf(':');
    const type = string.substring(0, breakAt);
    const data = (string.length - 1) === breakAt ? '' : string.substring(breakAt + 1);

    switch (type) {
      case 'function':
      case 'error':
      case 'undefined':
      default:
        this.value = undefined;
        break;

      case 'null':
        this.value = null;
        break;

      case 'boolean':
        this.value = (data === 'true');
        break;

      case 'number':
        this.value = Number(data);
        break;

      case 'string':
        this.value = data;
        break;

      case 'date':
        this.value = new Date(Number(data));
        break;

      case 'array':
      case 'object':
        this.value = JSON.parse(data);
        break;
    }
  }
}

export class Settings {

  static onSettingChange = null;

  static clear() {
    Object.keys(SettingDefaults)
          .forEach(key => localStorage.removeItem(KEY_PREFIX + key));
    if (Settings.onSettingChange) {
      Settings.onSettingChange();
    }
  }

  static get(setting) {
    const storedVal = localStorage.getItem(KEY_PREFIX + setting);

    if (storedVal === null) {
      return SettingDefaults[setting];
    }

    return Setting.parse(setting, storedVal).value;
  }

  static set(setting, value) {
    localStorage.setItem(KEY_PREFIX + setting, (new Setting(setting, value)).serialize());
    if (Settings.onSettingChange) {
      Settings.onSettingChange();
    }
  }

  static unset(setting) {
    localStorage.removeItem(KEY_PREFIX + setting);
    if (Settings.onSettingChange) {
      Settings.onSettingChange();
    }
  }
}
