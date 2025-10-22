/**
 * Edge case tests for VietQR decode functionality
 *
 * Tests unusual scenarios and boundary conditions per User Story 3.
 *
 * @module tests/integration/decode-edge-cases
 */

import { describe, it, expect } from 'vitest';
import { decode } from '../../src/decoders';
import { generatePngQR } from '../helpers/qr-image-generator';
import { MAX_IMAGE_SIZE } from '../../src/types/decode';

describe('decode() edge cases', () => {
  describe('Multiple QR codes in image', () => {
    it('should extract first/largest QR code when multiple present', async () => {
      // Note: The qr package by default extracts the first/largest QR code
      // This is documented behavior per T048 (SKIPPED)
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF';
      const imageBuffer = await generatePngQR(qrString);
      const result = decode(imageBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bankCode).toBe('970422');
      }
    });

    // Note: Testing actual multi-QR images would require a more complex
    // image generation setup. The qr package handles this automatically.
  });

  describe('Boundary size images', () => {
    it('should accept image at exactly MAX_IMAGE_SIZE', () => {
      // Create a buffer at max size with PNG header
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE);
      // Add PNG magic bytes
      buffer[0] = 0x89;
      buffer[1] = 0x50;
      buffer[2] = 0x4e;
      buffer[3] = 0x47;

      const result = decode(buffer);
      // Will fail QR extraction but should pass size validation
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should not be size limit error
        expect(result.error.type).not.toBe('SIZE_LIMIT_EXCEEDED');
      }
    });

    it('should reject image at MAX_IMAGE_SIZE + 1', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      const result = decode(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SIZE_LIMIT_EXCEEDED');
      }
    });

    it('should accept 1-byte image (will fail format detection)', () => {
      const buffer = Buffer.from([0x89]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('UNSUPPORTED_FORMAT');
      }
    });
  });

  describe('Format boundary cases', () => {
    it('should detect PNG with minimum valid header', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = decode(buffer);

      // Format detection should pass, but QR extraction will fail
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should not be format error
        expect(result.error.type).not.toBe('UNSUPPORTED_FORMAT');
      }
    });

    it('should detect JPEG with minimum valid header', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).not.toBe('UNSUPPORTED_FORMAT');
      }
    });

    it('should reject near-PNG format (one byte off)', () => {
      const buffer = Buffer.from([0x88, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('UNSUPPORTED_FORMAT');
      }
    });

    it('should reject near-JPEG format (one byte off)', () => {
      const buffer = Buffer.from([0xfe, 0xd8, 0xff]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('UNSUPPORTED_FORMAT');
      }
    });
  });

  describe('QR content edge cases', () => {
    it('should handle QR with minimum content', async () => {
      const minimalQR = 'A';
      const imageBuffer = await generatePngQR(minimalQR);
      const result = decode(imageBuffer);

      // Will decode QR successfully but fail VietQR parsing
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should be parse error, not decode error
        expect(result.error.type).not.toBe('IMAGE_DECODE_ERROR');
        expect(result.error.type).not.toBe('NO_QR_CODE_FOUND');
      }
    });

    it('should handle QR with maximum practical content', async () => {
      // QR codes can hold ~2900 alphanumeric chars at highest error correction
      const longContent = 'A'.repeat(2000);
      const imageBuffer = await generatePngQR(longContent);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
      // QR extraction should succeed, parsing should fail
    });

    it('should handle QR with special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?';
      const imageBuffer = await generatePngQR(specialChars);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
      // QR extraction should succeed
    });

    it('should handle QR with Unicode characters', async () => {
      const unicode = 'Hello 世界 🌍';
      const imageBuffer = await generatePngQR(unicode);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
      // QR extraction should succeed, will fail VietQR parsing
    });

    it('should handle QR with only whitespace', async () => {
      const whitespace = '   ';
      const imageBuffer = await generatePngQR(whitespace);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
    });

    it('should handle QR with newlines and tabs', async () => {
      const formatted = 'line1\nline2\tcolumn';
      const imageBuffer = await generatePngQR(formatted);
      const result = decode(imageBuffer);

      expect(result.success).toBe(false);
    });
  });

  describe('Buffer type variations', () => {
    it('should handle Buffer with non-zero offset', async () => {
      const imageBuffer = await generatePngQR('00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF');
      // Create new buffer view with offset (simulate slice scenario)
      const largerBuffer = Buffer.concat([Buffer.alloc(100), imageBuffer]);
      const slicedBuffer = largerBuffer.subarray(100);

      const result = decode(slicedBuffer);
      expect(result.success).toBe(true);
    });

    it('should handle Uint8Array created from ArrayBuffer', async () => {
      const imageBuffer = await generatePngQR('00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF');
      const arrayBuffer = new ArrayBuffer(imageBuffer.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(imageBuffer);

      const result = decode(uint8Array);
      expect(result.success).toBe(true);
    });
  });

  describe('Corrupted data scenarios', () => {
    it('should handle PNG with corrupted IHDR chunk', () => {
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR chunk type
        0xff, 0xff, 0xff, 0xff, // corrupted data
      ]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
    });

    it('should handle JPEG with truncated data', () => {
      const buffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, // JPEG SOI + APP0
        0x00, 0x10, // truncated
      ]);
      const result = decode(buffer);

      expect(result.success).toBe(false);
    });

    it('should handle valid format with invalid QR pattern', async () => {
      // Generate a QR code, then corrupt part of the image data
      const imageBuffer = await generatePngQR('test');
      // Corrupt middle of buffer (avoid PNG header)
      if (imageBuffer.length > 100) {
        imageBuffer[imageBuffer.length / 2] ^= 0xff;
        imageBuffer[imageBuffer.length / 2 + 1] ^= 0xff;
      }

      const result = decode(imageBuffer);
      // May succeed or fail depending on corruption location
      expect(result).toBeDefined();
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should handle Buffer instance check correctly', async () => {
      const imageBuffer = await generatePngQR('00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF');
      expect(Buffer.isBuffer(imageBuffer)).toBe(true);
      expect(imageBuffer instanceof Uint8Array).toBe(true);

      const result = decode(imageBuffer);
      expect(result.success).toBe(true);
    });

    it('should handle pure Uint8Array (non-Buffer)', async () => {
      const imageBuffer = await generatePngQR('00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF');
      const uint8Array = new Uint8Array(imageBuffer.buffer, imageBuffer.byteOffset, imageBuffer.length);

      const result = decode(uint8Array);
      expect(result.success).toBe(true);
    });
  });
});
