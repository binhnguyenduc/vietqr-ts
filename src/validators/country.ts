import { ValidationError } from '../types/errors';

/**
 * Validate country code
 *
 * Per NAPAS IBFT v1.5.2 specification, only Vietnam is supported:
 * - Country code must be "VN" (ISO 3166-1 alpha-2 code for Vietnam)
 * - Case-sensitive exact match required
 *
 * @param country - Country code to validate
 * @throws {ValidationError} If country is not "VN"
 *
 * @example
 * ```typescript
 * validateCountry('VN');  // Valid - Vietnam
 * validateCountry('vn');  // Throws - lowercase not allowed
 * validateCountry('US');  // Throws - only Vietnam supported
 * ```
 */
export function validateCountry(country: unknown): asserts country is 'VN' {
  // Type check
  if (typeof country !== 'string') {
    throw new ValidationError(
      'country',
      country,
      'type',
      'Country must be a string'
    );
  }

  // Trim whitespace
  const trimmed = country.trim();

  // Required check
  if (trimmed.length === 0) {
    throw new ValidationError(
      'country',
      country,
      'required',
      'Country is required',
      'MISSING_REQUIRED_FIELD',
      '"VN" (Vietnam)'
    );
  }

  // Valid country check - only VN (Vietnam) is supported
  if (trimmed !== 'VN') {
    throw new ValidationError(
      'country',
      country,
      'enum',
      `Invalid country code. Expected: "VN" (Vietnam), Received: "${trimmed}"`,
      'INVALID_COUNTRY_CODE',
      '"VN" (Vietnam)'
    );
  }
}
