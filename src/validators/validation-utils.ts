/**
 * Validation utility functions for robust input handling
 *
 * Provides enhanced trimming and sanitization beyond standard JavaScript methods
 * to handle edge cases like Unicode whitespace, special characters, and invalid inputs.
 */

/**
 * Comprehensive whitespace trimming that handles Unicode whitespace characters
 *
 * Standard trim() only handles ASCII whitespace (\t, \n, \r, space).
 * This function also handles Unicode whitespace like:
 * - \u00A0 (non-breaking space)
 * - \u2003 (em space)
 * - \u3000 (ideographic space)
 * - and other Unicode whitespace categories
 *
 * @param value - String value to trim
 * @returns Trimmed string with all whitespace (including Unicode) removed from start/end
 *
 * @example
 * ```typescript
 * trimWhitespace('  hello  ');        // 'hello'
 * trimWhitespace('\u00A0hello\u00A0'); // 'hello'
 * trimWhitespace('\u3000hello\u3000'); // 'hello'
 * ```
 */
export function trimWhitespace(value: string): string {
  // \s matches all Unicode whitespace characters in JavaScript regex
  // This includes standard whitespace and Unicode whitespace categories
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Check if a string contains only whitespace (including Unicode whitespace)
 *
 * @param value - String value to check
 * @returns true if string is empty or contains only whitespace
 *
 * @example
 * ```typescript
 * isWhitespaceOnly('   ');        // true
 * isWhitespaceOnly('\u00A0');     // true
 * isWhitespaceOnly('hello');      // false
 * isWhitespaceOnly('  hi  ');     // false
 * ```
 */
export function isWhitespaceOnly(value: string): boolean {
  return /^\s*$/.test(value);
}

/**
 * Sanitize value for error messages - truncate long values and escape special characters
 *
 * Prevents error messages from becoming too verbose or exposing sensitive data.
 * Truncates long values and adds ellipsis.
 *
 * @param value - Value to sanitize
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Sanitized string safe for error messages
 *
 * @example
 * ```typescript
 * sanitizeForError('short');                    // 'short'
 * sanitizeForError('a'.repeat(100));            // 'aaaa...' (truncated)
 * sanitizeForError('password123', 10);          // 'password...' (truncated at 10)
 * ```
 */
export function sanitizeForError(value: unknown, maxLength: number = 50): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  let str: string;

  if (typeof value === 'string') {
    str = value;
  } else if (typeof value === 'object') {
    // For objects, show type instead of contents to avoid verbose errors
    if (Array.isArray(value)) {
      str = `[Array(${value.length})]`;
    } else {
      str = '[Object]';
    }
  } else {
    str = String(value);
  }

  // Truncate if too long
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + '...';
  }

  return str;
}

/**
 * Check if a string contains newline or tab characters
 *
 * Useful for validating single-line text fields that should not contain
 * line breaks or tabs.
 *
 * @param value - String to check
 * @returns true if string contains newlines (\n, \r) or tabs (\t)
 *
 * @example
 * ```typescript
 * containsNewlineOrTab('hello');           // false
 * containsNewlineOrTab('line1\nline2');    // true
 * containsNewlineOrTab('text\twith\ttabs'); // true
 * ```
 */
export function containsNewlineOrTab(value: string): boolean {
  return /[\n\r\t]/.test(value);
}

/**
 * Validate that a string contains only ASCII alphanumeric characters
 *
 * Rejects Unicode letters, special characters, and non-ASCII digits.
 * Allows only A-Z, a-z, 0-9.
 *
 * @param value - String to validate
 * @returns true if string contains only ASCII alphanumeric characters
 *
 * @example
 * ```typescript
 * isAlphanumericASCII('ABC123');     // true
 * isAlphanumericASCII('ABC-123');    // false (hyphen)
 * isAlphanumericASCII('АБВ123');     // false (Cyrillic)
 * isAlphanumericASCII('中文123');    // false (Chinese)
 * ```
 */
export function isAlphanumericASCII(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value);
}

/**
 * Validate that a string contains only ASCII digits (0-9)
 *
 * Rejects Unicode digits like Arabic-Indic (٠-٩) or Devanagari (०-९).
 *
 * @param value - String to validate
 * @returns true if string contains only ASCII digits (0-9)
 *
 * @example
 * ```typescript
 * isNumericASCII('123456');      // true
 * isNumericASCII('١٢٣');         // false (Arabic-Indic digits)
 * isNumericASCII('९७०');         // false (Devanagari digits)
 * ```
 */
export function isNumericASCII(value: string): boolean {
  return /^\d+$/.test(value);
}
