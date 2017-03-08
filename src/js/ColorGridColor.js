// @flow

import tinycolor from 'tinycolor2';

import { ColorInfo } from './ColorTypes';

export default class ColorGridColor {

  _color: ?tinycolor;

  /**
   * Create the ColorGridColor
   * @param colorObject either a tinycolor object or an object that can be given to tinycolor
   */
  constructor(colorObject: tinycolor | ColorInfo | string) {
    this.color = colorObject;
  }

  get color(): tinycolor {
    return this._color;
  }

  set color(colorObject: tinycolor | ColorInfo | string) {
    if (colorObject === null || colorObject === undefined) {
      this._color = null;
    } else if (colorObject.getFormat) { // Check for tinycolor method
      this._color = colorObject;
    } else {
      this._color = tinycolor(colorObject);
    }
  }

  /**
   * True if this color is a shade of gray (saturation is 0)
   * @returns {boolean} true if this color is a shade of gray
   */
  get isGray(): bool {
    return this.color.toHsl().s === 0;
  }

  /**
   * True if this color is maximally saturated (saturation is 100%)
   * @returns {boolean} true if this color is maximally saturated
   */
  get isMaxSaturated(): bool {
    return this.color.toHsl().s === 1;
  }

  /**
   * Get a string representation of this color that can be used in a CSS rule
   * @returns {string}
   */
  get asCSS(): string {
    return this.color.toHslString();
  }

  /**
   * Get a readable string describing the color in HSL and RGB terms
   * @returns {string} readable string describing this color
   */
  toString(): string {
    return `${this.color.toHslString()} | ${this.color.toRgbString()}`;
  }

  /**
   * Deep copy this ColorGridColor
   * @returns {ColorGridColor} a deep clone of this object
   */
  clone(): ColorGridColor {
    return new ColorGridColor(this.color === null ? null : this.color.clone());
  }

  /**
   * Adjust saturation
   * @param {number} factor factor to adjust saturation by, in the range [-100, 100]
   */
  adjustSaturation(factor: number): void {
    if (factor === 0 || this.isGray) {
      return;
    }

    if (factor > 0) {
      if (this.isMaxSaturated) {
        return;
      }
      this.color.saturate(factor);
    } else {
      this.color.desaturate(Math.abs(factor));
    }
  }

  /**
   * Adjust warmth while maintaining approximately equivalent luminance.
   * Algorithm taken from the original ColdWarm implementation and modified to work here.
   * @param {number} factor factor to adjust the warmth by
   */
  adjustWarmth(factor: number): void {
    const luminance = this.color.getLuminance();

    const rgbColor = this.color.toRgb();

    rgbColor.r += factor;
    rgbColor.b -= factor;

    this.color = tinycolor(rgbColor);

    this.adjustBrightness((luminance - this.color.getLuminance()) * 2);
  }

  /**
   * Adjust brightness
   * @param {number} factor factor to adjust brightness by, in the range [-100, 100]
   */
  adjustBrightness(factor: number): void {
    if (factor === 0) {
      return;
    }

    if (factor > 0) {
      this.color.brighten(factor);
    } else {
      this.color.darken(Math.abs(factor));
    }
  }

}
