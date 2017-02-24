
import $ from 'jquery';

export class ColorGridColor {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toCSS() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
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
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.$el = null;
  }

  render() {
    this.$el = $('<div />').attr('class', 'coldwarm-grid-cell')
                           .attr('id', `coldwarm-grid-cell-${this.x}-${this.y}`)
                           .css('background-color', this.color ? this.color.toCSS() : 'transparent')
                           .html('&nbsp;');
    return this.$el;
  }
}

export class ColorGrid {
  constructor(targetSelector, gridSize) {
    this._color = null;
    this.gridSize = Number(gridSize);
    this.gridRows = [];
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color grid target ${targetSelector} does not exist`);
    }

    if (this.gridSize % 2 === 0) {
      console.log(`WARNING: ColorGrid.gridSize must be odd, adding 1 to ${gridSize}`);
      this.gridSize++;
    }
  }

  get color() {
    return this._color;
  }

  set color(newColor) {
    this._color = newColor;
    this.renderGrid();
  }

  renderGrid() {
    this.$el.empty();
    this.gridRows = [];

    for (let x = 0; x < this.gridSize; ++x) {
      const row = new ColorGridRow(x);
      for (let y = 0; y < this.gridSize; ++y) {
        row.addSquare(new ColorGridSquare(x, y, this.getColorFor(x, y)));
      }
      this.gridRows.push(row);
      this.$el.append(row.render());
    }
  }

  getColorFor(x, y) {
    const halfGridSize = (this.gridSize - 1) / 2;
    if (x === halfGridSize && y === halfGridSize) {
      return this.color;
    }
    return new ColorGridColor(0, 0, 0, 0);
  }
}
