/**
 * Image format detection using magic bytes
 *
 * @module decoders/format-detector
 */

export type ImageFormat = 'png' | 'jpeg' | 'unknown';

/**
 * Detect image format from buffer using magic bytes/file signatures
 *
 * @param imageBuffer - Image data to analyze
 * @returns Image format ('png', 'jpeg', or 'unknown')
 *
 * @remarks
 * Detection based on file magic bytes:
 * - PNG: Starts with `89 50 4E 47 0D 0A 1A 0A` (8 bytes)
 * - JPEG: Starts with `FF D8 FF` (3 bytes minimum)
 *
 * @example
 * ```typescript
 * const format = detectImageFormat(buffer);
 * if (format === 'unknown') {
 *   throw new Error('Unsupported format, use PNG or JPEG');
 * }
 * ```
 */
export function detectImageFormat(imageBuffer: Buffer | Uint8Array): ImageFormat {
  if (!imageBuffer || imageBuffer.length < 3) {
    return 'unknown';
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  // Check first 4 bytes for PNG signature
  if (
    imageBuffer[0] === 0x89 &&
    imageBuffer[1] === 0x50 &&
    imageBuffer[2] === 0x4e &&
    imageBuffer[3] === 0x47
  ) {
    return 'png';
  }

  // JPEG magic bytes: FF D8 FF
  // Check SOI (Start of Image) marker
  if (
    imageBuffer[0] === 0xff &&
    imageBuffer[1] === 0xd8 &&
    imageBuffer[2] === 0xff
  ) {
    return 'jpeg';
  }

  return 'unknown';
}

/**
 * Check if image format is supported for QR decoding
 *
 * @param format - Image format to check
 * @returns true if format is supported (png or jpeg)
 */
export function isSupportedFormat(format: ImageFormat): format is 'png' | 'jpeg' {
  return format === 'png' || format === 'jpeg';
}
