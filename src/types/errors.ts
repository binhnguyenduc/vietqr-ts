/**
 * Validation error with field-specific context
 */
export class ValidationError extends Error {
  /**
   * Field name that failed validation
   */
  readonly field: string;

  /**
   * Invalid value provided
   */
  readonly value: unknown;

  /**
   * Validation rule that failed
   */
  readonly rule: string;

  /**
   * Machine-readable error code for programmatic error handling
   *
   * Optional error code that categorizes the validation failure.
   * Enables consumers to handle specific error types programmatically.
   *
   * @example
   * ```typescript
   * if (error.code === 'INVALID_BANK_BIN_LENGTH') {
   *   // Handle bank BIN length error specifically
   * }
   * ```
   */
  readonly code?: string;

  /**
   * Expected format or constraint description
   *
   * Human-readable description of what format or value was expected.
   * Helps developers understand the constraint that was violated.
   *
   * @example
   * ```typescript
   * console.error(`Expected: ${error.expectedFormat}, Received: ${error.value}`);
   * // Output: "Expected: 6 numeric digits, Received: 12345"
   * ```
   */
  readonly expectedFormat?: string;

  constructor(
    field: string,
    value: unknown,
    rule: string,
    message: string,
    code?: string,
    expectedFormat?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
    this.code = code;
    this.expectedFormat = expectedFormat;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Aggregate validation error containing multiple validation failures
 */
export class AggregateValidationError extends Error {
  /**
   * Array of individual validation errors
   */
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Validation failed with ${errors.length} error(s):\n${errors
      .map((e) => `  - ${e.field}: ${e.message}`)
      .join('\n')}`;
    super(message);
    this.name = 'AggregateValidationError';
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, AggregateValidationError);
    }
  }
}

/**
 * Error thrown when QR code generation fails
 */
export class QRGenerationError extends Error {
  /**
   * Original error that caused the QR generation failure
   */
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'QRGenerationError';
    this.cause = cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, QRGenerationError);
    }
  }
}

/**
 * Error thrown when image encoding fails
 */
export class ImageEncodingError extends Error {
  /**
   * Original error that caused the image encoding failure
   */
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ImageEncodingError';
    this.cause = cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ImageEncodingError);
    }
  }
}
