// @flow

export type SettingName = 'showSaturation' | 'gridSize' | 'temperatureStep' | 'luminanceStep' | 'saturationStep';

export type Setting = {
  name: SettingName,
  defaultVal: string,
  type: 'boolean' | 'number' | 'string'
};

export default class Settings {
  static _settings: {[key: SettingName]: Setting} = {
    gridSize:        { name: 'gridSize', defaultVal: '5', type: 'number' },
    temperatureStep: { name: 'temperatureStep', defaultVal: '10', type: 'number' },
    luminanceStep:   { name: 'luminanceStep', defaultVal: '10', type: 'number' },
    showSaturation:  { name: 'showSaturation', defaultVal: 'true', type: 'boolean' },
    saturationStep:  { name: 'saturationStep', defaultVal: '10', type: 'number' }
  };

  static _onSettingChange: ?() => void = null;

  static get onSettingChange(): ?() => void {
    return Settings._onSettingChange;
  }

  static set onSettingChange(handler: ?() => void): void {
    Settings._onSettingChange = handler;
  }

  static _doOnSettingChange(): void {
    const onSettingChange: ?() => void = Settings.onSettingChange;
    if (onSettingChange) {
      onSettingChange();
    }
  }

  static _keyPrefix: string = '';

  static init(extensionId: string) {
    Settings._keyPrefix = `${extensionId}.`;
  }

  static get keyPrefix(): string {
    return Settings._keyPrefix;
  }

  static clear(): void {
    Object.keys(Settings._settings)
          .forEach(key => localStorage.removeItem(Settings.keyPrefix + key));

    Settings._doOnSettingChange();
  }

  static _getRawOrDefault(setting: SettingName): string {
    const storedVal = localStorage.getItem(Settings.keyPrefix + setting);

    if (storedVal === null || storedVal === undefined) {
      return this._settings[setting].defaultVal;
    }

    return storedVal;
  }

  static getString(setting: SettingName): string {
    if (!this._settings[setting] || this._settings[setting].type !== 'string') {
      throw new Error(`${setting} is not a valid string setting`);
    }

    return this._getRawOrDefault(setting);
  }

  static getBool(setting: SettingName): bool {
    if (!this._settings[setting] || this._settings[setting].type !== 'boolean') {
      throw new Error(`${setting} is not a valid boolean setting`);
    }
    return this._getRawOrDefault(setting) === 'true';
  }

  static getNumber(setting: SettingName): number {
    if (!this._settings[setting] || this._settings[setting].type !== 'number') {
      throw new Error(`${setting} is not a valid numeric setting`);
    }
    return Number(this._getRawOrDefault(setting));
  }

  static set(setting: SettingName, value: bool | number | string) {
    localStorage.setItem(Settings.keyPrefix + setting, JSON.stringify(value));
    Settings._doOnSettingChange();
  }

  static unset(setting: SettingName) {
    localStorage.removeItem(Settings.keyPrefix + setting);
    Settings._doOnSettingChange();
  }
}
