/**
 * Unit tests for VietQR field length validators
 *
 * Tests field length constraints per NAPAS IBFT v1.5.2 specification.
 * These tests follow TDD - they will FAIL until validators are implemented.
 *
 * @module tests/unit/validators/length-validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateFieldLength,
  validateMaxLength,
  validateMinLength,
  validateExactLength
} from '../../../src/validators/length-validators';
import { FIELD_CONSTRAINTS } from '../../../src/types/decode';

describe('validateFieldLength', () => {
  describe('Bank code length validation', () => {
    it('should accept 6-digit BIN code', () => {
      const result = validateFieldLength('bankCode', '970422', {
        exact: [FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH, FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH]
      });
      expect(result).toBeNull();
    });

    it('should accept 8-character CITAD code', () => {
      const result = validateFieldLength('bankCode', 'VIETBANK', {
        exact: [FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH, FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH]
      });
      expect(result).toBeNull();
    });

    it('should reject 5-character bank code', () => {
      const result = validateFieldLength('bankCode', '97042', {
        exact: [FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH, FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH]
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 7-character bank code', () => {
      const result = validateFieldLength('bankCode', '9704222', {
        exact: [FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH, FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH]
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 9-character bank code', () => {
      const result = validateFieldLength('bankCode', 'VIETBANK1', {
        exact: [FIELD_CONSTRAINTS.BANK_CODE_BIN_LENGTH, FIELD_CONSTRAINTS.BANK_CODE_CITAD_LENGTH]
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('Account number length validation', () => {
    it('should accept 1-digit account number', () => {
      const result = validateFieldLength('accountNumber', '1', {
        min: 1,
        max: FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 19-digit account number (maximum)', () => {
      const result = validateFieldLength('accountNumber', '1234567890123456789', {
        min: 1,
        max: FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 10-digit account number', () => {
      const result = validateFieldLength('accountNumber', '0123456789', {
        min: 1,
        max: FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should reject empty account number', () => {
      const result = validateFieldLength('accountNumber', '', {
        min: 1,
        max: FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_TOO_SHORT');
    });

    it('should reject 20-digit account number', () => {
      const result = validateFieldLength('accountNumber', '12345678901234567890', {
        min: 1,
        max: FIELD_CONSTRAINTS.ACCOUNT_NUMBER_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('19');
    });
  });

  describe('Amount length validation', () => {
    it('should accept 1-character amount', () => {
      const result = validateFieldLength('amount', '1', {
        max: FIELD_CONSTRAINTS.AMOUNT_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 13-character amount (maximum)', () => {
      const result = validateFieldLength('amount', '9999999999.99', {
        max: FIELD_CONSTRAINTS.AMOUNT_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 10-character amount', () => {
      const result = validateFieldLength('amount', '123456.789', {
        max: FIELD_CONSTRAINTS.AMOUNT_MAX
      });
      expect(result).toBeNull();
    });

    it('should reject 14-character amount', () => {
      const result = validateFieldLength('amount', '99999999999.99', {
        max: FIELD_CONSTRAINTS.AMOUNT_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('13');
    });
  });

  describe('Message length validation', () => {
    it('should accept empty message', () => {
      const result = validateFieldLength('message', '', {
        max: FIELD_CONSTRAINTS.MESSAGE_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 500-character message (maximum)', () => {
      const result = validateFieldLength('message', 'A'.repeat(500), {
        max: FIELD_CONSTRAINTS.MESSAGE_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept short message', () => {
      const result = validateFieldLength('message', 'Payment for order 123', {
        max: FIELD_CONSTRAINTS.MESSAGE_MAX
      });
      expect(result).toBeNull();
    });

    it('should reject 501-character message', () => {
      const result = validateFieldLength('message', 'A'.repeat(501), {
        max: FIELD_CONSTRAINTS.MESSAGE_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('500');
    });

    it('should reject very long message (1000 characters)', () => {
      const result = validateFieldLength('message', 'A'.repeat(1000), {
        max: FIELD_CONSTRAINTS.MESSAGE_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
    });
  });

  describe('Currency length validation', () => {
    it('should accept 3-character currency code', () => {
      const result = validateFieldLength('currency', '704', {
        exact: FIELD_CONSTRAINTS.CURRENCY_LENGTH
      });
      expect(result).toBeNull();
    });

    it('should reject 2-character currency code', () => {
      const result = validateFieldLength('currency', '70', {
        exact: FIELD_CONSTRAINTS.CURRENCY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 4-character currency code', () => {
      const result = validateFieldLength('currency', '7040', {
        exact: FIELD_CONSTRAINTS.CURRENCY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty currency code', () => {
      const result = validateFieldLength('currency', '', {
        exact: FIELD_CONSTRAINTS.CURRENCY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('Country code length validation', () => {
    it('should accept 2-character country code', () => {
      const result = validateFieldLength('countryCode', 'VN', {
        exact: FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH
      });
      expect(result).toBeNull();
    });

    it('should reject 1-character country code', () => {
      const result = validateFieldLength('countryCode', 'V', {
        exact: FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 3-character country code', () => {
      const result = validateFieldLength('countryCode', 'VNM', {
        exact: FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty country code', () => {
      const result = validateFieldLength('countryCode', '', {
        exact: FIELD_CONSTRAINTS.COUNTRY_CODE_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('Purpose code length validation', () => {
    it('should accept empty purpose code', () => {
      const result = validateFieldLength('purposeCode', '', {
        max: FIELD_CONSTRAINTS.PURPOSE_CODE_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 25-character purpose code (maximum)', () => {
      const result = validateFieldLength('purposeCode', 'A'.repeat(25), {
        max: FIELD_CONSTRAINTS.PURPOSE_CODE_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept short purpose code', () => {
      const result = validateFieldLength('purposeCode', 'PAYBILL', {
        max: FIELD_CONSTRAINTS.PURPOSE_CODE_MAX
      });
      expect(result).toBeNull();
    });

    it('should reject 26-character purpose code', () => {
      const result = validateFieldLength('purposeCode', 'A'.repeat(26), {
        max: FIELD_CONSTRAINTS.PURPOSE_CODE_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('25');
    });
  });

  describe('Bill number length validation', () => {
    it('should accept empty bill number', () => {
      const result = validateFieldLength('billNumber', '', {
        max: FIELD_CONSTRAINTS.BILL_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept 25-character bill number (maximum)', () => {
      const result = validateFieldLength('billNumber', 'A'.repeat(25), {
        max: FIELD_CONSTRAINTS.BILL_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should accept short bill number', () => {
      const result = validateFieldLength('billNumber', 'INV-2024', {
        max: FIELD_CONSTRAINTS.BILL_NUMBER_MAX
      });
      expect(result).toBeNull();
    });

    it('should reject 26-character bill number', () => {
      const result = validateFieldLength('billNumber', 'A'.repeat(26), {
        max: FIELD_CONSTRAINTS.BILL_NUMBER_MAX
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('25');
    });
  });

  describe('Merchant category length validation', () => {
    it('should accept 4-character merchant category', () => {
      const result = validateFieldLength('merchantCategory', '5812', {
        exact: FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH
      });
      expect(result).toBeNull();
    });

    it('should reject 3-character merchant category', () => {
      const result = validateFieldLength('merchantCategory', '581', {
        exact: FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 5-character merchant category', () => {
      const result = validateFieldLength('merchantCategory', '58123', {
        exact: FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty merchant category', () => {
      const result = validateFieldLength('merchantCategory', '', {
        exact: FIELD_CONSTRAINTS.MERCHANT_CATEGORY_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('CRC length validation', () => {
    it('should accept 4-character CRC', () => {
      const result = validateFieldLength('crc', '45D3', {
        exact: FIELD_CONSTRAINTS.CRC_LENGTH
      });
      expect(result).toBeNull();
    });

    it('should reject 3-character CRC', () => {
      const result = validateFieldLength('crc', '45D', {
        exact: FIELD_CONSTRAINTS.CRC_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 5-character CRC', () => {
      const result = validateFieldLength('crc', '45D3A', {
        exact: FIELD_CONSTRAINTS.CRC_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty CRC', () => {
      const result = validateFieldLength('crc', '', {
        exact: FIELD_CONSTRAINTS.CRC_LENGTH
      });
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });
});

describe('validateMaxLength', () => {
  it('should accept value within max length', () => {
    const result = validateMaxLength('message', 'Hello', 100);
    expect(result).toBeNull();
  });

  it('should accept value at exact max length', () => {
    const result = validateMaxLength('message', 'Hello', 5);
    expect(result).toBeNull();
  });

  it('should reject value exceeding max length', () => {
    const result = validateMaxLength('message', 'Hello', 4);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('LENGTH_EXCEEDED');
    expect(result?.field).toBe('message');
    expect(result?.message).toContain('4');
  });

  it('should handle empty string correctly', () => {
    const result = validateMaxLength('message', '', 100);
    expect(result).toBeNull();
  });

  it('should handle zero max length', () => {
    const result = validateMaxLength('message', 'A', 0);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('LENGTH_EXCEEDED');
  });
});

describe('validateMinLength', () => {
  it('should accept value within min length', () => {
    const result = validateMinLength('accountNumber', '123456', 1);
    expect(result).toBeNull();
  });

  it('should accept value at exact min length', () => {
    const result = validateMinLength('accountNumber', '12345', 5);
    expect(result).toBeNull();
  });

  it('should reject value below min length', () => {
    const result = validateMinLength('accountNumber', '123', 5);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('LENGTH_TOO_SHORT');
    expect(result?.field).toBe('accountNumber');
    expect(result?.message).toContain('5');
  });

  it('should handle empty string correctly', () => {
    const result = validateMinLength('accountNumber', '', 1);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('LENGTH_TOO_SHORT');
  });

  it('should handle zero min length', () => {
    const result = validateMinLength('message', '', 0);
    expect(result).toBeNull();
  });
});

describe('validateExactLength', () => {
  it('should accept value with exact length', () => {
    const result = validateExactLength('currency', '704', 3);
    expect(result).toBeNull();
  });

  it('should reject value with shorter length', () => {
    const result = validateExactLength('currency', '70', 3);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_FORMAT');
    expect(result?.field).toBe('currency');
    expect(result?.message).toContain('3');
  });

  it('should reject value with longer length', () => {
    const result = validateExactLength('currency', '7040', 3);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_FORMAT');
    expect(result?.message).toContain('3');
  });

  it('should handle empty string', () => {
    const result = validateExactLength('countryCode', '', 2);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_FORMAT');
  });

  it('should accept empty string when exact length is zero', () => {
    const result = validateExactLength('field', '', 0);
    expect(result).toBeNull();
  });

  describe('Multiple exact lengths support', () => {
    it('should accept first valid exact length', () => {
      const result = validateExactLength('bankCode', '970422', [6, 8]);
      expect(result).toBeNull();
    });

    it('should accept second valid exact length', () => {
      const result = validateExactLength('bankCode', 'VIETBANK', [6, 8]);
      expect(result).toBeNull();
    });

    it('should reject length not in valid list', () => {
      const result = validateExactLength('bankCode', '97042', [6, 8]);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.message).toContain('6 or 8');
    });
  });
});

describe('Boundary value testing', () => {
  it('should handle maximum integer length', () => {
    const longValue = '9'.repeat(10000);
    const result = validateMaxLength('field', longValue, 9999);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('LENGTH_EXCEEDED');
  });

  it('should handle off-by-one at maximum boundary', () => {
    const result1 = validateMaxLength('message', 'A'.repeat(500), 500);
    const result2 = validateMaxLength('message', 'A'.repeat(501), 500);

    expect(result1).toBeNull();
    expect(result2).not.toBeNull();
  });

  it('should handle off-by-one at minimum boundary', () => {
    const result1 = validateMinLength('accountNumber', '1', 1);
    const result2 = validateMinLength('accountNumber', '', 1);

    expect(result1).toBeNull();
    expect(result2).not.toBeNull();
  });

  it('should handle off-by-one at exact boundary', () => {
    const result1 = validateExactLength('currency', '704', 3);
    const result2 = validateExactLength('currency', '70', 3);
    const result3 = validateExactLength('currency', '7040', 3);

    expect(result1).toBeNull();
    expect(result2).not.toBeNull();
    expect(result3).not.toBeNull();
  });
});
