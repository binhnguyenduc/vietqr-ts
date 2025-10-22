/**
 * VietQR Required Fields Validator
 *
 * Validates that all mandatory fields per NAPAS IBFT v1.5.2 are present.
 * Checks for undefined/null required fields and returns comprehensive errors.
 *
 * @module validators/required-fields-validator
 */

import type { VietQRData, ValidationError } from '../types/decode';
import { ValidationErrorCode } from '../types/decode';

/**
 * List of required fields per NAPAS IBFT v1.5.2 specification
 */
const REQUIRED_FIELDS: (keyof VietQRData)[] = [
  'payloadFormatIndicator',
  'initiationMethod',
  'bankCode',
  'accountNumber',
  'currency',
  'countryCode',
  'crc'
];

/**
 * Validates that all required fields are present and non-empty
 *
 * @param data - VietQR data to validate
 * @returns Array of validation errors (empty if all required fields present)
 *
 * @remarks
 * Required fields per NAPAS IBFT v1.5.2:
 * - payloadFormatIndicator (Field 00)
 * - initiationMethod (Field 01)
 * - bankCode (Field 38.01.00)
 * - accountNumber (Field 38.01.01)
 * - currency (Field 53)
 * - countryCode (Field 58)
 * - crc (Field 63)
 *
 * Optional fields:
 * - amount (Field 54) - required for dynamic QR, optional for static
 * - message (Field 62.08)
 * - purposeCode (Field 62.07)
 * - billNumber (Field 62.05 or 62.09)
 * - merchantCategory (Field 52)
 */
export function validateRequiredFields(data: Partial<VietQRData>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const fieldName of REQUIRED_FIELDS) {
    const value = data[fieldName];

    if (value === undefined || value === null) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
        message: `Required field '${fieldName}' is missing`,
        expectedFormat: getExpectedFormat(fieldName)
      });
      continue;
    }

    // Check for empty strings (required fields cannot be empty)
    if (typeof value === 'string' && value.length === 0) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.INVALID_FORMAT,
        message: `Required field '${fieldName}' cannot be empty`,
        expectedFormat: getExpectedFormat(fieldName),
        actualValue: '[empty string]'
      });
    }
  }

  return errors;
}

/**
 * Gets expected format description for a field
 *
 * @param fieldName - Name of field
 * @returns Human-readable format description
 */
function getExpectedFormat(fieldName: keyof VietQRData): string {
  const formats: Record<string, string> = {
    payloadFormatIndicator: '"01"',
    initiationMethod: '"static" or "dynamic"',
    bankCode: '6-digit BIN or 8-character CITAD',
    accountNumber: '1-19 digit account number',
    currency: '"704" (VND)',
    countryCode: '"VN"',
    crc: '4 hexadecimal characters'
  };

  return formats[fieldName] || 'See NAPAS IBFT v1.5.2 specification';
}
