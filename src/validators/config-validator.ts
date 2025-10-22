/**
 * Centralized VietQR configuration validator
 *
 * This module provides comprehensive validation for VietQRConfig objects,
 * including field-level, cross-field, and business rule validation with
 * multi-error collection for improved developer experience.
 *
 * @example
 * ```typescript
 * const config: VietQRConfig = {
 *   bankBin: '970403',
 *   serviceCode: 'QRIBFTTA',
 *   accountNumber: '01234567',
 *   initiationMethod: '11',
 * };
 *
 * validateVietQRConfig(config); // Throws if invalid, returns void if valid
 * ```
 */

import { ValidationContext } from './validation-context.js';
import { validateBankBin, validateAccountNumber, validateCardNumber } from './bank-info.js';
import { validateServiceCode } from './service-code.js';
import { validateAmount } from './amount.js';
import { validateBillNumber, validatePurpose, validateReferenceLabel } from './additional-data.js';
import type { VietQRConfig } from '../types/config.js';

/**
 * Validates a complete VietQR configuration
 *
 * Performs comprehensive validation including:
 * - Required field presence (bankBin, serviceCode, accountNumber/cardNumber)
 * - Field format and constraint validation
 * - Cross-field business rules (account/card mutual exclusivity, service code dependencies)
 * - Dynamic vs static QR requirements (amount validation based on initiationMethod)
 * - Optional field validation (billNumber, purpose, referenceLabel)
 *
 * All validation errors are collected and reported together in an AggregateValidationError
 * for better developer experience.
 *
 * @param config - The VietQR configuration to validate
 * @throws {AggregateValidationError} If validation fails with one or more errors
 * @throws {ValidationError} If a single validation error occurs
 *
 * @example
 * ```typescript
 * // Valid static account transfer QR
 * validateVietQRConfig({
 *   bankBin: '970403',
 *   serviceCode: 'QRIBFTTA',
 *   accountNumber: '01234567',
 *   initiationMethod: '11',
 * });
 *
 * // Valid dynamic card transfer QR
 * validateVietQRConfig({
 *   bankBin: '970422',
 *   serviceCode: 'QRIBFTTC',
 *   cardNumber: '9704220112345678',
 *   initiationMethod: '12',
 *   amount: '180000',
 * });
 *
 * // Invalid config - throws AggregateValidationError with all errors
 * validateVietQRConfig({
 *   bankBin: '12345', // Too short
 *   serviceCode: 'INVALID', // Invalid code
 *   initiationMethod: '12', // Dynamic
 *   // Missing accountNumber/cardNumber and amount
 * });
 * ```
 */
export function validateVietQRConfig(config: VietQRConfig): void {
  const context = new ValidationContext(config);

  // T049: Required field validation
  // Bank BIN is always required
  context.tryValidate(() => validateBankBin(config.bankBin));

  // Service code is always required
  context.tryValidate(() => validateServiceCode(config.serviceCode));

  // T050: Conditional field validation
  // T051: Cross-field validation - account/card mutual exclusivity
  const hasAccountNumber = config.accountNumber !== undefined && config.accountNumber !== '';
  const hasCardNumber = config.cardNumber !== undefined && config.cardNumber !== '';

  // Check mutual exclusivity
  if (hasAccountNumber && hasCardNumber) {
    const error = context.createError(
      'config',
      config,
      'cross-field',
      'Cannot provide both accountNumber and cardNumber. Use accountNumber for QRIBFTTA or cardNumber for QRIBFTTC.',
      'BOTH_ACCOUNT_AND_CARD',
      'Either accountNumber OR cardNumber (not both)'
    );
    context.addError(error);
  }

  // Check that at least one is provided
  if (!hasAccountNumber && !hasCardNumber) {
    const error = context.createError(
      'config',
      config,
      'cross-field',
      'Either accountNumber or cardNumber must be provided.',
      'MISSING_ACCOUNT_OR_CARD',
      'accountNumber OR cardNumber (one required)'
    );
    context.addError(error);
  }

  // T051: Service code dependencies
  // QRIBFTTA requires accountNumber
  if (config.serviceCode === 'QRIBFTTA' && !hasAccountNumber) {
    const error = context.createError(
      'accountNumber',
      config.accountNumber,
      'required',
      'Service code QRIBFTTA requires accountNumber to be provided.',
      'ACCOUNT_REQUIRED_FOR_QRIBFTTA',
      'accountNumber required for QRIBFTTA'
    );
    context.addError(error);
  }

  // QRIBFTTC requires cardNumber
  if (config.serviceCode === 'QRIBFTTC' && !hasCardNumber) {
    const error = context.createError(
      'cardNumber',
      config.cardNumber,
      'required',
      'Service code QRIBFTTC requires cardNumber to be provided.',
      'CARD_REQUIRED_FOR_QRIBFTTC',
      'cardNumber required for QRIBFTTC'
    );
    context.addError(error);
  }

  // T052: Multi-error collection - validate all fields using tryValidate
  // Validate accountNumber if provided
  if (hasAccountNumber) {
    context.tryValidate(() => validateAccountNumber(config.accountNumber!));
  }

  // Validate cardNumber if provided
  if (hasCardNumber) {
    context.tryValidate(() => validateCardNumber(config.cardNumber!));
  }

  // Dynamic vs Static QR validation
  const isDynamic = config.initiationMethod === '12';
  const hasAmount = config.amount !== undefined && config.amount !== '';

  // Validate amount based on QR type
  if (isDynamic) {
    // Dynamic QR requires amount
    context.tryValidate(() => validateAmount(config.amount || '', true));
  } else if (hasAmount) {
    // Static QR with optional amount - validate format if provided
    context.tryValidate(() => validateAmount(config.amount!, false));
  }

  // Validate optional fields if provided
  if (config.billNumber !== undefined && config.billNumber !== '') {
    context.tryValidate(() => validateBillNumber(config.billNumber!));
  }

  if (config.purpose !== undefined && config.purpose !== '') {
    context.tryValidate(() => validatePurpose(config.purpose!));
  }

  if (config.referenceLabel !== undefined && config.referenceLabel !== '') {
    context.tryValidate(() => validateReferenceLabel(config.referenceLabel!));
  }

  // Throw if any errors were collected
  context.throwIfErrors();
}
