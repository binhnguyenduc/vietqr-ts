/**
 * Unit tests for VietQR field validators
 *
 * Tests individual field validation functions against NAPAS IBFT v1.5.2 specification.
 * These tests follow TDD - they will FAIL until validators are implemented.
 *
 * @module tests/unit/validators/field-validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateBankCode,
  validateAccountNumber,
  validateAmount,
  validateCurrency,
  validateCountryCode,
  validateMessage,
  validatePurposeCode,
  validateBillNumber,
  validateMerchantCategory
} from '../../../src/validators/field-validators';
import type { ValidationError } from '../../../src/types/decode';

describe('validateBankCode', () => {
  describe('Valid bank codes', () => {
    it('should accept 6-digit BIN code', () => {
      const result = validateBankCode('970422');
      expect(result).toBeNull();
    });

    it('should accept 8-character CITAD code', () => {
      const result = validateBankCode('ABCD1234');
      expect(result).toBeNull();
    });

    it('should accept CITAD code with lowercase letters', () => {
      const result = validateBankCode('abcd1234');
      expect(result).toBeNull();
    });

    it('should accept CITAD code with mixed case', () => {
      const result = validateBankCode('VietBank');
      expect(result).toBeNull();
    });
  });

  describe('Invalid bank codes', () => {
    it('should reject empty bank code', () => {
      const result = validateBankCode('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('bankCode');
    });

    it('should reject undefined bank code', () => {
      const result = validateBankCode(undefined as any);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should reject bank code with 5 digits (too short)', () => {
      const result = validateBankCode('97042');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject bank code with 7 characters (invalid length)', () => {
      const result = validateBankCode('9704222');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject bank code with 9 characters (too long)', () => {
      const result = validateBankCode('970422123');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject 6-digit BIN with non-numeric characters', () => {
      const result = validateBankCode('97042A');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject bank code with special characters', () => {
      const result = validateBankCode('970-422');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject bank code with spaces', () => {
      const result = validateBankCode('970 422');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validateAccountNumber', () => {
  describe('Valid account numbers', () => {
    it('should accept numeric account number', () => {
      const result = validateAccountNumber('0123456789');
      expect(result).toBeNull();
    });

    it('should accept maximum length account number (19 digits)', () => {
      const result = validateAccountNumber('1234567890123456789');
      expect(result).toBeNull();
    });

    it('should accept single digit account number', () => {
      const result = validateAccountNumber('1');
      expect(result).toBeNull();
    });

    it('should accept account number with leading zeros', () => {
      const result = validateAccountNumber('0000123456');
      expect(result).toBeNull();
    });
  });

  describe('Invalid account numbers', () => {
    it('should reject empty account number', () => {
      const result = validateAccountNumber('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('accountNumber');
    });

    it('should reject undefined account number', () => {
      const result = validateAccountNumber(undefined as any);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should reject account number exceeding 19 digits', () => {
      const result = validateAccountNumber('12345678901234567890');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.message).toContain('19');
    });

    it('should reject account number with non-numeric characters', () => {
      const result = validateAccountNumber('123ABC456');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject account number with special characters', () => {
      const result = validateAccountNumber('123-456-789');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject account number with spaces', () => {
      const result = validateAccountNumber('123 456 789');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validateAmount', () => {
  describe('Valid amounts', () => {
    it('should accept integer amount', () => {
      const result = validateAmount('50000');
      expect(result).toBeNull();
    });

    it('should accept amount with decimal point', () => {
      const result = validateAmount('50000.50');
      expect(result).toBeNull();
    });

    it('should accept undefined amount (optional for static QR)', () => {
      const result = validateAmount(undefined);
      expect(result).toBeNull();
    });

    it('should accept maximum length amount (13 characters)', () => {
      const result = validateAmount('9999999999.99');
      expect(result).toBeNull();
    });

    it('should accept single digit amount', () => {
      const result = validateAmount('1');
      expect(result).toBeNull();
    });

    it('should accept amount with leading zeros', () => {
      const result = validateAmount('0001000');
      expect(result).toBeNull();
    });
  });

  describe('Invalid amounts', () => {
    it('should reject empty amount string', () => {
      const result = validateAmount('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('amount');
    });

    it('should reject zero amount', () => {
      const result = validateAmount('0');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_AMOUNT');
    });

    it('should reject negative amount', () => {
      const result = validateAmount('-1000');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_AMOUNT');
    });

    it('should reject amount exceeding 13 characters', () => {
      const result = validateAmount('99999999999.99');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
    });

    it('should reject amount with non-numeric characters', () => {
      const result = validateAmount('1000ABC');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject amount with multiple decimal points', () => {
      const result = validateAmount('1000.50.25');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject amount with currency symbols', () => {
      const result = validateAmount('$1000');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject amount with spaces', () => {
      const result = validateAmount('1 000');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject amount with commas', () => {
      const result = validateAmount('1,000');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validateCurrency', () => {
  describe('Valid currency', () => {
    it('should accept VND currency code (704)', () => {
      const result = validateCurrency('704');
      expect(result).toBeNull();
    });
  });

  describe('Invalid currency', () => {
    it('should reject empty currency', () => {
      const result = validateCurrency('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('currency');
    });

    it('should reject undefined currency', () => {
      const result = validateCurrency(undefined as any);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should reject USD currency code', () => {
      const result = validateCurrency('840');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CURRENCY');
      expect(result?.message).toContain('704');
    });

    it('should reject EUR currency code', () => {
      const result = validateCurrency('978');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CURRENCY');
    });

    it('should reject non-numeric currency code', () => {
      const result = validateCurrency('VND');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject currency code with wrong length', () => {
      const result = validateCurrency('70');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });
});

describe('validateCountryCode', () => {
  describe('Valid country code', () => {
    it('should accept VN country code', () => {
      const result = validateCountryCode('VN');
      expect(result).toBeNull();
    });
  });

  describe('Invalid country code', () => {
    it('should reject empty country code', () => {
      const result = validateCountryCode('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('countryCode');
    });

    it('should reject undefined country code', () => {
      const result = validateCountryCode(undefined as any);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should reject US country code', () => {
      const result = validateCountryCode('US');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_COUNTRY');
      expect(result?.message).toContain('VN');
    });

    it('should reject lowercase vn', () => {
      const result = validateCountryCode('vn');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_COUNTRY');
    });

    it('should reject country code with wrong length', () => {
      const result = validateCountryCode('VNM');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject numeric country code', () => {
      const result = validateCountryCode('12');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });
  });
});

describe('validateMessage', () => {
  describe('Valid messages', () => {
    it('should accept ASCII message', () => {
      const result = validateMessage('Payment for order 123');
      expect(result).toBeNull();
    });

    it('should accept UTF-8 Vietnamese message', () => {
      const result = validateMessage('Thanh toán hóa đơn');
      expect(result).toBeNull();
    });

    it('should accept undefined message (optional)', () => {
      const result = validateMessage(undefined);
      expect(result).toBeNull();
    });

    it('should accept empty message', () => {
      const result = validateMessage('');
      expect(result).toBeNull();
    });

    it('should accept maximum length message (500 characters)', () => {
      const result = validateMessage('A'.repeat(500));
      expect(result).toBeNull();
    });

    it('should accept message with special characters', () => {
      const result = validateMessage('Payment #123 - $50.00 (VAT 10%)');
      expect(result).toBeNull();
    });

    it('should accept message with emojis', () => {
      const result = validateMessage('Payment 💰 received');
      expect(result).toBeNull();
    });
  });

  describe('Invalid messages', () => {
    it('should reject message exceeding 500 characters', () => {
      const result = validateMessage('A'.repeat(501));
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.field).toBe('message');
      expect(result?.message).toContain('500');
    });

    it('should reject message with control characters (newline)', () => {
      const result = validateMessage('Line 1\nLine 2');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject message with control characters (tab)', () => {
      const result = validateMessage('Value\tSeparated');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject message with null character', () => {
      const result = validateMessage('Text\x00Null');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validatePurposeCode', () => {
  describe('Valid purpose codes', () => {
    it('should accept alphanumeric purpose code', () => {
      const result = validatePurposeCode('PAYBILL');
      expect(result).toBeNull();
    });

    it('should accept undefined purpose code (optional)', () => {
      const result = validatePurposeCode(undefined);
      expect(result).toBeNull();
    });

    it('should accept empty purpose code', () => {
      const result = validatePurposeCode('');
      expect(result).toBeNull();
    });

    it('should accept maximum length purpose code (25 characters)', () => {
      const result = validatePurposeCode('A'.repeat(25));
      expect(result).toBeNull();
    });

    it('should accept purpose code with numbers', () => {
      const result = validatePurposeCode('PAY123');
      expect(result).toBeNull();
    });
  });

  describe('Invalid purpose codes', () => {
    it('should reject purpose code exceeding 25 characters', () => {
      const result = validatePurposeCode('A'.repeat(26));
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.field).toBe('purposeCode');
      expect(result?.message).toContain('25');
    });

    it('should reject purpose code with special characters', () => {
      const result = validatePurposeCode('PAY-BILL');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject purpose code with spaces', () => {
      const result = validatePurposeCode('PAY BILL');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validateBillNumber', () => {
  describe('Valid bill numbers', () => {
    it('should accept alphanumeric bill number', () => {
      const result = validateBillNumber('INV-2024-001');
      expect(result).toBeNull();
    });

    it('should accept undefined bill number (optional)', () => {
      const result = validateBillNumber(undefined);
      expect(result).toBeNull();
    });

    it('should accept empty bill number', () => {
      const result = validateBillNumber('');
      expect(result).toBeNull();
    });

    it('should accept maximum length bill number (25 characters)', () => {
      const result = validateBillNumber('A'.repeat(25));
      expect(result).toBeNull();
    });

    it('should accept numeric bill number', () => {
      const result = validateBillNumber('123456789');
      expect(result).toBeNull();
    });
  });

  describe('Invalid bill numbers', () => {
    it('should reject bill number exceeding 25 characters', () => {
      const result = validateBillNumber('A'.repeat(26));
      expect(result).not.toBeNull();
      expect(result?.code).toBe('LENGTH_EXCEEDED');
      expect(result?.field).toBe('billNumber');
      expect(result?.message).toContain('25');
    });

    it('should reject bill number with special characters', () => {
      const result = validateBillNumber('INV#2024');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject bill number with spaces', () => {
      const result = validateBillNumber('INV 2024');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});

describe('validateMerchantCategory', () => {
  describe('Valid merchant categories', () => {
    it('should accept 4-digit merchant category', () => {
      const result = validateMerchantCategory('5812');
      expect(result).toBeNull();
    });

    it('should accept undefined merchant category (optional)', () => {
      const result = validateMerchantCategory(undefined);
      expect(result).toBeNull();
    });

    it('should accept merchant category with leading zeros', () => {
      const result = validateMerchantCategory('0123');
      expect(result).toBeNull();
    });
  });

  describe('Invalid merchant categories', () => {
    it('should reject empty merchant category', () => {
      const result = validateMerchantCategory('');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
      expect(result?.field).toBe('merchantCategory');
    });

    it('should reject merchant category with less than 4 digits', () => {
      const result = validateMerchantCategory('581');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject merchant category with more than 4 digits', () => {
      const result = validateMerchantCategory('58123');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject merchant category with non-numeric characters', () => {
      const result = validateMerchantCategory('58AB');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject merchant category with special characters', () => {
      const result = validateMerchantCategory('58-12');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });
});
