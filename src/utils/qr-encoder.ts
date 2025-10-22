import QRCode from 'qrcode';
import { QRGenerationError } from '../types/errors';
import type { ErrorCorrectionLevel } from '../types/qr-image';

/**
 * Generates QR code matrix from data string
 *
 * Wraps qrcode.create() to generate QR matrix with specified error correction level.
 * The matrix can be used for custom rendering or passed to image encoding functions.
 *
 * @param data - Data string to encode in QR code
 * @param errorCorrectionLevel - Error correction level (default: 'M')
 * @returns QR code data with matrix, version, and metadata
 * @throws {QRGenerationError} If QR code generation fails
 */
export async function generateQRMatrix(
  data: string,
  errorCorrectionLevel: ErrorCorrectionLevel = 'M'
): Promise<QRCode.QRCode> {
  try {
    const qrData = await QRCode.create(data, {
      errorCorrectionLevel,
      version: undefined, // auto-detect optimal version
      maskPattern: undefined, // auto-select optimal mask pattern
    });

    return qrData;
  } catch (error) {
    throw new QRGenerationError(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}
