
import $ from 'jquery';

export default class ColorGrid {
  constructor(targetSelector) {
    this.$el = $(targetSelector);

    if (!this.$el || !this.$el.length) {
      throw new Error(`Color grid target ${targetSelector} does not exist`);
    }
  }
}
