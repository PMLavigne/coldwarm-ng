import * as $ from 'jquery';
import Cookie from 'js-cookie';

export const COOKIE_PREFIX = 'coldwarm_';

export const SettingDefaults = {
  gridSize: 5,
  temperatureStep: 12,
  luminanceStep: 12,
  showSaturation: true,
  saturationStep: 1,
  saturationHsb: false
};

export class Setting {
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

  static clearCookies() {
    const allCookieData = Cookie.get();
    if (!allCookieData) {
      return;
    }
    $.each(allCookieData, (key) => {
      if (key.startsWith(COOKIE_PREFIX)) {
        Cookie.remove(key);
      }
    });
  }

  constructor() {
    this._settings = new Map();
    this.load();
  }

  load() {
    const allCookieData = Cookie.get();
    this._settings.clear();
    if (!allCookieData) {
      return;
    }

    $.each(allCookieData, (key, value) => {
      if (key.startsWith(COOKIE_PREFIX)) {
        const clippedKey = key.substring(COOKIE_PREFIX.length);
        const setting = new Setting(clippedKey);
        if (value && value.length) {
          setting.deserialize(value);
        }
        this._settings.set(clippedKey, setting);
      }
    });
  }

  save() {
    Settings.clearCookies();
    this._settings.forEach((key, value) => {
      Cookie.set(COOKIE_PREFIX + key, value.serialize());
    });
  }

  get(setting) {
    if (this._settings.has(setting)) {
      return this._settings.get(setting).value;
    }
    return SettingDefaults[setting];
  }

  set(setting, value) {
    this._settings.set(setting, new Setting(setting, value));
  }

  unset(setting) {
    this._settings.delete(setting);
  }
}
