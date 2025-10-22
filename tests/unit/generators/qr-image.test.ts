import { describe, it, expect } from 'vitest';
import { generateQRImage } from '../../../src/generators/qr-image';
import { ValidationError, QRGenerationError } from '../../../src/types/errors';
import type { QRImageConfig } from '../../../src/types/qr-image';

/**
 * Unit tests for QR image generation orchestration
 *
 * Tests the main generateQRImage function with various configurations.
 */

describe('QR Image Generation', () => {
  const testVietQRData =
    '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

  /**
   * T034: Unit test - generateQRImage with minimal config (data only)
   *
   * Verifies that generateQRImage works with minimal configuration,
   * applying all default values correctly.
   */
  it('T034: generates QR image with minimal config (data only)', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
    };

    const result = await generateQRImage(config);

    // Verify result structure
    expect(result).toBeDefined();
    expect(result.base64).toBeTruthy();
    expect(result.dataURI).toBeTruthy();

    // Verify defaults applied
    expect(result.format).toBe('png'); // Default format
    expect(result.size).toBe(300); // Default size
    expect(result.errorCorrectionLevel).toBe('M'); // Default error correction

    // Verify PNG data URI format
    expect(result.dataURI).toMatch(/^data:image\/png;base64,/);
    expect(result.dataURI).toBe(`data:image/png;base64,${result.base64}`);
  });

  /**
   * T035: Unit test - generateQRImage with custom size returns correct metadata
   *
   * Verifies that custom configuration parameters are properly applied
   * and reflected in the result metadata.
   */
  it('T035: generates QR image with custom size and returns correct metadata', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 500,
      errorCorrectionLevel: 'H',
    };

    const result = await generateQRImage(config);

    // Verify custom parameters in metadata
    expect(result.format).toBe('png');
    expect(result.size).toBe(500);
    expect(result.errorCorrectionLevel).toBe('H');

    // Verify result structure
    expect(result.base64).toBeTruthy();
    expect(result.dataURI).toMatch(/^data:image\/png;base64,/);
  });

  it('generates QR image with all custom parameters', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 400,
      errorCorrectionLevel: 'Q',
      margin: 8,
      color: {
        dark: '#1a73e8',
        light: '#ffffff',
      },
    };

    const result = await generateQRImage(config);

    // Verify all parameters reflected in metadata
    expect(result.format).toBe('png');
    expect(result.size).toBe(400);
    expect(result.errorCorrectionLevel).toBe('Q');
    expect(result.base64).toBeTruthy();
    expect(result.dataURI).toBeTruthy();
  });

  /**
   * T036: Unit test - generateQRImage throws ValidationError for invalid input
   *
   * Verifies that generateQRImage properly validates configuration
   * and throws appropriate errors for invalid inputs.
   */
  it('T036: throws ValidationError for invalid input', async () => {
    // Invalid: empty data
    const emptyDataConfig: QRImageConfig = { data: '' };
    await expect(generateQRImage(emptyDataConfig)).rejects.toThrow(ValidationError);
    await expect(generateQRImage(emptyDataConfig)).rejects.toThrow(
      'data must be a non-empty string'
    );

    // Invalid: size too small
    const smallSizeConfig: QRImageConfig = { data: testVietQRData, size: 49 };
    await expect(generateQRImage(smallSizeConfig)).rejects.toThrow(ValidationError);

    // Invalid: size too large
    const largeSizeConfig: QRImageConfig = { data: testVietQRData, size: 1001 };
    await expect(generateQRImage(largeSizeConfig)).rejects.toThrow(ValidationError);

    // Invalid: wrong format
    const invalidFormatConfig = {
      data: testVietQRData,
      format: 'jpeg',
    } as unknown as QRImageConfig;
    await expect(generateQRImage(invalidFormatConfig)).rejects.toThrow(ValidationError);
  });

  /**
   * T045: Unit test - generateQRImage with format: 'svg' returns SVG data URI
   *
   * Verifies that generateQRImage correctly handles SVG format:
   * - format field in result is 'svg'
   * - dataURI starts with 'data:image/svg+xml;base64,'
   * - Default parameters still applied
   */
  it('T045: generateQRImage with format: \'svg\' returns SVG data URI', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
    };

    const result = await generateQRImage(config);

    // Verify SVG format
    expect(result.format).toBe('svg');
    expect(result.dataURI).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(result.dataURI).toBe(`data:image/svg+xml;base64,${result.base64}`);

    // Verify defaults still applied for other parameters
    expect(result.size).toBe(300);
    expect(result.errorCorrectionLevel).toBe('M');

    // Verify base64 decodes to valid SVG
    const svgString = Buffer.from(result.base64, 'base64').toString('utf-8');
    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
  });

  /**
   * T046: Unit test - SVG output has correct format metadata in QRImageResult
   *
   * Verifies that SVG generation returns complete QRImageResult with:
   * - format: 'svg'
   * - size: configured or default value
   * - errorCorrectionLevel: configured or default value
   * - base64 and dataURI fields populated
   */
  it('T046: SVG output has correct format metadata in QRImageResult', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
      size: 400,
      errorCorrectionLevel: 'H',
    };

    const result = await generateQRImage(config);

    // Verify all metadata fields
    expect(result).toHaveProperty('base64');
    expect(result).toHaveProperty('dataURI');
    expect(result).toHaveProperty('format');
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('errorCorrectionLevel');

    // Verify correct values
    expect(result.format).toBe('svg');
    expect(result.size).toBe(400);
    expect(result.errorCorrectionLevel).toBe('H');

    // Verify base64 and dataURI are properly formatted
    expect(typeof result.base64).toBe('string');
    expect(result.base64.length).toBeGreaterThan(0);
    expect(result.dataURI).toBe(`data:image/svg+xml;base64,${result.base64}`);
  });

  it('handles different error correction levels', async () => {
    const levels = ['L', 'M', 'Q', 'H'] as const;

    for (const level of levels) {
      const config: QRImageConfig = {
        data: testVietQRData,
        errorCorrectionLevel: level,
      };

      const result = await generateQRImage(config);

      expect(result.errorCorrectionLevel).toBe(level);
      expect(result.base64).toBeTruthy();
    }
  });

  it('applies custom colors correctly', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      color: {
        dark: '#ff0000',
        light: '#00ff00',
      },
    };

    const result = await generateQRImage(config);

    // Should not throw and should return valid result
    expect(result.base64).toBeTruthy();
    expect(result.dataURI).toBeTruthy();
  });

  it('applies custom margin correctly', async () => {
    const config: QRImageConfig = {
      data: testVietQRData,
      margin: 0,
    };

    const result = await generateQRImage(config);

    // Should not throw with zero margin
    expect(result.base64).toBeTruthy();
    expect(result.dataURI).toBeTruthy();
  });

  /**
   * T061: Unit test - Custom size parameter in QRImageResult metadata
   *
   * Verifies that custom size parameter is properly reflected in the
   * QRImageResult metadata and applied to the output.
   */
  it('T061: Custom size parameter in QRImageResult metadata', async () => {
    const customSizes = [100, 300, 500, 800];

    for (const size of customSizes) {
      const config: QRImageConfig = {
        data: testVietQRData,
        size,
      };

      const result = await generateQRImage(config);

      // Verify size metadata matches config
      expect(result.size).toBe(size);

      // Verify image is generated
      expect(result.base64).toBeTruthy();
      expect(result.dataURI).toBeTruthy();
    }
  });

  /**
   * T062: Unit test - Custom error correction level in QRImageResult metadata
   *
   * Verifies that custom error correction level is properly reflected in the
   * QRImageResult metadata and applied to QR generation.
   */
  it('T062: Custom error correction level in QRImageResult metadata', async () => {
    const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];

    for (const level of levels) {
      const config: QRImageConfig = {
        data: testVietQRData,
        errorCorrectionLevel: level,
      };

      const result = await generateQRImage(config);

      // Verify error correction level metadata matches config
      expect(result.errorCorrectionLevel).toBe(level);

      // Verify image is generated
      expect(result.base64).toBeTruthy();
      expect(result.dataURI).toBeTruthy();
      expect(result.format).toBe('png'); // Default format
      expect(result.size).toBe(300); // Default size
    }
  });

  /**
   * T063: Unit test - All configuration combinations work correctly
   *
   * Verifies that all QR image configuration parameters can be combined
   * and work together correctly.
   */
  it('T063: All configuration combinations work correctly', async () => {
    // Test comprehensive configuration with all parameters
    const comprehensiveConfig: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 450,
      errorCorrectionLevel: 'Q',
      margin: 6,
      color: {
        dark: '#1a73e8',
        light: '#ffffff',
      },
    };

    const result1 = await generateQRImage(comprehensiveConfig);

    // Verify all metadata
    expect(result1.format).toBe('png');
    expect(result1.size).toBe(450);
    expect(result1.errorCorrectionLevel).toBe('Q');
    expect(result1.base64).toBeTruthy();
    expect(result1.dataURI).toMatch(/^data:image\/png;base64,/);

    // Test SVG with all parameters
    const svgConfig: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
      size: 350,
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#f0f0f0',
      },
    };

    const result2 = await generateQRImage(svgConfig);

    // Verify all metadata for SVG
    expect(result2.format).toBe('svg');
    expect(result2.size).toBe(350);
    expect(result2.errorCorrectionLevel).toBe('H');
    expect(result2.base64).toBeTruthy();
    expect(result2.dataURI).toMatch(/^data:image\/svg\+xml;base64,/);

    // Test minimal config (defaults should be applied)
    const minimalConfig: QRImageConfig = {
      data: testVietQRData,
    };

    const result3 = await generateQRImage(minimalConfig);

    // Verify defaults
    expect(result3.format).toBe('png');
    expect(result3.size).toBe(300);
    expect(result3.errorCorrectionLevel).toBe('M');
  });

  /**
   * T066: Unit test - Edge case: Data too long for QR capacity
   *
   * Verifies that generateQRImage throws QRGenerationError when data
   * exceeds QR code capacity for the given error correction level.
   */
  it('T066: throws QRGenerationError for data too long for QR capacity', async () => {
    // Create extremely long data that exceeds QR code capacity
    // QR codes with error correction level H can hold less data than L
    // At version 40 (max), Level H can hold ~1273 alphanumeric characters
    const veryLongData = 'A'.repeat(3000); // Way over any QR capacity

    const config: QRImageConfig = {
      data: veryLongData,
      errorCorrectionLevel: 'H', // Highest error correction = lowest capacity
    };

    // Should throw QRGenerationError (not ValidationError)
    await expect(generateQRImage(config)).rejects.toThrow(QRGenerationError);
    await expect(generateQRImage(config)).rejects.toThrow(/too long for QR code capacity/i);
  });

  /**
   * T066: Unit test - Edge case: Null/undefined data
   *
   * Verifies that generateQRImage throws ValidationError for null/undefined data.
   */
  it('T066: throws ValidationError for null data', async () => {
    const nullConfig = { data: null } as unknown as QRImageConfig;
    await expect(generateQRImage(nullConfig)).rejects.toThrow(ValidationError);
    await expect(generateQRImage(nullConfig)).rejects.toThrow('data must be a non-empty string');
  });

  /**
   * T066: Unit test - Edge case: Non-string data types
   *
   * Verifies that generateQRImage throws ValidationError for non-string data.
   */
  it('T066: throws ValidationError for non-string data types', async () => {
    // Number data
    const numberConfig = { data: 12345 } as unknown as QRImageConfig;
    await expect(generateQRImage(numberConfig)).rejects.toThrow(ValidationError);

    // Object data
    const objectConfig = { data: { value: 'test' } } as unknown as QRImageConfig;
    await expect(generateQRImage(objectConfig)).rejects.toThrow(ValidationError);

    // Array data
    const arrayConfig = { data: ['test'] } as unknown as QRImageConfig;
    await expect(generateQRImage(arrayConfig)).rejects.toThrow(ValidationError);
  });
});
