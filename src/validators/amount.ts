import { ValidationError } from '../types/errors';
import { trimWhitespace, sanitizeForError } from './validation-utils';

/**
 * Validate transaction amount
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Amount must be numeric with optional decimal point
 * - Maximum length: 13 characters (including decimal point)
 * - Minimum length: 1 character
 * - Must be positive (> 0)
 * - Cannot be negative or zero
 *
 * Dynamic QR codes (when `isDynamic` is true):
 * - Amount is REQUIRED (cannot be empty)
 * - Must be a positive value (> 0)
 *
 * Static QR codes (when `isDynamic` is false):
 * - Amount is OPTIONAL (can be empty for user-filled QR)
 * - If provided, must still meet all format requirements
 *
 * @param amount - Transaction amount to validate
 * @param isDynamic - Whether this is a dynamic QR (requires amount) or static QR (amount optional)
 * @throws {ValidationError} If amount is invalid
 *
 * @example
 * ```typescript
 * // Dynamic QR examples
 * validateAmount('180000', true);        // Valid - dynamic with amount
 * validateAmount('', true);              // Throws - dynamic requires amount
 * validateAmount('0', true);             // Throws - dynamic requires positive amount
 *
 * // Static QR examples
 * validateAmount('', false);             // Valid - static allows empty amount
 * validateAmount('180000', false);       // Valid - static with pre-filled amount
 * validateAmount('abc', false);          // Throws - invalid format even for static
 *
 * // General validation (backward compatible)
 * validateAmount('180000');              // Valid - integer amount
 * validateAmount('180000.50');           // Valid - decimal amount
 * validateAmount('1234567890123');       // Valid - 13 chars (max)
 * validateAmount('12345678901234');      // Throws - exceeds 13 chars
 * validateAmount('abc');                 // Throws - non-numeric
 * validateAmount('-100');                // Throws - negative
 * validateAmount('0');                   // Throws - zero not allowed
 * ```
 */
export function validateAmount(amount: unknown, isDynamic?: boolean): asserts amount is string {
  // Type check
  if (typeof amount !== 'string') {
    throw new ValidationError('amount', amount, 'type', 'Amount must be a string');
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(amount);

  // Dynamic QR specific validation - amount is REQUIRED
  if (isDynamic === true && trimmed.length === 0) {
    throw new ValidationError(
      'amount',
      amount,
      'required',
      'Dynamic QR codes require an amount. Expected: Positive numeric value, Received: empty string',
      'INVALID_DYNAMIC_AMOUNT',
      'Positive numeric value (e.g., 180000 or 180000.50)'
    );
  }

  // Static QR - empty amount is allowed (user will fill in)
  if (isDynamic === false && trimmed.length === 0) {
    return; // Valid for static QR
  }

  // Required check (for backward compatibility when isDynamic is undefined)
  if (trimmed.length === 0) {
    throw new ValidationError(
      'amount',
      amount,
      'required',
      'Amount is required',
      'MISSING_REQUIRED_FIELD',
      'Numeric with optional decimal (e.g., 180000 or 180000.50)'
    );
  }

  // Length check - maximum 13 characters per NAPAS spec
  if (trimmed.length > 13) {
    throw new ValidationError(
      'amount',
      amount,
      'length',
      `Amount must not exceed 13 characters. Expected: ≤ 13 characters, Received: "${sanitizeForError(trimmed, 20)}" (${trimmed.length} ${trimmed.length === 1 ? 'character' : 'characters'})`,
      'AMOUNT_TOO_LONG',
      '≤ 13 characters'
    );
  }

  // Format check - must be numeric with optional single decimal point (ASCII digits only)
  // Valid: 123, 123.45, 0.5, 1234567890123
  // Invalid: abc, 12.34.56, -100, 123., .5, 180,000 (thousand separator), ١٢٣ (Unicode digits)
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new ValidationError(
      'amount',
      amount,
      'format',
      `Amount must be numeric with optional decimal point. Expected: Numeric with optional decimal (e.g., 180000 or 180000.50), Received: "${sanitizeForError(trimmed, 20)}"`,
      'INVALID_AMOUNT_FORMAT',
      'Numeric with optional decimal (e.g., 180000 or 180000.50)'
    );
  }

  // Value check - must be positive (> 0)
  const numericValue = parseFloat(trimmed);
  if (numericValue <= 0) {
    throw new ValidationError(
      'amount',
      amount,
      'value',
      `Amount must be positive. Expected: > 0, Received: "${sanitizeForError(trimmed, 20)}" (${numericValue})`,
      'INVALID_AMOUNT_VALUE',
      '> 0'
    );
  }
}
