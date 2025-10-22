/**
 * QR code extraction from image buffers
 *
 * @module decoders/qr-extractor
 */

import { decodeQR } from 'qr/decode.js';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import { detectImageFormat, isSupportedFormat } from './format-detector';

/**
 * Decode image buffer to raw pixel data
 *
 * @param imageBuffer - PNG or JPEG image data
 * @returns Image object with width, height, and RGBA pixel data
 */
function decodeImageToPixels(imageBuffer: Buffer | Uint8Array): {
  width: number;
  height: number;
  data: Uint8Array;
} {
  // Ensure we have a Buffer
  const buffer = Buffer.from(imageBuffer);

  // Detect format
  const format = detectImageFormat(buffer);

  if (!isSupportedFormat(format)) {
    throw new Error('Unsupported image format');
  }

  if (format === 'png') {
    // Decode PNG
    const png = PNG.sync.read(buffer);
    return {
      width: png.width,
      height: png.height,
      data: png.data
    };
  } else {
    // Decode JPEG
    const jpegData = jpeg.decode(buffer);
    return {
      width: jpegData.width,
      height: jpegData.height,
      data: jpegData.data
    };
  }
}

/**
 * Extract QR code string from image buffer
 *
 * @param imageBuffer - PNG or JPEG image data
 * @returns Decoded QR string
 * @throws {Error} If no QR code found or decoding fails
 *
 * @remarks
 * - Uses `qr` package by paulmillr for QR decoding
 * - Supports PNG and JPEG formats
 * - If multiple QR codes present, extracts the first/largest one
 * - Returns raw QR string data without validation
 *
 * @example
 * ```typescript
 * try {
 *   const qrString = extractQRString(imageBuffer);
 *   console.log('Decoded:', qrString);
 * } catch (error) {
 *   console.error('No QR code found');
 * }
 * ```
 */
export function extractQRString(imageBuffer: Buffer | Uint8Array): string {
  try {
    // Step 1: Decode image to raw pixels
    const imageData = decodeImageToPixels(imageBuffer);

    // Step 2: Decode QR code from pixel data
    const qrString = decodeQR(imageData);

    if (!qrString || qrString.length === 0) {
      throw new Error('QR code decoded but contained no data');
    }

    return qrString;
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      if (error.message.includes('No QR code') || error.message.includes('contained no data')) {
        throw error;
      }
      throw new Error(`Failed to decode QR code: ${error.message}`);
    }
    throw new Error('Failed to decode QR code from image');
  }
}

/**
 * Check if buffer contains a valid QR code (without extracting)
 *
 * @param imageBuffer - Image data to check
 * @returns true if QR code detected, false otherwise
 *
 * @remarks
 * This is a lightweight check that attempts to detect QR presence
 * without full decoding. Useful for pre-validation.
 */
export function hasQRCode(imageBuffer: Buffer | Uint8Array): boolean {
  try {
    const imageData = decodeImageToPixels(imageBuffer);
    const result = decodeQR(imageData);
    return result !== null && result !== undefined;
  } catch {
    return false;
  }
}
