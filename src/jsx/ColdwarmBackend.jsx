/**
 * @file Simple backend handlers for conveying colors to and from the frontend.
 */

function setColor(type, r, g, b, a) {

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

  if (a !== null) {
    color.rgb.alpha = a;
  }
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
    '"alpha": ' + (color.rgb.alpha === undefined ? null : color.rgb.alpha) +
  '}';
}
