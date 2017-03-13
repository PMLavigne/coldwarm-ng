// @flow
import $, { jQuery } from 'jquery';

import ColorGridColor from './ColorGridColor';

export default class ColorGridSquare {

  _x: number;
  _y: number;
  _colorFunc: (x: number, y: number) => ColorGridColor;
  _onSelectCallback: (color: ColorGridColor) => Promise<void>;
  $el: jQuery;

  constructor(x: number, y: number, colorFunc: (x: number, y: number) => ColorGridColor, onSelectCallback: (color: ColorGridColor) => Promise<void>) {
    this._x = x;
    this._y = y;
    this._colorFunc = colorFunc;
    this._onSelectCallback = onSelectCallback;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get colorFunc(): (x: number, y: number) => ColorGridColor {
    return this._colorFunc;
  }

  get onSelect(): (color: ColorGridColor) => Promise<void> {
    return this._onSelectCallback;
  }

  get color(): ColorGridColor {
    return this.colorFunc(this.x, this.y);
  }

  render(): jQuery {
    this.$el = $('<div />').addClass('coldwarm-grid-cell')
                           .attr('title', this.color.toString())
                           .css('background-color', this.color ? this.color.asCSS : 'transparent')
                           .on('click', this.onClick.bind(this));

    return this.$el;
  }

  refresh(): void {
    this.$el.css('background-color', this.color ? this.color.asCSS : 'transparent');
  }

  onClick(): void {
    if (this.onSelect) {
      this.onSelect(this.color);
    }
  }
}
