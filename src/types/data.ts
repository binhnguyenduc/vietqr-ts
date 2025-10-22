import type { ValidationError } from './errors';

/**
 * Individual EMVCo QR code field
 */
export interface QRField {
  /**
   * 2-digit field identifier
   * @example "00"
   */
  id: string;

  /**
   * 2-digit length of value
   * @example "02"
   */
  length: string;

  /**
   * Field value (variable length)
   * @example "01"
   */
  value: string;

  /**
   * Complete encoded field (id + length + value)
   * @example "000201"
   */
  encoded: string;
}

/**
 * Generated VietQR data
 */
export interface VietQRData {
  /**
   * Complete EMVCo-compliant QR data string with CRC
   * Ready for QR code encoding
   * @example "00020101021138570010A00000072701270006970403011301234567020869QRIBFTTA53037045802VN630424F5"
   */
  rawData: string;

  /**
   * CRC-16-CCITT checksum (4 uppercase hexadecimal characters)
   * @example "24F5"
   */
  crc: string;

  /**
   * Parsed field breakdown for debugging
   */
  fields: QRField[];
}

/**
 * Aggregate validation result
 */
export interface ValidationResult {
  /**
   * Whether all validation checks passed
   */
  valid: boolean;

  /**
   * List of validation errors (empty if valid)
   */
  errors: ValidationError[];
}
