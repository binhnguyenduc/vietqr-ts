import { describe, it, expect } from 'vitest';
import { validateBankBin, validateAccountNumber, validateCardNumber } from '../../../src/validators/bank-info';
import { ValidationError } from '../../../src/types/errors';

describe('validateBankBin', () => {
  describe('Valid Bank BINs', () => {
    it('should accept standard 6-digit bank BIN', () => {
      expect(() => validateBankBin('970403')).not.toThrow();
      expect(() => validateBankBin('970415')).not.toThrow();
      expect(() => validateBankBin('970422')).not.toThrow();
    });

    it('should accept numeric bank BINs', () => {
      expect(() => validateBankBin('000000')).not.toThrow();
      expect(() => validateBankBin('999999')).not.toThrow();
    });
  });

  describe('Invalid Bank BINs', () => {
    it('should reject empty bank BIN with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateBankBin('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('bankBin');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validateBankBin(null as any)).toThrow('Bank BIN must be a string');
      expect(() => validateBankBin(undefined as any)).toThrow('Bank BIN must be a string');
    });

    it('should reject bank BIN with incorrect length with INVALID_BANK_BIN_LENGTH code', () => {
      try {
        validateBankBin('97040'); // Too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_LENGTH');
        expect((error as ValidationError).expectedFormat).toBe('6 numeric digits');
        expect((error as ValidationError).field).toBe('bankBin');
      }

      try {
        validateBankBin('9704033'); // Too long
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_LENGTH');
      }
    });

    it('should reject bank BIN with non-numeric characters with INVALID_BANK_BIN_FORMAT code', () => {
      try {
        validateBankBin('97040A');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_FORMAT');
        expect((error as ValidationError).expectedFormat).toBe('6 numeric digits');
        expect((error as ValidationError).field).toBe('bankBin');
      }

      try {
        validateBankBin('970-03');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_FORMAT');
      }
    });

    it('should reject bank BIN with special characters with INVALID_BANK_BIN_FORMAT code', () => {
      try {
        validateBankBin('970@03');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_FORMAT');
      }

      try {
        validateBankBin('!70403');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_FORMAT');
      }
    });

    it('should reject whitespace-only bank BIN with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateBankBin('   ');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateBankBin(970403 as any)).toThrow(/string/i);
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateBankBin(' 970403 ')).not.toThrow();
    });
  });
});

describe('validateAccountNumber', () => {
  describe('Valid Account Numbers', () => {
    it('should accept standard account numbers', () => {
      expect(() => validateAccountNumber('01234567')).not.toThrow();
      expect(() => validateAccountNumber('1234567890')).not.toThrow();
    });

    it('should accept account numbers up to 19 characters', () => {
      expect(() => validateAccountNumber('1'.repeat(19))).not.toThrow();
    });

    it('should accept single character account number', () => {
      expect(() => validateAccountNumber('1')).not.toThrow();
    });

    it('should accept alphanumeric account numbers', () => {
      expect(() => validateAccountNumber('ABC123XYZ')).not.toThrow();
      expect(() => validateAccountNumber('0123ABC456DEF')).not.toThrow();
    });
  });

  describe('Invalid Account Numbers', () => {
    it('should reject empty account number with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateAccountNumber('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('accountNumber');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validateAccountNumber(null as any)).toThrow('Account number must be a string');
      expect(() => validateAccountNumber(undefined as any)).toThrow('Account number must be a string');
    });

    it('should reject account number exceeding 19 characters with ACCOUNT_NUMBER_TOO_LONG code', () => {
      try {
        validateAccountNumber('1'.repeat(20));
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('ACCOUNT_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 19 characters');
        expect((error as ValidationError).field).toBe('accountNumber');
      }

      try {
        validateAccountNumber('12345678901234567890');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('ACCOUNT_NUMBER_TOO_LONG');
      }
    });

    it('should reject account numbers with special characters with INVALID_ACCOUNT_CHARACTERS code', () => {
      try {
        validateAccountNumber('0123-456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric only (A-Z, a-z, 0-9)');
      }

      try {
        validateAccountNumber('0123@456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
      }

      try {
        validateAccountNumber('0123 456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
      }
    });

    it('should reject account numbers with Unicode characters with INVALID_ACCOUNT_CHARACTERS code', () => {
      try {
        validateAccountNumber('012ñ456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
      }

      try {
        validateAccountNumber('012中456');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateAccountNumber(1234567 as any)).toThrow(/string/i);
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateAccountNumber(' 01234567 ')).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 19 characters', () => {
      const account19 = '1234567890123456789';
      expect(() => validateAccountNumber(account19)).not.toThrow();
    });

    it('should reject 20 characters', () => {
      const account20 = '12345678901234567890';
      try {
        validateAccountNumber(account20);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('ACCOUNT_NUMBER_TOO_LONG');
      }
    });
  });
});

describe('validateCardNumber', () => {
  describe('Valid Card Numbers', () => {
    it('should accept standard card numbers', () => {
      expect(() => validateCardNumber('9704220112345678')).not.toThrow();
      expect(() => validateCardNumber('1234567890')).not.toThrow();
    });

    it('should accept card numbers up to 19 characters', () => {
      expect(() => validateCardNumber('1'.repeat(19))).not.toThrow();
    });

    it('should accept alphanumeric card numbers', () => {
      expect(() => validateCardNumber('ABC123XYZ')).not.toThrow();
    });
  });

  describe('Invalid Card Numbers', () => {
    it('should reject empty card number with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateCardNumber('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('cardNumber');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validateCardNumber(null as any)).toThrow('Card number must be a string');
      expect(() => validateCardNumber(undefined as any)).toThrow('Card number must be a string');
    });

    it('should reject card number exceeding 19 characters with CARD_NUMBER_TOO_LONG code', () => {
      try {
        validateCardNumber('1'.repeat(20));
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('CARD_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 19 characters');
        expect((error as ValidationError).field).toBe('cardNumber');
      }
    });

    it('should reject card numbers with special characters with INVALID_CARD_CHARACTERS code', () => {
      try {
        validateCardNumber('1234-5678');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CARD_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric only (A-Z, a-z, 0-9)');
      }

      try {
        validateCardNumber('1234@5678');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CARD_CHARACTERS');
      }
    });

    it('should reject card numbers with whitespace with INVALID_CARD_CHARACTERS code', () => {
      try {
        validateCardNumber('1234 5678');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CARD_CHARACTERS');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateCardNumber(1234567890 as any)).toThrow(/string/i);
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateCardNumber(' 9704220112345678 ')).not.toThrow();
    });
  });
});
