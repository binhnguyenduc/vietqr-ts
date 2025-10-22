import { ValidationError } from '../types/errors';

/**
 * Validate merchant category code (MCC)
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - MCC must be exactly 4 numeric digits
 * - No leading/trailing spaces allowed (trimmed before validation)
 * - Valid range: 0000-9999
 *
 * Merchant Category Codes (MCC) are four-digit numbers assigned by card networks
 * to classify businesses by their primary trade, profession, or vocation.
 *
 * @param merchantCategory - Merchant category code to validate
 * @throws {ValidationError} If MCC is invalid
 *
 * @example
 * ```typescript
 * validateMerchantCategory('5411');  // Valid - Grocery stores
 * validateMerchantCategory('5812');  // Valid - Restaurants
 * validateMerchantCategory('0742');  // Valid - Veterinary services
 * validateMerchantCategory('541');   // Throws - too short
 * validateMerchantCategory('541A');  // Throws - non-numeric
 * ```
 */
export function validateMerchantCategory(merchantCategory: unknown): asserts merchantCategory is string {
  // Type check
  if (typeof merchantCategory !== 'string') {
    throw new ValidationError(
      'merchantCategory',
      merchantCategory,
      'type',
      'Merchant category must be a string'
    );
  }

  // Trim whitespace
  const trimmed = merchantCategory.trim();

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'merchantCategory',
      merchantCategory,
      'required',
      'Merchant category is required',
      'MISSING_REQUIRED_FIELD',
      '4 numeric digits'
    );
  }

  // Length check - must be exactly 4 digits
  if (trimmed.length !== 4) {
    throw new ValidationError(
      'merchantCategory',
      merchantCategory,
      'length',
      `Merchant category must be exactly 4 digits. Expected: 4 numeric digits, Received: "${trimmed}" (${trimmed.length} ${trimmed.length === 1 ? 'digit' : 'digits'})`,
      'INVALID_MCC_LENGTH',
      '4 numeric digits'
    );
  }

  // Format check - must be numeric
  if (!/^\d{4}$/.test(trimmed)) {
    throw new ValidationError(
      'merchantCategory',
      merchantCategory,
      'format',
      `Merchant category must be numeric. Expected: 4 numeric digits, Received: "${trimmed}"`,
      'INVALID_MCC_FORMAT',
      '4 numeric digits'
    );
  }
}
