// @flow


declare type Version = {
  major: number;
  minor: number;
  micro: number;
  special?: string;
}

declare type RGBColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

declare type Direction = {
  x: number;
  y: number;
}

declare type GradientStop = {
  offset: number;
  rgbColor: RGBColor;
}

declare type GradientColor = {
  type: 'linear';
  direction: Direction;
  numStops: number;
  arrGradientStop: Array<GradientStop>;
}

declare type UIColor = {
  type: 1;
  antialiasLevel: number;
  color: RGBColor;
} | {
  type: 2;
  antialiasLevel: number;
  color: GradientColor;
};

declare type AppSkinInfo = {
  baseFontFamily: string;
  baseFontSize: string;
  appBarBackgroundColor: UIColor;
  panelBackgroundColor: UIColor;
  appBarBackgroundColorSRGB: UIColor;
  panelBackgroundColorSRGB: UIColor;
  systemHighlightColor: RGBColor;
}

declare type HostEnvironment = {
  appName: string;
  appVersion: string;
  appLocale: string;
  appUILocale: string;
  appId: string;
  isAppOnline: bool;
  appSkinInfo: AppSkinInfo;
}

declare type ApiVersion = {
  major: number;
  minor: number;
  micro: number;
}

declare type HostCapabilities = {
  EXTENDED_PANEL_MENU: bool;
  EXTENDED_PANEL_ICONS: bool;
  DELEGATE_APE_ENGINE: bool;
  SUPPORT_HTML_EXTENSIONS: bool;
  DISABLE_FLASH_EXTENSIONS: bool;
}

declare type SystemPath = 'userData' | 'commonFiles' | 'myDocuments' | 'application' | 'extension' | 'hostApplication';

declare type VersionBound = {
  version: Version;
  inclusive: bool;
}

declare type VersionRange = {
  lowerBound: VersionBound;
  upperBound: VersionBound;
}

declare type Runtime = {
  name: string;
  versionRange: VersionRange;
}

declare type Extension = {
  id: string;
  name: string;
  mainPath: string;
  basePath: string;
  windowType: 'Panel' | 'Modeless' | 'ModalDialog';
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  defaultExtensionDataXml: string;
  specialExtensionDataXml: string;
  requiredRuntimeList: Array<Runtime>;
  isAutoVisible: bool;
  isPluginExtension: bool;
}

declare class CSEvent {
  type: string;
  scope: 'GLOBAL' | 'APPLICATION';
  appId: string;
  extensionId: string;
  data?: string;
}

declare class CSInterface {
  static THEME_COLOR_CHANGED_EVENT: string;

  getExtensionID(): string;
  getHostEnvironment(): HostEnvironment;
  closeExtension(): void;
  getSystemPath(pathType: SystemPath): void;
  evalScript(script: string, callback?: Function): void;
  getApplicationID(): string;
  getHostCapabilities(): HostCapabilities;
  dispatchEvent(event: CSEvent): void;
  addEventListener(type: string, listener: Function, obj?: any): void;
  removeEventListener(type: string, listener: Function, obj?: any): void;
  requestOpenExtension(extensionId: string, params: ''): void;
  getExtensions(extensionIds?: Array<string>): Array<Extension>;
  getNetworkPreferences(): any;
  initResourceBundle(): any;
  dumpInstallationInfo(): string;
  getOSInformation(): string;
  openURLInDefaultBrowser(url: string): void;
  getScaleFactor(): number;
  setScaleFactorChangedHandler(handler: Function): void;
  getCurrentApiVersion(): ApiVersion;
  setPanelFlyoutMenu(menu: string): void;
  updatePanelMenuItem(menuLabel: string, enabled: bool, checked: bool): void;
  setContextMenu(menu: string, callback: Function): void;
  setContextMenuByJSON(menu: string, callback: Function): void;
  updateContextMenuItem(menuItemID: string, enabled: bool, checked: bool): void;
  isWindowVisible(): bool;
  resizeContent(width: number, height: number): void;
  registerInvalidCertificateCallback(callback: Function): void;
  registerKeyEventsInterest(keyEventsInterest: string): void;
  setWindowTitle(title: string): void;
  getWindowTitle(): string;
}
