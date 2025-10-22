import { validateVietQRConfig } from '../validators';
import { buildConsumerAccountInfo } from './consumer-account-info';
import { buildAdditionalData } from './additional-data';
import { encodeFieldWithDetails } from '../utils/encoding';
import { calculateCRC } from '../utils/crc';
import { DEFAULT_CURRENCY, DEFAULT_COUNTRY } from '../utils/constants';
import type { VietQRConfig } from '../types/config';
import type { VietQRData, QRField } from '../types/data';

/**
 * Generate VietQR data string for static or dynamic QR code
 *
 * Creates an EMVCo-compliant QR data string per NAPAS IBFT v1.5.2 specification.
 * The generated string is ready to be encoded into a QR code image.
 *
 * Supports both static and dynamic QR codes:
 * - Static QR: User enters amount manually (initiation method "11")
 * - Dynamic QR: Amount pre-filled (initiation method "12")
 *
 * Supports both account and card transfers:
 * - QRIBFTTA: Account transfer (requires accountNumber)
 * - QRIBFTTC: Card transfer (requires cardNumber)
 *
 * @param config - VietQR configuration
 * @param config.bankBin - 6-digit bank identification number
 * @param config.accountNumber - Account number for QRIBFTTA (max 19 characters, alphanumeric)
 * @param config.cardNumber - Card number for QRIBFTTC (max 19 characters, alphanumeric)
 * @param config.serviceCode - Service code (QRIBFTTA for account, QRIBFTTC for card)
 * @param config.amount - Transaction amount for dynamic QR (max 13 characters, numeric with optional decimal)
 * @param config.billNumber - Bill/invoice number (max 25 characters, alphanumeric)
 * @param config.purpose - Transaction purpose/description (max 25 characters)
 * @returns VietQR data with raw string, CRC, and field breakdown
 *
 * @throws {AggregateValidationError} If any parameter fails validation
 *
 * @example
 * ```typescript
 * // Generate static account QR
 * const accountResult = generateVietQR({
 *   bankBin: '970403',
 *   accountNumber: '01234567',
 *   serviceCode: 'QRIBFTTA'
 * });
 *
 * // Generate dynamic account QR with amount
 * const dynamicResult = generateVietQR({
 *   bankBin: '970403',
 *   accountNumber: '0011012345678',
 *   serviceCode: 'QRIBFTTA',
 *   amount: '180000',
 *   billNumber: 'NPS6869',
 *   purpose: 'thanh toan don hang'
 * });
 *
 * // Generate static card QR
 * const cardResult = generateVietQR({
 *   bankBin: '970403',
 *   cardNumber: '9704031101234567',
 *   serviceCode: 'QRIBFTTC'
 * });
 * ```
 */
export function generateVietQR(config: VietQRConfig): VietQRData {
  // Validate all input parameters (aggregate validation - collects all errors)
  validateVietQRConfig(config);

  // Determine if this is a dynamic QR (has amount)
  const isDynamic = config.amount !== undefined && config.amount.trim().length > 0;

  // Trim whitespace from inputs
  const bankBin = config.bankBin.trim();
  const accountOrCardNumber = (config.accountNumber || config.cardNumber || '').trim();
  const serviceCode = config.serviceCode;

  // Track all fields for debugging
  const fields: QRField[] = [];

  // Field 00: Payload Format Indicator (always "01")
  const field00 = encodeFieldWithDetails('00', '01');
  if (field00) fields.push(field00);

  // Field 01: Point of Initiation Method
  // "11" = Static QR (user enters amount)
  // "12" = Dynamic QR (amount pre-filled)
  const initiationMethod = isDynamic ? '12' : '11';
  const field01 = encodeFieldWithDetails('01', initiationMethod);
  if (field01) fields.push(field01);

  // Field 38: Consumer Account Information (NAPAS-specific)
  const consumerAccountField = buildConsumerAccountInfo(bankBin, accountOrCardNumber, serviceCode);
  const field38Value = consumerAccountField.substring(4); // Remove "38LL" prefix for value extraction
  const field38 = encodeFieldWithDetails('38', field38Value);
  if (field38) fields.push(field38);

  // Field 53: Transaction Currency (704 = VND)
  const field53 = encodeFieldWithDetails('53', DEFAULT_CURRENCY);
  if (field53) fields.push(field53);

  // Field 54: Transaction Amount (only for dynamic QR)
  let field54Encoded = '';
  if (isDynamic && config.amount) {
    const field54 = encodeFieldWithDetails('54', config.amount.trim());
    if (field54) {
      fields.push(field54);
      field54Encoded = field54.encoded;
    }
  }

  // Field 58: Country Code (VN = Vietnam)
  const field58 = encodeFieldWithDetails('58', DEFAULT_COUNTRY);
  if (field58) fields.push(field58);

  // Field 62: Additional Data (for dynamic QR with bill number or purpose)
  let field62Encoded = '';
  if (config.billNumber || config.purpose) {
    const additionalDataField = buildAdditionalData(config.billNumber, config.purpose);
    if (additionalDataField) {
      const field62Value = additionalDataField.substring(4); // Remove "62LL" prefix
      const field62 = encodeFieldWithDetails('62', field62Value);
      if (field62) {
        fields.push(field62);
        field62Encoded = additionalDataField;
      }
    }
  }

  // Build data string without CRC
  let dataWithoutCRC = field00?.encoded || '';
  dataWithoutCRC += field01?.encoded || '';
  dataWithoutCRC += consumerAccountField;
  dataWithoutCRC += field53?.encoded || '';
  dataWithoutCRC += field54Encoded; // Amount field (dynamic QR only)
  dataWithoutCRC += field58?.encoded || '';
  dataWithoutCRC += field62Encoded; // Additional data (if present)

  // Add CRC placeholder
  dataWithoutCRC += '6304'; // CRC field ID and length

  // Calculate CRC
  const crc = calculateCRC(dataWithoutCRC);

  // Add CRC field to fields list
  const field63 = encodeFieldWithDetails('63', crc);
  if (field63) fields.push(field63);

  // Complete QR data string
  const rawData = dataWithoutCRC + crc;

  return {
    rawData,
    crc,
    fields,
  };
}
