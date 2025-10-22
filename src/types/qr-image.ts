/**
 * QR Image Encoding Types
 *
 * Type definitions for QR code image generation feature.
 * Supports PNG and SVG output formats with configurable quality parameters.
 */

/**
 * Supported QR image output formats
 * - png: Raster image format, widely supported, larger file size
 * - svg: Vector image format, scalable, smaller file size
 */
export type QRImageFormat = 'png' | 'svg';

/**
 * QR code error correction levels (ISO/IEC 18004)
 * - L: Low - 7% error recovery
 * - M: Medium - 15% error recovery (default per constitution)
 * - Q: Quartile - 25% error recovery
 * - H: High - 30% error recovery
 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Color options for QR code rendering
 */
export interface QRColorOptions {
  /**
   * Foreground color (QR modules/dark areas)
   * @default '#000000' (black)
   * @example '#FF0000' (red)
   */
  dark: string;

  /**
   * Background color (light areas)
   * @default '#FFFFFF' (white)
   * @example '#F0F0F0' (light gray)
   */
  light: string;
}

/**
 * Configuration for QR image generation
 */
export interface QRImageConfig {
  /**
   * VietQR data string to encode (from generateVietQR)
   * @example '00020101021138570010A00000072701270006970436011234567890208QRIBFTTA53037045802VN62150811Purchase 15630481CB'
   */
  data: string;

  /**
   * Output image format
   * @default 'png'
   */
  format?: QRImageFormat;

  /**
   * Image width and height in pixels (square output)
   * @default 300
   * @minimum 50
   * @maximum 1000
   */
  size?: number;

  /**
   * Error correction level
   * @default 'M'
   */
  errorCorrectionLevel?: ErrorCorrectionLevel;

  /**
   * Quiet zone margin around QR code in modules
   * Minimum 4 modules per ISO/IEC 18004 recommendation
   * @default 4
   * @minimum 0
   */
  margin?: number;

  /**
   * Color options for QR code
   * @default { dark: '#000000', light: '#FFFFFF' }
   */
  color?: QRColorOptions;
}

/**
 * Result of QR image generation
 */
export interface QRImageResult {
  /**
   * Base64-encoded image string (without data URI prefix)
   * Can be used directly or wrapped in data URI format
   * @example 'iVBORw0KGgoAAAANSUhEUgAA...' (PNG)
   * @example 'PHN2ZyB4bWxucz0iaHR0cDov...' (SVG)
   */
  base64: string;

  /**
   * Complete data URI for direct embedding
   * @example 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
   * @example 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDov...'
   */
  dataURI: string;

  /**
   * Format of the generated image
   */
  format: QRImageFormat;

  /**
   * Size of the generated image in pixels
   */
  size: number;

  /**
   * Error correction level used
   */
  errorCorrectionLevel: ErrorCorrectionLevel;
}
