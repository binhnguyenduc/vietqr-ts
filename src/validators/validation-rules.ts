/**
 * Shared validation utilities and common validation patterns
 *
 * This module provides reusable validation helpers used across all validators
 * to ensure consistent validation behavior and error handling.
 *
 * @example
 * ```typescript
 * const trimmed = trimAndValidateString(bankBin, 'bankBin');
 * validateNumericString(trimmed, 'bankBin', 'Bank BIN');
 * validateLength(trimmed, 'bankBin', 6, 6, 'Bank BIN');
 * ```
 */

import { ValidationError } from '../types/errors.js';
import type { ValidationErrorCode } from './error-codes.js';

/**
 * Trims whitespace from a string value and validates it's not empty
 *
 * This helper implements the whitespace handling decision: automatic trimming
 * before validation (per research.md).
 *
 * @param value - The value to trim (must be string type)
 * @param fieldName - The field name for error messages
 * @returns Trimmed string value
 * @throws {ValidationError} If value is not a string or is empty after trimming
 *
 * @example
 * ```typescript
 * const bankBin = trimAndValidateString('  970403  ', 'bankBin'); // '970403'
 * ```
 */
export function trimAndValidateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      fieldName,
      value,
      'type',
      `${fieldName} must be a string`
    );
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationError(
      fieldName,
      value,
      'required',
      `${fieldName} is required and cannot be empty`
    );
  }

  return trimmed;
}

/**
 * Validates that a string contains only numeric characters
 *
 * @param value - The string value to validate
 * @param fieldName - The field name for error messages
 * @param displayName - Human-readable name for error messages
 * @param code - Optional error code for the validation failure
 * @throws {ValidationError} If value contains non-numeric characters
 *
 * @example
 * ```typescript
 * validateNumericString('970403', 'bankBin', 'Bank BIN'); // passes
 * validateNumericString('970A03', 'bankBin', 'Bank BIN'); // throws
 * ```
 */
export function validateNumericString(
  value: string,
  fieldName: string,
  displayName: string,
  code?: ValidationErrorCode
): void {
  if (!/^\d+$/.test(value)) {
    const error = new ValidationError(
      fieldName,
      value,
      'format',
      `${displayName} must contain only numeric digits (0-9)`
    );

    if (code) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
        writable: false,
      });
    }

    throw error;
  }
}

/**
 * Validates that a string contains only alphanumeric characters
 *
 * @param value - The string value to validate
 * @param fieldName - The field name for error messages
 * @param displayName - Human-readable name for error messages
 * @param code - Optional error code for the validation failure
 * @throws {ValidationError} If value contains non-alphanumeric characters
 *
 * @example
 * ```typescript
 * validateAlphanumericString('ABC123', 'accountNumber', 'Account number'); // passes
 * validateAlphanumericString('ABC-123', 'accountNumber', 'Account number'); // throws
 * ```
 */
export function validateAlphanumericString(
  value: string,
  fieldName: string,
  displayName: string,
  code?: ValidationErrorCode
): void {
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    const error = new ValidationError(
      fieldName,
      value,
      'format',
      `${displayName} must contain only alphanumeric characters (A-Z, a-z, 0-9)`
    );

    if (code) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
        writable: false,
      });
    }

    throw error;
  }
}

/**
 * Validates string length constraints
 *
 * @param value - The string value to validate
 * @param fieldName - The field name for error messages
 * @param minLength - Minimum allowed length (inclusive), or null for no minimum
 * @param maxLength - Maximum allowed length (inclusive), or null for no maximum
 * @param displayName - Human-readable name for error messages
 * @param code - Optional error code for the validation failure
 * @throws {ValidationError} If value length is outside the allowed range
 *
 * @example
 * ```typescript
 * validateLength('970403', 'bankBin', 6, 6, 'Bank BIN'); // passes (exactly 6)
 * validateLength('12345', 'bankBin', 6, 6, 'Bank BIN'); // throws (too short)
 * validateLength('toolongaccountnumber', 'accountNumber', null, 19, 'Account number'); // throws
 * ```
 */
export function validateLength(
  value: string,
  fieldName: string,
  minLength: number | null,
  maxLength: number | null,
  displayName: string,
  code?: ValidationErrorCode
): void {
  const actualLength = value.length;

  if (minLength !== null && maxLength !== null && minLength === maxLength) {
    // Exact length requirement
    if (actualLength !== minLength) {
      const error = new ValidationError(
        fieldName,
        value,
        'length',
        `${displayName} must be exactly ${minLength} ${minLength === 1 ? 'character' : 'characters'}. ` +
          `Expected: ${minLength} ${minLength === 1 ? 'character' : 'characters'}, ` +
          `Received: "${value}" (${actualLength} ${actualLength === 1 ? 'character' : 'characters'})`
      );

      if (code) {
        Object.defineProperty(error, 'code', {
          value: code,
          enumerable: true,
          writable: false,
        });
        Object.defineProperty(error, 'expectedFormat', {
          value: `${minLength} ${minLength === 1 ? 'character' : 'characters'}`,
          enumerable: true,
          writable: false,
        });
      }

      throw error;
    }
  } else {
    // Range-based length requirement
    if (minLength !== null && actualLength < minLength) {
      const error = new ValidationError(
        fieldName,
        value,
        'length',
        `${displayName} must be at least ${minLength} ${minLength === 1 ? 'character' : 'characters'}. ` +
          `Expected: ≥ ${minLength} ${minLength === 1 ? 'character' : 'characters'}, ` +
          `Received: ${actualLength} ${actualLength === 1 ? 'character' : 'characters'}`
      );

      if (code) {
        Object.defineProperty(error, 'code', {
          value: code,
          enumerable: true,
          writable: false,
        });
        Object.defineProperty(error, 'expectedFormat', {
          value: `≥ ${minLength} ${minLength === 1 ? 'character' : 'characters'}`,
          enumerable: true,
          writable: false,
        });
      }

      throw error;
    }

    if (maxLength !== null && actualLength > maxLength) {
      const error = new ValidationError(
        fieldName,
        value,
        'length',
        `${displayName} must not exceed ${maxLength} ${maxLength === 1 ? 'character' : 'characters'}. ` +
          `Expected: ≤ ${maxLength} ${maxLength === 1 ? 'character' : 'characters'}, ` +
          `Received: ${actualLength} ${actualLength === 1 ? 'character' : 'characters'}`
      );

      if (code) {
        Object.defineProperty(error, 'code', {
          value: code,
          enumerable: true,
          writable: false,
        });
        Object.defineProperty(error, 'expectedFormat', {
          value: `≤ ${maxLength} ${maxLength === 1 ? 'character' : 'characters'}`,
          enumerable: true,
          writable: false,
        });
      }

      throw error;
    }
  }
}

/**
 * Sanitizes a value for safe display in error messages
 *
 * Prevents excessively long values from cluttering error messages while
 * preserving useful debugging information.
 *
 * @param value - The value to sanitize
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Sanitized string representation
 *
 * @example
 * ```typescript
 * sanitizeForErrorMessage('short'); // '"short"'
 * sanitizeForErrorMessage('a'.repeat(100)); // '"aaaa...aaaa" (100 characters)'
 * sanitizeForErrorMessage(undefined); // 'undefined'
 * sanitizeForErrorMessage(null); // 'null'
 * ```
 */
export function sanitizeForErrorMessage(value: unknown, maxLength = 50): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const str = String(value);
  if (str.length <= maxLength) {
    return `"${str}"`;
  }

  const halfLength = Math.floor(maxLength / 2) - 2;
  return `"${str.slice(0, halfLength)}...${str.slice(-halfLength)}" (${str.length} characters)`;
}

/**
 * Validates that a numeric string represents a positive number
 *
 * @param value - The numeric string to validate
 * @param fieldName - The field name for error messages
 * @param displayName - Human-readable name for error messages
 * @param code - Optional error code for the validation failure
 * @throws {ValidationError} If value is zero or negative
 *
 * @example
 * ```typescript
 * validatePositiveNumber('50000', 'amount', 'Amount'); // passes
 * validatePositiveNumber('0', 'amount', 'Amount'); // throws
 * validatePositiveNumber('-500', 'amount', 'Amount'); // throws
 * ```
 */
export function validatePositiveNumber(
  value: string,
  fieldName: string,
  displayName: string,
  code?: ValidationErrorCode
): void {
  const num = parseFloat(value);

  if (isNaN(num) || num <= 0) {
    const error = new ValidationError(
      fieldName,
      value,
      'value',
      `${displayName} must be a positive number. Expected: > 0, Received: "${value}"`
    );

    if (code) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
        writable: false,
      });
      Object.defineProperty(error, 'expectedFormat', {
        value: '> 0',
        enumerable: true,
        writable: false,
      });
    }

    throw error;
  }
}

/**
 * Validates that a value is one of the allowed options
 *
 * @param value - The value to validate
 * @param fieldName - The field name for error messages
 * @param allowedValues - Array of allowed values
 * @param displayName - Human-readable name for error messages
 * @param code - Optional error code for the validation failure
 * @throws {ValidationError} If value is not in the allowed set
 *
 * @example
 * ```typescript
 * validateEnum('QRIBFTTA', 'serviceCode', ['QRIBFTTA', 'QRIBFTTC'], 'Service code'); // passes
 * validateEnum('INVALID', 'serviceCode', ['QRIBFTTA', 'QRIBFTTC'], 'Service code'); // throws
 * ```
 */
export function validateEnum<T>(
  value: T,
  fieldName: string,
  allowedValues: readonly T[],
  displayName: string,
  code?: ValidationErrorCode
): void {
  if (!allowedValues.includes(value)) {
    const allowedStr = allowedValues.map((v) => `"${v}"`).join(' or ');
    const error = new ValidationError(
      fieldName,
      value,
      'enum',
      `Invalid ${displayName}. Expected: ${allowedStr}, Received: ${sanitizeForErrorMessage(value)}`
    );

    if (code) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
        writable: false,
      });
      Object.defineProperty(error, 'expectedFormat', {
        value: allowedStr,
        enumerable: true,
        writable: false,
      });
    }

    throw error;
  }
}
