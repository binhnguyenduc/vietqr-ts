/**
 * VietQR Validation Error Builder
 *
 * Utility functions for constructing validation errors with proper sanitization.
 * Prevents sensitive data exposure in error messages per security requirements.
 *
 * @module validators/error-builder
 */

import type { ValidationError, ValidationWarning } from '../types/decode';
import { ValidationErrorCode, ValidationWarningCode } from '../types/decode';

/**
 * Sensitive field names that should be redacted in error messages
 */
const SENSITIVE_FIELDS = new Set(['accountNumber', 'bankCode']);

/**
 * Fields that should be truncated if too long in error messages
 */
const TRUNCATABLE_FIELDS = new Set(['message', 'purposeCode']);

/**
 * Maximum length for field values in error messages
 */
const MAX_ERROR_VALUE_LENGTH = 100;

/**
 * Builds a validation error with automatic value sanitization
 *
 * @param field - Name of field with error
 * @param code - Error code
 * @param message - Human-readable error message
 * @param options - Optional error details
 * @returns Sanitized validation error
 *
 * @remarks
 * Sanitization rules:
 * - Account numbers: always "[REDACTED]"
 * - Bank codes: always "[REDACTED]"
 * - Messages: truncated to 100 chars if longer
 * - Other fields: shown as-is (amounts, codes, etc.)
 */
export function buildError(
  field: string,
  code: ValidationErrorCode,
  message: string,
  options?: {
    expectedFormat?: string;
    actualValue?: string;
  }
): ValidationError {
  const error: ValidationError = {
    field,
    code,
    message
  };

  if (options?.expectedFormat) {
    error.expectedFormat = options.expectedFormat;
  }

  if (options?.actualValue !== undefined) {
    error.actualValue = sanitizeValue(field, options.actualValue);
  }

  return error;
}

/**
 * Sanitizes field value for safe display in error messages
 *
 * @param field - Name of field
 * @param value - Original field value
 * @returns Sanitized value safe for error messages
 *
 * @remarks
 * Prevents sensitive data exposure and limits message size.
 * Per NAPAS security guidelines, financial account data must not
 * appear in logs or error messages.
 */
export function sanitizeValue(field: string, value: string): string {
  // Always redact sensitive financial data
  if (SENSITIVE_FIELDS.has(field)) {
    return '[REDACTED]';
  }

  // Truncate long values
  if (TRUNCATABLE_FIELDS.has(field) && value.length > MAX_ERROR_VALUE_LENGTH) {
    return value.substring(0, MAX_ERROR_VALUE_LENGTH) + '...';
  }

  // Truncate any value longer than max length
  if (value.length > MAX_ERROR_VALUE_LENGTH) {
    return value.substring(0, MAX_ERROR_VALUE_LENGTH) + '...';
  }

  return value;
}

/**
 * Builds a validation warning
 *
 * @param field - Name of field with warning
 * @param code - Warning code
 * @param message - Human-readable warning message
 * @returns Validation warning
 *
 * @remarks
 * Warnings are non-critical issues that don't prevent processing.
 * Examples: deprecated fields, unusual patterns, missing optional fields.
 */
export function buildWarning(
  field: string,
  code: ValidationWarningCode,
  message: string
): ValidationWarning {
  return {
    field,
    code,
    message
  };
}

/**
 * Merges validation error arrays, removing duplicates
 *
 * @param errorArrays - Arrays of validation errors to merge
 * @returns Deduplicated merged error array
 *
 * @remarks
 * Deduplication based on field + code combination.
 * Preserves first occurrence of each unique error.
 */
export function mergeErrors(...errorArrays: ValidationError[][]): ValidationError[] {
  const seen = new Set<string>();
  const merged: ValidationError[] = [];

  for (const errors of errorArrays) {
    for (const error of errors) {
      const key = `${error.field}:${error.code}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(error);
      }
    }
  }

  return merged;
}

/**
 * Sorts validation errors by severity and field name
 *
 * @param errors - Errors to sort
 * @returns Sorted error array
 *
 * @remarks
 * Sort priority:
 * 1. MISSING_REQUIRED_FIELD (highest priority)
 * 2. CHECKSUM_MISMATCH
 * 3. INVALID_CURRENCY, INVALID_COUNTRY
 * 4. INVALID_FORMAT
 * 5. Other errors
 * Within same priority, sorted alphabetically by field name.
 */
export function sortErrors(errors: ValidationError[]): ValidationError[] {
  const priorityMap: Record<ValidationErrorCode, number> = {
    [ValidationErrorCode.MISSING_REQUIRED_FIELD]: 1,
    [ValidationErrorCode.CHECKSUM_MISMATCH]: 2,
    [ValidationErrorCode.INVALID_CURRENCY]: 3,
    [ValidationErrorCode.INVALID_COUNTRY]: 3,
    [ValidationErrorCode.INVALID_FORMAT]: 4,
    [ValidationErrorCode.LENGTH_EXCEEDED]: 5,
    [ValidationErrorCode.LENGTH_TOO_SHORT]: 5,
    [ValidationErrorCode.INVALID_CHARACTER]: 5,
    [ValidationErrorCode.INVALID_AMOUNT]: 5,
    [ValidationErrorCode.UNKNOWN_FIELD]: 6
  };

  return [...errors].sort((a, b) => {
    // First, sort by priority
    const priorityA = priorityMap[a.code] || 999;
    const priorityB = priorityMap[b.code] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, sort alphabetically by field
    return a.field.localeCompare(b.field);
  });
}
