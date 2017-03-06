import tinycolor from 'tinycolor2';

export default class ColorGridColor {
  /**
   * Create the ColorGridColor
   * @param colorObject either a tinycolor object or an object that can be given to tinycolor
   */
  constructor(colorObject) {
    this.color = colorObject;
  }

  get color() {
    return this._color;
  }

  set color(colorObject) {
    if (colorObject === null || colorObject === undefined) {
      this._color = null;
    } else if (colorObject.getFormat) { // Check for tinycolor method
      this._color = colorObject;
    } else {
      this._color = tinycolor(colorObject);
    }
  }

  get isGray() {
    return this.color.toHsl().s === 0;
  }

  get isMaxSaturated() {
    return this.color.toHsl().s === 1;
  }

  get asCSS() {
    return this.color.toHslString();
  }

  toString() {
    return `${this.color.toHslString()} | ${this.color.toRgbString()}`;
  }

  copy() {
    return new ColorGridColor(this.color === null ? null : this.color.clone());
  }

  /**
   * Adjust saturation
   * @param {number} factor factor to adjust saturation by, in the range [-100, 100]
   */
  adjustSaturation(factor) {
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

    /*
     * Algorithm taken from original ColdWarm implementation
    const factorBound = Math.max(-1, Math.min(1, Number(factor)));

    const sorted = [
      { name: 'r', value: this.r },
      { name: 'g', value: this.g },
      { name: 'b', value: this.b }
    ];
    sorted.sort((a, b) => a.value - b.value);
    const gray = this.luminance;
    const low = sorted[0];
    const med = sorted[1];
    const high = sorted[2];

    if (factorBound > 0) {
      this[med.name] -= ((high.value - med.value) / (high.value - low.value)) * low.value * factorBound;
      this[low.name] -= low.value * factorBound;
    } else {
      this.r += (this.r - gray) * factorBound;
      this.g += (this.g - gray) * factorBound;
      this.b += (this.b - gray) * factorBound;
    }*/
  }

  /**
   * Adjust warmth while maintaining approximately equivalent luminance.
   * Algorithm taken from the original ColdWarm implementation and modified to work here.
   * @param {number} factor factor to adjust the warmth by
   */
  adjustWarmth(factor) {
    const luminance = this.color.getLuminance();

    const rgbColor = this.color.toRgb();

    rgbColor.r += factor;
    rgbColor.b -= factor;

    this.color = tinycolor(rgbColor);

    this.adjustBrightness((luminance - this.color.getLuminance()) * 2);
  }

  adjustBrightness(factor) {
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
