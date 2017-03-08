import $ from 'jquery';

export default class ContextMenu {
  static _openMenu = null;

  static open(mouseEvent, entries) {
    return new Promise((resolve) => {
      if (ContextMenu._openMenu !== null) {
        resolve();
        return;
      }

      ContextMenu._openMenu = new ContextMenu(mouseEvent, entries, () => {
        if (ContextMenu._openMenu.selection) {
          ContextMenu._openMenu.selection.action();
        }
        ContextMenu._openMenu = null;
        resolve();
      });

      ContextMenu._openMenu.render();
    });
  }

  constructor(event, entries, callback) {
    this._point = {
      x: event.pageX,
      y: event.pageY
    };
    this._entries = entries;
    this._callback = callback;
    this._selection = null;
  }

  get point() {
    return this._point;
  }

  get callback() {
    return this._callback;
  }

  get entries() {
    return this._entries;
  }

  get selection() {
    return this._selection;
  }

  render() {
    this.$wrapper = $('<div />').addClass('coldwarm-context-menu-wrapper')
                                .on('click', e => this.onClick(e))
                                .on('contextmenu', () => false);

    this.$el = $('<ul />').addClass('coldwarm-context-menu')
                          .addClass('hostBgd')
                          .css('top', this.point.y)
                          .css('left', this.point.x);


    this.entries.forEach((entry) => {
      const $entry = $('<li />').addClass('coldwarm-context-menu-entry')
                                .attr('id', `coldwarm-menu-${entry.id}`)
                                .on('click', e => this.onClick(e))
                                .text(entry.name);
      this.$el.append($entry);
    });

    this.$wrapper.append(this.$el);
    $('body').append(this.$wrapper);
  }

  onClick(e) {
    const $selected = $(e.currentTarget);
    const selectedId = $selected.attr('id');

    if (selectedId) {
      this._selection = this.entries.find(entry => `coldwarm-menu-${entry.id}` === selectedId);
    }
    this.close();
  }

  close() {
    this.$wrapper.remove();
    this.callback();
  }
}
