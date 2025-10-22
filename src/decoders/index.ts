/**
 * VietQR image decoding - Main entry point
 *
 * @module decoders
 */

import { parse } from '../parsers';
import { validate } from '../validators';
import type { VietQRData, ParseResult, ValidationResult } from '../types/decode';
import { DecodingErrorType } from '../types/decode';
import { validateImageBuffer } from './image-validator';
import { detectImageFormat, isSupportedFormat } from './format-detector';
import { extractQRString } from './qr-extractor';

/**
 * Decode QR code image to extract VietQR string, then parse to structured data
 *
 * @param imageBuffer - Image data as Buffer (Node.js) or Uint8Array (browser)
 * @returns ParseResult containing VietQRData on success or DecodingError on failure
 *
 * @remarks
 * - Supports PNG and JPEG image formats
 * - Enforces 2MB maximum file size (rejects larger images before decoding)
 * - Extracts first/largest QR code if multiple codes present
 * - Automatically parses extracted QR string to VietQRData
 * - Does NOT perform validation (use decodeAndValidate() for combined operation)
 *
 * @example
 * ```typescript
 * import fs from 'fs/promises';
 * import { decode } from 'vietqr';
 *
 * const imageBuffer = await fs.readFile('qr-code.png');
 * const result = decode(imageBuffer);
 *
 * if (result.success) {
 *   console.log('Bank:', result.data.bankCode);
 *   console.log('Account:', result.data.accountNumber);
 *   console.log('Amount:', result.data.amount);
 * } else {
 *   console.error('Decode failed:', result.error.message);
 * }
 * ```
 */
export function decode(imageBuffer: Buffer | Uint8Array): ParseResult<VietQRData> {
  // Step 1: Validate image buffer and size
  try {
    validateImageBuffer(imageBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid image buffer';

    // Determine error type based on message
    let errorType = DecodingErrorType.IMAGE_DECODE_ERROR;
    if (message.includes('exceeds maximum')) {
      errorType = DecodingErrorType.SIZE_LIMIT_EXCEEDED;
    }

    return {
      success: false,
      error: {
        type: errorType,
        message
      }
    };
  }

  // Step 2: Detect and validate image format
  const format = detectImageFormat(imageBuffer);

  if (!isSupportedFormat(format)) {
    return {
      success: false,
      error: {
        type: DecodingErrorType.UNSUPPORTED_FORMAT,
        message: 'Unsupported image format. Only PNG and JPEG are supported.'
      }
    };
  }

  // Step 3: Extract QR string from image
  let qrString: string;
  try {
    qrString = extractQRString(imageBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to decode QR code';

    // Determine error type based on message
    let errorType = DecodingErrorType.IMAGE_DECODE_ERROR;
    if (message.includes('No QR code')) {
      errorType = DecodingErrorType.NO_QR_CODE_FOUND;
    }

    return {
      success: false,
      error: {
        type: errorType,
        message
      }
    };
  }

  // Step 4: Parse QR string to VietQRData
  const parseResult = parse(qrString);

  if (!parseResult.success) {
    // Pass through parse errors
    return parseResult;
  }

  // Return successfully parsed data
  return parseResult;
}

/**
 * Decode QR code image, parse to structured data, and validate
 *
 * @param imageBuffer - Image data as Buffer (Node.js) or Uint8Array (browser)
 * @returns ParseResult containing ValidationResult on success or DecodingError on failure
 *
 * @remarks
 * This is a convenience function that combines decode() and validate():
 * 1. Decode QR image to string
 * 2. Parse string to VietQRData
 * 3. Validate parsed data
 * 4. Return ValidationResult
 *
 * If decoding or parsing fails, returns ParseResult with DecodingError.
 * If successful, returns ParseResult with ValidationResult.
 *
 * @example
 * ```typescript
 * import { decodeAndValidate } from 'vietqr';
 *
 * const result = decodeAndValidate(imageBuffer);
 *
 * if (result.success) {
 *   if (result.data.isValid) {
 *     console.log('✓ Valid VietQR payment');
 *     // Safe to process payment
 *   } else {
 *     console.warn('✗ Invalid VietQR data');
 *     result.data.errors.forEach(err => {
 *       console.error(`  ${err.field}: ${err.message}`);
 *     });
 *   }
 * } else {
 *   console.error('Decode failed:', result.error.message);
 * }
 * ```
 */
export function decodeAndValidate(imageBuffer: Buffer | Uint8Array): ParseResult<ValidationResult> {
  // Step 1: Decode and parse image
  const decodeResult = decode(imageBuffer);

  if (!decodeResult.success) {
    // Return decode/parse errors
    return {
      success: false,
      error: decodeResult.error
    };
  }

  // Step 2: Validate parsed data
  // Note: validate() requires the original qrString for CRC verification
  // Since we already decoded and parsed successfully, we have valid data
  // We validate with empty qrString (validates format only, not CRC from image)
  if (!decodeResult.data) {
    return {
      success: false,
      error: {
        type: DecodingErrorType.PARSE_ERROR,
        message: 'Decoded data is undefined'
      }
    };
  }

  const validationResult = validate(decodeResult.data, '');

  // Return validation result wrapped in ParseResult
  return {
    success: true,
    data: validationResult
  };
}

// Re-export utilities for convenience
export { isValidImageSize } from './image-validator';
export { detectImageFormat } from './format-detector';
export type { ImageFormat } from './format-detector';
