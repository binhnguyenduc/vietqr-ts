import { ValidationError } from '../types/errors';
import { trimWhitespace, sanitizeForError, containsNewlineOrTab, isAlphanumericASCII } from './validation-utils';

/**
 * Validate bill number
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Bill numbers must be alphanumeric
 * - Maximum length: 25 characters
 * - Minimum length: 1 character
 *
 * @param billNumber - Bill number to validate
 * @throws {ValidationError} If billNumber is invalid
 *
 * @example
 * ```typescript
 * validateBillNumber('NPS6869');       // Valid
 * validateBillNumber('INV123');        // Valid
 * validateBillNumber('A'.repeat(25));  // Valid - 25 chars (max)
 * validateBillNumber('A'.repeat(26));  // Throws - exceeds 25 chars
 * validateBillNumber('INV-123');       // Throws - contains hyphen
 * ```
 */
export function validateBillNumber(billNumber: unknown): asserts billNumber is string {
  // Type check
  if (typeof billNumber !== 'string') {
    throw new ValidationError(
      'billNumber',
      billNumber,
      'type',
      'Bill number must be a string'
    );
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(billNumber);

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'billNumber',
      billNumber,
      'required',
      'Bill number is required',
      'MISSING_REQUIRED_FIELD',
      'Alphanumeric, hyphen, underscore allowed'
    );
  }

  // Length check - maximum 25 characters per NAPAS spec
  if (trimmed.length > 25) {
    throw new ValidationError(
      'billNumber',
      billNumber,
      'length',
      `Bill number must not exceed 25 characters. Expected: ≤ 25 characters, Received: "${sanitizeForError(trimmed, 30)}" (${trimmed.length} ${trimmed.length === 1 ? 'character' : 'characters'})`,
      'BILL_NUMBER_TOO_LONG',
      '≤ 25 characters'
    );
  }

  // Format check - alphanumeric with hyphens and underscores allowed (common in bill numbers)
  // Updated to match real-world bill number formats
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw new ValidationError(
      'billNumber',
      billNumber,
      'format',
      `Bill number must contain only alphanumeric characters, hyphens, or underscores. Expected: Alphanumeric, hyphen, underscore allowed, Received: "${sanitizeForError(trimmed, 30)}"`,
      'INVALID_BILL_CHARACTERS',
      'Alphanumeric, hyphen, underscore allowed'
    );
  }
}

/**
 * Validate purpose/description
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Purpose can contain any characters
 * - Maximum length: 25 characters
 * - Minimum length: 1 character
 *
 * @param purpose - Purpose/description to validate
 * @throws {ValidationError} If purpose is invalid
 *
 * @example
 * ```typescript
 * validatePurpose('thanh toan don hang');  // Valid
 * validatePurpose('payment for order');     // Valid
 * validatePurpose('A'.repeat(25));          // Valid - 25 chars (max)
 * validatePurpose('A'.repeat(26));          // Throws - exceeds 25 chars
 * ```
 */
export function validatePurpose(purpose: unknown): asserts purpose is string {
  // Type check
  if (typeof purpose !== 'string') {
    throw new ValidationError('purpose', purpose, 'type', 'Purpose must be a string');
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(purpose);

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'purpose',
      purpose,
      'required',
      'Purpose is required',
      'MISSING_REQUIRED_FIELD',
      'Any characters (Unicode OK)'
    );
  }

  // Length check - maximum 25 characters per NAPAS spec
  if (trimmed.length > 25) {
    throw new ValidationError(
      'purpose',
      purpose,
      'length',
      `Purpose must not exceed 25 characters. Expected: ≤ 25 characters, Received: "${sanitizeForError(trimmed, 30)}..." (${trimmed.length} ${trimmed.length === 1 ? 'character' : 'characters'})`,
      'PURPOSE_TOO_LONG',
      '≤ 25 characters'
    );
  }

  // Format check - reject newlines and tabs (single-line text field)
  if (containsNewlineOrTab(trimmed)) {
    throw new ValidationError(
      'purpose',
      purpose,
      'format',
      `Purpose must not contain newline or tab characters. Expected: Single-line text, Received: "${sanitizeForError(trimmed, 30)}"`,
      'INVALID_PURPOSE_FORMAT',
      'Single-line text (no newlines or tabs)'
    );
  }

  // No other format restriction - purpose can contain any characters per NAPAS spec
}

/**
 * Validate message field
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Message can contain any characters (Unicode supported)
 * - Maximum length: 500 characters
 * - Minimum length: 0 characters (optional field)
 *
 * @param message - Message to validate
 * @throws {ValidationError} If message is invalid
 *
 * @example
 * ```typescript
 * validateMessage('Thanh toán đơn hàng #123');  // Valid - Vietnamese
 * validateMessage('Payment for order');         // Valid - English
 * validateMessage('A'.repeat(500));             // Valid - 500 chars (max)
 * validateMessage('A'.repeat(501));             // Throws - exceeds 500 chars
 * ```
 */
export function validateMessage(message: unknown): asserts message is string {
  // Type check
  if (typeof message !== 'string') {
    throw new ValidationError('message', message, 'type', 'Message must be a string');
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(message);

  // Optional field - empty is allowed (skip required check)

  // Length check - maximum 500 characters per NAPAS spec
  if (trimmed.length > 500) {
    throw new ValidationError(
      'message',
      message,
      'length',
      `Message must not exceed 500 characters. Expected: ≤ 500 characters, Received: "${sanitizeForError(trimmed, 50)}..." (${trimmed.length} ${trimmed.length === 1 ? 'character' : 'characters'})`,
      'MESSAGE_TOO_LONG',
      '≤ 500 characters'
    );
  }

  // No format restriction - message can contain any characters per NAPAS spec
}

/**
 * Validate reference label
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Reference label must be alphanumeric
 * - Maximum length: 25 characters
 * - Minimum length: 0 characters (optional field)
 *
 * @param referenceLabel - Reference label to validate
 * @throws {ValidationError} If referenceLabel is invalid
 *
 * @example
 * ```typescript
 * validateReferenceLabel('REF123');        // Valid
 * validateReferenceLabel('ORDER001');      // Valid
 * validateReferenceLabel('A'.repeat(25));  // Valid - 25 chars (max)
 * validateReferenceLabel('A'.repeat(26));  // Throws - exceeds 25 chars
 * validateReferenceLabel('REF-123');       // Throws - contains hyphen
 * ```
 */
export function validateReferenceLabel(
  referenceLabel: unknown
): asserts referenceLabel is string {
  // Type check
  if (typeof referenceLabel !== 'string') {
    throw new ValidationError(
      'referenceLabel',
      referenceLabel,
      'type',
      'Reference label must be a string'
    );
  }

  // Trim whitespace (including Unicode whitespace)
  const trimmed = trimWhitespace(referenceLabel);

  // Optional field - empty is allowed, but whitespace-only is not
  // If original was non-empty but trimmed is empty, it was whitespace-only
  if (referenceLabel.length > 0 && trimmed.length === 0) {
    throw new ValidationError(
      'referenceLabel',
      referenceLabel,
      'format',
      `Reference label cannot be whitespace only. Expected: Alphanumeric only (A-Z, a-z, 0-9) or empty, Received: "${sanitizeForError(referenceLabel, 25)}"`,
      'INVALID_REFERENCE_CHARACTERS',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }

  // Length check - maximum 25 characters per NAPAS spec
  if (trimmed.length > 25) {
    throw new ValidationError(
      'referenceLabel',
      referenceLabel,
      'length',
      `Reference label must not exceed 25 characters. Expected: ≤ 25 characters, Received: "${sanitizeForError(trimmed, 30)}" (${trimmed.length} ${trimmed.length === 1 ? 'character' : 'characters'})`,
      'REFERENCE_LABEL_TOO_LONG',
      '≤ 25 characters'
    );
  }

  // Format check - must be alphanumeric only (A-Z, a-z, 0-9)
  // Only validate if non-empty (optional field)
  if (trimmed.length > 0 && !isAlphanumericASCII(trimmed)) {
    throw new ValidationError(
      'referenceLabel',
      referenceLabel,
      'format',
      `Reference label must contain only alphanumeric characters. Expected: Alphanumeric only (A-Z, a-z, 0-9), Received: "${sanitizeForError(trimmed, 30)}"`,
      'INVALID_REFERENCE_CHARACTERS',
      'Alphanumeric only (A-Z, a-z, 0-9)'
    );
  }
}
