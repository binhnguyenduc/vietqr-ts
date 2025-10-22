/**
 * Advanced validation options for VietQR data
 *
 * @module validators/validate-with-options
 */

import type {
  VietQRData,
  ValidationResult,
  ValidationError as VietQRValidationError,
  ValidationWarning
} from '../types/decode';
import { ValidationWarningCode, ValidationErrorCode } from '../types/decode';

// Import validators
import { validateRequiredFields } from './required-fields-validator';
import { validateBusinessRules } from './business-rules-validator';
import { validateCRC } from './crc-validator';
import { detectCorruption } from './corruption-detector';
import { mergeErrors, sortErrors, buildWarning } from './error-builder';

// Import field validators
import {
  validateBankCode,
  validateAccountNumber,
  validateAmount,
  validateCurrency,
  validateCountryCode,
  validateMessage,
  validatePurposeCode,
  validateBillNumber,
  validateMerchantCategory
} from './field-validators';

/**
 * Custom field length limits for validation
 */
export interface CustomFieldLimits {
  /** Maximum account number length (default: 19) */
  accountNumberMax?: number;
  /** Maximum amount length (default: 13) */
  amountMax?: number;
  /** Maximum message byte length (default: 500) */
  messageMax?: number;
  /** Maximum purpose code length (default: 25) */
  purposeCodeMax?: number;
  /** Maximum bill number length (default: 25) */
  billNumberMax?: number;
}

/**
 * Advanced validation options for validateWithOptions
 */
export interface ValidationOptions {
  /**
   * Skip CRC checksum verification
   * Useful for testing or when CRC has been previously verified
   * @default false
   */
  skipCRCCheck?: boolean;

  /**
   * Custom field length limits
   * Allows stricter or more lenient validation
   */
  customFieldLimits?: CustomFieldLimits;

  /**
   * Treat warnings as errors
   * @default false
   */
  treatWarningsAsErrors?: boolean;

  /**
   * Skip corruption detection
   * @default false
   */
  skipCorruptionDetection?: boolean;
}

/**
 * Validate parsed VietQR data with advanced options
 *
 * @param data - Parsed VietQR data to validate
 * @param qrString - Original QR string (required for CRC verification)
 * @param options - Advanced validation options
 * @returns Validation result with errors, warnings, and corruption flag
 *
 * @remarks
 * - Supports skipping CRC verification for performance
 * - Allows custom field length limits
 * - Can treat warnings as errors for strict validation
 *
 * @example
 * ```typescript
 * // Skip CRC check for performance
 * const result1 = validateWithOptions(data, qrString, {
 *   skipCRCCheck: true
 * });
 *
 * // Custom field limits
 * const result2 = validateWithOptions(data, qrString, {
 *   customFieldLimits: {
 *     accountNumberMax: 15,
 *     messageMax: 200
 *   }
 * });
 *
 * // Treat warnings as errors
 * const result3 = validateWithOptions(data, qrString, {
 *   treatWarningsAsErrors: true
 * });
 * ```
 */
export function validateWithOptions(
  data: VietQRData,
  qrString: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    skipCRCCheck = false,
    customFieldLimits,
    treatWarningsAsErrors = false,
    skipCorruptionDetection = false
  } = options;

  const allErrors: VietQRValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Step 1: Validate required fields presence
  const requiredFieldErrors = validateRequiredFields(data);
  allErrors.push(...requiredFieldErrors);

  // Step 2: Validate individual field formats with custom limits
  const fieldErrors: VietQRValidationError[] = [];

  // Required fields
  const bankCodeError = validateBankCode(data.bankCode);
  if (bankCodeError) fieldErrors.push(bankCodeError);

  // Account number validation with custom limit
  if (customFieldLimits?.accountNumberMax) {
    const accountNumberError = validateAccountNumberWithLimit(
      data.accountNumber,
      customFieldLimits.accountNumberMax
    );
    if (accountNumberError) fieldErrors.push(accountNumberError);
  } else {
    const accountNumberError = validateAccountNumber(data.accountNumber);
    if (accountNumberError) fieldErrors.push(accountNumberError);
  }

  const currencyError = validateCurrency(data.currency);
  if (currencyError) fieldErrors.push(currencyError);

  const countryCodeError = validateCountryCode(data.countryCode);
  if (countryCodeError) fieldErrors.push(countryCodeError);

  // Optional fields with custom limits
  if (data.amount !== undefined) {
    if (customFieldLimits?.amountMax) {
      const amountError = validateAmountWithLimit(
        data.amount,
        customFieldLimits.amountMax
      );
      if (amountError) fieldErrors.push(amountError);
    } else {
      const amountError = validateAmount(data.amount);
      if (amountError) fieldErrors.push(amountError);
    }
  }

  if (data.message !== undefined) {
    if (customFieldLimits?.messageMax) {
      const messageError = validateMessageWithLimit(
        data.message,
        customFieldLimits.messageMax
      );
      if (messageError) fieldErrors.push(messageError);
    } else {
      const messageError = validateMessage(data.message);
      if (messageError) fieldErrors.push(messageError);
    }
  }

  if (data.purposeCode !== undefined) {
    if (customFieldLimits?.purposeCodeMax) {
      const purposeCodeError = validatePurposeCodeWithLimit(
        data.purposeCode,
        customFieldLimits.purposeCodeMax
      );
      if (purposeCodeError) fieldErrors.push(purposeCodeError);
    } else {
      const purposeCodeError = validatePurposeCode(data.purposeCode);
      if (purposeCodeError) fieldErrors.push(purposeCodeError);
    }
  }

  if (data.billNumber !== undefined) {
    if (customFieldLimits?.billNumberMax) {
      const billNumberError = validateBillNumberWithLimit(
        data.billNumber,
        customFieldLimits.billNumberMax
      );
      if (billNumberError) fieldErrors.push(billNumberError);
    } else {
      const billNumberError = validateBillNumber(data.billNumber);
      if (billNumberError) fieldErrors.push(billNumberError);
    }
  }

  if (data.merchantCategory !== undefined) {
    const merchantCategoryError = validateMerchantCategory(data.merchantCategory);
    if (merchantCategoryError) fieldErrors.push(merchantCategoryError);
  }

  allErrors.push(...fieldErrors);

  // Step 3: Validate business rules
  const businessRuleErrors = validateBusinessRules(data);
  allErrors.push(...businessRuleErrors);

  // Step 4: Validate CRC (if not skipped)
  if (!skipCRCCheck && qrString && qrString.length > 0) {
    const crcError = validateCRC(qrString, data.crc);
    if (crcError) allErrors.push(crcError);
  }

  // Step 5: Detect corruption (if not skipped)
  const isCorrupted = skipCorruptionDetection
    ? false
    : detectCorruption(data, qrString, allErrors);

  // Step 6: Add warnings
  // Dynamic QR should typically include amount
  if (isDynamicQR(data) && !data.amount) {
    warnings.push(
      buildWarning(
        'amount',
        ValidationWarningCode.MISSING_OPTIONAL_FIELD,
        'Dynamic QR codes typically include an amount. Consider adding Field 54.'
      )
    );
  }

  // Step 7: Merge and sort errors
  const dedupedErrors = mergeErrors(allErrors);
  const sortedErrors = sortErrors(dedupedErrors);

  // Step 8: Convert warnings to errors if requested
  if (treatWarningsAsErrors && warnings.length > 0) {
    const warningErrors: VietQRValidationError[] = warnings.map(w => ({
      field: w.field,
      code: ValidationErrorCode.MISSING_REQUIRED_FIELD,
      message: w.message
    }));
    sortedErrors.push(...warningErrors);
  }

  return {
    isValid: sortedErrors.length === 0,
    isCorrupted,
    errors: sortedErrors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Helper function to check if QR is dynamic
function isDynamicQR(data: VietQRData): boolean {
  return data.initiationMethod === 'dynamic';
}

// Custom limit validation helpers
function validateAccountNumberWithLimit(
  value: string | undefined,
  maxLength: number
): VietQRValidationError | null {
  const baseError = validateAccountNumber(value);
  if (baseError) return baseError;

  if (value && value.length > maxLength) {
    return {
      field: 'accountNumber',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Account number exceeds custom maximum length of ${maxLength} digits`,
      expectedFormat: `1-${maxLength} digits`,
      actualValue: '[REDACTED]'
    };
  }

  return null;
}

function validateAmountWithLimit(
  value: string | undefined,
  maxLength: number
): VietQRValidationError | null {
  const baseError = validateAmount(value);
  if (baseError) return baseError;

  if (value && value.length > maxLength) {
    return {
      field: 'amount',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Amount exceeds custom maximum length of ${maxLength} characters`,
      expectedFormat: `Maximum ${maxLength} characters`,
      actualValue: value
    };
  }

  return null;
}

function validateMessageWithLimit(
  value: string | undefined,
  maxByteLength: number
): VietQRValidationError | null {
  if (value === null || value === undefined) return null;

  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(value)) {
    return {
      field: 'message',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Message contains invalid control characters',
      expectedFormat: 'UTF-8 text without control characters',
      actualValue: value.length > 100 ? value.substring(0, 100) + '...' : value
    };
  }

  const byteLength = Buffer.from(value, 'utf-8').length;
  if (byteLength > maxByteLength) {
    return {
      field: 'message',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Message exceeds custom maximum byte length of ${maxByteLength}`,
      expectedFormat: `Maximum ${maxByteLength} bytes (UTF-8)`,
      actualValue: value.length > 100 ? value.substring(0, 100) + '...' : value
    };
  }

  return null;
}

function validatePurposeCodeWithLimit(
  value: string | undefined,
  maxLength: number
): VietQRValidationError | null {
  if (value === null || value === undefined || value.length === 0) return null;

  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return {
      field: 'purposeCode',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Purpose code must be alphanumeric only',
      expectedFormat: 'Alphanumeric (A-Z, a-z, 0-9)',
      actualValue: value
    };
  }

  if (value.length > maxLength) {
    return {
      field: 'purposeCode',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Purpose code exceeds custom maximum length of ${maxLength} characters`,
      expectedFormat: `Maximum ${maxLength} characters`,
      actualValue: value
    };
  }

  return null;
}

function validateBillNumberWithLimit(
  value: string | undefined,
  maxLength: number
): VietQRValidationError | null {
  if (value === null || value === undefined || value.length === 0) return null;

  if (!/^[a-zA-Z0-9-]+$/.test(value)) {
    return {
      field: 'billNumber',
      code: ValidationErrorCode.INVALID_CHARACTER,
      message: 'Bill number must be alphanumeric (hyphens allowed)',
      expectedFormat: 'Alphanumeric with optional hyphens (A-Z, a-z, 0-9, -)',
      actualValue: value
    };
  }

  if (value.length > maxLength) {
    return {
      field: 'billNumber',
      code: ValidationErrorCode.LENGTH_EXCEEDED,
      message: `Bill number exceeds custom maximum length of ${maxLength} characters`,
      expectedFormat: `Maximum ${maxLength} characters`,
      actualValue: value
    };
  }

  return null;
}
