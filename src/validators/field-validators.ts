/**
 * VietQR Field Format Validators
 *
 * Individual field validation functions per NAPAS IBFT v1.5.2 specification.
 * Each validator returns null if valid, or ValidationError if invalid.
 *
 * @module validators/field-validators
 */

import type { ValidationError } from '../types/decode';
import { ValidationErrorCode, FIELD_CONSTRAINTS, REQUIRED_VALUES } from '../types/decode';

/**
 * Validates bank code format (BIN or CITAD)
 *
 * @param value - Bank code to validate
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - BIN format: 6 numeric digits (e.g., "970422")
 * - CITAD format: 8 alphanumeric characters (e.g., "VIETBANK")
 */
export function validateBankCode(value: string | undefined): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: 'Bank code is required'
    };
  }

  if (value.length === 0) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Bank code cannot be empty',
      expectedFormat: '6 digits (BIN) or 8 alphanumeric (CITAD)'
    };
  }

  // Check for illegal characters (anything other than alphanumeric)
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Bank code contains invalid characters',
      expectedFormat: 'Alphanumeric only (no spaces or special characters)',
      actualValue: '[REDACTED]'
    };
  }

  // Check for excessive length (resource exhaustion prevention) - only for extremely long values
  const REASONABLE_MAX_LENGTH = 100;  // Security threshold for resource exhaustion
  if (value.length > REASONABLE_MAX_LENGTH) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Bank code exceeds reasonable maximum length`,
      expectedFormat: '6 digits (BIN) or 8 alphanumeric (CITAD)',
      actualValue: '[REDACTED]'
    };
  }

  // Check length: must be exactly 6 or 8 characters
  if (value.length !== FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH &&
      value.length !== FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: `Bank code must be ${FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH} or ${FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH} characters`,
      expectedFormat: '6 digits (BIN) or 8 alphanumeric (CITAD)',
      actualValue: '[REDACTED]'
    };
  }

  // If 6 characters, must be all numeric (BIN format)
  if (value.length === FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH && !/^\d{6}$/.test(value)) {
    return {
      field: 'bankCode',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: '6-character bank code must be all digits (BIN format)',
      expectedFormat: '6 numeric digits',
      actualValue: '[REDACTED]'
    };
  }

  return null;
}

/**
 * Validates account number format
 *
 * @param value - Account number to validate
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - Must be numeric only
 * - Maximum 19 digits per NAPAS spec
 * - Minimum 1 digit
 */
export function validateAccountNumber(value: string | undefined): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: 'Account number is required'
    };
  }

  if (value.length === 0) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Account number cannot be empty',
      expectedFormat: '1-19 numeric digits'
    };
  }

  // Check for special characters or spaces (more specific than letters)
  if (/[^0-9A-Za-z]/.test(value)) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Account number contains invalid characters',
      expectedFormat: 'Numeric only (0-9)',
      actualValue: '[REDACTED]'
    };
  }

  // Must be numeric only (catch letters)
  if (!/^\d+$/.test(value)) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Account number must contain only digits',
      expectedFormat: 'Numeric only (0-9)',
      actualValue: '[REDACTED]'
    };
  }

  // Check length constraints
  if (value.length > FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Account number exceeds maximum length of ${FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX} digits`,
      expectedFormat: `1-${FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX} digits`,
      actualValue: '[REDACTED]'
    };
  }

  return null;
}

/**
 * Validates transaction amount format
 *
 * @param value - Amount to validate (optional field)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - Numeric with optional decimal point
 * - Maximum 13 characters (including decimal)
 * - Must be positive (> 0)
 */
export function validateAmount(value: string | undefined): ValidationError | null {
  // Amount is optional
  if (value === undefined || value === null) {
    return null;
  }

  if (value.length === 0) {
    return {
      field: 'amount',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Amount cannot be empty string if present',
      expectedFormat: 'Numeric with optional decimal (e.g., "50000" or "50000.50")'
    };
  }

  // Check if negative (most specific error)
  if (value.startsWith('-')) {
    return {
      field: 'amount',
      code: ValidationErrorCode.INVALID_AMOUNT,
      message: 'Amount cannot be negative',
      expectedFormat: 'Positive number > 0',
      actualValue: value
    };
  }

  // Check for special characters (currency symbols, commas, spaces) - but not letters
  if (/[^\d.A-Za-z]/.test(value)) {
    return {
      field: 'amount',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Amount contains invalid characters',
      expectedFormat: 'Numeric with optional decimal (e.g., "50000" or "50000.50")',
      actualValue: value
    };
  }

  // Must be numeric with optional decimal point
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return {
      field: 'amount',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Amount must be numeric with optional decimal',
      expectedFormat: 'Numeric with optional decimal (e.g., "50000" or "50000.50")',
      actualValue: value
    };
  }

  // Check length constraint
  if (value.length > FIELD_CONSTRAINTS.AMOUNT_MAX) {
    return {
      field: 'amount',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Amount exceeds maximum length of ${FIELD_CONSTRAINTS.AMOUNT_MAX} characters`,
      expectedFormat: `Maximum ${FIELD_CONSTRAINTS.AMOUNT_MAX} characters`,
      actualValue: value
    };
  }

  // Must be positive
  const numericValue = parseFloat(value);
  if (numericValue <= 0) {
    return {
      field: 'amount',
      code: ValidationErrorCode.INVALID_AMOUNT,
      message: 'Amount must be greater than zero',
      expectedFormat: 'Positive number > 0',
      actualValue: value
    };
  }

  return null;
}

/**
 * Validates currency code (must be VND/704)
 *
 * @param value - Currency code to validate
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * Per NAPAS spec, only VND (code "704") is allowed
 */
export function validateCurrency(value: string | undefined): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: 'currency',
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: 'Currency is required'
    };
  }

  // Check for wrong format/length first
  if (value.length !== 3 || !/^\d{3}$/.test(value)) {
    return {
      field: 'currency',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Currency code must be 3 digits',
      expectedFormat: '3 numeric digits (ISO 4217)',
      actualValue: value
    };
  }

  if (value !== REQUIRED_VALUES.CURRENCY_VND) {
    return {
      field: 'currency',
      code: ValidationErrorCode.INVALID_CURRENCY,
      message: 'Currency must be VND (704)',
      expectedFormat: REQUIRED_VALUES.CURRENCY_VND,
      actualValue: value
    };
  }

  return null;
}

/**
 * Validates country code (must be VN)
 *
 * @param value - Country code to validate
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * Per NAPAS spec, only Vietnam (code "VN") is allowed
 */
export function validateCountryCode(value: string | undefined): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: 'countryCode',
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: 'Country code is required'
    };
  }

  // Check for wrong length first
  if (value.length !== 2) {
    return {
      field: 'countryCode',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Country code must be 2 characters',
      expectedFormat: '2 letters (ISO 3166-1)',
      actualValue: value
    };
  }

  // Check if it's letters (format valid but wrong value should be INVALID_COUNTRY)
  if (!/^[A-Za-z]{2}$/.test(value)) {
    return {
      field: 'countryCode',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Country code must be 2 letters',
      expectedFormat: '2 letters (ISO 3166-1)',
      actualValue: value
    };
  }

  // Must be exactly "VN" (case-sensitive, per spec requirement for uppercase)
  if (value !== REQUIRED_VALUES.COUNTRY_CODE_VN) {
    return {
      field: 'countryCode',
      code: ValidationErrorCode.INVALID_COUNTRY,
      message: 'Country code must be VN (uppercase)',
      expectedFormat: REQUIRED_VALUES.COUNTRY_CODE_VN,
      actualValue: value
    };
  }

  return null;
}

/**
 * Validates message/description field
 *
 * @param value - Message to validate (optional field)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - UTF-8 encoded text
 * - Maximum 500 characters
 * - No control characters allowed
 */
export function validateMessage(value: string | undefined): ValidationError | null {
  // Message is optional
  if (value === undefined || value === null) {
    return null;
  }

  // Check for control characters (reject all control chars for security)
  if (/[\x00-\x1F\x7F]/.test(value)) {
    return {
      field: 'message',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Message contains invalid control characters',
      expectedFormat: 'UTF-8 text without control characters',
      actualValue: value.length > 100 ? value.substring(0, 100) + '...' : value
    };
  }

  // Check UTF-8 byte length (not character length)
  const byteLength = Buffer.from(value, 'utf-8').length;
  if (byteLength > FIELD_CONSTRAINTS.MESSAGE_MAX) {
    return {
      field: 'message',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Message exceeds maximum byte length of ${FIELD_CONSTRAINTS.MESSAGE_MAX}`,
      expectedFormat: `Maximum ${FIELD_CONSTRAINTS.MESSAGE_MAX} bytes (UTF-8)`,
      actualValue: value.length > 100 ? value.substring(0, 100) + '...' : value
    };
  }

  return null;
}

/**
 * Validates purpose code field
 *
 * @param value - Purpose code to validate (optional field)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - Alphanumeric characters only
 * - Maximum 25 characters
 */
export function validatePurposeCode(value: string | undefined): ValidationError | null {
  // Purpose code is optional
  if (value === undefined || value === null) {
    return null;
  }

  // Allow empty string for optional fields
  if (value.length === 0) {
    return null;
  }

  // Must be alphanumeric only
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return {
      field: 'purposeCode',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Purpose code must be alphanumeric only',
      expectedFormat: 'Alphanumeric (A-Z, a-z, 0-9)',
      actualValue: value
    };
  }

  // Check length constraint
  if (value.length > FIELD_CONSTRAINTS.PURPOSE_CODE_MAX) {
    return {
      field: 'purposeCode',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Purpose code exceeds maximum length of ${FIELD_CONSTRAINTS.PURPOSE_CODE_MAX} characters`,
      expectedFormat: `Maximum ${FIELD_CONSTRAINTS.PURPOSE_CODE_MAX} characters`,
      actualValue: value
    };
  }

  return null;
}

/**
 * Validates bill/invoice number field
 *
 * @param value - Bill number to validate (optional field)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - Alphanumeric characters only
 * - Maximum 25 characters
 */
export function validateBillNumber(value: string | undefined): ValidationError | null {
  // Bill number is optional
  if (value === undefined || value === null) {
    return null;
  }

  // Allow empty string for optional fields
  if (value.length === 0) {
    return null;
  }

  // Must be alphanumeric only (allow hyphens for invoice formats like "INV-2024")
  if (!/^[a-zA-Z0-9-]+$/.test(value)) {
    return {
      field: 'billNumber',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Bill number must be alphanumeric (hyphens allowed)',
      expectedFormat: 'Alphanumeric with optional hyphens (A-Z, a-z, 0-9, -)',
      actualValue: value
    };
  }

  // Check length constraint
  if (value.length > FIELD_CONSTRAINTS.BILL_NUMBER_MAX) {
    return {
      field: 'billNumber',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Bill number exceeds maximum length of ${FIELD_CONSTRAINTS.BILL_NUMBER_MAX} characters`,
      expectedFormat: `Maximum ${FIELD_CONSTRAINTS.BILL_NUMBER_MAX} characters`,
      actualValue: value
    };
  }

  return null;
}

/**
 * Validates merchant category code
 *
 * @param value - Merchant category code to validate (optional field)
 * @returns null if valid, ValidationError if invalid
 *
 * @remarks
 * - Must be exactly 4 numeric digits
 * - ISO 18245 Merchant Category Codes
 */
export function validateMerchantCategory(value: string | undefined): ValidationError | null {
  // Merchant category is optional
  if (value === undefined || value === null) {
    return null;
  }

  if (value.length === 0) {
    return {
      field: 'merchantCategory',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Merchant category cannot be empty string if present',
      expectedFormat: '4 numeric digits'
    };
  }

  // Check for special characters first (not alphanumeric)
  if (/[^0-9A-Za-z]/.test(value)) {
    return {
      field: 'merchantCategory',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Merchant category contains invalid characters',
      expectedFormat: '4 numeric digits only',
      actualValue: value
    };
  }

  // Must be exactly 4 numeric digits (catch letters as INVALID_FORMAT)
  if (!/^\d{4}$/.test(value)) {
    return {
      field: 'merchantCategory',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Merchant category must be exactly 4 digits',
      expectedFormat: '4 numeric digits (e.g., "5812" for restaurant)',
      actualValue: value
    };
  }

  return null;
}
