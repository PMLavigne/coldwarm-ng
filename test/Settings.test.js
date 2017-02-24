import { Setting, Settings } from '../src/js/Settings';

describe('Setting', () => {
  describe('#constructor()', () => {
    it('initializes the Setting object and parses the type of the value automatically', () => {
      const setting = new Setting('test', 'test');
      expect(setting).toBeTruthy();
      expect(setting.key).toBe('test');
      expect(setting.value).toBe('test');
      expect(setting.type).toBe('string');
    });
  });
});

describe('Settings', () => {
  describe('#constructor()', () => {
    it('initializes the Settings object and loads settings from cookie storage', () => {
      const settings = new Settings();
      expect(settings).toBeTruthy();
    });
  });
});
