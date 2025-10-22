/**
 * Unit tests for VietQR image format detector
 *
 * Tests image format detection using magic bytes per User Story 3.
 *
 * @module tests/unit/decoders/format-detector
 */

import { describe, it, expect } from 'vitest';
import { detectImageFormat, isSupportedFormat } from '../../../src/decoders/format-detector';

describe('detectImageFormat', () => {
  describe('PNG format detection', () => {
    it('should detect PNG by magic bytes (89 50 4E 47)', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      expect(detectImageFormat(buffer)).toBe('png');
    });

    it('should detect PNG with minimal header', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(detectImageFormat(buffer)).toBe('png');
    });

    it('should detect PNG with additional data', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0xff]);
      expect(detectImageFormat(buffer)).toBe('png');
    });

    it('should detect PNG from Uint8Array', () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
      expect(detectImageFormat(buffer)).toBe('png');
    });
  });

  describe('JPEG format detection', () => {
    it('should detect JPEG by magic bytes (FF D8 FF)', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });

    it('should detect JPEG with minimal header', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });

    it('should detect JPEG with JFIF marker', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });

    it('should detect JPEG with EXIF marker', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x00]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });

    it('should detect JPEG from Uint8Array', () => {
      const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });
  });

  describe('Unknown format detection', () => {
    it('should return unknown for BMP format', () => {
      const buffer = Buffer.from([0x42, 0x4d, 0x00, 0x00, 0x00]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for GIF format', () => {
      const buffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for WebP format', () => {
      const buffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for TIFF format', () => {
      const buffer = Buffer.from([0x49, 0x49, 0x2a, 0x00]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for PDF', () => {
      const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for random data', () => {
      const buffer = Buffer.from([0x12, 0x34, 0x56, 0x78]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for text data', () => {
      const buffer = Buffer.from('hello world');
      expect(detectImageFormat(buffer)).toBe('unknown');
    });
  });

  describe('Edge cases', () => {
    it('should return unknown for null buffer', () => {
      expect(detectImageFormat(null as any)).toBe('unknown');
    });

    it('should return unknown for undefined buffer', () => {
      expect(detectImageFormat(undefined as any)).toBe('unknown');
    });

    it('should return unknown for empty buffer', () => {
      const buffer = Buffer.alloc(0);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for 1-byte buffer', () => {
      const buffer = Buffer.from([0x89]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should return unknown for 2-byte buffer', () => {
      const buffer = Buffer.from([0x89, 0x50]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should detect format from 3-byte buffer (JPEG minimum)', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff]);
      expect(detectImageFormat(buffer)).toBe('jpeg');
    });

    it('should detect format from 4-byte buffer (PNG minimum)', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(detectImageFormat(buffer)).toBe('png');
    });
  });

  describe('Near-miss cases', () => {
    it('should reject PNG with wrong first byte', () => {
      const buffer = Buffer.from([0x88, 0x50, 0x4e, 0x47]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should reject PNG with wrong second byte', () => {
      const buffer = Buffer.from([0x89, 0x51, 0x4e, 0x47]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should reject JPEG with wrong first byte', () => {
      const buffer = Buffer.from([0xfe, 0xd8, 0xff]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });

    it('should reject JPEG with wrong second byte', () => {
      const buffer = Buffer.from([0xff, 0xd7, 0xff]);
      expect(detectImageFormat(buffer)).toBe('unknown');
    });
  });
});

describe('isSupportedFormat', () => {
  it('should return true for PNG format', () => {
    expect(isSupportedFormat('png')).toBe(true);
  });

  it('should return true for JPEG format', () => {
    expect(isSupportedFormat('jpeg')).toBe(true);
  });

  it('should return false for unknown format', () => {
    expect(isSupportedFormat('unknown')).toBe(false);
  });

  it('should narrow type for supported formats', () => {
    const format: 'png' | 'jpeg' | 'unknown' = 'png';
    if (isSupportedFormat(format)) {
      // TypeScript should narrow format to 'png' | 'jpeg'
      const supported: 'png' | 'jpeg' = format;
      expect(supported).toBe('png');
    }
  });
});
