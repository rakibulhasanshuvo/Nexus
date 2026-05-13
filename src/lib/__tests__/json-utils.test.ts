import { test } from 'node:test';
import assert from 'node:assert';
import { safeJsonParse } from '../json-utils.ts';

test('safeJsonParse - valid values', () => {
  assert.strictEqual(safeJsonParse('123', 0), 123);
  assert.strictEqual(safeJsonParse('"hello"', ''), 'hello');
  assert.strictEqual(safeJsonParse('true', false), true);
  assert.deepStrictEqual(safeJsonParse('[1, 2, 3]', []), [1, 2, 3]);
  assert.deepStrictEqual(safeJsonParse('{"a": 1}', {}), { a: 1 });
});

test('safeJsonParse - invalid JSON returns default', () => {
  // Silent console.error for tests
  const originalError = console.error;
  console.error = () => {};

  assert.strictEqual(safeJsonParse('invalid', 'default'), 'default');
  assert.deepStrictEqual(safeJsonParse('{unquoted: 1}', { a: 0 }), { a: 0 });

  console.error = originalError;
});

test('safeJsonParse - type mismatch returns default', () => {
  assert.strictEqual(safeJsonParse('123', 'string'), 'string');
  assert.strictEqual(safeJsonParse('"string"', 0), 0);
  assert.deepStrictEqual(safeJsonParse('[]', { a: 1 }), { a: 1 });
  assert.deepStrictEqual(safeJsonParse('{}', [1]), [1]);
  assert.deepStrictEqual(safeJsonParse('null', { a: 1 }), { a: 1 });
});

test('safeJsonParse - custom validator', () => {
  interface MyType { id: number; name: string }
  const isMyType = (data: any): data is MyType =>
    typeof data === 'object' && data !== null && typeof data.id === 'number';

  const valid = '{"id": 1, "name": "test"}';
  const invalid = '{"name": "missing-id"}';
  const defaultValue: MyType = { id: 0, name: '' };

  assert.deepStrictEqual(safeJsonParse(valid, defaultValue, isMyType), { id: 1, name: "test" });
  assert.deepStrictEqual(safeJsonParse(invalid, defaultValue, isMyType), defaultValue);
});

test('safeJsonParse - null handling', () => {
    assert.strictEqual(safeJsonParse('null', null), null);
    assert.strictEqual(safeJsonParse('null', 'not-null'), 'not-null');
    assert.strictEqual(safeJsonParse('{"a": 1}', null as any), null);
});
