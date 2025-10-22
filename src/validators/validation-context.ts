/**
 * Validation context for collecting multiple validation errors
 *
 * This module provides a context-based error collection pattern that allows
 * validators to accumulate multiple errors before throwing, enabling better
 * user experience by showing all validation issues at once.
 *
 * @example
 * ```typescript
 * const context = new ValidationContext(config);
 *
 * context.tryValidate(() => validateBankBin(config.bankBin));
 * context.tryValidate(() => validateAccountNumber(config.accountNumber));
 *
 * context.throwIfErrors(); // Throws AggregateValidationError if any errors
 * ```
 */

import { ValidationError, AggregateValidationError } from '../types/errors.js';
import type { ValidationErrorCode } from './error-codes.js';

/**
 * Context for collecting validation errors across multiple validation operations
 *
 * Allows validators to run without immediately throwing, collecting all errors
 * for comprehensive error reporting.
 */
export class ValidationContext {
  /**
   * Accumulated validation errors
   */
  readonly errors: ValidationError[] = [];

  /**
   * Configuration object being validated
   */
  readonly config: unknown;

  /**
   * Creates a new validation context
   *
   * @param config - The configuration object being validated
   */
  constructor(config: unknown) {
    this.config = config;
  }

  /**
   * Adds a validation error to the context
   *
   * @param error - The validation error to add
   */
  addError(error: ValidationError): void {
    this.errors.push(error);
  }

  /**
   * Executes a validation function and catches any ValidationError thrown
   *
   * If the validation function throws a ValidationError, it's added to the
   * error collection. Other error types are re-thrown.
   *
   * @param validationFn - Function that performs validation (may throw ValidationError)
   * @returns true if validation passed, false if ValidationError was caught
   *
   * @example
   * ```typescript
   * context.tryValidate(() => validateBankBin(config.bankBin));
   * ```
   */
  tryValidate(validationFn: () => void): boolean {
    try {
      validationFn();
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.addError(error);
        return false;
      }
      // Re-throw non-validation errors
      throw error;
    }
  }

  /**
   * Throws AggregateValidationError if any errors have been collected
   *
   * Should be called after all validations are complete to fail-fast if
   * any validation errors occurred.
   *
   * @throws {AggregateValidationError} If one or more validation errors exist
   *
   * @example
   * ```typescript
   * context.tryValidate(() => validateBankBin(config.bankBin));
   * context.tryValidate(() => validateAccountNumber(config.accountNumber));
   * context.throwIfErrors(); // Throws if either validation failed
   * ```
   */
  throwIfErrors(): void {
    if (this.errors.length > 0) {
      throw new AggregateValidationError(this.errors);
    }
  }

  /**
   * Checks if any errors have been collected
   *
   * @returns true if errors exist, false otherwise
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Gets the number of errors collected
   *
   * @returns The error count
   */
  get errorCount(): number {
    return this.errors.length;
  }

  /**
   * Creates a ValidationError with enhanced properties
   *
   * Helper method to create ValidationError instances with code and expectedFormat
   * properties for improved error reporting.
   *
   * @param field - The field name that failed validation
   * @param value - The actual value that was invalid
   * @param rule - The validation rule that failed
   * @param message - Human-readable error message
   * @param code - Machine-readable error code (optional)
   * @param expectedFormat - Description of expected format (optional)
   * @returns ValidationError instance
   */
  createError(
    field: string,
    value: unknown,
    rule: string,
    message: string,
    code?: ValidationErrorCode,
    expectedFormat?: string
  ): ValidationError {
    const error = new ValidationError(field, value, rule, message);

    // Extend with additional properties
    if (code !== undefined) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
        writable: false,
      });
    }

    if (expectedFormat !== undefined) {
      Object.defineProperty(error, 'expectedFormat', {
        value: expectedFormat,
        enumerable: true,
        writable: false,
      });
    }

    return error;
  }
}
