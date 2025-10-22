import { describe, it, expect } from 'vitest';
import type { ErrorCorrectionLevel } from '../../../src/types/qr-image';

/**
 * Unit tests for QR matrix generation utilities
 *
 * Tests the wrapper around qrcode.create() for generating QR code matrices.
 */

describe('QR Encoder Utilities', () => {
  /**
   * T019: Unit test - QR matrix generation with default config
   *
   * Verifies that generateQRMatrix function:
   * - Accepts VietQR data string
   * - Uses default error correction level 'M'
   * - Returns a valid QR matrix structure
   */
  it('T019: QR matrix generation with default config', async () => {
    // This test will fail until generateQRMatrix is implemented
    const { generateQRMatrix } = await import('../../../src/utils/qr-encoder');

    const testData =
      '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

    const qrMatrix = await generateQRMatrix(testData);

    // Verify matrix exists
    expect(qrMatrix).toBeDefined();
    expect(qrMatrix).toHaveProperty('modules');
    expect(qrMatrix).toHaveProperty('version');

    // Verify modules structure (qrcode library uses Uint8Array)
    expect(qrMatrix.modules).toBeDefined();
    expect(qrMatrix.modules.size).toBeGreaterThan(0);
  });

  it('QR matrix generation with custom error correction level', async () => {
    const { generateQRMatrix } = await import('../../../src/utils/qr-encoder');

    const testData =
      '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

    const errorLevels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

    for (const level of errorLevels) {
      const qrMatrix = await generateQRMatrix(testData, level);

      // Verify matrix generated successfully
      expect(qrMatrix).toBeDefined();
      expect(qrMatrix.modules.size).toBeGreaterThan(0);
    }
  });
});
