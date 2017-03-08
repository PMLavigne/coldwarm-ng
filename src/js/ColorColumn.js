import $ from 'jquery';

import { Settings } from './Settings';
import ColorGridSquare from './ColorGridSquare';

export default class ColorColumn {
  constructor(targetSelector, onSelectCallback) {
    this._color = null;
    this._onSelectCallback = onSelectCallback;
    this._size = Number(Settings.get('gridSize'));
    this._squares = [];
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color column target ${targetSelector} does not exist`);
    }
  }

  get size() {
    return this._size;
  }

  get squares() {
    return this._squares;
  }

  get color() {
    return this._color;
  }

  set color(newColor) {
    this._color = newColor;
    this.refresh();
  }

  show() {
    this.$el.addClass('active');
  }

  hide() {
    this.$el.removeClass('active');
  }

  refresh() {
    if (!this.squares.length) {
      this.render();
    } else {
      this.squares.forEach(square => square.refresh());
    }

    if (Settings.get('showSaturation')) {
      this.show();
    } else {
      this.hide();
    }
  }

  render() {
    this.$el.empty();
    this._squares = [];

    this._size = Number(Settings.get('gridSize'));
    if (this.size % 2 === 0) {
      console.log(`WARNING: ColorColumn.size must be odd, adding 1 to ${this.size}`);
      this._size++;
    }

    for (let y = 0; y < this.size; ++y) {
      const square = new ColorGridSquare(0, y, this.getColorFor.bind(this), this._onSelectCallback);
      this.squares.push(square);
      this.$el.append(square.render());
    }
  }

  getColorFor(ignored, pos) {
    const halfSize = (this.size - 1) / 2;
    if (pos === halfSize) {
      return this.color;
    }

    const curColor = this.color.clone();
    const saturationStep = Settings.get('saturationStep');
    const relativePos = halfSize - pos;

    curColor.adjustSaturation(saturationStep * relativePos);

    return curColor;
  }
}
