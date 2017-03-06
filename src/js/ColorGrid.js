import $ from 'jquery';

import { Settings } from './Settings';
import ColorGridSquare from './ColorGridSquare';


class ColorGridRow {
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


export default class ColorGrid {
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

    for (let y = 0; y < this._gridSize; ++y) {
      const row = new ColorGridRow(y);
      for (let x = 0; x < this._gridSize; ++x) {
        row.addSquare(new ColorGridSquare(x, y, this.getColorFor.bind(this), this._onSelectCallback));
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
    const relativeY = halfGridSize - y;

    curColor.adjustWarmth(relativeX * tempStep);
    curColor.adjustBrightness(relativeY * lumaStep);

    return curColor;
  }
}
