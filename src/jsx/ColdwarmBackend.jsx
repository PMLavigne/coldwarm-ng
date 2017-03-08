/**
 * @file Simple backend handlers for conveying colors to and from the frontend.
 */

function setColor(type, rgbaObject) {

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

  color.rgb.red = rgbaObject.r;
  color.rgb.green = rgbaObject.g;
  color.rgb.blue = rgbaObject.b;
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
    '"r": ' + color.rgb.red + ',' +
    '"b": ' + color.rgb.blue + ',' +
    '"g": ' + color.rgb.green + ',' +
    '"a": ' + (color.rgb.alpha === undefined ? null : color.rgb.alpha) +
  '}';
}

function getColorHSB(type) {
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
    '"hue": ' + color.hsb.hue + ',' +
    '"saturation": ' + color.hsb.saturation + ',' +
    '"brightness": ' + color.hsb.brightness + ',' +
    '"alpha": ' + (color.hsb.alpha === undefined ? null : color.hsb.alpha) +
    '}';
}
