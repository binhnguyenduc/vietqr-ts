import { ValidationError, AggregateValidationError } from '../types/errors';
import type { QRImageConfig } from '../types/qr-image';

/**
 * Validates QR image configuration
 *
 * Performs comprehensive validation of all QRImageConfig fields according to
 * functional requirements FR-011 and FR-012.
 *
 * @param config - QR image configuration to validate
 * @throws {AggregateValidationError} If multiple validation errors occur
 * @throws {ValidationError} If a single validation error occurs
 */
export function validateQRImageConfig(config: QRImageConfig): void {
  const errors: ValidationError[] = [];

  // FR-011: Required field validation - data must be non-empty string
  if (!config.data || typeof config.data !== 'string' || config.data.trim() === '') {
    errors.push(
      new ValidationError(
        'data',
        config.data,
        'required',
        'data must be a non-empty string'
      )
    );
  }

  // Optional: format validation
  if (config.format !== undefined) {
    const validFormats = ['png', 'svg'];
    if (!validFormats.includes(config.format)) {
      errors.push(
        new ValidationError(
          'format',
          config.format,
          'enum',
          'format must be either "png" or "svg"'
        )
      );
    }
  }

  // FR-012: size validation (50-1000 pixels)
  if (config.size !== undefined) {
    if (!Number.isInteger(config.size)) {
      errors.push(
        new ValidationError(
          'size',
          config.size,
          'type',
          'size must be an integer'
        )
      );
    } else if (config.size < 50 || config.size > 1000) {
      errors.push(
        new ValidationError(
          'size',
          config.size,
          'range',
          'size must be between 50 and 1000 pixels'
        )
      );
    }
  }

  // Optional: errorCorrectionLevel validation
  if (config.errorCorrectionLevel !== undefined) {
    const validLevels = ['L', 'M', 'Q', 'H'];
    if (!validLevels.includes(config.errorCorrectionLevel)) {
      errors.push(
        new ValidationError(
          'errorCorrectionLevel',
          config.errorCorrectionLevel,
          'enum',
          'errorCorrectionLevel must be one of: L, M, Q, H'
        )
      );
    }
  }

  // Optional: margin validation (non-negative)
  if (config.margin !== undefined) {
    if (!Number.isInteger(config.margin)) {
      errors.push(
        new ValidationError(
          'margin',
          config.margin,
          'type',
          'margin must be an integer'
        )
      );
    } else if (config.margin < 0) {
      errors.push(
        new ValidationError(
          'margin',
          config.margin,
          'range',
          'margin must be a non-negative integer'
        )
      );
    }
  }

  // Optional: color validation
  if (config.color) {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    if (config.color.dark && !hexPattern.test(config.color.dark)) {
      errors.push(
        new ValidationError(
          'color.dark',
          config.color.dark,
          'pattern',
          'color.dark must be a valid 6-digit hex color (e.g., #000000)'
        )
      );
    }

    if (config.color.light && !hexPattern.test(config.color.light)) {
      errors.push(
        new ValidationError(
          'color.light',
          config.color.light,
          'pattern',
          'color.light must be a valid 6-digit hex color (e.g., #FFFFFF)'
        )
      );
    }
  }

  // Throw aggregate error if multiple validation errors
  if (errors.length > 1) {
    throw new AggregateValidationError(errors);
  }

  // Throw single error if only one validation error
  if (errors.length === 1) {
    throw errors[0];
  }
}
