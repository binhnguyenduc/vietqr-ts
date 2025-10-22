/**
 * VietQR Business Rules Validator
 *
 * Validates business logic rules per NAPAS IBFT v1.5.2 specification.
 * Checks currency, country code, payload format, and dynamic QR requirements.
 *
 * @module validators/business-rules-validator
 */

import type { VietQRData, ValidationError } from '../types/decode';
import { ValidationErrorCode, REQUIRED_VALUES } from '../types/decode';

/**
 * Validates all business rules defined in NAPAS IBFT v1.5.2
 *
 * @param data - VietQR data to validate
 * @returns Array of validation errors (empty if all rules pass)
 *
 * @remarks
 * Business rules checked:
 * 1. Currency must be VND (704)
 * 2. Country code must be VN
 * 3. Payload format indicator must be "01"
 * 4. Dynamic QR should have amount (warning if missing)
 * 5. Initiation method must be valid ("static" or "dynamic")
 */
export function validateBusinessRules(data: VietQRData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 1: Currency must be VND (704)
  if (data.currency !== REQUIRED_VALUES.CURRENCY_VND) {
    errors.push({
      field: 'currency',
      code: ValidationErrorCode.INVALID_CURRENCY,
      message: 'Only Vietnamese Dong (VND) currency is supported',
      expectedFormat: REQUIRED_VALUES.CURRENCY_VND,
      actualValue: data.currency
    });
  }

  // Rule 2: Country code must be VN
  if (data.countryCode !== REQUIRED_VALUES.COUNTRY_CODE_VN) {
    errors.push({
      field: 'countryCode',
      code: ValidationErrorCode.INVALID_COUNTRY,
      message: 'Only Vietnam (VN) country code is supported',
      expectedFormat: REQUIRED_VALUES.COUNTRY_CODE_VN,
      actualValue: data.countryCode
    });
  }

  // Rule 3: Payload format indicator must be "01"
  if (data.payloadFormatIndicator !== REQUIRED_VALUES.PAYLOAD_FORMAT_INDICATOR) {
    errors.push({
      field: 'payloadFormatIndicator',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Payload format indicator must be "01"',
      expectedFormat: REQUIRED_VALUES.PAYLOAD_FORMAT_INDICATOR,
      actualValue: data.payloadFormatIndicator
    });
  }

  // Rule 4: Initiation method must be valid
  if (data.initiationMethod !== 'static' && data.initiationMethod !== 'dynamic') {
    errors.push({
      field: 'initiationMethod',
      code: ValidationErrorCode.INVALID_FORMAT,
      message: 'Initiation method must be "static" or "dynamic"',
      expectedFormat: '"static" or "dynamic"',
      actualValue: data.initiationMethod as string
    });
  }

  // Rule 5: Dynamic QR validation
  // Note: Dynamic QR SHOULD have amount, but it's not strictly required by spec
  // We don't add an error here, just a note for future warning implementation

  return errors;
}

/**
 * Checks if dynamic QR has recommended fields
 *
 * @param data - VietQR data to check
 * @returns true if dynamic QR has amount, false otherwise
 *
 * @remarks
 * This is used for generating warnings (not errors).
 * Dynamic QR codes typically should include an amount, but it's not
 * strictly required by the NAPAS specification.
 */
export function hasDynamicQRRecommendedFields(data: VietQRData): boolean {
  if (data.initiationMethod === 'dynamic') {
    return data.amount !== undefined && data.amount.length > 0;
  }
  return true; // Not applicable for static QR
}
