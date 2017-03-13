// @flow

import $, { jQuery } from 'jquery';

import Settings from './Settings';
import ColorGridSquare from './ColorGridSquare';
import ColorGridColor from './ColorGridColor';


class ColorGridRow {
  _x: number;
  _squares: Array<ColorGridSquare>;
  $el: jQuery;

  constructor(x: number) {
    this._x = x;
    this._squares = [];
  }

  get x(): number {
    return this._x;
  }

  get squares(): Array<ColorGridSquare> {
    return this._squares;
  }

  addSquare(square: ColorGridSquare): void {
    this.squares.push(square);
  }

  get(index: number): ColorGridSquare {
    return this.squares[index];
  }

  refresh(): void {
    this.squares.forEach(square => square.refresh());
  }

  render(): jQuery {
    this.$el = $('<div />').attr('class', 'coldwarm-grid-row')
                           .attr('id', `coldwarm-grid-row-${this.x}`);
    this.squares.forEach((square) => {
      this.$el.append(square.render());
    });
    return this.$el;
  }
}


export default class ColorGrid {
  _color: ColorGridColor;
  _gridSize: number;
  _gridRows: Array<ColorGridRow> = [];
  _onSelectCallback: (color: ColorGridColor) => Promise<void>;
  $el: jQuery;

  constructor(targetSelector: string, onSelectCallback: (color: ColorGridColor) => Promise<void>) {
    this._onSelectCallback = onSelectCallback;
    this._gridSize = Settings.getNumber('gridSize');
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color grid target ${targetSelector} does not exist`);
    }
  }

  get gridSize(): number {
    return this._gridSize;
  }

  get color(): ColorGridColor {
    return this._color;
  }

  set color(newColor: ColorGridColor): void {
    this._color = newColor;
    this.refresh();
  }

  refresh(): void {
    if (!this._gridRows.length) {
      this.renderGrid();
    } else {
      this._gridRows.forEach(row => row.refresh());
    }
  }

  renderGrid(): void {
    this.$el.empty();
    this._gridRows = [];
    this._gridSize = Settings.getNumber('gridSize');
    if (this.gridSize % 2 === 0) {
      console.log(`WARNING: ColorGrid.gridSize must be odd, adding 1 to ${this.gridSize}`);
      this._gridSize++;
    }


    for (let y = 0; y < this.gridSize; ++y) {
      const row = new ColorGridRow(y);
      for (let x = 0; x < this.gridSize; ++x) {
        row.addSquare(new ColorGridSquare(x, y, this.getColorFor.bind(this), this._onSelectCallback));
      }
      this._gridRows.push(row);
      this.$el.append(row.render());
    }
  }

  getColorFor(x: number, y: number): ColorGridColor {
    const halfGridSize = (this.gridSize - 1) / 2;
    if (x === halfGridSize && y === halfGridSize) {
      return this.color;
    }

    const curColor = this.color.clone();
    const tempStep = Settings.getNumber('temperatureStep');
    const lumaStep = Settings.getNumber('luminanceStep');
    const relativeX = x - halfGridSize;
    const relativeY = halfGridSize - y;

    curColor.adjustWarmth(relativeX * tempStep);
    curColor.adjustBrightness(relativeY * lumaStep);

    return curColor;
  }
}
