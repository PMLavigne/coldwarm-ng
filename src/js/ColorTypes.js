// @flow

export interface ColorInfo {
  a: ?number;
}

export interface RGBColorInfo extends ColorInfo {
  r: number;
  g: number;
  b: number;
}

export interface HSLColorInfo extends ColorInfo {
  h: number;
  s: number;
  l: number;
}

export interface HSBColorInfo extends ColorInfo {
  h: number;
  s: number;
  b: number;
}
