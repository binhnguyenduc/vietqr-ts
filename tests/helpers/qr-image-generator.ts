/**
 * Test helper for generating QR code images
 *
 * Uses qrcode package to generate test PNG images for decoder tests.
 */

import QRCode from 'qrcode';

/**
 * Generate PNG QR code image buffer for testing
 */
export async function generatePngQR(text: string): Promise<Buffer> {
  const options = {
    errorCorrectionLevel: 'M' as const,
    type: 'png' as const,
    margin: 1,
    width: 256
  };

  return QRCode.toBuffer(text, options);
}

/**
 * Generate JPEG QR code image buffer for testing (via PNG conversion)
 */
export async function generateJpegQR(text: string): Promise<Buffer> {
  // qrcode package doesn't support JPEG directly, so we'd need additional deps
  // For now, we'll just use PNG in tests
  throw new Error('JPEG generation not implemented - use PNG for tests');
}

/**
 * Common test QR strings
 */
export const TEST_QR_STRINGS = {
  // Minimal static QR: account 0123456789, bank 970422, service QRIBFTTA
  MINIMAL: '00020101021138540010A00000072701240006970422011001234567890208QRIBFTTA53037045802VN6304B1A7',

  // Dynamic QR with amount 100000: account 0123456789, bank 970422, service QRIBFTTA, amount 100000
  DYNAMIC: '00020101021238540010A00000072701240006970422011001234567890208QRIBFTTA530370454061000005802VN63041D8E',

  // Static QR with additional data (billNumber): account 0123456789, bank 970422, service QRIBFTTA, billNumber TXT
  STATIC: '00020101021138540010A00000072701240006970422011001234567890208QRIBFTTA53037045802VN62070803TXT63047693',

  // Invalid CRC (last 4 digits changed to FFFF)
  INVALID_CRC: '00020101021138540010A00000072701240006970422011001234567890208QRIBFTTA53037045802VN6304FFFF',

  MALFORMED: 'not-a-valid-qr-string',
  EMPTY: '',
};
