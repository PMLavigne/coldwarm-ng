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

    it('can accept only the key, and initializes the type to "null"', () => {
      const setting = new Setting('test');
      expect(setting).toBeTruthy();
      expect(setting.key).toBe('test');
      expect(setting.value).toBeNull();
      expect(setting.type).toBe('null');
    });
  });

  describe('#serialize()', () => {
    it('serializes a boolean', () => {
      const setting = new Setting('test', false);
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('boolean:false');
    });

    it('serializes a number', () => {
      const setting = new Setting('test', 10.5);
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('number:10.5');
    });

    it('serializes a string', () => {
      const setting = new Setting('test', 'test string:with:colons');
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('string:test string:with:colons');
    });

    it('serializes a date', () => {
      const setting = new Setting('test', new Date(1000000000000));
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('date:1000000000000');
    });

    it('serializes an object', () => {
      const setting = new Setting('test', { data: [{ test: 'object' }, { test: 'object2' }] });
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('object:{"data":[{"test":"object"},{"test":"object2"}]}');
    });

    it('serializes an array', () => {
      const setting = new Setting('test', [{ test: 'object' }, { test: 'object2' }]);
      const serialized = setting.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized).toBe('array:[{"test":"object"},{"test":"object2"}]');
    });
  });

  describe('#deserialize()', () => {
    it('deserializes a boolean', () => {
      const setting = new Setting('test');
      setting.deserialize('boolean:false');
      expect(setting.type).toBe('boolean');
      expect(setting.value).toBe(false);
    });

    it('deserializes a number', () => {
      const setting = new Setting('test');
      setting.deserialize('number:10.5');
      expect(setting.type).toBe('number');
      expect(setting.value).toBe(10.5);
    });

    it('deserializes a string', () => {
      const setting = new Setting('test');
      setting.deserialize('string:test string:with:colons');
      expect(setting.type).toBe('string');
      expect(setting.value).toBe('test string:with:colons');
    });

    it('deserializes a date', () => {
      const setting = new Setting('test');
      setting.deserialize('date:1000000000000');
      expect(setting.type).toBe('date');
      expect(setting.value).toEqual(new Date(1000000000000));
    });

    it('deserializes an object', () => {
      const setting = new Setting('test');
      setting.deserialize('object:{"data":[{"test":"object"},{"test":"object2"}]}');
      expect(setting.type).toBe('object');
      expect(setting.value).toEqual({ data: [{ test: 'object' }, { test: 'object2' }] });
    });

    it('deserializes an array', () => {
      const setting = new Setting('test');
      setting.deserialize('array:[{"test":"object"},{"test":"object2"}]');
      expect(setting.type).toBe('array');
      expect(setting.value).toEqual([{ test: 'object' }, { test: 'object2' }]);
    });
  });
});
