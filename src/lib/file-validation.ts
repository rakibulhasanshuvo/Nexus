/**
 * Allowed MIME types and their corresponding canonical extensions.
 */
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/**
 * Validates a file's MIME type and extension.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  if (!ALLOWED_FILE_TYPES[mimeType]) {
    return { valid: false, error: 'File type not allowed.' };
  }

  const expectedExtension = ALLOWED_FILE_TYPES[mimeType];
  const actualExtension = fileName.split('.').pop();

  // Basic extension check - ensure it matches one of the allowed extensions for this MIME type
  // Note: some MIME types might have multiple extensions, but here we enforce the canonical one
  // or at least that it's not something obviously malicious like .exe
  if (actualExtension !== expectedExtension) {
    // Special case for jpeg/jpg
    if (mimeType === 'image/jpeg' && (actualExtension === 'jpg' || actualExtension === 'jpeg')) {
      return { valid: true };
    }
    return { valid: false, error: `File extension does not match file type. Expected .${expectedExtension}` };
  }

  return { valid: true };
}

/**
 * Returns the canonical extension for a given MIME type.
 */
export function getSafeExtension(mimeType: string): string {
  const ext = ALLOWED_FILE_TYPES[mimeType];
  if (!ext) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  return ext;
}
