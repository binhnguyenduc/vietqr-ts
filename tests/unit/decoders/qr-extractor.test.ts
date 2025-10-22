/**
 * Unit tests for VietQR QR string extractor
 *
 * Tests QR code extraction from image buffers per User Story 3.
 *
 * @module tests/unit/decoders/qr-extractor
 */

import { describe, it, expect } from 'vitest';
import { extractQRString } from '../../../src/decoders/qr-extractor';
import { generatePngQR, TEST_QR_STRINGS } from '../../helpers/qr-image-generator';

describe('extractQRString', () => {
  describe('Valid QR code extraction', () => {
    it('should extract QR string from minimal VietQR PNG', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(TEST_QR_STRINGS.MINIMAL);
    });

    it('should extract QR string from dynamic VietQR PNG', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(TEST_QR_STRINGS.DYNAMIC);
    });

    it('should extract QR string from static VietQR PNG', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.STATIC);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(TEST_QR_STRINGS.STATIC);
    });

    it('should extract simple text QR code', async () => {
      const text = 'Hello World';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });

    it('should extract URL QR code', async () => {
      const url = 'https://example.com';
      const imageBuffer = await generatePngQR(url);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(url);
    });

    it('should extract long text QR code', async () => {
      const longText = 'A'.repeat(500);
      const imageBuffer = await generatePngQR(longText);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(longText);
    });

    it('should handle QR code with special characters', async () => {
      const text = 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });

    it('should handle QR code with Vietnamese characters', async () => {
      const text = 'Thanh toán QR';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });
  });

  describe('Invalid images', () => {
    it('should throw error for empty buffer', () => {
      const buffer = Buffer.alloc(0);
      expect(() => extractQRString(buffer)).toThrow();
    });

    it('should throw error for non-QR PNG image', () => {
      // PNG header without QR code data
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
      ]);
      expect(() => extractQRString(buffer)).toThrow(/No QR code|Failed to decode/);
    });

    it('should throw error for random data', () => {
      const buffer = Buffer.from('random data that is not a QR image');
      expect(() => extractQRString(buffer)).toThrow(/Failed to decode/);
    });

    it('should throw error for corrupted PNG', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xff, 0xff, 0xff]);
      expect(() => extractQRString(buffer)).toThrow(/Failed to decode/);
    });

    it('should throw error for null buffer', () => {
      expect(() => extractQRString(null as any)).toThrow();
    });

    it('should throw error for undefined buffer', () => {
      expect(() => extractQRString(undefined as any)).toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum size QR code', async () => {
      const text = 'A';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });

    it('should handle QR code with numbers only', async () => {
      const text = '1234567890';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });

    it('should handle QR code with whitespace', async () => {
      const text = '  spaces  ';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });

    it('should handle QR code with newlines', async () => {
      const text = 'line1\nline2';
      const imageBuffer = await generatePngQR(text);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(text);
    });
  });

  describe('Error messages', () => {
    it('should include descriptive error for non-QR images', () => {
      const buffer = Buffer.from('not an image');
      try {
        extractQRString(buffer);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Failed to decode QR code/);
      }
    });

    it('should indicate when no QR code found', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      try {
        extractQRString(buffer);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Error message should mention QR code not found or decode failure
        expect((error as Error).message.toLowerCase()).toMatch(/qr code|decode|failed/);
      }
    });
  });

  describe('Buffer type handling', () => {
    it('should accept Buffer type', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      expect(Buffer.isBuffer(imageBuffer)).toBe(true);
      const result = extractQRString(imageBuffer);
      expect(result).toBe(TEST_QR_STRINGS.MINIMAL);
    });

    it('should accept Uint8Array type', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const uint8Array = new Uint8Array(imageBuffer);
      const result = extractQRString(uint8Array);
      expect(result).toBe(TEST_QR_STRINGS.MINIMAL);
    });
  });
});
