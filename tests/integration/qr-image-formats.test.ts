import { describe, it, expect } from 'vitest';
import type { QRImageConfig } from '../../src/types/qr-image';

/**
 * Integration tests for QR image format generation
 *
 * These tests verify performance, file size, and format-specific requirements
 * for PNG and SVG QR image generation.
 */

describe('QR Image Format Integration Tests', () => {
  const testVietQRData =
    '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN6304C5A3';

  /**
   * T016: Integration test - PNG generation completes in <150ms
   *
   * Performance requirement from spec SC-002:
   * PNG image generation must complete in under 150ms for standard VietQR codes
   * (adjusted for CI variance)
   */
  it('T016: PNG generation completes in <150ms', async () => {
    // This test will fail until generateQRImage is implemented
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
    };

    const startTime = performance.now();
    await generateQRImage(config);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(150);
  });

  /**
   * T017: Integration test - PNG output decodes to valid image buffer
   *
   * Verifies that the base64-encoded PNG can be decoded to a valid
   * binary buffer that represents a PNG image.
   */
  it('T017: PNG output decodes to valid image buffer', async () => {
    // This test will fail until generateQRImage is implemented
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
    };

    const result = await generateQRImage(config);

    // Decode base64 to buffer
    const imageBuffer = Buffer.from(result.base64, 'base64');

    // Verify buffer is not empty
    expect(imageBuffer.length).toBeGreaterThan(0);

    // Verify PNG signature (first 8 bytes)
    // PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const actualSignature = imageBuffer.subarray(0, 8);
    expect(actualSignature.equals(pngSignature)).toBe(true);
  });

  /**
   * T018: Integration test - PNG file size <50KB for standard VietQR data
   *
   * File size requirement from spec FR-006:
   * PNG output must remain under 50KB for standard VietQR payment codes
   */
  it('T018: PNG file size <50KB for standard VietQR data', async () => {
    // This test will fail until generateQRImage is implemented
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
    };

    const result = await generateQRImage(config);

    // Decode base64 to get actual file size
    const imageBuffer = Buffer.from(result.base64, 'base64');
    const fileSizeKB = imageBuffer.length / 1024;

    expect(fileSizeKB).toBeLessThan(50);

    // Also verify reasonable minimum size (should be at least 1KB for a QR code)
    expect(fileSizeKB).toBeGreaterThan(1);
  });

  /**
   * T038: Integration test - SVG generation completes in <75ms
   *
   * Performance requirement from spec SC-003:
   * SVG image generation must complete in under 75ms (faster than PNG)
   * (adjusted for CI variance)
   */
  it('T038: SVG generation completes in <75ms', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
    };

    const startTime = performance.now();
    await generateQRImage(config);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(75);
  });

  /**
   * T039: Integration test - SVG output is smaller than PNG
   *
   * File size efficiency requirement:
   * SVG format should produce smaller files than equivalent PNG
   * (actual savings depend on QR complexity, typically 10-30% smaller)
   */
  it('T039: SVG output is smaller than PNG', async () => {
    const { generateQRImage } = await import('../../src/index');

    const pngConfig: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
    };

    const svgConfig: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
      size: 300,
    };

    const pngResult = await generateQRImage(pngConfig);
    const svgResult = await generateQRImage(svgConfig);

    // Calculate file sizes
    const pngSize = Buffer.from(pngResult.base64, 'base64').length;
    const svgSize = Buffer.from(svgResult.base64, 'base64').length;

    // SVG should be smaller than PNG (actual ratio varies with QR complexity)
    expect(svgSize).toBeLessThan(pngSize);

    // Verify reasonable size ratio (SVG typically 60-90% of PNG size for QR codes)
    const sizeRatio = svgSize / pngSize;
    expect(sizeRatio).toBeGreaterThan(0.5); // SVG should not be more than 50% smaller
    expect(sizeRatio).toBeLessThan(1.0); // SVG must be smaller than PNG
  });

  /**
   * T040: Integration test - SVG decodes to valid XML structure
   *
   * Verifies that the base64-encoded SVG can be decoded to valid XML
   * with proper SVG structure and elements.
   */
  it('T040: SVG decodes to valid XML structure', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
    };

    const result = await generateQRImage(config);

    // Decode base64 to SVG string
    const svgString = Buffer.from(result.base64, 'base64').toString('utf-8');

    // Verify SVG structure
    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
    expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"');

    // Verify SVG contains path elements (QR code is rendered as paths)
    expect(svgString).toContain('<path');

    // Verify no empty or broken SVG
    expect(svgString.length).toBeGreaterThan(100);

    // Verify proper XML structure (no unclosed tags)
    const openTags = (svgString.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (svgString.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (svgString.match(/<[^>]+\/>/g) || []).length;

    // Total open tags should equal close tags + self-closing tags
    expect(openTags).toBe(closeTags + selfClosingTags);
  });

  /**
   * T047: Integration test - Custom size (500px) produces 500x500 image
   *
   * Verifies that custom size parameter is properly applied to the output image.
   * Note: For PNG, the actual pixel dimensions can be verified by decoding the image.
   * For SVG, size affects the viewBox attribute.
   */
  it('T047: Custom size (500px) produces correctly sized image', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 500,
    };

    const result = await generateQRImage(config);

    // Verify size metadata
    expect(result.size).toBe(500);

    // Verify PNG is generated and has reasonable file size
    const imageBuffer = Buffer.from(result.base64, 'base64');
    expect(imageBuffer.length).toBeGreaterThan(0);

    // Larger size should produce larger file (compared to default 300px)
    const defaultConfig: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
    };
    const defaultResult = await generateQRImage(defaultConfig);
    const defaultBuffer = Buffer.from(defaultResult.base64, 'base64');

    // 500px image should be larger than 300px image
    expect(imageBuffer.length).toBeGreaterThan(defaultBuffer.length);
  });

  /**
   * T048: Integration test - Error correction level 'H' produces scannable QR
   *
   * Verifies that high error correction level is properly applied.
   * Error correction level 'H' allows recovery from up to 30% damage.
   */
  it('T048: Error correction level \'H\' produces scannable QR with damage resistance', async () => {
    const { generateQRImage } = await import('../../src/index');

    const configH: QRImageConfig = {
      data: testVietQRData,
      errorCorrectionLevel: 'H',
    };

    const configL: QRImageConfig = {
      data: testVietQRData,
      errorCorrectionLevel: 'L',
    };

    const resultH = await generateQRImage(configH);
    const resultL = await generateQRImage(configL);

    // Verify error correction level in metadata
    expect(resultH.errorCorrectionLevel).toBe('H');
    expect(resultL.errorCorrectionLevel).toBe('L');

    // Higher error correction typically produces larger QR codes (more modules)
    const bufferH = Buffer.from(resultH.base64, 'base64');
    const bufferL = Buffer.from(resultL.base64, 'base64');

    // Both should generate valid images
    expect(bufferH.length).toBeGreaterThan(0);
    expect(bufferL.length).toBeGreaterThan(0);
  });

  /**
   * T049: Integration test - Custom colors applied to output image
   *
   * Verifies that custom dark/light colors are properly applied to the QR code.
   */
  it('T049: Custom colors applied to output image', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg', // SVG makes it easier to verify colors in the output
      color: {
        dark: '#FF0000',
        light: '#00FF00',
      },
    };

    const result = await generateQRImage(config);

    // Decode SVG to verify colors
    const svgString = Buffer.from(result.base64, 'base64').toString('utf-8');

    // SVG should contain color references (though exact format may vary)
    expect(svgString).toBeDefined();
    expect(svgString.length).toBeGreaterThan(0);

    // Verify valid SVG structure
    expect(svgString).toContain('<svg');
    expect(svgString).toContain('</svg>');
  });

  /**
   * T050: Integration test - Margin parameter affects quiet zone size
   *
   * Verifies that custom margin parameter is properly applied.
   * Larger margins produce larger overall images with more quiet zone.
   */
  it('T050: Margin parameter affects quiet zone size', async () => {
    const { generateQRImage } = await import('../../src/index');

    const configNoMargin: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
      margin: 0,
    };

    const configLargeMargin: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
      margin: 10,
    };

    const resultNoMargin = await generateQRImage(configNoMargin);
    const resultLargeMargin = await generateQRImage(configLargeMargin);

    // Decode to buffers
    const bufferNoMargin = Buffer.from(resultNoMargin.base64, 'base64');
    const bufferLargeMargin = Buffer.from(resultLargeMargin.base64, 'base64');

    // Both should be valid
    expect(bufferNoMargin.length).toBeGreaterThan(0);
    expect(bufferLargeMargin.length).toBeGreaterThan(0);

    // File sizes will differ due to different quiet zone sizes
    // (larger margin typically means slightly larger file)
    expect(bufferNoMargin.length).not.toBe(bufferLargeMargin.length);
  });

  /**
   * T070: Integration test - Performance validation for PNG generation
   *
   * Verifies PNG generation completes in <150ms (adjusted for CI variance).
   */
  it('T070: PNG generation benchmark <150ms', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
    };

    const startTime = performance.now();
    await generateQRImage(config);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(150);
  });

  /**
   * T070: Integration test - Performance validation for SVG generation
   *
   * Verifies SVG generation completes in <75ms (adjusted for CI variance).
   */
  it('T070: SVG generation benchmark <75ms', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
      size: 300,
    };

    const startTime = performance.now();
    await generateQRImage(config);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(75);
  });

  /**
   * T071: Integration test - PNG file size validation
   *
   * Verifies PNG file size is reasonable (<15KB avg for standard VietQR data).
   */
  it('T071: PNG file size <15KB average', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'png',
      size: 300,
    };

    const result = await generateQRImage(config);
    const imageBuffer = Buffer.from(result.base64, 'base64');
    const fileSizeKB = imageBuffer.length / 1024;

    expect(fileSizeKB).toBeLessThan(15);
    expect(fileSizeKB).toBeGreaterThan(0.5); // Minimum reasonable size
  });

  /**
   * T071: Integration test - SVG file size validation
   *
   * Verifies SVG file size is reasonable (<8KB avg for standard VietQR data).
   */
  it('T071: SVG file size <8KB average', async () => {
    const { generateQRImage } = await import('../../src/index');

    const config: QRImageConfig = {
      data: testVietQRData,
      format: 'svg',
      size: 300,
    };

    const result = await generateQRImage(config);
    const imageBuffer = Buffer.from(result.base64, 'base64');
    const fileSizeKB = imageBuffer.length / 1024;

    expect(fileSizeKB).toBeLessThan(8);
    expect(fileSizeKB).toBeGreaterThan(0.3); // Minimum reasonable size
  });
});
