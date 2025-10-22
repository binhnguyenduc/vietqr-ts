/**
 * Image validation utilities for QR code decoding
 *
 * @module decoders/image-validator
 */

import { MAX_IMAGE_SIZE } from '../types/decode';

/**
 * Check if image buffer is within size limits
 *
 * @param imageBuffer - Image data to validate
 * @returns true if buffer size ≤ 2MB, false otherwise
 *
 * @remarks
 * - 2MB limit prevents resource exhaustion attacks
 * - Mobile-optimized size that handles typical smartphone photos (1-4MB compressed)
 * - Used for pre-validation before attempting QR decode
 *
 * @example
 * ```typescript
 * if (!isValidImageSize(imageBuffer)) {
 *   throw new Error('Image exceeds 2MB limit');
 * }
 * ```
 */
export function isValidImageSize(imageBuffer: Buffer | Uint8Array): boolean {
  if (!imageBuffer || !imageBuffer.length) {
    return false;
  }

  return imageBuffer.length <= MAX_IMAGE_SIZE;
}

/**
 * Validate image buffer and return size in bytes
 *
 * @param imageBuffer - Image data to validate
 * @returns Size in bytes if valid
 * @throws {Error} If buffer is invalid or exceeds size limit
 */
export function validateImageBuffer(imageBuffer: Buffer | Uint8Array): number {
  if (!imageBuffer) {
    throw new Error('Image buffer is required');
  }

  if (!(imageBuffer instanceof Buffer) && !(imageBuffer instanceof Uint8Array)) {
    throw new Error('Image buffer must be Buffer or Uint8Array');
  }

  const size = imageBuffer.length;

  if (size === 0) {
    throw new Error('Image buffer is empty');
  }

  if (size > MAX_IMAGE_SIZE) {
    throw new Error(`Image size ${size} bytes exceeds maximum ${MAX_IMAGE_SIZE} bytes (2MB)`);
  }

  return size;
}
