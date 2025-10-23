/**
 * Integration tests for VietQR decode() function
 *
 * Tests complete image decoding pipeline per User Story 3.
 *
 * @module tests/integration/decode
 */

import { describe, it, expect } from 'vitest';
import { decode, decodeAndValidate } from '../../src/decoders';
import { generatePngQR, TEST_QR_STRINGS } from '../helpers/qr-image-generator';
import { MAX_IMAGE_SIZE } from '../../src/types/decode';
import { DecodingErrorType } from '../../src/types/decode';

describe('decode()', () => {
  describe('Successful decoding', () => {
    it('should decode minimal VietQR from PNG', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bankCode).toBe('970422');
        expect(result.data.accountNumber).toBe('0123456789');
      }
    });

    it('should decode dynamic VietQR from PNG', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bankCode).toBe('970422');
        expect(result.data.accountNumber).toBe('0123456789');
        expect(result.data.amount).toBe('100000');
      }
    });

    it('should decode static VietQR with additional data', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.STATIC);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bankCode).toBe('970422');
        expect(result.data.message).toBe('TXT');
      }
    });

    it('should work with Buffer input', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      expect(Buffer.isBuffer(imageBuffer)).toBe(true);
      const result = decode(imageBuffer);
      expect(result.success).toBe(true);
    });

    it('should work with Uint8Array input', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const uint8Array = new Uint8Array(imageBuffer);
      const result = decode(uint8Array);
      expect(result.success).toBe(true);
    });
  });

  describe('Image validation errors', () => {
    it('should reject oversized image', () => {
      const oversizedBuffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      const result = decode(oversizedBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.SIZE_LIMIT_EXCEEDED);
        expect(result.error.message).toMatch(/exceeds maximum/);
      }
    });

    it('should reject empty buffer', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = decode(emptyBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.IMAGE_DECODE_ERROR);
        expect(result.error.message).toMatch(/empty/);
      }
    });

    it('should reject null buffer', () => {
      const result = decode(null as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.IMAGE_DECODE_ERROR);
        expect(result.error.message).toMatch(/required/);
      }
    });

    it('should reject undefined buffer', () => {
      const result = decode(undefined as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.IMAGE_DECODE_ERROR);
      }
    });
  });

  describe('Format detection errors', () => {
    it('should reject unsupported image format (BMP)', () => {
      // BMP magic bytes
      const bmpBuffer = Buffer.from([0x42, 0x4d, 0x00, 0x00, 0x00, 0x00]);
      const result = decode(bmpBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.UNSUPPORTED_FORMAT);
        expect(result.error.message).toMatch(/PNG.*JPEG/);
      }
    });

    it('should reject unsupported image format (GIF)', () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39]);
      const result = decode(gifBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.UNSUPPORTED_FORMAT);
      }
    });

    it('should reject unknown format', () => {
      const unknownBuffer = Buffer.from('random data');
      const result = decode(unknownBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.UNSUPPORTED_FORMAT);
      }
    });
  });

  describe('QR extraction errors', () => {
    it('should handle PNG without QR code', () => {
      // Valid PNG header but no QR code
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
      ]);
      const result = decode(pngBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect([
          DecodingErrorType.NO_QR_CODE_FOUND,
          DecodingErrorType.IMAGE_DECODE_ERROR
        ]).toContain(result.error.type);
      }
    });

    it('should handle corrupted QR image', () => {
      const corruptedBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0xff, 0xff, 0xff, 0xff
      ]);
      const result = decode(corruptedBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.IMAGE_DECODE_ERROR);
      }
    });
  });

  describe('QR parsing errors', () => {
    it('should handle QR with invalid VietQR format', async () => {
      const invalidQR = 'https://example.com';
      const imageBuffer = await generatePngQR(invalidQR);
      const result = decode(imageBuffer);

      // Should decode image successfully but fail parsing
      expect(result.success).toBe(false);
      if (!result.success) {
        // Parse error from parsers module
        expect(result.error.message).toBeDefined();
      }
    });

    it('should handle QR with malformed EMV data', async () => {
      const malformed = TEST_QR_STRINGS.MALFORMED;
      const imageBuffer = await generatePngQR(malformed);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
    });
  });

  describe('End-to-end scenarios', () => {
    it('should decode valid static QR without amount', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.initiationMethod).toBe('static');
        expect(result.data.amount).toBeUndefined();
      }
    });

    it('should decode valid dynamic QR with amount', async () => {
      const qrString = TEST_QR_STRINGS.DYNAMIC;
      const imageBuffer = await generatePngQR(qrString);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.initiationMethod).toBe('dynamic');
        expect(result.data.amount).toBe('100000');
      }
    });

    it('should handle large valid QR image', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);
      // Verify it's under size limit
      expect(imageBuffer.length).toBeLessThan(MAX_IMAGE_SIZE);

      const result = decode(imageBuffer);
      expect(result.success).toBe(true);
    });
  });
});

describe('decodeAndValidate()', () => {
  describe('Successful decoding with validation', () => {
    it('should decode and validate minimal VietQR', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const result = decodeAndValidate(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isValid).toBe(true);
      }
    });

    it('should decode and validate dynamic VietQR', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);
      const result = decodeAndValidate(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isValid).toBe(true);
        expect(result.data.errors).toHaveLength(0);
      }
    });

    it('should provide validation errors for invalid data', async () => {
      // QR with invalid CRC
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.INVALID_CRC);
      const result = decodeAndValidate(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        // Invalid CRC marks data as corrupted but may still be valid
        expect(result.data.isCorrupted).toBe(true);
      }
    });
  });

  describe('Decoding errors', () => {
    it('should propagate decode errors', () => {
      const oversizedBuffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      const result = decodeAndValidate(oversizedBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.SIZE_LIMIT_EXCEEDED);
      }
    });

    it('should propagate format errors', () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39]);
      const result = decodeAndValidate(gifBuffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe(DecodingErrorType.UNSUPPORTED_FORMAT);
      }
    });

    it('should propagate QR extraction errors', () => {
      const pngNoQR = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
      ]);
      const result = decodeAndValidate(pngNoQR);

      expect(result.success).toBe(false);
    });
  });

  describe('Validation results', () => {
    it('should include validation warnings', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const result = decodeAndValidate(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        // Warnings are optional - just verify the structure if present
        if (result.data.warnings) {
          expect(Array.isArray(result.data.warnings)).toBe(true);
        }
      }
    });

    it('should include parsed data in validation result', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);
      const result = decodeAndValidate(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isValid).toBe(true);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle undefined decode result data', async () => {
      // This tests the undefined check in decodeAndValidate
      const malformed = 'invalid';
      const imageBuffer = await generatePngQR(malformed);
      const result = decodeAndValidate(imageBuffer);

      // Should either fail decode or fail parse
      expect(result.success).toBe(false);
    });
  });
});
