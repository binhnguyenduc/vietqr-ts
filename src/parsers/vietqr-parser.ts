/**
 * VietQR field extractor
 *
 * Extracts VietQR payment fields from parsed TLV structure
 *
 * @module parsers/vietqr-parser
 */

import type { TLVField } from './tlv-parser';
import { parseTLV } from './tlv-parser';

/**
 * Partial VietQR data (fields may be missing)
 */
export interface PartialVietQRData {
  payloadFormatIndicator?: string;
  initiationMethod?: 'static' | 'dynamic';
  bankCode?: string;
  accountNumber?: string;
  amount?: string;
  currency?: string;
  message?: string;
  purposeCode?: string;
  billNumber?: string;
  merchantCategory?: string;
  countryCode?: string;
  crc?: string;
}

/**
 * Extract VietQR fields from parsed TLV fields
 *
 * @param fields - Array of TLV fields from parser
 * @returns Partial VietQR data object with extracted fields
 *
 * @remarks
 * Maps EMV QR field IDs to VietQR data structure:
 * - Field 00: Payload Format Indicator
 * - Field 01: Initiation Method (11=static, 12=dynamic)
 * - Field 38: Merchant Account Information (contains bank code, account number)
 * - Field 52: Merchant Category Code
 * - Field 53: Transaction Currency
 * - Field 54: Transaction Amount
 * - Field 58: Country Code
 * - Field 62: Additional Data (contains message, purpose code, bill number)
 * - Field 63: CRC
 */
export function extractVietQRFields(fields: TLVField[]): PartialVietQRData {
  const result: PartialVietQRData = {};

  for (const field of fields) {
    switch (field.id) {
      case '00':
        // Payload Format Indicator
        result.payloadFormatIndicator = field.value;
        break;

      case '01':
        // Point of Initiation Method
        if (field.value === '11') {
          result.initiationMethod = 'static';
        } else if (field.value === '12') {
          result.initiationMethod = 'dynamic';
        }
        break;

      case '38':
        // Merchant Account Information (nested TLV structure)
        extractMerchantAccount(field.value, result);
        break;

      case '52':
        // Merchant Category Code
        result.merchantCategory = field.value;
        break;

      case '53':
        // Transaction Currency
        result.currency = field.value;
        break;

      case '54':
        // Transaction Amount
        result.amount = field.value;
        break;

      case '58':
        // Country Code
        result.countryCode = field.value;
        break;

      case '62':
        // Additional Data Field Template (nested TLV)
        extractAdditionalData(field.value, result);
        break;

      case '63':
        // CRC
        result.crc = field.value;
        break;

      // Ignore unknown field IDs (forward compatibility)
    }
  }

  return result;
}

/**
 * Extract bank code and account number from merchant account field
 *
 * @param value - Merchant account field value (nested TLV)
 * @param result - Result object to populate
 *
 * @remarks
 * Merchant account field contains:
 * - Sub-field 00: Globally Unique Identifier (GUID)
 * - Sub-field 01: Payment network specific data
 *   - Sub-sub-field 00: Bank identifier (BIN or CITAD)
 *   - Sub-sub-field 01: Account/card number
 *   - Sub-sub-field 02: Service code (QRIBFTTA for VietQR)
 */
function extractMerchantAccount(value: string, result: PartialVietQRData): void {
  const merchantFields = parseTLV(value);

  if (!merchantFields.success) {
    return;
  }

  // Look for sub-field 01 (Payment network specific)
  const paymentNetworkField = merchantFields.fields.find(f => f.id === '01');
  if (!paymentNetworkField) {
    return;
  }

  // Parse nested structure
  const networkFields = parseTLV(paymentNetworkField.value);
  if (!networkFields.success) {
    return;
  }

  // Extract bank code (sub-field 00)
  const bankCodeField = networkFields.fields.find(f => f.id === '00');
  if (bankCodeField) {
    result.bankCode = bankCodeField.value;
  }

  // Extract account number (sub-field 01)
  const accountField = networkFields.fields.find(f => f.id === '01');
  if (accountField) {
    result.accountNumber = accountField.value;
  }
}

/**
 * Extract message, purpose code, and bill number from additional data field
 *
 * @param value - Additional data field value (nested TLV)
 * @param result - Result object to populate
 *
 * @remarks
 * Additional data field contains:
 * - Sub-field 08: Bill Number
 * - Sub-field 07: Purpose of Transaction
 * - Sub-field 09: Additional Consumer Data Request (bill reference)
 */
function extractAdditionalData(value: string, result: PartialVietQRData): void {
  const additionalFields = parseTLV(value);

  if (!additionalFields.success) {
    return;
  }

  for (const field of additionalFields.fields) {
    switch (field.id) {
      case '08':
        // Bill Number / Message
        result.message = field.value;
        break;

      case '07':
        // Purpose of Transaction
        result.purposeCode = field.value;
        break;

      case '09':
        // Additional Consumer Data Request (Bill Reference)
        result.billNumber = field.value;
        break;
    }
  }
}
