import { test } from 'node:test';
import assert from 'node:assert';
import { validateFile, getSafeExtension } from '../file-validation.ts';

// Mock File class for testing in Node.js environment
class MockFile {
  name: string;
  type: string;
  size: number;
  constructor(content: any[], name: string, options: { type: string }) {
    this.name = name;
    this.type = options.type;
    this.size = 0;
  }
}

// @ts-ignore
global.File = MockFile;

test('validateFile - valid files', () => {
  const pdfFile = new File([], 'test.pdf', { type: 'application/pdf' });
  assert.deepStrictEqual(validateFile(pdfFile as unknown as File), { valid: true });

  const jpgFile = new File([], 'test.jpg', { type: 'image/jpeg' });
  assert.deepStrictEqual(validateFile(jpgFile as unknown as File), { valid: true });

  const jpegFile = new File([], 'test.jpeg', { type: 'image/jpeg' });
  assert.deepStrictEqual(validateFile(jpegFile as unknown as File), { valid: true });
});

test('validateFile - invalid MIME type', () => {
  const exeFile = new File([], 'test.exe', { type: 'application/x-msdownload' });
  assert.deepStrictEqual(validateFile(exeFile as unknown as File), { valid: false, error: 'File type not allowed.' });
});

test('validateFile - mismatched extension', () => {
  const malFile = new File([], 'test.exe', { type: 'application/pdf' });
  assert.deepStrictEqual(validateFile(malFile as unknown as File), {
    valid: false,
    error: 'File extension does not match file type. Expected .pdf'
  });
});

test('getSafeExtension', () => {
  assert.strictEqual(getSafeExtension('application/pdf'), 'pdf');
  assert.strictEqual(getSafeExtension('image/jpeg'), 'jpg');
  assert.throws(() => getSafeExtension('application/x-msdownload'), /Unsupported MIME type/);
});
