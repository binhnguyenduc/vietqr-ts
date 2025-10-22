/**
 * VietQR CRC-16-CCITT Checksum Validator
 *
 * Implements CRC-16-CCITT checksum calculation and verification per NAPAS IBFT v1.5.2.
 * Uses polynomial 0x1021 with initial value 0xFFFF.
 *
 * @module validators/crc-validator
 */

import type { ValidationError } from '../types/decode';
import { ValidationErrorCode, FIELD_CONSTRAINTS } from '../types/decode';

/**
 * CRC-16-CCITT polynomial (0x1021)
 */
const CRC_POLYNOMIAL = 0x1021;

/**
 * Initial CRC value (0xFFFF)
 */
const CRC_INITIAL = 0xFFFF;

/**
 * Validates CRC format and verifies checksum
 *
 * @param qrString - Complete QR string including CRC field
 * @param crcValue - CRC value extracted from Field 63
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - CRC must be exactly 4 hexadecimal characters
 * - Case-insensitive validation (B7C9 = b7c9)
 * - Calculates CRC over QR string minus last 4 characters (the CRC itself)
 */
export function validateCRC(
  qrString: string,
  crcValue: string | undefined
): ValidationError | null {
  if (crcValue === undefined || crcValue === null) {
    return {
      field: 'crc',
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: 'CRC is required'
    };
  }

  // Check format: must be exactly 4 characters
  if (crcValue.length !== FIELD_CONSTRAINTS.CRC_LENGTH) {
    return {
      field: 'crc',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: `CRC must be exactly ${FIELD_CONSTRAINTS.CRC_LENGTH} hexadecimal characters`,
      expectedFormat: '4 hexadecimal digits (e.g., "B7C9")',
      actualValue: crcValue
    };
  }

  // Check for non-hexadecimal characters
  if (!/^[0-9A-Fa-f]{4}$/.test(crcValue)) {
    // Distinguish between invalid characters vs wrong format
    if (/^[0-9A-Za-z]{4}$/.test(crcValue)) {
      return {
        field: 'crc',
        code: ValidationErrorCode.INVALID_FORMAT,
        message: 'CRC contains non-hexadecimal characters',
        expectedFormat: 'Hexadecimal only (0-9, A-F)',
        actualValue: crcValue
      };
    }

    return {
      field: 'crc',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'CRC contains invalid characters',
      expectedFormat: 'Hexadecimal only (0-9, A-F)',
      actualValue: crcValue
    };
  }

  // Calculate expected CRC
  // Per EMV spec: CRC is calculated over everything EXCEPT the CRC value itself
  // QR string format: ...6304XXXX where 6304 is Field 63 (length 04), XXXX is CRC
  // Calculate over: ...6304 (include field ID and length, exclude CRC value)
  const dataForCRC = qrString.substring(0, qrString.length - FIELD_CONSTRAINTS.CRC_LENGTH);
  const calculatedCRC = calculateCRC(dataForCRC);

  // Compare (case-insensitive)
  if (calculatedCRC.toUpperCase() !== crcValue.toUpperCase()) {
    return {
      field: 'crc',
      code: ValidationErrorCode.CHECKSUM_MISMATCH,
      message: 'CRC verification failed - data may be corrupted or tampered',
      expectedFormat: `Expected CRC: ${calculatedCRC}`,
      actualValue: crcValue
    };
  }

  return null;
}

/**
 * Verifies CRC of complete QR string
 *
 * @param qrString - Complete QR string including CRC field
 * @returns true if CRC is valid, false otherwise
 *
 * @remarks
 * Convenience function for quick boolean CRC checks without detailed error info.
 * For detailed error reporting, use validateCRC() instead.
 */
export function verifyCRC(qrString: string): boolean {
  if (!qrString || qrString.length < 4) {
    return false;
  }

  // Extract CRC from last 4 characters
  const crcValue = qrString.substring(qrString.length - FIELD_CONSTRAINTS.CRC_LENGTH);

  // Validate format
  if (!/^[0-9A-Fa-f]{4}$/.test(crcValue)) {
    return false;
  }

  // Calculate and compare
  const dataForCRC = qrString.substring(0, qrString.length - FIELD_CONSTRAINTS.CRC_LENGTH);
  const calculatedCRC = calculateCRC(dataForCRC);

  return calculatedCRC.toUpperCase() === crcValue.toUpperCase();
}

/**
 * Calculates CRC-16-CCITT checksum for given data
 *
 * @param data - Input data string to calculate CRC for
 * @returns CRC value as 4-character uppercase hexadecimal string
 *
 * @remarks
 * Algorithm: CRC-16-CCITT
 * - Polynomial: 0x1021
 * - Initial value: 0xFFFF
 * - No final XOR
 * - Bit-by-bit processing
 *
 * This is the standard EMV QR CRC calculation per ISO/IEC 13239.
 */
export function calculateCRC(data: string): string {
  let crc = CRC_INITIAL;

  // Convert string to UTF-8 bytes for correct CRC calculation
  const buffer = Buffer.from(data, 'utf-8');

  // Process each byte of input data
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];

    if (byte === undefined) continue;

    // XOR byte with high byte of CRC
    crc ^= (byte << 8);

    // Process all 8 bits
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ CRC_POLYNOMIAL;
      } else {
        crc <<= 1;
      }

      // Keep CRC in 16-bit range
      crc &= 0xFFFF;
    }
  }

  // Convert to 4-character uppercase hex string
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
