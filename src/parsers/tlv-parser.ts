/**
 * EMV QR TLV (Tag-Length-Value) parser
 *
 * Parses EMV QR formatted strings using Tag-Length-Value encoding structure
 *
 * @module parsers/tlv-parser
 */

import { DecodingErrorType } from '../types/decode';

export interface TLVField {
  /** 2-digit field identifier */
  id: string;
  /** Field value length */
  length: number;
  /** Field value content */
  value: string;
}

export interface TLVParseResult {
  /** Parse operation succeeded */
  success: boolean;
  /** Extracted TLV fields */
  fields: TLVField[];
  /** Data appears truncated or corrupted */
  isCorrupted: boolean;
  /** Error details if parse failed */
  error?: {
    type: DecodingErrorType;
    message: string;
    position?: number;
  };
}

/**
 * Parse EMV QR TLV formatted string
 *
 * @param input - EMV QR string with TLV encoding
 * @returns Parse result with extracted fields or error
 *
 * @remarks
 * TLV format: Each field is ID (2 digits) + Length (2 digits) + Value (variable)
 * Example: "000201" → ID=00, Length=02, Value="01"
 */
export function parseTLV(input: string): TLVParseResult {
  if (!input || input.length === 0) {
    return {
      success: false,
      fields: [],
      isCorrupted: false,
      error: {
        type: DecodingErrorType.INVALID_FORMAT,
        message: 'Input string is empty',
        position: 0
      }
    };
  }

  const fields: TLVField[] = [];
  let position = 0;
  let isCorrupted = false;

  while (position < input.length) {
    // Need at least 4 characters for ID + Length
    if (position + 4 > input.length) {
      // Incomplete field structure at end
      isCorrupted = true;
      break;
    }

    // Extract field ID (2 digits)
    const id = input.substring(position, position + 2);
    if (!/^\d{2}$/.test(id)) {
      return {
        success: false,
        fields: [],
        isCorrupted: false,
        error: {
          type: DecodingErrorType.INVALID_FORMAT,
          message: `Invalid field ID at position ${position}: expected 2 digits, got "${id}"`,
          position
        }
      };
    }
    position += 2;

    // Extract length (2 digits)
    const lengthStr = input.substring(position, position + 2);
    if (!/^\d{2}$/.test(lengthStr)) {
      return {
        success: false,
        fields: [],
        isCorrupted: false,
        error: {
          type: DecodingErrorType.INVALID_FORMAT,
          message: `Invalid length at position ${position}: expected 2 digits, got "${lengthStr}"`,
          position
        }
      };
    }
    const length = parseInt(lengthStr, 10);
    position += 2;

    // Extract value (length is byte count for UTF-8)
    // Convert remaining string to buffer to handle UTF-8 byte lengths correctly
    const remainingString = input.substring(position);
    const remainingBuffer = Buffer.from(remainingString, 'utf-8');

    if (length > remainingBuffer.length) {
      // Value is truncated - not enough data to extract
      // Decision logic:
      // 1. If we've already successfully parsed some fields → treat as corruption (partial success)
      // 2. If this is the FIRST field AND we have < 50% data → parse error (too incomplete)
      // 3. Otherwise → corruption (might be usable)

      const completeness = remainingBuffer.length / length;
      const hasPartialData = fields.length > 0;

      if (!hasPartialData && completeness < 0.5) {
        // First field is severely truncated - parse error
        return {
          success: false,
          fields: [],
          isCorrupted: false,
          error: {
            type: DecodingErrorType.PARSE_ERROR,
            message: `Incomplete field value: declared length ${length} but only ${remainingBuffer.length} bytes available`,
            position
          }
        };
      }

      // Either have prior fields OR sufficient data - treat as corruption
      isCorrupted = true;
      break;
    }

    // Extract exact byte count and convert back to string
    const valueBuffer = remainingBuffer.subarray(0, length);
    const value = valueBuffer.toString('utf-8');

    // Advance position by the number of JavaScript characters consumed
    position += value.length;

    fields.push({ id, length, value });
  }

  return {
    success: true,
    fields,
    isCorrupted
  };
}
