import { describe, it, expect } from 'vitest';
import { validateBillNumber, validatePurpose } from '../../../src/validators/additional-data';
import { ValidationError } from '../../../src/types/errors';

describe('validateBillNumber', () => {
  describe('Valid Bill Numbers', () => {
    it('should accept alphanumeric bill numbers', () => {
      expect(() => validateBillNumber('NPS6869')).not.toThrow();
      expect(() => validateBillNumber('INV123')).not.toThrow();
      expect(() => validateBillNumber('BILL001')).not.toThrow();
    });

    it('should accept bill numbers up to 25 characters', () => {
      expect(() => validateBillNumber('A'.repeat(25))).not.toThrow(); // 25 chars (max)
      expect(() => validateBillNumber('A'.repeat(24))).not.toThrow(); // 24 chars
      expect(() => validateBillNumber('1'.repeat(25))).not.toThrow(); // 25 digits
    });

    it('should accept single character bill number', () => {
      expect(() => validateBillNumber('A')).not.toThrow();
      expect(() => validateBillNumber('1')).not.toThrow();
    });

    it('should accept mixed alphanumeric bill numbers', () => {
      expect(() => validateBillNumber('ABC123XYZ')).not.toThrow();
      expect(() => validateBillNumber('ORDER2024001')).not.toThrow();
    });
  });

  describe('Invalid Bill Numbers', () => {
    it('should reject empty bill number with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateBillNumber('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('billNumber');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validateBillNumber(null as any)).toThrow('Bill number must be a string');
      expect(() => validateBillNumber(undefined as any)).toThrow(
        'Bill number must be a string'
      );
    });

    it('should reject bill number exceeding 25 characters with BILL_NUMBER_TOO_LONG code', () => {
      try {
        validateBillNumber('A'.repeat(26)); // 26 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('BILL_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 25 characters');
        expect((error as ValidationError).field).toBe('billNumber');
      }

      try {
        validateBillNumber('1234567890123456789012345678'); // 28 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('BILL_NUMBER_TOO_LONG');
      }
    });

    it('should accept bill numbers with hyphens and underscores (common formats)', () => {
      // Updated to match real-world bill number formats that often include hyphens and underscores
      expect(() => validateBillNumber('NPS-6869')).not.toThrow(); // Hyphen - common in real bill numbers
      expect(() => validateBillNumber('INV_123')).not.toThrow(); // Underscore - allowed format
      expect(() => validateBillNumber('ORDER-2024-001')).not.toThrow(); // Multiple hyphens
    });

    it('should reject bill numbers with invalid special characters with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('INV@123'); // At symbol - not allowed
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric, hyphen, underscore allowed');
      }

      try {
        validateBillNumber('BILL 001'); // Space - not allowed
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });

    it('should reject bill numbers with Unicode characters with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('NPS€6869'); // Euro symbol
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }

      try {
        validateBillNumber('送り状番号'); // Japanese characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateBillNumber(123456 as any)).toThrow('Bill number must be a string');
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateBillNumber('  NPS6869  ')).not.toThrow();
      expect(() => validateBillNumber('\nINV123\n')).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 25 characters', () => {
      const billNumber = 'A'.repeat(25);
      expect(() => validateBillNumber(billNumber)).not.toThrow();
    });

    it('should reject 26 characters', () => {
      const billNumber = 'A'.repeat(26);
      expect(() => validateBillNumber(billNumber)).toThrow(/25.*character/i);
    });
  });
});

describe('validatePurpose', () => {
  describe('Valid Purposes', () => {
    it('should accept text purposes', () => {
      expect(() => validatePurpose('thanh toan don hang')).not.toThrow();
      expect(() => validatePurpose('payment for order')).not.toThrow();
      expect(() => validatePurpose('test payment')).not.toThrow();
    });

    it('should accept purposes up to 25 characters', () => {
      expect(() => validatePurpose('A'.repeat(25))).not.toThrow(); // 25 chars (max)
      expect(() => validatePurpose('A'.repeat(24))).not.toThrow(); // 24 chars
    });

    it('should accept single character purpose', () => {
      expect(() => validatePurpose('A')).not.toThrow();
      expect(() => validatePurpose('1')).not.toThrow();
    });

    it('should accept alphanumeric and spaces', () => {
      expect(() => validatePurpose('Order 123')).not.toThrow();
      expect(() => validatePurpose('Pay for item ABC')).not.toThrow();
    });
  });

  describe('Invalid Purposes', () => {
    it('should reject empty purpose with MISSING_REQUIRED_FIELD code', () => {
      try {
        validatePurpose('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('purpose');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validatePurpose(null as any)).toThrow('Purpose must be a string');
      expect(() => validatePurpose(undefined as any)).toThrow('Purpose must be a string');
    });

    it('should reject purpose exceeding 25 characters with PURPOSE_TOO_LONG code', () => {
      try {
        validatePurpose('A'.repeat(26)); // 26 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('PURPOSE_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 25 characters');
        expect((error as ValidationError).field).toBe('purpose');
      }

      try {
        validatePurpose('This is a very long purpose that exceeds limit'); // 48 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('PURPOSE_TOO_LONG');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validatePurpose(123456 as any)).toThrow('Purpose must be a string');
    });

    it('should handle whitespace trimming', () => {
      expect(() => validatePurpose('  payment  ')).not.toThrow();
      expect(() => validatePurpose('\norder payment\n')).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 25 characters', () => {
      const purpose = 'A'.repeat(25);
      expect(() => validatePurpose(purpose)).not.toThrow();
    });

    it('should reject 26 characters', () => {
      const purpose = 'A'.repeat(26);
      expect(() => validatePurpose(purpose)).toThrow(/25.*character/i);
    });
  });

  describe('Unicode Support (T031)', () => {
    it('should accept Vietnamese characters and diacritics', () => {
      expect(() => validatePurpose('Thanh toán hóa đơn')).not.toThrow();
      expect(() => validatePurpose('Chuyển khoản')).not.toThrow();
      expect(() => validatePurpose('Nạp tiền điện thoại')).not.toThrow();
      expect(() => validatePurpose('Đóng học phí')).not.toThrow();
      expect(() => validatePurpose('Mua sắm trực tuyến')).not.toThrow();
    });

    it('should accept other Unicode languages', () => {
      expect(() => validatePurpose('支付订单')).not.toThrow(); // Chinese
      expect(() => validatePurpose('支払い')).not.toThrow(); // Japanese
      expect(() => validatePurpose('Оплата')).not.toThrow(); // Russian
      expect(() => validatePurpose('결제')).not.toThrow(); // Korean
    });

    it('should accept emoji characters', () => {
      expect(() => validatePurpose('Payment 😊')).not.toThrow();
      expect(() => validatePurpose('Order 🛒')).not.toThrow();
      expect(() => validatePurpose('Bill ✅')).not.toThrow();
    });

    it('should accept special punctuation and symbols', () => {
      expect(() => validatePurpose('Order #123')).not.toThrow();
      expect(() => validatePurpose('Payment (urgent)')).not.toThrow();
      expect(() => validatePurpose('Bill & Invoice')).not.toThrow();
      expect(() => validatePurpose('Amount: $100')).not.toThrow();
      expect(() => validatePurpose('Ref: 2024/01')).not.toThrow();
    });

    it('should count multi-byte characters correctly for length validation', () => {
      // Vietnamese characters are multi-byte UTF-8
      const vietnamese = 'Thanh toán hóa đơn ABC'; // 23 characters
      expect(() => validatePurpose(vietnamese)).not.toThrow();

      // Emoji are complex - each emoji can be 1-4 characters in JavaScript
      // The smiling face emoji '😊' is actually 2 JavaScript characters (surrogate pair)
      const withEmoji = '😊'.repeat(12); // 12 emoji = 24 JS characters
      expect(() => validatePurpose(withEmoji)).not.toThrow();

      // But 13 emoji would exceed the limit
      const tooManyEmoji = '😊'.repeat(13); // 13 emoji = 26 JS characters
      expect(() => validatePurpose(tooManyEmoji)).toThrow(/25.*character/i);
    });

    it('should reject Vietnamese text exceeding 25 characters', () => {
      try {
        validatePurpose('Thanh toán hóa đơn điện tử tháng 12'); // 38 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('PURPOSE_TOO_LONG');
      }
    });
  });
});

describe('Unicode Handling Across All Validators (T031)', () => {
  describe('billNumber - should NOT accept Unicode', () => {
    it('should reject Vietnamese characters with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('HÓA123');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }

      try {
        validateBillNumber('ĐƠN456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });

    it('should reject emoji with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('BILL😊');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });

    it('should reject other Unicode scripts with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('送り状');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }

      try {
        validateBillNumber('счет123');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });
  });

  describe('purpose - should accept ALL Unicode', () => {
    it('should accept mixed script text within length limit', () => {
      expect(() => validatePurpose('Pay 支付 оплата')).not.toThrow();
      expect(() => validatePurpose('ABC 123 đơn hàng')).not.toThrow();
    });

    it('should handle RTL (Right-to-Left) text', () => {
      expect(() => validatePurpose('مرحبا')).not.toThrow(); // Arabic
      expect(() => validatePurpose('שלום')).not.toThrow(); // Hebrew
    });

    it('should accept combining diacritical marks', () => {
      expect(() => validatePurpose('café')).not.toThrow();
      expect(() => validatePurpose('naïve')).not.toThrow();
      expect(() => validatePurpose('Zürich')).not.toThrow();
    });
  });
});
