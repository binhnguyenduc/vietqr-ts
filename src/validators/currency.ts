import { ValidationError } from '../types/errors';

/**
 * Validate currency code
 *
 * Per NAPAS IBFT v1.5.2 specification, only VND (Vietnamese Dong) is supported:
 * - Currency code must be "704" (ISO 4217 numeric code for VND)
 * - Case-sensitive exact match required
 *
 * @param currency - Currency code to validate
 * @throws {ValidationError} If currency is not "704"
 *
 * @example
 * ```typescript
 * validateCurrency('704');  // Valid - VND
 * validateCurrency('840');  // Throws - USD not supported
 * validateCurrency('VND');  // Throws - must be numeric code
 * ```
 */
export function validateCurrency(currency: unknown): asserts currency is '704' {
  // Type check
  if (typeof currency !== 'string') {
    throw new ValidationError(
      'currency',
      currency,
      'type',
      'Currency must be a string'
    );
  }

  // Trim whitespace
  const trimmed = currency.trim();

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'currency',
      currency,
      'required',
      'Currency is required',
      'MISSING_REQUIRED_FIELD',
      '"704" (VND)'
    );
  }

  // Valid currency check - only VND (704) is supported
  if (trimmed !== '704') {
    throw new ValidationError(
      'currency',
      currency,
      'enum',
      `Invalid currency code. Expected: "704" (VND), Received: "${trimmed}"`,
      'INVALID_CURRENCY_CODE',
      '"704" (VND)'
    );
  }
}
