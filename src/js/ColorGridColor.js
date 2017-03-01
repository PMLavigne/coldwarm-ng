export default class ColorGridColor {
  constructor(r, g, b, a) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  get red() {
    return this.r;
  }

  get r() {
    return this._r;
  }

  set red(red) {
    this.r = red;
  }

  set r(r) {
    this._r = Math.min(Math.max(r, 0), 255);
  }

  get green() {
    return this.g;
  }

  get g() {
    return this._g;
  }

  set green(green) {
    this.g = green;
  }

  set g(g) {
    this._g = Math.min(Math.max(g, 0), 255);
  }

  get blue() {
    return this.b;
  }

  get b() {
    return this._b;
  }

  set blue(blue) {
    this.b = blue;
  }

  set b(b) {
    this._b = Math.min(Math.max(b, 0), 255);
  }

  get alpha() {
    return this.a;
  }

  get a() {
    return this._a;
  }

  /**
   * Convert the internal 8-bit alpha integer (0-255) to a CSS-recognized 0-1 floating point decimal
   * @returns {number} alpha as a floating point number in the range [0, 1]
   */
  get cssAlpha() {
    return (this.a === null) ? 1 : Math.min(1, Math.max(0, (this.a || 255) / 255));
  }

  set alpha(alpha) {
    this.a = alpha;
  }

  set a(a) {
    if (a === null) {
      this._a = null;
      return;
    }
    this._a = Math.min(Math.max(a, 0), 255);
  }

  get roundedRGBA() {
    return [
      Math.min(255, Math.round(this.r)),
      Math.min(255, Math.round(this.g)),
      Math.min(255, Math.round(this.b)),
      this.a === null ? null : Math.min(255, Math.round(this.a))
    ];
  }

  get roundedCSSRGBA() {
    return [
      Math.min(255, Math.round(this.r)),
      Math.min(255, Math.round(this.g)),
      Math.min(255, Math.round(this.b)),
      this.cssAlpha
    ];
  }

  get isGray() {
    return this.r === this.b && this.r === this.g;
  }

  get isMaxSaturated() {
    return this.r === 0 || this.b === 0 || this.g === 0;
  }

  get asCSS() {
    return `rgba(${this.roundedCSSRGBA.join(', ')})`;
  }

  copy() {
    return new ColorGridColor(this.r, this.g, this.b, this.a);
  }

  /**
   * Adjust saturation, attempting to be similar to Photoshop's Ctrl+U action
   * Algorithm taken from original ColdWarm implementation and modified to work here.
   * @param {number} factor factor to adjust saturation by, in the range [-1, 1]
   */
  adjustSaturation(factor) {
    if (this.isGray) {
      return;
    }

    if (factor > 0 && this.isMaxSaturated) {
      return;
    }

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
    }
  }

  /**
   * Adjust warmth while maintaining approximately equivalent luminance.
   * Algorithm taken from the original ColdWarm implementation and modified to work here.
   * @param {number} factor factor to adjust the warmth by
   */
  adjustWarmth(factor) {
    const brightness = this.luminance;

    this.r += factor;
    this.b -= factor;

    this.addToRGB((brightness - this.luminance) * 2);
  }

  /**
   * Add amount to r, g, b channels
   * @param {number} amount absolute value to add to r, g, b channels
   */
  addToRGB(amount) {
    this.r += amount;
    this.g += amount;
    this.b += amount;
  }

  /**
   * Relative luminance of the color
   * @see https://en.wikipedia.org/wiki/Relative_luminance
   *
   * @returns {number} relative luminance of this color
   */
  get luminance() {
    return (0.2126 * this.r) + (0.7152 * this.g) + (0.0722 * this.b);
  }
}
