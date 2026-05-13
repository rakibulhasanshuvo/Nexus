import { test, describe, mock } from 'node:test';
import assert from 'node:assert';

// Mock the env module which is imported dynamically in getApiKey
// We mock it BEFORE importing api-router to ensure the mock is picked up
// if it was a static import, but since it is dynamic it might be different.
mock.module('../env.ts', {
  namedExports: {
    getAvailableGeminiKey: async () => 'fallback-key',
  },
});

import { getApiKey, getModelIdentifier, resolveApiRoute } from '../api-router.ts';

describe('api-router', () => {
  describe('getApiKey', () => {
    test('should return trimmed user API key when provided', async () => {
      const userKey = '  user-api-key  ';
      const result = await getApiKey(userKey);
      assert.strictEqual(result, 'user-api-key');
    });

    test('should fall back to server key when user key is null', async () => {
      const result = await getApiKey(null);
      assert.strictEqual(result, 'fallback-key');
    });

    test('should fall back to server key when user key is undefined', async () => {
      const result = await getApiKey(undefined);
      assert.strictEqual(result, 'fallback-key');
    });

    test('should fall back to server key when user key is empty string', async () => {
      const result = await getApiKey('');
      assert.strictEqual(result, 'fallback-key');
    });

    test('should fall back to server key when user key is whitespace', async () => {
      const result = await getApiKey('   ');
      assert.strictEqual(result, 'fallback-key');
    });
  });

  describe('getModelIdentifier', () => {
    test('should return the correct model for DEFAULT_OPS', () => {
      const result = getModelIdentifier('DEFAULT_OPS');
      assert.strictEqual(result, 'gemma-4-31b-it');
    });

    test('should return the correct model for VECTORIZATION', () => {
      const result = getModelIdentifier('VECTORIZATION');
      assert.strictEqual(result, 'text-embedding-004');
    });
  });

  describe('resolveApiRoute', () => {
    test('should resolve to correct model and user API key', async () => {
      const config = {
        operationType: 'DEFAULT_OPS' as const,
        userApiKey: '  user-key  ',
      };
      const result = await resolveApiRoute(config);
      assert.deepStrictEqual(result, {
        model: 'gemma-4-31b-it',
        apiKey: 'user-key',
      });
    });

    test('should resolve to correct model and fallback API key', async () => {
      const config = {
        operationType: 'VECTORIZATION' as const,
        userApiKey: null,
      };
      const result = await resolveApiRoute(config);
      assert.deepStrictEqual(result, {
        model: 'text-embedding-004',
        apiKey: 'fallback-key',
      });
    });
  });
});
