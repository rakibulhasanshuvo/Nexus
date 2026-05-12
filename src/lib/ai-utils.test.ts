import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createAIClient } from './ai-utils.ts';

describe('createAIClient', () => {
  test('should instantiate the provided class with the API key', () => {
    const apiKey = 'test-api-key';

    class MockAI {
      config: { apiKey: string };
      constructor(config: { apiKey: string }) {
        this.config = config;
      }
    }

    const client = createAIClient(MockAI, apiKey);

    assert.strictEqual(client.config.apiKey, apiKey);
    assert.ok(client instanceof MockAI);
  });
});
