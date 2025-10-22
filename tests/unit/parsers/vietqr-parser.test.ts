/**
 * Unit tests for VietQR field extractor
 *
 * @module tests/unit/parsers/vietqr-parser
 */

import { describe, it, expect } from 'vitest';
import { extractVietQRFields } from '../../../src/parsers/vietqr-parser';
import type { TLVField } from '../../../src/parsers/tlv-parser';

describe('VietQR Field Extractor', () => {
  describe('extractVietQRFields - Required fields', () => {
    it('should extract bank code and account number from merchant field', () => {
      const fields: TLVField[] = [
        {
          id: '38',
          length: 57,
          value: '0010A00000072701390006970422011301234567890200208QRIBFTTA'
        }
      ];

      const result = extractVietQRFields(fields);

      expect(result.bankCode).toBe('970422');
      expect(result.accountNumber).toBe('0123456789020');
    });

    it('should extract currency code from field 53', () => {
      const fields: TLVField[] = [
        { id: '53', length: 3, value: '704' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.currency).toBe('704');
    });

    it('should extract country code from field 58', () => {
      const fields: TLVField[] = [
        { id: '58', length: 2, value: 'VN' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.countryCode).toBe('VN');
    });

    it('should extract CRC from field 63', () => {
      const fields: TLVField[] = [
        { id: '63', length: 4, value: '45D3' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.crc).toBe('45D3');
    });

    it('should extract payload format indicator from field 00', () => {
      const fields: TLVField[] = [
        { id: '00', length: 2, value: '01' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.payloadFormatIndicator).toBe('01');
    });

    it('should extract initiation method and map to static/dynamic', () => {
      const staticFields: TLVField[] = [
        { id: '01', length: 2, value: '11' }  // Static
      ];

      const dynamicFields: TLVField[] = [
        { id: '01', length: 2, value: '12' }  // Dynamic
      ];

      expect(extractVietQRFields(staticFields).initiationMethod).toBe('static');
      expect(extractVietQRFields(dynamicFields).initiationMethod).toBe('dynamic');
    });
  });

  describe('extractVietQRFields - Optional fields', () => {
    it('should extract amount from field 54 when present', () => {
      const fields: TLVField[] = [
        { id: '54', length: 5, value: '50000' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.amount).toBe('50000');
    });

    it('should leave amount undefined when field 54 absent', () => {
      const fields: TLVField[] = [];

      const result = extractVietQRFields(fields);

      expect(result.amount).toBeUndefined();
    });

    it('should extract merchant category from field 52 when present', () => {
      const fields: TLVField[] = [
        { id: '52', length: 4, value: '5812' }  // Restaurant
      ];

      const result = extractVietQRFields(fields);

      expect(result.merchantCategory).toBe('5812');
    });

    it('should extract message from additional data field 62', () => {
      const fields: TLVField[] = [
        { id: '62', length: 16, value: '0812Test Payment' }  // Sub-field 08, length 12
      ];

      const result = extractVietQRFields(fields);

      expect(result.message).toBe('Test Payment');
    });

    it('should extract purpose code from additional data field 62', () => {
      const fields: TLVField[] = [
        { id: '62', length: 9, value: '0706PAYBIL' }  // Sub-field 07, length 06
      ];

      const result = extractVietQRFields(fields);

      expect(result.purposeCode).toBe('PAYBIL');
    });

    it('should extract bill number from additional data field 62', () => {
      const fields: TLVField[] = [
        { id: '62', length: 12, value: '0908INV-2024' }  // Sub-field 09, length 08
      ];

      const result = extractVietQRFields(fields);

      expect(result.billNumber).toBe('INV-2024');
    });

    it('should extract multiple sub-fields from additional data field 62', () => {
      const fields: TLVField[] = [
        { id: '62', length: 38, value: '0812Test Payment0706PAYBIL0908INV-2024' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.message).toBe('Test Payment');
      expect(result.purposeCode).toBe('PAYBIL');
      expect(result.billNumber).toBe('INV-2024');
    });
  });

  describe('extractVietQRFields - Complete VietQR data', () => {
    it('should extract all fields from complete VietQR', () => {
      const fields: TLVField[] = [
        { id: '00', length: 2, value: '01' },
        { id: '01', length: 2, value: '12' },  // Dynamic
        { id: '38', length: 57, value: '0010A00000072701390006970422011301234567890200208QRIBFTTA' },
        { id: '52', length: 4, value: '5812' },
        { id: '53', length: 3, value: '704' },
        { id: '54', length: 5, value: '50000' },
        { id: '58', length: 2, value: 'VN' },
        { id: '62', length: 16, value: '0812Test Payment' },
        { id: '63', length: 4, value: '45D3' }
      ];

      const result = extractVietQRFields(fields);

      expect(result).toEqual({
        payloadFormatIndicator: '01',
        initiationMethod: 'dynamic',
        bankCode: '970422',
        accountNumber: '0123456789020',
        merchantCategory: '5812',
        currency: '704',
        amount: '50000',
        countryCode: 'VN',
        message: 'Test Payment',
        crc: '45D3'
      });
    });
  });

  describe('extractVietQRFields - Edge cases', () => {
    it('should handle empty fields array', () => {
      const fields: TLVField[] = [];

      const result = extractVietQRFields(fields);

      expect(result).toEqual({});
    });

    it('should handle UTF-8 characters in message', () => {
      const fields: TLVField[] = [
        { id: '62', length: 26, value: '0822Thanh toán hóa đơn' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.message).toBe('Thanh toán hóa đơn');
    });

    it('should handle numeric-only account numbers', () => {
      const fields: TLVField[] = [
        { id: '38', length: 63, value: '0010A00000072701450006970422011901234567890000000000208QRIBFTTA' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.accountNumber).toMatch(/^\d+$/);  // All digits
    });

    it('should ignore unknown field IDs', () => {
      const fields: TLVField[] = [
        { id: '00', length: 2, value: '01' },
        { id: '99', length: 5, value: 'XXXXX' },  // Unknown field
        { id: '53', length: 3, value: '704' }
      ];

      const result = extractVietQRFields(fields);

      expect(result.payloadFormatIndicator).toBe('01');
      expect(result.currency).toBe('704');
      expect(result).not.toHaveProperty('99');
    });
  });
});
