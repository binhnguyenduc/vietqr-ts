/**
 * Unit tests for VietQR image size validator
 *
 * Tests image buffer validation and size constraints per User Story 3.
 *
 * @module tests/unit/decoders/image-validator
 */

import { describe, it, expect } from 'vitest';
import { isValidImageSize, validateImageBuffer } from '../../../src/decoders/image-validator';
import { MAX_IMAGE_SIZE } from '../../../src/types/decode';

describe('isValidImageSize', () => {
  describe('Valid image sizes', () => {
    it('should accept empty buffer (0 bytes)', () => {
      const buffer = Buffer.alloc(0);
      expect(isValidImageSize(buffer)).toBe(false); // Empty is invalid
    });

    it('should accept 1 byte buffer', () => {
      const buffer = Buffer.alloc(1);
      expect(isValidImageSize(buffer)).toBe(true);
    });

    it('should accept 1KB buffer', () => {
      const buffer = Buffer.alloc(1024);
      expect(isValidImageSize(buffer)).toBe(true);
    });

    it('should accept 1MB buffer', () => {
      const buffer = Buffer.alloc(1024 * 1024);
      expect(isValidImageSize(buffer)).toBe(true);
    });

    it('should accept exactly 2MB buffer (MAX_IMAGE_SIZE)', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE);
      expect(isValidImageSize(buffer)).toBe(true);
    });

    it('should accept Uint8Array instead of Buffer', () => {
      const buffer = new Uint8Array(1024);
      expect(isValidImageSize(buffer)).toBe(true);
    });
  });

  describe('Invalid image sizes', () => {
    it('should reject 2MB + 1 byte buffer', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      expect(isValidImageSize(buffer)).toBe(false);
    });

    it('should reject 3MB buffer', () => {
      const buffer = Buffer.alloc(3 * 1024 * 1024);
      expect(isValidImageSize(buffer)).toBe(false);
    });

    it('should reject 10MB buffer', () => {
      const buffer = Buffer.alloc(10 * 1024 * 1024);
      expect(isValidImageSize(buffer)).toBe(false);
    });

    it('should reject null buffer', () => {
      expect(isValidImageSize(null as any)).toBe(false);
    });

    it('should reject undefined buffer', () => {
      expect(isValidImageSize(undefined as any)).toBe(false);
    });
  });
});

describe('validateImageBuffer', () => {
  describe('Valid image buffers', () => {
    it('should accept valid Buffer', () => {
      const buffer = Buffer.alloc(1024);
      expect(() => validateImageBuffer(buffer)).not.toThrow();
      expect(validateImageBuffer(buffer)).toBe(1024);
    });

    it('should accept valid Uint8Array', () => {
      const buffer = new Uint8Array(1024);
      expect(() => validateImageBuffer(buffer)).not.toThrow();
      expect(validateImageBuffer(buffer)).toBe(1024);
    });

    it('should return correct size for various buffers', () => {
      expect(validateImageBuffer(Buffer.alloc(100))).toBe(100);
      expect(validateImageBuffer(Buffer.alloc(1024))).toBe(1024);
      expect(validateImageBuffer(new Uint8Array(2048))).toBe(2048);
    });

    it('should accept buffer at maximum size', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE);
      expect(() => validateImageBuffer(buffer)).not.toThrow();
      expect(validateImageBuffer(buffer)).toBe(MAX_IMAGE_SIZE);
    });
  });

  describe('Invalid image buffers', () => {
    it('should reject null buffer', () => {
      expect(() => validateImageBuffer(null as any)).toThrow('Image buffer is required');
    });

    it('should reject undefined buffer', () => {
      expect(() => validateImageBuffer(undefined as any)).toThrow('Image buffer is required');
    });

    it('should reject empty buffer', () => {
      const buffer = Buffer.alloc(0);
      expect(() => validateImageBuffer(buffer)).toThrow('Image buffer is empty');
    });

    it('should reject empty Uint8Array', () => {
      const buffer = new Uint8Array(0);
      expect(() => validateImageBuffer(buffer)).toThrow('Image buffer is empty');
    });

    it('should reject buffer exceeding maximum size', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      expect(() => validateImageBuffer(buffer)).toThrow(/exceeds maximum/);
    });

    it('should reject 3MB buffer', () => {
      const buffer = Buffer.alloc(3 * 1024 * 1024);
      expect(() => validateImageBuffer(buffer)).toThrow(/exceeds maximum.*2MB/);
    });

    it('should reject non-buffer objects', () => {
      expect(() => validateImageBuffer({} as any)).toThrow('Image buffer must be Buffer or Uint8Array');
      expect(() => validateImageBuffer([] as any)).toThrow('Image buffer must be Buffer or Uint8Array');
      expect(() => validateImageBuffer('string' as any)).toThrow('Image buffer must be Buffer or Uint8Array');
      expect(() => validateImageBuffer(123 as any)).toThrow('Image buffer must be Buffer or Uint8Array');
    });
  });

  describe('Error messages', () => {
    it('should include actual size in error message', () => {
      const size = MAX_IMAGE_SIZE + 100;
      const buffer = Buffer.alloc(size);
      expect(() => validateImageBuffer(buffer)).toThrow(`Image size ${size} bytes exceeds maximum ${MAX_IMAGE_SIZE} bytes (2MB)`);
    });

    it('should mention 2MB limit in error message', () => {
      const buffer = Buffer.alloc(MAX_IMAGE_SIZE + 1);
      expect(() => validateImageBuffer(buffer)).toThrow('2MB');
    });
  });
});
