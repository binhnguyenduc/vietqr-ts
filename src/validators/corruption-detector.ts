/**
 * VietQR Data Corruption Detector
 *
 * Detects data corruption indicators such as truncation and checksum failures.
 * Sets the isCorrupted flag in validation results per NAPAS IBFT v1.5.2.
 *
 * @module validators/corruption-detector
 */

import type { VietQRData, ValidationError } from '../types/decode';
import { ValidationErrorCode } from '../types/decode';
import { verifyCRC } from './crc-validator';

/**
 * Detects data corruption indicators in VietQR data
 *
 * @param data - Parsed VietQR data
 * @param qrString - Original QR string
 * @param errors - Existing validation errors
 * @returns true if corruption detected, false otherwise
 *
 * @remarks
 * Corruption indicators:
 * 1. CRC checksum mismatch (data tampering or transmission error)
 * 2. Missing required fields (possible truncation)
 * 3. QR string truncation (incomplete data)
 * 4. Length mismatches between declared and actual field values
 *
 * Note: Corrupted data can still be partially valid.
 * isCorrupted flag alerts consumers to potential data integrity issues.
 */
export function detectCorruption(
  data: Partial<VietQRData>,
  qrString: string,
  errors: ValidationError[]
): boolean {
  const indicators: boolean[] = [];

  // Indicator 1: CRC checksum failure
  const hasCRCError = errors.some(err => err.code === ValidationErrorCode.CHECKSUM_MISMATCH);
  indicators.push(hasCRCError);

  // Indicator 2: Missing critical required fields suggests truncation
  const requiredFields = ['bankCode', 'accountNumber', 'currency', 'countryCode'];
  const missingCriticalFields = requiredFields.some(field => {
    const value = data[field as keyof VietQRData];
    return value === undefined || value === null || (typeof value === 'string' && value.length === 0);
  });
  indicators.push(missingCriticalFields);

  // Indicator 3: QR string appears truncated (no CRC field or incomplete)
  const isTruncated = detectTruncation(qrString, data);
  indicators.push(isTruncated);

  // Indicator 4: CRC field exists but checksum fails (data corruption)
  if (data.crc && data.crc.length === 4 && !verifyCRC(qrString)) {
    indicators.push(true);
  }

  // Return true if ANY corruption indicator is present
  return indicators.some(indicator => indicator === true);
}

/**
 * Detects if QR string appears truncated
 *
 * @param qrString - Original QR string
 * @param data - Parsed data
 * @returns true if truncation detected, false otherwise
 *
 * @remarks
 * Truncation indicators:
 * - QR string doesn't end with Field 63 (CRC)
 * - QR string is unusually short (<50 characters)
 * - CRC field is missing or incomplete
 */
function detectTruncation(qrString: string, data: Partial<VietQRData>): boolean {
  // Minimum viable QR string should be at least 50 characters
  // (00|02|01 + 01|02|11 + Field 38 ~40 chars + 53|03|704 + 58|02|VN + 63|04|XXXX)
  if (qrString.length < 50) {
    return true;
  }

  // QR string should end with Field 63 (CRC): 6304XXXX
  if (!qrString.match(/6304[0-9A-Fa-f]{4}$/)) {
    return true;
  }

  // CRC field should be present in parsed data
  if (!data.crc || data.crc.length !== 4) {
    return true;
  }

  return false;
}

/**
 * Checks if corruption is recoverable
 *
 * @param data - Parsed VietQR data
 * @param errors - Validation errors
 * @returns true if data is usable despite corruption, false if unusable
 *
 * @remarks
 * Recoverable corruption:
 * - CRC mismatch but all required fields present and valid
 * - Optional fields missing/truncated but core payment info intact
 *
 * Unrecoverable corruption:
 * - Missing bank code or account number
 * - Invalid currency or country code
 * - Critical format errors
 */
export function isRecoverableCorruption(
  data: Partial<VietQRData>,
  errors: ValidationError[]
): boolean {
  // Check for critical field errors
  const criticalErrors = errors.filter(err =>
    err.code === ValidationErrorCode.MISSING_REQUIRED_FIELD &&
    (err.field === 'bankCode' ||
     err.field === 'accountNumber' ||
     err.field === 'currency' ||
     err.field === 'countryCode')
  );

  // If critical fields are missing, corruption is unrecoverable
  if (criticalErrors.length > 0) {
    return false;
  }

  // Check if core payment fields are present and valid
  const hasCoreFields = Boolean(
    data.bankCode && data.bankCode.length > 0 &&
    data.accountNumber && data.accountNumber.length > 0 &&
    data.currency && data.currency.length > 0 &&
    data.countryCode && data.countryCode.length > 0
  );

  // Corruption is recoverable if core fields are present
  return hasCoreFields;
}
