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
  MINIMAL: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF',
  DYNAMIC: '00020101021238570010A000000727013900069704220113012345678902002108QRIBFTTASV01040123530370454061000005802VN62150811Order 123163047F2C',
  STATIC: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN62070803TXT6304D2F1',
  INVALID_CRC: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304FFFF',
  MALFORMED: 'not-a-valid-qr-string',
  EMPTY: '',
};
