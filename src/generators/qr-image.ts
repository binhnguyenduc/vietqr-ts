import { validateQRImageConfig } from '../validators/qr-image-config';
import { encodePNGImage, encodeSVGImage } from '../utils/image-encoder';
import { QRGenerationError } from '../types/errors';
import type { QRImageConfig, QRImageResult } from '../types/qr-image';

/**
 * Default configuration for QR image generation
 * Per constitution assumptions and data-model.md
 */
const DEFAULT_CONFIG = {
  format: 'png' as const,
  size: 300,
  errorCorrectionLevel: 'M' as const,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * Generates QR code image from VietQR data string
 *
 * Converts VietQR data strings into base64-encoded PNG or SVG images
 * suitable for web embedding, API responses, or further processing.
 *
 * @param config - QR image generation configuration
 * @returns QR image result with base64 string, data URI, and metadata
 * @throws {ValidationError} If configuration is invalid
 * @throws {QRGenerationError} If QR code generation fails
 * @throws {ImageEncodingError} If image encoding fails
 *
 * @example
 * ```typescript
 * // Generate PNG QR image
 * const result = await generateQRImage({
 *   data: vietQRData,
 *   format: 'png',
 *   size: 300
 * });
 *
 * // Use in HTML
 * <img src={result.dataURI} alt="Payment QR Code" />
 * ```
 */
export async function generateQRImage(config: QRImageConfig): Promise<QRImageResult> {
  // Step 1: Validate configuration (throws ValidationError if invalid)
  validateQRImageConfig(config);

  // Step 2: Apply defaults
  const finalConfig = {
    data: config.data,
    format: config.format ?? DEFAULT_CONFIG.format,
    size: config.size ?? DEFAULT_CONFIG.size,
    errorCorrectionLevel: config.errorCorrectionLevel ?? DEFAULT_CONFIG.errorCorrectionLevel,
    margin: config.margin ?? DEFAULT_CONFIG.margin,
    color: config.color ?? DEFAULT_CONFIG.color,
  };

  // Step 3: Generate QR image based on format
  let dataURI: string;

  try {
    if (finalConfig.format === 'svg') {
      // SVG path
      dataURI = await encodeSVGImage(finalConfig.data, {
        size: finalConfig.size,
        margin: finalConfig.margin,
        errorCorrectionLevel: finalConfig.errorCorrectionLevel,
        color: finalConfig.color,
      });
    } else {
      // PNG path (default)
      dataURI = await encodePNGImage(finalConfig.data, {
        size: finalConfig.size,
        margin: finalConfig.margin,
        errorCorrectionLevel: finalConfig.errorCorrectionLevel,
        color: finalConfig.color,
      });
    }
  } catch (error) {
    // Handle QR capacity errors (data too long for error correction level)
    if (error instanceof Error &&
        (error.message.includes('too much data') ||
         error.message.includes('too big to be stored'))) {
      throw new QRGenerationError(
        `Data too long for QR code capacity at error correction level ${finalConfig.errorCorrectionLevel}. Try using a lower error correction level (L or M) or reducing data size.`,
        error
      );
    }
    // Re-throw other errors as-is (ImageEncodingError, etc.)
    throw error;
  }

  // Step 4: Extract base64 from data URI
  const base64Prefix =
    finalConfig.format === 'svg' ? 'data:image/svg+xml;base64,' : 'data:image/png;base64,';
  const base64 = dataURI.replace(base64Prefix, '');

  // Step 5: Return result with metadata
  return {
    base64,
    dataURI,
    format: finalConfig.format,
    size: finalConfig.size,
    errorCorrectionLevel: finalConfig.errorCorrectionLevel,
  };
}
