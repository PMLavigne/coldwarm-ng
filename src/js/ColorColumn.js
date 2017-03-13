// @flow
import $, { jQuery } from 'jquery';

import Settings from './Settings';
import ColorGridSquare from './ColorGridSquare';
import ColorGridColor from './ColorGridColor';

export default class ColorColumn {

  $el: jQuery;
  _color: ColorGridColor;
  _onSelectCallback: (color: ColorGridColor) => Promise<void>;
  _size: number;
  _squares: Array<ColorGridSquare> = [];

  constructor(targetSelector: string, onSelectCallback: (color: ColorGridColor) => Promise<void>) {
    this._onSelectCallback = onSelectCallback;
    this._size = Settings.getNumber('gridSize');
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color column target ${targetSelector} does not exist`);
    }
  }

  get size(): number {
    return this._size;
  }

  get squares(): Array<ColorGridSquare> {
    return this._squares;
  }

  get color(): ColorGridColor {
    return this._color;
  }

  set color(newColor: ColorGridColor): void {
    this._color = newColor;
    this.refresh();
  }

  show(): void {
    this.$el.addClass('active');
  }

  hide(): void {
    this.$el.removeClass('active');
  }

  refresh(): void {
    if (!this.squares.length) {
      this.render();
    } else {
      this.squares.forEach(square => square.refresh());
    }

    if (Settings.getBool('showSaturation')) {
      this.show();
    } else {
      this.hide();
    }
  }

  render(): void {
    this.$el.empty();
    this._squares = [];

    this._size = Settings.getNumber('gridSize');
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

  getColorFor(ignored: any, pos: number): ColorGridColor {
    const halfSize = (this.size - 1) / 2;
    if (pos === halfSize) {
      return this.color;
    }

    const curColor = this.color.clone();
    const saturationStep = Settings.getNumber('saturationStep');
    const relativePos = halfSize - pos;

    curColor.adjustSaturation(saturationStep * relativePos);

    return curColor;
  }
}
