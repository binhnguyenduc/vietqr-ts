import { ValidationError } from '../types/errors';
import { trimWhitespace, sanitizeForError, isAlphanumericASCII } from './validation-utils';

/**
 * Validate bank BIN (Bank Identification Number)
 *
 * Per NAPAS IBFT v1.5.2 specification, bank BIN must be exactly 6 numeric digits.
 *
 * @param bankBin - Bank identification number to validate
 * @throws {ValidationError} If bankBin is invalid
 *
 * @example
 * ```typescript
 * validateBankBin('970403'); // Valid - Vietcombank
 * validateBankBin('970415'); // Valid - VietinBank
 * validateBankBin('97040');  // Throws - not 6 digits
 * validateBankBin('970@03'); // Throws - not numeric
 * ```
 */
export function validateBankBin(bankBin: unknown): asserts bankBin is string {
  // Type check
  if (typeof bankBin !== 'string') {
    throw new ValidationError(
      'bankBin',
      bankBin,
      'type',
      'Bank BIN must be a string'
    );
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(bankBin);

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'bankBin',
      bankBin,
      'required',
      'Bank BIN is required',
      'MISSING_REQUIRED_FIELD',
      '6 numeric digits'
    );
  }

  // Length check - must be exactly 6 digits
  if (trimmed.length !== 6) {
    throw new ValidationError(
      'bankBin',
      bankBin,
      'length',
      `Bank BIN must be exactly 6 digits. Expected: 6 numeric digits, Received: "${sanitizeForError(trimmed, 20)}" (${trimmed.length} ${trimmed.length === 1 ? 'digit' : 'digits'})`,
      'INVALID_BANK_BIN_LENGTH',
      '6 numeric digits'
    );
  }

  // Format check - must be numeric only (ASCII digits 0-9, not Unicode digits)
  if (!/^\d{6}$/.test(trimmed)) {
    throw new ValidationError(
      'bankBin',
      bankBin,
      'format',
      `Bank BIN must contain only numeric characters (0-9). Expected: 6 numeric digits, Received: "${sanitizeForError(trimmed, 20)}"`,
      'INVALID_BANK_BIN_FORMAT',
      '6 numeric digits'
    );
  }
}

/**
 * Validate account number
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Account numbers must be alphanumeric
 * - Maximum length: 19 characters
 * - Minimum length: 1 character
 *
 * @param accountNumber - Account number to validate
 * @throws {ValidationError} If accountNumber is invalid
 *
 * @example
 * ```typescript
 * validateAccountNumber('01234567');      // Valid
 * validateAccountNumber('ABC123XYZ');     // Valid - alphanumeric
 * validateAccountNumber('1234567890123456789'); // Valid - 19 chars (max)
 * validateAccountNumber('12345678901234567890'); // Throws - exceeds 19 chars
 * validateAccountNumber('0123-456');      // Throws - contains hyphen
 * ```
 */
export function validateAccountNumber(accountNumber: unknown): asserts accountNumber is string {
  // Type check
  if (typeof accountNumber !== 'string') {
    throw new ValidationError(
      'accountNumber',
      accountNumber,
      'type',
      'Account number must be a string'
    );
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(accountNumber);

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'accountNumber',
      accountNumber,
      'required',
      'Account number is required',
      'MISSING_REQUIRED_FIELD',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }

  // Length check - maximum 19 characters per NAPAS spec
  if (trimmed.length > 19) {
    throw new ValidationError(
      'accountNumber',
      accountNumber,
      'length',
      `Account number must not exceed 19 characters. Expected: ≤ 19 characters, Received: "${sanitizeForError(trimmed, 25)}" (${trimmed.length} characters)`,
      'ACCOUNT_NUMBER_TOO_LONG',
      '≤ 19 characters'
    );
  }

  // Format check - must be alphanumeric only (ASCII A-Z, a-z, 0-9, not Unicode)
  if (!isAlphanumericASCII(trimmed)) {
    throw new ValidationError(
      'accountNumber',
      accountNumber,
      'format',
      `Account number must contain only alphanumeric characters (A-Z, a-z, 0-9). Expected: Alphanumeric only (A-Z, a-z, 0-9), Received: "${sanitizeForError(trimmed, 25)}"`,
      'INVALID_ACCOUNT_CHARACTERS',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }
}

/**
 * Validate card number
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Card numbers must be alphanumeric
 * - Maximum length: 19 characters
 * - Minimum length: 1 character
 *
 * @param cardNumber - Card number to validate
 * @throws {ValidationError} If cardNumber is invalid
 *
 * @example
 * ```typescript
 * validateCardNumber('9704031101234567');      // Valid
 * validateCardNumber('ABC123XYZ');             // Valid - alphanumeric
 * validateCardNumber('1234567890123456789');   // Valid - 19 chars (max)
 * validateCardNumber('12345678901234567890');  // Throws - exceeds 19 chars
 * validateCardNumber('9704-0311');             // Throws - contains hyphen
 * ```
 */
export function validateCardNumber(cardNumber: unknown): asserts cardNumber is string {
  // Type check
  if (typeof cardNumber !== 'string') {
    throw new ValidationError(
      'cardNumber',
      cardNumber,
      'type',
      'Card number must be a string'
    );
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(cardNumber);

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'cardNumber',
      cardNumber,
      'required',
      'Card number is required',
      'MISSING_REQUIRED_FIELD',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }

  // Length check - maximum 19 characters per NAPAS spec
  if (trimmed.length > 19) {
    throw new ValidationError(
      'cardNumber',
      cardNumber,
      'length',
      `Card number must not exceed 19 characters. Expected: ≤ 19 characters, Received: "${sanitizeForError(trimmed, 25)}" (${trimmed.length} characters)`,
      'CARD_NUMBER_TOO_LONG',
      '≤ 19 characters'
    );
  }

  // Format check - must be alphanumeric only (ASCII A-Z, a-z, 0-9, not Unicode)
  if (!isAlphanumericASCII(trimmed)) {
    throw new ValidationError(
      'cardNumber',
      cardNumber,
      'format',
      `Card number must contain only alphanumeric characters (A-Z, a-z, 0-9). Expected: Alphanumeric only (A-Z, a-z, 0-9), Received: "${sanitizeForError(trimmed, 25)}"`,
      'INVALID_CARD_CHARACTERS',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }
}
