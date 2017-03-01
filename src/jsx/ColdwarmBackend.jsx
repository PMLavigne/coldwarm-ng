/**
 * @file Simple backend handlers for conveying colors to and from the frontend.
 */

function setColor(type, r, g, b) {

  var color;
  switch(type) {
    case 'foreground': {
      color = app.foregroundColor;
    } break;
    case 'background': {
      color = app.backgroundColor;
    } break;
    default:
      alert('Coldwarm-NG: Invalid event received that requested to set ' + type + ' color');
      return;
  }

  color.rgb.red = r;
  color.rgb.green = g;
  color.rgb.blue = b;
}

function getColor(type) {
  var color;
  switch(type) {
    case 'foreground':
      color = app.foregroundColor;
      break;
    case 'background':
      color = app.backgroundColor;
      break;
    default:
      alert('Coldwarm-NG: Invalid event received that requested to get ' + type + ' color');
      return;
  }

  return '{' +
    '"red": ' + color.rgb.red + ',' +
    '"blue": ' + color.rgb.blue + ',' +
    '"green": ' + color.rgb.green + ',' +
    '"alpha": ' + (color.rgb.alpha === undefined ? 1 : color.rgb.alpha) +
  '}';
}
