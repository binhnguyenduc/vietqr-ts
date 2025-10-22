import { describe, it, expect } from 'vitest';
import type { QRColorOptions } from '../../../src/types/qr-image';

/**
 * Unit tests for image encoding utilities
 *
 * Tests PNG/SVG encoding functions and base64 conversion utilities.
 */

describe('Image Encoder Utilities', () => {
  const testVietQRData =
    '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

  /**
   * T020: Unit test - PNG encoding from QR matrix
   *
   * Verifies that encodePNGImage function:
   * - Accepts QR data string
   * - Accepts optional size, margin, and color parameters
   * - Returns PNG data URI string
   */
  it('T020: PNG encoding from QR data', async () => {
    // This test will fail until encodePNGImage is implemented
    const { encodePNGImage } = await import('../../../src/utils/image-encoder');

    const dataURI = await encodePNGImage(testVietQRData);

    // Verify PNG data URI format
    expect(dataURI).toMatch(/^data:image\/png;base64,/);
    expect(dataURI.length).toBeGreaterThan(100);
  });

  it('PNG encoding with custom parameters', async () => {
    const { encodePNGImage } = await import('../../../src/utils/image-encoder');

    const color: QRColorOptions = {
      dark: '#000000',
      light: '#FFFFFF',
    };

    const dataURI = await encodePNGImage(testVietQRData, {
      size: 400,
      margin: 4,
      errorCorrectionLevel: 'H',
      color,
    });

    expect(dataURI).toMatch(/^data:image\/png;base64,/);
    expect(dataURI.length).toBeGreaterThan(100);
  });

  /**
   * T021: Unit test - Base64 encoding produces valid data URI
   *
   * Verifies that encodeToBase64 utility function:
   * - Accepts raw string or buffer
   * - Returns valid base64 string
   * - Creates correct data URI with MIME type
   */
  it('T021: Base64 encoding produces valid data URI', async () => {
    // This test will fail until encodeToBase64 is implemented
    const { encodeToBase64 } = await import('../../../src/utils/image-encoder');

    const testString = 'Hello, World!';
    const result = encodeToBase64(testString, 'text/plain');

    // Verify data URI format
    expect(result.dataURI).toMatch(/^data:text\/plain;base64,/);

    // Verify base64 string
    expect(result.base64).toBeTruthy();
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    expect(result.base64).toMatch(base64Pattern);

    // Verify decoding works
    const decoded = Buffer.from(result.base64, 'base64').toString('utf-8');
    expect(decoded).toBe(testString);
  });

  it('Base64 encoding with Buffer input', async () => {
    const { encodeToBase64 } = await import('../../../src/utils/image-encoder');

    const testBuffer = Buffer.from('Test Buffer Content');
    const result = encodeToBase64(testBuffer, 'application/octet-stream');

    expect(result.dataURI).toMatch(/^data:application\/octet-stream;base64,/);
    expect(result.base64).toBeTruthy();

    // Verify round-trip
    const decoded = Buffer.from(result.base64, 'base64');
    expect(decoded.equals(testBuffer)).toBe(true);
  });

  /**
   * T041: Unit test - SVG encoding from QR matrix
   *
   * Verifies that encodeSVGImage function:
   * - Accepts QR data string
   * - Accepts optional size, margin, and color parameters
   * - Returns SVG data URI string
   * - SVG contains valid XML structure
   */
  it('T041: SVG encoding from QR data', async () => {
    const { encodeSVGImage } = await import('../../../src/utils/image-encoder');

    const dataURI = await encodeSVGImage(testVietQRData);

    // Verify SVG data URI format
    expect(dataURI).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(dataURI.length).toBeGreaterThan(100);

    // Decode and verify SVG content
    const base64Part = dataURI.replace('data:image/svg+xml;base64,', '');
    const svgString = Buffer.from(base64Part, 'base64').toString('utf-8');

    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
    expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('SVG encoding with custom parameters', async () => {
    const { encodeSVGImage } = await import('../../../src/utils/image-encoder');

    const color: QRColorOptions = {
      dark: '#FF0000',
      light: '#00FF00',
    };

    const dataURI = await encodeSVGImage(testVietQRData, {
      size: 500,
      margin: 2,
      errorCorrectionLevel: 'Q',
      color,
    });

    expect(dataURI).toMatch(/^data:image\/svg\+xml;base64,/);

    // Decode and verify custom parameters are applied
    const base64Part = dataURI.replace('data:image/svg+xml;base64,', '');
    const svgString = Buffer.from(base64Part, 'base64').toString('utf-8');

    // SVG should contain valid structure
    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
  });
});
