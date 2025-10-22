import QRCode from 'qrcode';
import { ImageEncodingError } from '../types/errors';
import type { ErrorCorrectionLevel, QRColorOptions } from '../types/qr-image';

/**
 * Options for PNG/SVG encoding
 */
export interface ImageEncodingOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  color?: QRColorOptions;
}

/**
 * Result of base64 encoding with data URI
 */
export interface Base64Result {
  /**
   * Base64-encoded string (without data URI prefix)
   */
  base64: string;

  /**
   * Complete data URI for direct embedding
   */
  dataURI: string;
}

/**
 * Encodes QR data as PNG image with base64 data URI
 *
 * Wraps qrcode.toDataURL() to generate PNG images with configurable parameters.
 *
 * @param data - QR data string to encode
 * @param options - Encoding options (size, margin, errorCorrectionLevel, color)
 * @returns PNG data URI string
 * @throws {ImageEncodingError} If PNG encoding fails
 */
export async function encodePNGImage(
  data: string,
  options: ImageEncodingOptions = {}
): Promise<string> {
  try {
    const dataURI = await QRCode.toDataURL(data, {
      type: 'image/png',
      width: options.size,
      margin: options.margin,
      errorCorrectionLevel: options.errorCorrectionLevel,
      color: options.color
        ? {
            dark: options.color.dark,
            light: options.color.light,
          }
        : undefined,
    });

    return dataURI;
  } catch (error) {
    throw new ImageEncodingError(
      `Failed to encode PNG image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Encodes QR data as SVG image with base64 data URI
 *
 * Wraps qrcode.toString() to generate SVG images with configurable parameters.
 *
 * @param data - QR data string to encode
 * @param options - Encoding options (size, margin, errorCorrectionLevel, color)
 * @returns SVG data URI string
 * @throws {ImageEncodingError} If SVG encoding fails
 */
export async function encodeSVGImage(
  data: string,
  options: ImageEncodingOptions = {}
): Promise<string> {
  try {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: options.size,
      margin: options.margin,
      errorCorrectionLevel: options.errorCorrectionLevel,
      color: options.color
        ? {
            dark: options.color.dark,
            light: options.color.light,
          }
        : undefined,
    });

    // Convert SVG string to base64 data URI
    const base64SVG = Buffer.from(svgString).toString('base64');
    const dataURI = `data:image/svg+xml;base64,${base64SVG}`;

    return dataURI;
  } catch (error) {
    throw new ImageEncodingError(
      `Failed to encode SVG image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Encodes string or buffer to base64 with data URI
 *
 * Utility function for base64 encoding with automatic data URI generation.
 *
 * @param input - String or Buffer to encode
 * @param mimeType - MIME type for data URI (e.g., 'text/plain', 'image/png')
 * @returns Base64 string and data URI
 */
export function encodeToBase64(input: string | Buffer, mimeType: string): Base64Result {
  const base64 = Buffer.from(input).toString('base64');
  const dataURI = `data:${mimeType};base64,${base64}`;

  return {
    base64,
    dataURI,
  };
}
