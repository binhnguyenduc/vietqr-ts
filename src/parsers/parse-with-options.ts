/**
 * Advanced parsing options for VietQR strings
 *
 * @module parsers/parse-with-options
 */

import { parseTLV } from './tlv-parser';
import { extractVietQRFields } from './vietqr-parser';
import type { VietQRData, ParseResult, DecodingError } from '../types/decode';
import { DecodingErrorType, MAX_QR_STRING_LENGTH } from '../types/decode';

/**
 * Advanced parsing options for parseWithOptions
 */
export interface ParseOptions {
  /**
   * Strict mode - reject QR strings with any missing required fields
   * @default false
   */
  strictMode?: boolean;

  /**
   * Extract partial data even when errors occur
   * When true, returns available fields even if parsing fails
   * @default false
   */
  extractPartialOnError?: boolean;

  /**
   * Maximum allowed QR string length
   * @default 4096
   */
  maxLength?: number;
}

/**
 * Parse VietQR string with advanced options
 *
 * @param qrString - EMV QR formatted VietQR string to parse
 * @param options - Advanced parsing options
 * @returns ParseResult containing VietQRData on success or DecodingError on failure
 *
 * @remarks
 * - Supports strict mode for rejecting incomplete data
 * - Can extract partial data from corrupted QR strings
 * - Allows custom maximum length validation
 *
 * @example
 * ```typescript
 * // Strict mode - reject any incomplete data
 * const strictResult = parseWithOptions(qrString, { strictMode: true });
 *
 * // Extract partial data from corrupted QR
 * const partialResult = parseWithOptions(corruptedQR, {
 *   extractPartialOnError: true
 * });
 *
 * // Custom length limit
 * const limitedResult = parseWithOptions(qrString, {
 *   maxLength: 2000
 * });
 * ```
 */
export function parseWithOptions(
  qrString: string,
  options: ParseOptions = {}
): ParseResult<VietQRData> {
  const {
    strictMode = false,
    extractPartialOnError = false,
    maxLength = MAX_QR_STRING_LENGTH
  } = options;

  // Validate input
  if (!qrString || typeof qrString !== 'string') {
    return {
      success: false,
      error: {
        type: DecodingErrorType.INVALID_FORMAT,
        message: 'QR string is required and must be a string'
      }
    };
  }

  if (qrString.length > maxLength) {
    return {
      success: false,
      error: {
        type: DecodingErrorType.PARSE_ERROR,
        message: `QR string exceeds maximum length (${maxLength} characters)`
      }
    };
  }

  // Parse TLV structure
  const tlvResult = parseTLV(qrString);

  if (!tlvResult.success) {
    // If extractPartialOnError is enabled and we have some fields, return them
    if (extractPartialOnError && tlvResult.fields && tlvResult.fields.length > 0) {
      const partialData = extractVietQRFields(tlvResult.fields);

      if (Object.keys(partialData).length > 0) {
        return {
          success: true,
          data: partialData as VietQRData
        };
      }
    }

    return {
      success: false,
      error: tlvResult.error as DecodingError
    };
  }

  // Extract VietQR fields
  const partialData = extractVietQRFields(tlvResult.fields);

  // Strict mode validation - require ALL essential fields
  if (strictMode) {
    const requiredFields = [
      'payloadFormatIndicator',
      'initiationMethod',
      'bankCode',
      'accountNumber',
      'currency',
      'countryCode',
      'crc'
    ];

    const missingFields = requiredFields.filter(
      field => !partialData[field as keyof typeof partialData]
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        error: {
          type: DecodingErrorType.INVALID_FORMAT,
          message: `Strict mode: Missing required fields: ${missingFields.join(', ')}`
        }
      };
    }

    // Also reject if data appears corrupted
    if (tlvResult.isCorrupted) {
      return {
        success: false,
        error: {
          type: DecodingErrorType.INVALID_FORMAT,
          message: 'Strict mode: QR data appears corrupted or truncated'
        }
      };
    }
  }

  // Check minimum required fields (non-strict mode)
  if (!partialData.payloadFormatIndicator || !partialData.initiationMethod) {
    // If extractPartialOnError is enabled and we have some data, return it
    if (extractPartialOnError && Object.keys(partialData).length > 0) {
      return {
        success: true,
        data: partialData as VietQRData
      };
    }

    return {
      success: false,
      error: {
        type: DecodingErrorType.INVALID_FORMAT,
        message: 'Missing required EMV QR fields (payload format or initiation method)'
      }
    };
  }

  // Return parsed data
  return {
    success: true,
    data: partialData as VietQRData
  };
}
