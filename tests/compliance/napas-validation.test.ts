/**
 * NAPAS IBFT v1.5.2 compliance validation tests
 *
 * Tests VietQR validation against official NAPAS specification requirements.
 * These tests follow TDD - they will FAIL until validators are implemented.
 *
 * @module tests/compliance/napas-validation
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/validators';
import { parse } from '../../src/parsers';
import {
  VALID_VIETQR_SAMPLES,
  createMockVietQRData
} from '../fixtures/vietqr-samples';
import type { VietQRData } from '../../src/types/decode';
import { FIELD_CONSTRAINTS, REQUIRED_VALUES } from '../../src/types/decode';

describe('NAPAS IBFT v1.5.2 Compliance', () => {
  describe('Field ID 00 - Payload Format Indicator', () => {
    it('should require value "01" per NAPAS spec', () => {
      const data = createMockVietQRData({ payloadFormatIndicator: '01' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-"01" payload format indicator', () => {
      const data = createMockVietQRData({ payloadFormatIndicator: '02' });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'payloadFormatIndicator' && e.code === 'INVALID_FORMAT'
      )).toBe(true);
    });

    it('should reject empty payload format indicator', () => {
      const data = createMockVietQRData({ payloadFormatIndicator: '' });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'payloadFormatIndicator')).toBe(true);
    });
  });

  describe('Field ID 01 - Initiation Method', () => {
    it('should accept "11" (static) per NAPAS spec', () => {
      const data = createMockVietQRData({
        initiationMethod: 'static',
        amount: undefined
      });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should accept "12" (dynamic) per NAPAS spec', () => {
      const data = createMockVietQRData({
        initiationMethod: 'dynamic',
        amount: '50000'
      });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should map static to "11" and dynamic to "12"', () => {
      // Verify the mapping is correct
      expect(REQUIRED_VALUES.INITIATION_STATIC).toBe('11');
      expect(REQUIRED_VALUES.INITIATION_DYNAMIC).toBe('12');
    });
  });

  describe('Field ID 38 - Bank Account Information', () => {
    describe('Sub-field 00 - Bank Code (BIN or CITAD)', () => {
      it('should accept 6-digit BIN code', () => {
        const data = createMockVietQRData({ bankCode: '970422' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should accept 8-character CITAD code', () => {
        const data = createMockVietQRData({ bankCode: 'VIETBANK' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should enforce exact length constraint (6 or 8)', () => {
        expect(FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH).toBe(6);
        expect(FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH).toBe(8);
      });

      it('should reject 7-character bank code', () => {
        const data = createMockVietQRData({ bankCode: 'VIETNAM' });
        const result = validate(data, '');
        expect(result.isValid).toBe(false);
      });

      it('should require bank code (mandatory field)', () => {
        const data = createMockVietQRData({ bankCode: undefined as any });
        const result = validate(data, '');

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e =>
          e.field === 'bankCode' && e.code === 'MISSING_REQUIRED_FIELD'
        )).toBe(true);
      });
    });

    describe('Sub-field 01 - Account Number', () => {
      it('should accept numeric account number', () => {
        const data = createMockVietQRData({ accountNumber: '0123456789' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should enforce maximum length of 19 digits', () => {
        expect(FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX).toBe(19);

        const data19 = createMockVietQRData({ accountNumber: '1234567890123456789' });
        const data20 = createMockVietQRData({ accountNumber: '12345678901234567890' });

        expect(validate(data19, '').isValid).toBe(true);
        expect(validate(data20, '').isValid).toBe(false);
      });

      it('should require account number (mandatory field)', () => {
        const data = createMockVietQRData({ accountNumber: undefined as any });
        const result = validate(data, '');

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e =>
          e.field === 'accountNumber' && e.code === 'MISSING_REQUIRED_FIELD'
        )).toBe(true);
      });

      it('should require numeric characters only', () => {
        const data = createMockVietQRData({ accountNumber: '123ABC456' });
        const result = validate(data, '');

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e =>
          e.field === 'accountNumber' && e.code === 'INVALID_FORMAT'
        )).toBe(true);
      });
    });
  });

  describe('Field ID 54 - Transaction Amount', () => {
    it('should accept valid numeric amount', () => {
      const data = createMockVietQRData({ amount: '50000' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should accept amount with decimal point', () => {
      const data = createMockVietQRData({ amount: '50000.50' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should enforce maximum length of 13 characters', () => {
      expect(FIELD_CONSTRAINTS.AMOUNT_MAX).toBe(13);

      const data13 = createMockVietQRData({ amount: '9999999999.99' });
      const data14 = createMockVietQRData({ amount: '99999999999.99' });

      expect(validate(data13, '').isValid).toBe(true);
      expect(validate(data14, '').isValid).toBe(false);
    });

    it('should allow undefined amount for static QR', () => {
      const data = createMockVietQRData({
        initiationMethod: 'static',
        amount: undefined
      });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should reject zero amount', () => {
      const data = createMockVietQRData({ amount: '0' });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'amount' && e.code === 'INVALID_AMOUNT'
      )).toBe(true);
    });

    it('should reject negative amount', () => {
      const data = createMockVietQRData({ amount: '-1000' });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'amount')).toBe(true);
    });
  });

  describe('Field ID 53 - Transaction Currency', () => {
    it('should require "704" (VND) per NAPAS spec', () => {
      expect(REQUIRED_VALUES.CURRENCY_VND).toBe('704');

      const data = createMockVietQRData({ currency: '704' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-VND currency codes', () => {
      const usd = createMockVietQRData({ currency: '840' }); // USD
      const eur = createMockVietQRData({ currency: '978' }); // EUR

      expect(validate(usd, '').isValid).toBe(false);
      expect(validate(eur, '').isValid).toBe(false);
    });

    it('should enforce exact length of 3 characters', () => {
      expect(FIELD_CONSTRAINTS.CURRENCY_LENGTH).toBe(3);

      const data2 = createMockVietQRData({ currency: '70' });
      const data4 = createMockVietQRData({ currency: '7040' });

      expect(validate(data2, '').isValid).toBe(false);
      expect(validate(data4, '').isValid).toBe(false);
    });

    it('should require currency (mandatory field)', () => {
      const data = createMockVietQRData({ currency: undefined as any });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'currency' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });
  });

  describe('Field ID 58 - Country Code', () => {
    it('should require "VN" per NAPAS spec', () => {
      expect(REQUIRED_VALUES.COUNTRY_CODE_VN).toBe('VN');

      const data = createMockVietQRData({ countryCode: 'VN' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-VN country codes', () => {
      const us = createMockVietQRData({ countryCode: 'US' });
      const cn = createMockVietQRData({ countryCode: 'CN' });

      expect(validate(us, '').isValid).toBe(false);
      expect(validate(cn, '').isValid).toBe(false);
    });

    it('should enforce exact length of 2 characters', () => {
      expect(FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH).toBe(2);

      const data1 = createMockVietQRData({ countryCode: 'V' });
      const data3 = createMockVietQRData({ countryCode: 'VNM' });

      expect(validate(data1, '').isValid).toBe(false);
      expect(validate(data3, '').isValid).toBe(false);
    });

    it('should require uppercase VN (not lowercase)', () => {
      const data = createMockVietQRData({ countryCode: 'vn' });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'countryCode' && e.code === 'INVALID_COUNTRY'
      )).toBe(true);
    });

    it('should require country code (mandatory field)', () => {
      const data = createMockVietQRData({ countryCode: undefined as any });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'countryCode' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });
  });

  describe('Field ID 62 - Additional Data', () => {
    describe('Sub-field 08 - Bill Number', () => {
      it('should accept alphanumeric bill number', () => {
        const data = createMockVietQRData({ billNumber: 'INV-2024-001' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should enforce maximum length of 25 characters', () => {
        expect(FIELD_CONSTRAINTS.BILL_NUMBER_MAX).toBe(25);

        const data25 = createMockVietQRData({ billNumber: 'A'.repeat(25) });
        const data26 = createMockVietQRData({ billNumber: 'A'.repeat(26) });

        expect(validate(data25, '').isValid).toBe(true);
        expect(validate(data26, '').isValid).toBe(false);
      });

      it('should be optional field', () => {
        const data = createMockVietQRData({ billNumber: undefined });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Sub-field 07 - Purpose Code', () => {
      it('should accept alphanumeric purpose code', () => {
        const data = createMockVietQRData({ purposeCode: 'PAYBILL' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should enforce maximum length of 25 characters', () => {
        expect(FIELD_CONSTRAINTS.PURPOSE_CODE_MAX).toBe(25);

        const data25 = createMockVietQRData({ purposeCode: 'A'.repeat(25) });
        const data26 = createMockVietQRData({ purposeCode: 'A'.repeat(26) });

        expect(validate(data25, '').isValid).toBe(true);
        expect(validate(data26, '').isValid).toBe(false);
      });

      it('should be optional field', () => {
        const data = createMockVietQRData({ purposeCode: undefined });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Sub-field 08 - Message/Description', () => {
      it('should accept UTF-8 message', () => {
        const data = createMockVietQRData({ message: 'Thanh toán hóa đơn' });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });

      it('should enforce maximum length of 500 characters', () => {
        expect(FIELD_CONSTRAINTS.MESSAGE_MAX).toBe(500);

        const data500 = createMockVietQRData({ message: 'A'.repeat(500) });
        const data501 = createMockVietQRData({ message: 'A'.repeat(501) });

        expect(validate(data500, '').isValid).toBe(true);
        expect(validate(data501, '').isValid).toBe(false);
      });

      it('should be optional field', () => {
        const data = createMockVietQRData({ message: undefined });
        const result = validate(data, '');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Field ID 52 - Merchant Category Code', () => {
    it('should accept 4-digit MCC', () => {
      const data = createMockVietQRData({ merchantCategory: '5812' });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });

    it('should enforce exact length of 4 digits', () => {
      expect(FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH).toBe(4);

      const data3 = createMockVietQRData({ merchantCategory: '581' });
      const data5 = createMockVietQRData({ merchantCategory: '58123' });

      expect(validate(data3, '').isValid).toBe(false);
      expect(validate(data5, '').isValid).toBe(false);
    });

    it('should be optional field', () => {
      const data = createMockVietQRData({ merchantCategory: undefined });
      const result = validate(data, '');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Field ID 63 - CRC Checksum', () => {
    it('should require 4-character hexadecimal CRC', () => {
      expect(FIELD_CONSTRAINTS.CRC_LENGTH).toBe(4);

      const data = createMockVietQRData({ crc: '45D3' });
      const result = validate(data, '');
      // Validation will check format and potentially checksum
      expect(result.errors.every(e => e.field !== 'crc' || e.code !== 'INVALID_FORMAT')).toBe(true);
    });

    it('should require CRC (mandatory field)', () => {
      const data = createMockVietQRData({ crc: undefined as any });
      const result = validate(data, '');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e =>
        e.field === 'crc' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });

    it('should validate CRC-16-CCITT checksum', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      // CRC should be valid
      expect(validationResult.errors.every(e => e.field !== 'crc')).toBe(true);
    });
  });

  describe('Complete NAPAS compliance validation', () => {
    it('should validate real NAPAS sample - dynamic with full fields', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate real NAPAS sample - static without amount', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate real NAPAS sample - with optional fields', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_WITH_OPTIONALS;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate real NAPAS sample - UTF-8 message', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_UTF8_MESSAGE;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Character-by-character NAPAS compliance', () => {
    it('should validate exact field structure from NAPAS samples', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const data = parseResult.data as VietQRData;

      // Verify exact NAPAS values
      expect(data.payloadFormatIndicator).toBe('01');
      expect(data.currency).toBe('704');
      expect(data.countryCode).toBe('VN');
      expect(data.bankCode).toMatch(/^\d{6}$|^[A-Za-z0-9]{8}$/);
      expect(data.accountNumber).toMatch(/^\d{1,19}$/);
    });

    it('should enforce NAPAS field constraints exactly', () => {
      // Verify all NAPAS constraints are defined
      expect(FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH).toBe(6);
      expect(FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH).toBe(8);
      expect(FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX).toBe(19);
      expect(FIELD_CONSTRAINTS.AMOUNT_MAX).toBe(13);
      expect(FIELD_CONSTRAINTS.CURRENCY_LENGTH).toBe(3);
      expect(FIELD_CONSTRAINTS.MESSAGE_MAX).toBe(500);
      expect(FIELD_CONSTRAINTS.PURPOSE_CODE_MAX).toBe(25);
      expect(FIELD_CONSTRAINTS.BILL_NUMBER_MAX).toBe(25);
      expect(FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH).toBe(2);
      expect(FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH).toBe(4);
      expect(FIELD_CONSTRAINTS.CRC_LENGTH).toBe(4);
    });

    it('should enforce NAPAS required values exactly', () => {
      // Verify all NAPAS required values are defined
      expect(REQUIRED_VALUES.CURRENCY_VND).toBe('704');
      expect(REQUIRED_VALUES.COUNTRY_CODE_VN).toBe('VN');
      expect(REQUIRED_VALUES.PAYLOAD_FORMAT_INDICATOR).toBe('01');
      expect(REQUIRED_VALUES.INITIATION_STATIC).toBe('11');
      expect(REQUIRED_VALUES.INITIATION_DYNAMIC).toBe('12');
    });
  });
});
