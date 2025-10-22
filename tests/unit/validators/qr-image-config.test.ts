import { describe, it, expect } from 'vitest';
import { validateQRImageConfig } from '../../../src/validators/qr-image-config';
import { ValidationError, AggregateValidationError } from '../../../src/types/errors';
import type { QRImageConfig } from '../../../src/types/qr-image';

/**
 * Unit tests for QR image configuration validation
 *
 * Tests validation logic for all QRImageConfig fields per FR-011 and FR-012.
 */

describe('QR Image Config Validation', () => {
  const validData =
    '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

  /**
   * T023: Unit test - Config validation for required data field
   *
   * Verifies that validateQRImageConfig:
   * - Accepts valid non-empty data string
   * - Rejects empty string
   * - Rejects undefined/null data
   * - Rejects non-string types
   */
  it('T023: validates required data field', () => {
    // Valid: non-empty string
    const validConfig: QRImageConfig = { data: validData };
    expect(() => validateQRImageConfig(validConfig)).not.toThrow();

    // Invalid: empty string
    const emptyConfig: QRImageConfig = { data: '' };
    expect(() => validateQRImageConfig(emptyConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(emptyConfig)).toThrow('data must be a non-empty string');

    // Invalid: whitespace only
    const whitespaceConfig: QRImageConfig = { data: '   ' };
    expect(() => validateQRImageConfig(whitespaceConfig)).toThrow(ValidationError);

    // Invalid: undefined (type assertion for test)
    const undefinedConfig = { data: undefined } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(undefinedConfig)).toThrow(ValidationError);

    // Invalid: null (type assertion for test)
    const nullConfig = { data: null } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(nullConfig)).toThrow(ValidationError);
  });

  /**
   * T024: Unit test - Config validation for format enum
   *
   * Verifies that validateQRImageConfig:
   * - Accepts 'png' format
   * - Accepts 'svg' format
   * - Rejects invalid format values
   * - Allows undefined format (optional field)
   */
  it('T024: validates format enum', () => {
    // Valid: 'png' format
    const pngConfig: QRImageConfig = { data: validData, format: 'png' };
    expect(() => validateQRImageConfig(pngConfig)).not.toThrow();

    // Valid: 'svg' format
    const svgConfig: QRImageConfig = { data: validData, format: 'svg' };
    expect(() => validateQRImageConfig(svgConfig)).not.toThrow();

    // Valid: undefined format (optional)
    const noFormatConfig: QRImageConfig = { data: validData };
    expect(() => validateQRImageConfig(noFormatConfig)).not.toThrow();

    // Invalid: wrong format
    const invalidConfig = { data: validData, format: 'jpeg' } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(invalidConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(invalidConfig)).toThrow(
      'format must be either "png" or "svg"'
    );

    // Invalid: wrong case
    const wrongCaseConfig = { data: validData, format: 'PNG' } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(wrongCaseConfig)).toThrow(ValidationError);
  });

  /**
   * T025: Unit test - Config validation for size range (50-1000)
   *
   * Verifies that validateQRImageConfig:
   * - Accepts sizes in valid range [50, 1000]
   * - Rejects sizes below 50
   * - Rejects sizes above 1000
   * - Rejects non-integer sizes
   * - Allows undefined size (optional field)
   */
  it('T025: validates size range (50-1000)', () => {
    // Valid: minimum size
    const minSizeConfig: QRImageConfig = { data: validData, size: 50 };
    expect(() => validateQRImageConfig(minSizeConfig)).not.toThrow();

    // Valid: maximum size
    const maxSizeConfig: QRImageConfig = { data: validData, size: 1000 };
    expect(() => validateQRImageConfig(maxSizeConfig)).not.toThrow();

    // Valid: middle range
    const midSizeConfig: QRImageConfig = { data: validData, size: 300 };
    expect(() => validateQRImageConfig(midSizeConfig)).not.toThrow();

    // Valid: undefined size (optional)
    const noSizeConfig: QRImageConfig = { data: validData };
    expect(() => validateQRImageConfig(noSizeConfig)).not.toThrow();

    // Invalid: below minimum
    const tooSmallConfig: QRImageConfig = { data: validData, size: 49 };
    expect(() => validateQRImageConfig(tooSmallConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(tooSmallConfig)).toThrow(
      'size must be between 50 and 1000 pixels'
    );

    // Invalid: above maximum
    const tooLargeConfig: QRImageConfig = { data: validData, size: 1001 };
    expect(() => validateQRImageConfig(tooLargeConfig)).toThrow(ValidationError);

    // Invalid: non-integer
    const floatConfig: QRImageConfig = { data: validData, size: 300.5 };
    expect(() => validateQRImageConfig(floatConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(floatConfig)).toThrow('size must be an integer');

    // Invalid: negative
    const negativeConfig: QRImageConfig = { data: validData, size: -100 };
    expect(() => validateQRImageConfig(negativeConfig)).toThrow(ValidationError);
  });

  /**
   * T051: Unit test - All error correction levels (L, M, Q, H) accepted
   *
   * Verifies that validateQRImageConfig accepts all valid error correction levels
   * and rejects invalid values.
   */
  it('T051: All error correction levels (L, M, Q, H) accepted', () => {
    // Valid: all levels
    const levels = ['L', 'M', 'Q', 'H'] as const;
    for (const level of levels) {
      const config: QRImageConfig = { data: validData, errorCorrectionLevel: level };
      expect(() => validateQRImageConfig(config)).not.toThrow();
    }

    // Invalid: wrong level
    const invalidConfig = {
      data: validData,
      errorCorrectionLevel: 'X',
    } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(invalidConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(invalidConfig)).toThrow(
      'errorCorrectionLevel must be one of: L, M, Q, H'
    );
  });

  it('validates margin (non-negative integer)', () => {
    // Valid: zero margin
    const zeroMarginConfig: QRImageConfig = { data: validData, margin: 0 };
    expect(() => validateQRImageConfig(zeroMarginConfig)).not.toThrow();

    // Valid: positive margin
    const positiveMarginConfig: QRImageConfig = { data: validData, margin: 10 };
    expect(() => validateQRImageConfig(positiveMarginConfig)).not.toThrow();

    // Invalid: negative margin
    const negativeMarginConfig: QRImageConfig = { data: validData, margin: -1 };
    expect(() => validateQRImageConfig(negativeMarginConfig)).toThrow(ValidationError);

    // Invalid: float margin
    const floatMarginConfig: QRImageConfig = { data: validData, margin: 2.5 };
    expect(() => validateQRImageConfig(floatMarginConfig)).toThrow(ValidationError);
  });

  /**
   * T052: Unit test - Color hex validation accepts valid formats
   *
   * Verifies that validateQRImageConfig accepts valid 6-digit hex color codes
   * in both uppercase and lowercase.
   */
  it('T052: Color hex validation accepts valid formats', () => {
    // Valid: standard hex colors (uppercase)
    const validColorConfig: QRImageConfig = {
      data: validData,
      color: { dark: '#000000', light: '#FFFFFF' },
    };
    expect(() => validateQRImageConfig(validColorConfig)).not.toThrow();

    // Valid: lowercase hex
    const lowercaseConfig: QRImageConfig = {
      data: validData,
      color: { dark: '#ff0000', light: '#00ff00' },
    };
    expect(() => validateQRImageConfig(lowercaseConfig)).not.toThrow();

    // Valid: mixed case hex
    const mixedCaseConfig: QRImageConfig = {
      data: validData,
      color: { dark: '#AbCdEf', light: '#123456' },
    };
    expect(() => validateQRImageConfig(mixedCaseConfig)).not.toThrow();
  });

  /**
   * T053: Unit test - Color hex validation rejects invalid formats
   *
   * Verifies that validateQRImageConfig properly rejects invalid color formats
   * including 3-digit hex, named colors, and invalid characters.
   */
  it('T053: Color hex validation rejects invalid formats', () => {
    // Invalid: 3-digit hex (both dark and light invalid = AggregateValidationError)
    const shortHexConfig: QRImageConfig = {
      data: validData,
      color: { dark: '#000', light: '#FFF' },
    };
    expect(() => validateQRImageConfig(shortHexConfig)).toThrow(AggregateValidationError);

    // Invalid: named colors (both invalid = AggregateValidationError)
    const namedColorConfig = {
      data: validData,
      color: { dark: 'black', light: 'white' },
    } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(namedColorConfig)).toThrow(AggregateValidationError);

    // Invalid: invalid hex characters
    const invalidHexConfig = {
      data: validData,
      color: { dark: '#GGGGGG', light: '#FFFFFF' },
    } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(invalidHexConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(invalidHexConfig)).toThrow(
      'color.dark must be a valid 6-digit hex color'
    );

    // Invalid: missing hash symbol
    const noHashConfig = {
      data: validData,
      color: { dark: '000000', light: '#FFFFFF' },
    } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(noHashConfig)).toThrow(ValidationError);
  });

  it('throws AggregateValidationError for multiple errors', () => {
    // Config with multiple errors
    const multiErrorConfig = {
      data: '',
      format: 'jpeg',
      size: 2000,
    } as unknown as QRImageConfig;

    try {
      validateQRImageConfig(multiErrorConfig);
      expect.fail('Should have thrown AggregateValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateValidationError);
      if (error instanceof AggregateValidationError) {
        expect(error.errors.length).toBeGreaterThan(1);
      }
    }
  });

  /**
   * T067: Unit test - Edge case: Size boundary validation at exact limits
   *
   * Verifies that size validation works correctly at exact boundary values (50 and 1000).
   */
  it('T067: validates size boundaries (50 and 1000) correctly', () => {
    // Valid: exactly 50 (minimum)
    const minSizeConfig: QRImageConfig = { data: validData, size: 50 };
    expect(() => validateQRImageConfig(minSizeConfig)).not.toThrow();

    // Valid: exactly 1000 (maximum)
    const maxSizeConfig: QRImageConfig = { data: validData, size: 1000 };
    expect(() => validateQRImageConfig(maxSizeConfig)).not.toThrow();

    // Invalid: 49 (just below minimum)
    const belowMinConfig: QRImageConfig = { data: validData, size: 49 };
    expect(() => validateQRImageConfig(belowMinConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(belowMinConfig)).toThrow(
      'size must be between 50 and 1000 pixels'
    );

    // Invalid: 1001 (just above maximum)
    const aboveMaxConfig: QRImageConfig = { data: validData, size: 1001 };
    expect(() => validateQRImageConfig(aboveMaxConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(aboveMaxConfig)).toThrow(
      'size must be between 50 and 1000 pixels'
    );
  });

  /**
   * T067: Unit test - Edge case: Size type validation
   *
   * Verifies that size must be an integer (not float, string, etc.).
   */
  it('T067: rejects non-integer size values', () => {
    // Invalid: floating point number
    const floatConfig: QRImageConfig = { data: validData, size: 100.5 };
    expect(() => validateQRImageConfig(floatConfig)).toThrow(ValidationError);
    expect(() => validateQRImageConfig(floatConfig)).toThrow('size must be an integer');

    // Invalid: negative integer
    const negativeConfig: QRImageConfig = { data: validData, size: -100 };
    expect(() => validateQRImageConfig(negativeConfig)).toThrow(ValidationError);

    // Invalid: string (type assertion for test)
    const stringConfig = { data: validData, size: '300' } as unknown as QRImageConfig;
    expect(() => validateQRImageConfig(stringConfig)).toThrow(ValidationError);
  });
});
