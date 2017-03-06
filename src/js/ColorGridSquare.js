import $ from 'jquery';

export default class ColorGridSquare {
  constructor(x, y, colorFunc, onSelectCallback) {
    this.x = x;
    this.y = y;
    this.colorFunc = colorFunc;
    this.$el = null;
    this.onSelect = onSelectCallback;
  }

  get color() {
    return this.colorFunc(this.x, this.y);
  }

  render() {
    this.$el = $('<div />').addClass('coldwarm-grid-cell')
                           .attr('title', this.color.toString())
                           .css('background-color', this.color ? this.color.asCSS : 'transparent')
                           .on('click', this.onClick.bind(this));

    return this.$el;
  }

  refresh() {
    this.$el.css('background-color', this.color ? this.color.asCSS : 'transparent');
  }

  onClick() {
    if (this.onSelect) {
      this.onSelect(this.color);
    }
  }
}
