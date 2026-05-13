import { test } from 'node:test';
import assert from 'node:assert';
import { safeJsonParse } from '../../lib/json-utils.ts';

/**
 * This test verifies that the secure logic correctly rejects
 * incompatible JSON types and falls back to the default value.
 */
test('repro - secure JSON parsing of localStorage rejects unexpected types', () => {
  const initialValue = { count: 0 };
  let storedValue: any = initialValue;
  const setStoredValue = (val: any) => { storedValue = val; };

  // Malicious or unexpected data in localStorage that is technically valid JSON
  const malformedItems = [
    'null',
    'true',
    '"just a string"',
    '123',
    '[1, 2, 3]' // Array is an object but not our object
  ];

  for (const item of malformedItems) {
    // This simulates the FIXED handleUpdate / initial load logic
    const parsed = safeJsonParse(item, initialValue);
    setStoredValue(parsed);

    // Verification: storedValue should NOT have changed to the malformed item.
    // It should have fallen back to initialValue.
    assert.deepStrictEqual(storedValue, initialValue);
    assert.strictEqual(typeof storedValue, typeof initialValue);
  }
});

test('repro - secure JSON parsing accepts valid types', () => {
  const initialValue = { count: 0 };
  const validItem = '{"count": 10}';

  const parsed = safeJsonParse(validItem, initialValue);
  assert.deepStrictEqual(parsed, { count: 10 });
});
