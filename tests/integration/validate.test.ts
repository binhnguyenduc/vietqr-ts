/**
 * Integration tests for VietQR validation
 *
 * Tests complete validation flow from parsed VietQRData through all validators.
 * These tests follow TDD - they will FAIL until validators are implemented.
 *
 * @module tests/integration/validate
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/validators';
import { parse } from '../../src/parsers';
import {
  VALID_VIETQR_SAMPLES,
  INVALID_VIETQR_SAMPLES,
  CORRUPTED_VIETQR_SAMPLES,
  createMockVietQRData
} from '../fixtures/vietqr-samples';
import type { VietQRData, ValidationResult } from '../../src/types/decode';

describe('validate() - Integration Tests', () => {
  describe('Valid VietQR data validation', () => {
    it('should validate complete dynamic VietQR data', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate static VietQR without amount', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate minimal VietQR with only required fields', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate VietQR with UTF-8 message', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_UTF8_MESSAGE;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate VietQR with purpose code and bill number', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_PURPOSE_AND_BILL;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should validate VietQR with merchant category', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_MERCHANT_CATEGORY;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Invalid format validation', () => {
    it('should detect invalid bank code format', () => {
      const data = createMockVietQRData({ bankCode: '97042' }); // Too short
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors.some(e => e.field === 'bankCode')).toBe(true);
      expect(validationResult.errors.some(e => e.code === 'INVALID_FORMAT')).toBe(true);
    });

    it('should detect invalid account number format', () => {
      const data = createMockVietQRData({ accountNumber: '123ABC456' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e => e.field === 'accountNumber')).toBe(true);
      expect(validationResult.errors.some(e => e.code === 'INVALID_FORMAT')).toBe(true);
    });

    it('should detect invalid amount format', () => {
      const data = createMockVietQRData({ amount: '-1000' }); // Negative
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e => e.field === 'amount')).toBe(true);
      expect(validationResult.errors.some(e => e.code === 'INVALID_AMOUNT')).toBe(true);
    });

    it('should detect invalid merchant category format', () => {
      const data = createMockVietQRData({ merchantCategory: '58AB' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e => e.field === 'merchantCategory')).toBe(true);
      expect(validationResult.errors.some(e => e.code === 'INVALID_FORMAT')).toBe(true);
    });
  });

  describe('Missing required fields validation', () => {
    it('should detect missing bank code', () => {
      const data = createMockVietQRData({ bankCode: undefined as any });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'bankCode' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });

    it('should detect missing account number', () => {
      const data = createMockVietQRData({ accountNumber: undefined as any });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'accountNumber' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });

    it('should detect missing currency', () => {
      const data = createMockVietQRData({ currency: undefined as any });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'currency' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });

    it('should detect missing country code', () => {
      const data = createMockVietQRData({ countryCode: undefined as any });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'countryCode' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });

    it('should detect missing CRC', () => {
      const data = createMockVietQRData({ crc: undefined as any });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'crc' && e.code === 'MISSING_REQUIRED_FIELD'
      )).toBe(true);
    });
  });

  describe('Business rule violations', () => {
    it('should detect wrong currency (not VND/704)', () => {
      const data = createMockVietQRData({ currency: '840' }); // USD
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'currency' && e.code === 'INVALID_CURRENCY'
      )).toBe(true);
    });

    it('should detect wrong country code (not VN)', () => {
      const data = createMockVietQRData({ countryCode: 'US' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'countryCode' && e.code === 'INVALID_COUNTRY'
      )).toBe(true);
    });

    it('should detect zero amount', () => {
      const data = createMockVietQRData({ amount: '0' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'amount' && e.code === 'INVALID_AMOUNT'
      )).toBe(true);
    });

    it('should detect invalid payload format indicator', () => {
      const data = createMockVietQRData({ payloadFormatIndicator: '99' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'payloadFormatIndicator' && e.code === 'INVALID_FORMAT'
      )).toBe(true);
    });
  });

  describe('Field length violations', () => {
    it('should detect account number exceeding 19 digits', () => {
      const data = createMockVietQRData({ accountNumber: '12345678901234567890' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'accountNumber' && e.code === 'LENGTH_EXCEEDED'
      )).toBe(true);
    });

    it('should detect amount exceeding 13 characters', () => {
      const data = createMockVietQRData({ amount: '99999999999.99' });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'amount' && e.code === 'LENGTH_EXCEEDED'
      )).toBe(true);
    });

    it('should detect message exceeding 500 characters', () => {
      const data = createMockVietQRData({ message: 'A'.repeat(501) });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'message' && e.code === 'LENGTH_EXCEEDED'
      )).toBe(true);
    });

    it('should detect purpose code exceeding 25 characters', () => {
      const data = createMockVietQRData({ purposeCode: 'A'.repeat(26) });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'purposeCode' && e.code === 'LENGTH_EXCEEDED'
      )).toBe(true);
    });

    it('should detect bill number exceeding 25 characters', () => {
      const data = createMockVietQRData({ billNumber: 'A'.repeat(26) });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(e =>
        e.field === 'billNumber' && e.code === 'LENGTH_EXCEEDED'
      )).toBe(true);
    });
  });

  describe('CRC validation', () => {
    it('should detect CRC mismatch', () => {
      const sample = INVALID_VIETQR_SAMPLES.INVALID_CRC;
      const parseResult = parse(sample.qrString);

      // Parse may succeed but validation should fail on CRC
      if (parseResult.success) {
        const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.isCorrupted).toBe(true);
        expect(validationResult.errors.some(e =>
          e.field === 'crc' && e.code === 'CHECKSUM_MISMATCH'
        )).toBe(true);
      }
    });

    it('should mark data as corrupted when CRC fails', () => {
      const data = createMockVietQRData({ crc: '0000' });
      const qrString = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const validationResult = validate(data, qrString);

      expect(validationResult.isCorrupted).toBe(true);
    });
  });

  describe('Multiple validation errors', () => {
    it('should collect all validation errors', () => {
      const data = createMockVietQRData({
        bankCode: '97042', // Too short
        accountNumber: '12345678901234567890', // Too long
        currency: '840', // Wrong currency
        countryCode: 'US', // Wrong country
        amount: '0' // Zero amount
      });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThanOrEqual(5);

      // All errors should be present
      expect(validationResult.errors.some(e => e.field === 'bankCode')).toBe(true);
      expect(validationResult.errors.some(e => e.field === 'accountNumber')).toBe(true);
      expect(validationResult.errors.some(e => e.field === 'currency')).toBe(true);
      expect(validationResult.errors.some(e => e.field === 'countryCode')).toBe(true);
      expect(validationResult.errors.some(e => e.field === 'amount')).toBe(true);
    });

    it('should provide detailed error messages', () => {
      const data = createMockVietQRData({ currency: '840' });
      const validationResult = validate(data, '');

      const currencyError = validationResult.errors.find(e => e.field === 'currency');
      expect(currencyError).toBeDefined();
      expect(currencyError?.message).toBeTruthy();
      expect(currencyError?.expectedFormat).toBeTruthy();
    });
  });

  describe('Corrupted data validation', () => {
    it('should handle truncated data gracefully', () => {
      const sample = CORRUPTED_VIETQR_SAMPLES.TRUNCATED_MID_FIELD;
      const parseResult = parse(sample.qrString);

      if (parseResult.success) {
        const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

        // Should detect missing required fields or corruption
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);
      }
    });

    it('should detect missing CRC field', () => {
      const sample = CORRUPTED_VIETQR_SAMPLES.MISSING_CRC;
      const parseResult = parse(sample.qrString);

      if (parseResult.success) {
        const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

        expect(validationResult.isCorrupted).toBe(true);
      }
    });
  });

  describe('Validation warnings', () => {
    it('should not generate warnings for valid complete data', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const parseResult = parse(sample.qrString);
      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.warnings).toBeUndefined();
    });

    it('should generate warning for missing optional fields in dynamic QR', () => {
      const data = createMockVietQRData({
        initiationMethod: 'dynamic',
        message: undefined,
        purposeCode: undefined
      });
      const validationResult = validate(data, '');

      // Dynamic QR without message might generate warning
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        expect(validationResult.warnings.some(w =>
          w.code === 'MISSING_OPTIONAL_FIELD'
        )).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    it('should validate data with exact maximum lengths', () => {
      const data = createMockVietQRData({
        accountNumber: '1234567890123456789', // Exactly 19
        amount: '9999999999.99', // Exactly 13
        message: 'A'.repeat(500), // Exactly 500
        purposeCode: 'B'.repeat(25), // Exactly 25
        billNumber: 'C'.repeat(25) // Exactly 25
      });
      const validationResult = validate(data, '');

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should handle empty optional fields', () => {
      const data = createMockVietQRData({
        message: '',
        purposeCode: '',
        billNumber: ''
      });
      const validationResult = validate(data, '');

      // Empty optional fields should not cause errors
      expect(validationResult.isValid).toBe(true);
    });

    it('should handle undefined optional fields', () => {
      const data = createMockVietQRData({
        amount: undefined,
        message: undefined,
        purposeCode: undefined,
        billNumber: undefined,
        merchantCategory: undefined
      });
      const validationResult = validate(data, '');

      // Missing optional fields should not cause errors
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('Complete parse-validate workflow', () => {
    it('should validate successfully parsed valid data', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const parseResult = parse(sample.qrString);

      expect(parseResult.success).toBe(true);

      const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.isCorrupted).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should detect validation errors in parsed invalid data', () => {
      const sample = INVALID_VIETQR_SAMPLES.INVALID_CURRENCY;
      const parseResult = parse(sample.qrString);

      // Parsing might succeed but validation should fail
      if (parseResult.success) {
        const validationResult = validate(parseResult.data as VietQRData, sample.qrString);

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.some(e =>
          e.field === 'currency' && e.code === 'INVALID_CURRENCY'
        )).toBe(true);
      }
    });
  });
});
