/**
 * VietQR string parser - Main entry point
 *
 * @module parsers
 */

import { parseTLV } from './tlv-parser';
import { extractVietQRFields } from './vietqr-parser';
import type { VietQRData, ParseResult, DecodingError } from '../types/decode';
import { DecodingErrorType, MAX_QR_STRING_LENGTH } from '../types/decode';

// Export advanced parsing options
export { parseWithOptions, type ParseOptions } from './parse-with-options';

/**
 * Parse VietQR string data into structured payment information
 *
 * @param qrString - EMV QR formatted VietQR string to parse
 * @returns ParseResult containing VietQRData on success or DecodingError on failure
 *
 * @remarks
 * - Performs TLV (Tag-Length-Value) parsing per EMV QR specification
 * - Extracts all VietQR fields from the string
 * - Handles truncated/corrupted data by extracting available fields
 * - Does NOT perform validation (use validate() for that)
 *
 * @example
 * ```typescript
 * const result = parse(qrString);
 * if (result.success) {
 *   console.log('Bank:', result.data.bankCode);
 *   console.log('Amount:', result.data.amount);
 * } else {
 *   console.error('Parse failed:', result.error.message);
 * }
 * ```
 */
export function parse(qrString: string): ParseResult<VietQRData> {
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

  if (qrString.length > MAX_QR_STRING_LENGTH) {
    return {
      success: false,
      error: {
        type: DecodingErrorType.PARSE_ERROR,
        message: `QR string exceeds maximum length (${MAX_QR_STRING_LENGTH} characters)`
      }
    };
  }

  // Parse TLV structure
  const tlvResult = parseTLV(qrString);

  if (!tlvResult.success) {
    return {
      success: false,
      error: tlvResult.error as DecodingError
    };
  }

  // Extract VietQR fields
  const partialData = extractVietQRFields(tlvResult.fields);

  // Check if we have minimum required fields
  if (!partialData.payloadFormatIndicator || !partialData.initiationMethod) {
    // Even if corrupted, try to return what we have if possible
    if (tlvResult.isCorrupted && Object.keys(partialData).length > 0) {
      // Return partial data (validation will flag issues)
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

  // Return parsed data (may be incomplete if corrupted)
  // Validation should be performed separately
  return {
    success: true,
    data: partialData as VietQRData
  };
}
