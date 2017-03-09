// @flow

import $, { jQuery } from 'jquery';
import jss from 'jss';
import preset from 'jss-preset-default';
import tinycolor from 'tinycolor2';

import Backend from './Backend';

export type ThemeType = 'light' | 'dark';

export const LIGHT_THEME_PATH = 'lib/css/light.css';
export const DARK_THEME_PATH = 'lib/css/dark.css';

export default class Theme {

  static uiToTinycolor(color: UIColor): tinycolor {
    if (color.type !== 1) {
      throw new Error('Gradients unsupported');
    }

    return Theme.rgbToTinycolor(color.color);
  }

  static rgbToTinycolor(rgbColor: RGBColor): tinycolor {
    return tinycolor({
      r: rgbColor.red,
      g: rgbColor.green,
      b: rgbColor.blue,
      a: rgbColor.alpha
    });
  }

  _backend: Backend;
  _currentTheme: ThemeType;
  _appSkinInfo: AppSkinInfo;
  _themeElement: jQuery;
  _dynamicStylesheetElement: jQuery;
  _bodyElement: jQuery;

  constructor(backend: Backend) {
    jss.setup(preset());
    this._backend = backend;
    this._themeElement = $('link#coldwarm-theme');
    this._bodyElement = $('body');
    this._dynamicStylesheetElement = $('style#coldwarm-dynamic-theme');
    this.backend.registerThemeChangeHandler(() => this.onThemeChange());
    this.onThemeChange();
  }

  get backend(): Backend {
    return this._backend;
  }

  get appSkinInfo(): AppSkinInfo {
    return this._appSkinInfo;
  }

  get currentTheme(): ThemeType {
    return this._currentTheme;
  }

  get themeElement(): jQuery {
    return this._themeElement;
  }

  get bodyElement(): jQuery {
    return this._bodyElement;
  }

  get dynamicStylesheetElement(): jQuery {
    return this._dynamicStylesheetElement;
  }

  refreshSkinInfo(): void {
    this._appSkinInfo = this.backend.getHostEnvironment().appSkinInfo;

    if (this.appSkinInfo.panelBackgroundColor.type !== 1) {
      throw new Error('Panel background color is gradient, somehow');
    }
    const red = this.appSkinInfo.panelBackgroundColor.color.red;

    if (red > 127) {
      this._currentTheme = 'light';
    } else {
      this._currentTheme = 'dark';
    }
  }

  onThemeChange(): void {
    this.refreshSkinInfo();
    if (this.currentTheme === 'light') {
      this.themeElement.attr('href', LIGHT_THEME_PATH);
      this.bodyElement.removeClass('dark-theme').addClass('light-theme');
    } else {
      this.themeElement.attr('href', DARK_THEME_PATH);
      this.bodyElement.removeClass('light-theme').addClass('dark-theme');
    }
    this.rebuildStylesheet();
  }

  rebuildStylesheet(): void {
    const convertedColors = {
      appBarBackgroundColor: Theme.uiToTinycolor(this.appSkinInfo.appBarBackgroundColor),
      panelBackgroundColor: Theme.uiToTinycolor(this.appSkinInfo.panelBackgroundColor),
      systemHighlightColor: Theme.rgbToTinycolor(this.appSkinInfo.systemHighlightColor)
    };

    const styles = {
      '@global': {
        body: {
          backgroundColor: convertedColors.panelBackgroundColor.toRgbString(),
          fontSize: this.appSkinInfo.baseFontSize
        },
        '.hostBgd': {
          backgroundColor: convertedColors.panelBackgroundColor.toRgbString(),
        }
      }
    };

    const styleSheet = jss.createStyleSheet(styles, {
      element: this.dynamicStylesheetElement.get(0),
      jss
    });
    styleSheet.attach();
  }
}
