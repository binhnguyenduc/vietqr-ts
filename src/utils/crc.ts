import { crc16ccitt } from 'crc';

/**
 * Calculate CRC-16-CCITT checksum for data string
 *
 * Per EMVCo specification, the CRC is calculated over the entire data string
 * including the CRC field ID "63" and length "04" but with CRC value as empty.
 * The data parameter should already include "6304" at the end.
 *
 * @param data - Data string ending with "6304" placeholder
 * @returns 4-character uppercase hexadecimal CRC
 *
 * @example
 * ```typescript
 * const dataWithPlaceholder = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304';
 * const crc = calculateCRC(dataWithPlaceholder);
 * console.log(crc); // "F4E5"
 * // Complete QR data: dataWithPlaceholder + crc
 * ```
 *
 * @remarks
 * Uses CRC-16-CCITT algorithm (ISO/IEC 13239, polynomial 0x1021, initial 0xFFFF).
 * Implementation uses the 'crc' npm package's crc16ccitt function which matches
 * the NAPAS specification requirements for VietQR payment QR codes.
 */
export function calculateCRC(data: string): string {
  const crcValue = crc16ccitt(data);
  return crcValue.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Verify CRC-16-CCITT checksum of VietQR string
 *
 * @param qrString - Complete EMV QR formatted VietQR string (must include CRC field)
 * @returns true if CRC is valid, false otherwise
 *
 * @example
 * ```typescript
 * const validQR = '00020101...6304F4E5';
 * const isValid = verifyCRC(validQR); // true
 *
 * const invalidQR = '00020101...63040000';
 * const isInvalid = verifyCRC(invalidQR); // false
 * ```
 *
 * @remarks
 * Uses CRC-16-CCITT algorithm (polynomial 0x1021) per EMVCo spec.
 * Compares calculated CRC with CRC field in QR string.
 */
export function verifyCRC(qrString: string): boolean {
  // Extract CRC from end of string (last 4 characters)
  if (qrString.length < 4) {
    return false;
  }

  const providedCRC = qrString.slice(-4);

  // Calculate CRC on string without the CRC value (but with field ID "6304")
  const dataWithoutCRC = qrString.slice(0, -4);
  const calculatedCRC = calculateCRC(dataWithoutCRC);

  return providedCRC.toUpperCase() === calculatedCRC;
}
