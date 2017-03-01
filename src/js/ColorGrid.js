import $ from 'jquery';

import { Settings } from './Settings';

export class ColorGridColor {
  constructor(r, g, b, a) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  get r() {
    return this._r;
  }

  set r(r) {
    this._r = Math.min(Math.max(r, 0), 255);
  }

  get g() {
    return this._g;
  }

  set g(g) {
    this._g = Math.min(Math.max(g, 0), 255);
  }

  get b() {
    return this._b;
  }

  set b(b) {
    this._b = Math.min(Math.max(b, 0), 255);
  }

  get a() {
    return this._a;
  }

  set a(a) {
    this._a = Math.min(Math.max(a, 0), 255);
  }

  copy() {
    return new ColorGridColor(this.r, this.g, this.b, this.a);
  }

  toCSS() {
    return `rgba(${this.toRoundedRGBA().join(', ')})`;
  }

  toString() {
    return this.toCSS();
  }

  toRoundedRGBA() {
    return [
      Math.min(255, Math.round(this.r)),
      Math.min(255, Math.round(this.g)),
      Math.min(255, Math.round(this.b)),
      Math.min(255, Math.round(this.a))
    ];
  }
  adjustWarmth(factor) {
    const brightness = this.getLuminanceGrey();

    this.r += factor;
    this.b -= factor;

    this.addToRGB((brightness - this.getLuminanceGrey()) * 2);
  }

  /**
   * Add amount to r, g, b channels
   * @param amount
   */
  addToRGB(amount) {
    this.r += amount;
    this.g += amount;
    this.b += amount;
  }

  getLuminanceGrey() {
    return (0.2126 * this.r) + (0.7152 * this.g) + (0.0722 * this.b);
  }
}

export class ColorGridRow {
  constructor(x) {
    this.x = x;
    this.squares = [];
    this.$el = null;
  }

  addSquare(square) {
    this.squares.push(square);
  }

  get(index) {
    return this.squares[index];
  }

  refresh() {
    this.squares.forEach(square => square.refresh());
  }

  render() {
    this.$el = $('<div />').attr('class', 'coldwarm-grid-row')
                           .attr('id', `coldwarm-grid-row-${this.x}`);
    this.squares.forEach((square) => {
      this.$el.append(square.render());
    });
    return this.$el;
  }
}

export class ColorGridSquare {
  constructor(x, y, colorFunc, onSelectCallback) {
    this.x = x;
    this.y = y;
    this.colorFunc = colorFunc;
    this.$el = null;
    this.onSelect = onSelectCallback;
  }

  get color() {
    return this.colorFunc();
  }

  render() {
    this.$el = $('<div />').attr('class', 'coldwarm-grid-cell')
                           .attr('id', `coldwarm-grid-cell-${this.x}-${this.y}`)
                           .css('background-color', this.color ? this.color.toCSS() : 'transparent')
                           .html('&nbsp;')
                           .on('click', this.onClick.bind(this));
    return this.$el;
  }

  refresh() {
    this.$el.css('background-color', this.color ? this.color.toCSS() : 'transparent');
  }

  onClick() {
    if (this.onSelect) {
      this.onSelect(this.color);
    }
  }
}

export class ColorGrid {
  constructor(targetSelector, onSelectCallback) {
    this._color = null;
    this._onSelectCallback = onSelectCallback;
    this._gridSize = Number(Settings.get('gridSize'));
    this._gridRows = [];
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color grid target ${targetSelector} does not exist`);
    }

    if (this._gridSize % 2 === 0) {
      console.log(`WARNING: ColorGrid.gridSize must be odd, adding 1 to ${this._gridSize}`);
      this._gridSize++;
    }
  }

  get color() {
    return this._color;
  }

  set color(newColor) {
    this._color = newColor;
    this.refresh();
  }

  refresh() {
    if (!this._gridRows.length) {
      this.renderGrid();
    } else {
      this._gridRows.forEach(row => row.refresh());
    }
  }

  renderGrid() {
    this.$el.empty();
    this._gridRows = [];

    for (let x = 0; x < this._gridSize; ++x) {
      const row = new ColorGridRow(x);
      for (let y = 0; y < this._gridSize; ++y) {
        row.addSquare(new ColorGridSquare(x, y, () => this.getColorFor(x, y), this._onSelectCallback));
      }
      this._gridRows.push(row);
      this.$el.append(row.render());
    }
  }

  getColorFor(x, y) {
    const halfGridSize = (this._gridSize - 1) / 2;
    if (x === halfGridSize && y === halfGridSize) {
      return this.color;
    }

    const curColor = this.color.copy();
    const tempStep = Settings.get('temperatureStep');
    const lumaStep = Settings.get('luminanceStep');
    const relativeX = x - halfGridSize;
    const relativeY = y - halfGridSize;

    curColor.addToRGB(relativeY * lumaStep);
    curColor.adjustWarmth(relativeX * tempStep);

    return curColor;
  }
}
