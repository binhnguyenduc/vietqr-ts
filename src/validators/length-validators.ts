/**
 * VietQR Field Length Validators
 *
 * Generic length validation functions for enforcing NAPAS IBFT v1.5.2 constraints.
 * Provides utilities for min/max/exact length validation with proper error reporting.
 *
 * @module validators/length-validators
 */

import type { ValidationError } from '../types/decode';
import { ValidationErrorCode } from '../types/decode';

/**
 * Length constraint options for validateFieldLength
 */
export interface LengthConstraints {
  /** Minimum allowed length (inclusive) */
  min?: number;

  /** Maximum allowed length (inclusive) */
  max?: number;

  /** Exact length(s) required (single value or array of valid lengths) */
  exact?: number | number[];
}

/**
 * Generic field length validator with flexible constraints
 *
 * @param fieldName - Name of field being validated
 * @param value - Value to check length of
 * @param constraints - Length constraints (min, max, or exact)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - For UTF-8 fields, pass byte length, not character count
 * - Exact constraints take precedence over min/max
 * - Can specify multiple valid exact lengths (e.g., [6, 8] for bank code)
 */
export function validateFieldLength(
  fieldName: string,
  value: string | undefined,
  constraints: LengthConstraints
): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: fieldName,
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: `${fieldName} is required`
    };
  }

  const length = value.length;

  // Check exact length constraints first
  if (constraints.exact !== undefined) {
    const validLengths = Array.isArray(constraints.exact) ? constraints.exact : [constraints.exact];

    if (!validLengths.includes(length)) {
      const expectedFormat = validLengths.length === 1
        ? `Exactly ${validLengths[0]} characters`
        : `Exactly ${validLengths.join(' or ')} characters`;

      return {
        field: fieldName,
        code: ValidationErrorCode.INVALID_FORMAT,
        message: `${fieldName} must be ${expectedFormat}`,
        expectedFormat,
        actualValue: getSanitizedValue(fieldName, value)
      };
    }

    return null;
  }

  // Check minimum length
  if (constraints.min !== undefined && length < constraints.min) {
    return {
      field: fieldName,
      code: ValidationErrorCode.LENGTH_TOO_SHORT,
      message: `${fieldName} is too short (minimum ${constraints.min} characters)`,
      expectedFormat: `Minimum ${constraints.min} characters`,
      actualValue: getSanitizedValue(fieldName, value)
    };
  }

  // Check maximum length
  if (constraints.max !== undefined && length > constraints.max) {
    return {
      field: fieldName,
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `${fieldName} exceeds maximum length of ${constraints.max} characters`,
      expectedFormat: `Maximum ${constraints.max} characters`,
      actualValue: getSanitizedValue(fieldName, value)
    };
  }

  return null;
}

/**
 * Validates that field does not exceed maximum length
 *
 * @param fieldName - Name of field being validated
 * @param value - Value to check
 * @param maxLength - Maximum allowed length
 * @returns null if valid, ValidationError if too long
 */
export function validateMaxLength(
  fieldName: string,
  value: string | undefined,
  maxLength: number
): ValidationError | null {
  return validateFieldLength(fieldName, value, { max: maxLength });
}

/**
 * Validates that field meets minimum length requirement
 *
 * @param fieldName - Name of field being validated
 * @param value - Value to check
 * @param minLength - Minimum required length
 * @returns null if valid, ValidationError if too short
 */
export function validateMinLength(
  fieldName: string,
  value: string | undefined,
  minLength: number
): ValidationError | null {
  return validateFieldLength(fieldName, value, { min: minLength });
}

/**
 * Validates that field has exact length
 *
 * @param fieldName - Name of field being validated
 * @param value - Value to check
 * @param exactLength - Required exact length (or array of valid lengths)
 * @returns null if valid, ValidationError if wrong length
 */
export function validateExactLength(
  fieldName: string,
  value: string | undefined,
  exactLength: number | number[]
): ValidationError | null {
  return validateFieldLength(fieldName, value, { exact: exactLength });
}

/**
 * Sanitizes field value for error reporting
 *
 * @param fieldName - Name of field
 * @param value - Original value
 * @returns Sanitized value safe for error messages
 *
 * @remarks
 * - Account numbers: always redacted
 * - Bank codes: always redacted
 * - Amounts: shown (not sensitive)
 * - Messages: truncated if >100 chars
 * - Other fields: shown as-is
 */
function getSanitizedValue(fieldName: string, value: string): string {
  // Always redact sensitive financial data
  if (fieldName === 'accountNumber' || fieldName === 'bankCode') {
    return '[REDACTED]';
  }

  // Truncate long messages
  if (fieldName === 'message' && value.length > 100) {
    return value.substring(0, 100) + '...';
  }

  // Show amounts and other fields as-is
  return value;
}
