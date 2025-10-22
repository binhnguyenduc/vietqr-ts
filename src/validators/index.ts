// ============================================================================
// VietQR Generation Validation (Feature 004 - Input Validation)
// ============================================================================

// Re-export comprehensive config validator
export { validateVietQRConfig } from './config-validator.js';

// Re-export individual field validators for QR generation
export { validateBankBin, validateAccountNumber as validateAccountNumberForGeneration, validateCardNumber } from './bank-info.js';
export { validateServiceCode } from './service-code.js';
export { validateAmount as validateAmountForGeneration } from './amount.js';
export { validateBillNumber as validateBillNumberForGeneration, validatePurpose, validateReferenceLabel, validateMessage as validateMessageForGeneration } from './additional-data.js';
export { validateCountry as validateCountryCodeForGeneration } from './country.js';
export { validateCurrency as validateCurrencyCodeForGeneration } from './currency.js';
export { validateMerchantCategory as validateMerchantCategoryCodeForGeneration } from './merchant-category.js';

// Re-export validation utilities
export { trimWhitespace, sanitizeForError, isWhitespaceOnly, containsNewlineOrTab, isAlphanumericASCII, isNumericASCII } from './validation-utils.js';

// Re-export validation context for multi-error collection
export { ValidationContext } from './validation-context.js';

// Re-export error codes
export { type ValidationErrorCode } from './error-codes.js';

// ============================================================================
// VietQR Data Validation (Feature 003 - Decoding & Validation)
// ============================================================================

import type { VietQRData, ValidationResult, ValidationError as VietQRValidationError, ValidationWarning } from '../types/decode';
import { ValidationWarningCode } from '../types/decode';

// Import field validators
import {
  validateBankCode,
  validateAccountNumber as validateParsedAccountNumber,
  validateAmount as validateParsedAmount,
  validateCurrency,
  validateCountryCode,
  validateMessage,
  validatePurposeCode,
  validateBillNumber as validateParsedBillNumber,
  validateMerchantCategory
} from './field-validators';

import { validateCRC } from './crc-validator';
import { validateRequiredFields } from './required-fields-validator';
import { validateBusinessRules, hasDynamicQRRecommendedFields } from './business-rules-validator';
import { detectCorruption } from './corruption-detector';
import { mergeErrors, sortErrors, buildWarning } from './error-builder';

/**
 * Validates parsed VietQR data against NAPAS IBFT v1.5.2 specification
 *
 * @param data - Parsed VietQR data to validate
 * @param qrString - Original QR string (required for CRC verification)
 * @returns Validation result with errors, warnings, and corruption flag
 *
 * @remarks
 * This function validates decoded QR data, not generation config.
 * For validating QR generation configuration, use validateVietQRConfig().
 *
 * @example
 * ```typescript
 * const parseResult = parse(qrString);
 * if (parseResult.success) {
 *   const validation = validate(parseResult.data, qrString);
 *   if (validation.isValid) {
 *     // Process payment
 *   } else {
 *     console.error('Validation errors:', validation.errors);
 *   }
 * }
 * ```
 */
export function validate(data: VietQRData, qrString: string): ValidationResult {
  const allErrors: VietQRValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Step 1: Validate required fields presence
  const requiredFieldErrors = validateRequiredFields(data);
  allErrors.push(...requiredFieldErrors);

  // Step 2: Validate individual field formats
  const fieldErrors: VietQRValidationError[] = [];

  // Required fields
  const bankCodeError = validateBankCode(data.bankCode);
  if (bankCodeError) fieldErrors.push(bankCodeError);

  const accountNumberError = validateParsedAccountNumber(data.accountNumber);
  if (accountNumberError) fieldErrors.push(accountNumberError);

  const currencyError = validateCurrency(data.currency);
  if (currencyError) fieldErrors.push(currencyError);

  const countryCodeError = validateCountryCode(data.countryCode);
  if (countryCodeError) fieldErrors.push(countryCodeError);

  // Optional fields (only validate if present)
  if (data.amount !== undefined) {
    const amountError = validateParsedAmount(data.amount);
    if (amountError) fieldErrors.push(amountError);
  }

  if (data.message !== undefined) {
    const messageError = validateMessage(data.message);
    if (messageError) fieldErrors.push(messageError);
  }

  if (data.purposeCode !== undefined) {
    const purposeCodeError = validatePurposeCode(data.purposeCode);
    if (purposeCodeError) fieldErrors.push(purposeCodeError);
  }

  if (data.billNumber !== undefined) {
    const billNumberError = validateParsedBillNumber(data.billNumber);
    if (billNumberError) fieldErrors.push(billNumberError);
  }

  if (data.merchantCategory !== undefined) {
    const merchantCategoryError = validateMerchantCategory(data.merchantCategory);
    if (merchantCategoryError) fieldErrors.push(merchantCategoryError);
  }

  allErrors.push(...fieldErrors);

  // Step 3: Validate business rules
  const businessRuleErrors = validateBusinessRules(data);
  allErrors.push(...businessRuleErrors);

  // Step 4: Verify CRC checksum (only if qrString is provided)
  // When qrString is empty, only format validation is performed, not checksum verification
  if (qrString && qrString.length > 0) {
    const crcError = validateCRC(qrString, data.crc);
    if (crcError) {
      allErrors.push(crcError);
    }
  } else if (data.crc) {
    // When no qrString provided, only validate CRC format
    const crcFormatError = validateCRC('6304' + data.crc, data.crc);
    if (crcFormatError && crcFormatError.code !== 'CHECKSUM_MISMATCH') {
      // Only add non-checksum errors (format errors)
      allErrors.push(crcFormatError);
    }
  }

  // Step 5: Detect data corruption
  const isCorrupted = detectCorruption(data, qrString, allErrors);

  // Step 6: Generate warnings for optional/recommended fields
  if (!hasDynamicQRRecommendedFields(data)) {
    warnings.push(buildWarning(
      'amount',
      ValidationWarningCode.MISSING_OPTIONAL_FIELD,
      'Dynamic QR codes typically include an amount. Consider adding Field 54.'
    ));
  }

  // Deduplicate and sort errors
  const uniqueErrors = mergeErrors(allErrors);
  const sortedErrors = sortErrors(uniqueErrors);

  // Determine overall validation status
  const isValid = sortedErrors.length === 0;

  return {
    isValid,
    isCorrupted,
    errors: sortedErrors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Re-export validator functions for advanced usage
export {
  validateBankCode,
  validateCurrency,
  validateCountryCode,
  validateMessage,
  validatePurposeCode,
  validateMerchantCategory
} from './field-validators';

// Export aliased functions using local imports (for decoding validation)
export { validateParsedAccountNumber as validateAccountNumber };
export { validateParsedAmount as validateAmount };
export { validateParsedBillNumber as validateBillNumber };

export { validateCRC, verifyCRC, calculateCRC } from './crc-validator';
export { validateRequiredFields } from './required-fields-validator';
export { validateBusinessRules } from './business-rules-validator';
export { detectCorruption, isRecoverableCorruption } from './corruption-detector';
export { buildError, buildWarning, sanitizeValue, mergeErrors, sortErrors } from './error-builder';
export { validateFieldLength, validateMaxLength, validateMinLength, validateExactLength } from './length-validators';

// Export advanced validation options
export { validateWithOptions, type ValidationOptions, type CustomFieldLimits } from './validate-with-options';
