import { describe, it, expect } from 'vitest';
import { validateAmount } from '../../src/validators/amount';
import { validateCurrency } from '../../src/validators/currency';
import { validateMerchantCategory } from '../../src/validators/merchant-category';
import { ValidationError } from '../../src/types/errors';

describe('User Story 2: Validate Numeric Formats Integration', () => {
  describe('Scenario 1: Valid amount formats', () => {
    it('should accept integer amounts', () => {
      expect(() => validateAmount('180000')).not.toThrow();
      expect(() => validateAmount('1000')).not.toThrow();
      expect(() => validateAmount('1')).not.toThrow();
    });

    it('should accept decimal amounts', () => {
      expect(() => validateAmount('180000.50')).not.toThrow();
      expect(() => validateAmount('1000.99')).not.toThrow();
      expect(() => validateAmount('0.5')).not.toThrow();
    });

    it('should accept amounts up to 13 characters', () => {
      expect(() => validateAmount('1234567890123')).not.toThrow();
      expect(() => validateAmount('12345.1234567')).not.toThrow();
    });
  });

  describe('Scenario 2: Invalid amount formats', () => {
    it('should reject empty amount with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateAmount('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('amount');
      }
    });

    it('should reject amount exceeding 13 characters with AMOUNT_TOO_LONG code', () => {
      try {
        validateAmount('12345678901234'); // 14 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('AMOUNT_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 13 characters');
        expect((error as ValidationError).field).toBe('amount');
      }
    });

    it('should reject non-numeric amounts with INVALID_AMOUNT_FORMAT code', () => {
      try {
        validateAmount('abc');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
        expect((error as ValidationError).expectedFormat).toBe('Numeric with optional decimal (e.g., 180000 or 180000.50)');
      }
    });

    it('should reject zero amounts with INVALID_AMOUNT_VALUE code', () => {
      try {
        validateAmount('0');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
        expect((error as ValidationError).expectedFormat).toBe('> 0');
      }
    });
  });

  describe('Scenario 3: Valid currency code', () => {
    it('should accept "704" (VND)', () => {
      expect(() => validateCurrency('704')).not.toThrow();
    });

    it('should trim whitespace and accept valid currency', () => {
      expect(() => validateCurrency('  704  ')).not.toThrow();
    });
  });

  describe('Scenario 4: Invalid currency codes', () => {
    it('should reject empty currency with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateCurrency('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('currency');
        expect((error as ValidationError).expectedFormat).toBe('"704" (VND)');
      }
    });

    it('should reject non-VND currency codes with INVALID_CURRENCY_CODE code', () => {
      try {
        validateCurrency('840'); // USD
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
        expect((error as ValidationError).expectedFormat).toBe('"704" (VND)');
      }
    });
  });

  describe('Scenario 5: Valid merchant category codes', () => {
    it('should accept 4-digit numeric MCC codes', () => {
      expect(() => validateMerchantCategory('5411')).not.toThrow();
      expect(() => validateMerchantCategory('5812')).not.toThrow();
      expect(() => validateMerchantCategory('0742')).not.toThrow();
    });

    it('should trim whitespace and accept valid MCC', () => {
      expect(() => validateMerchantCategory('  5411  ')).not.toThrow();
    });
  });

  describe('Scenario 6: Invalid merchant category codes', () => {
    it('should reject empty MCC with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateMerchantCategory('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('merchantCategory');
        expect((error as ValidationError).expectedFormat).toBe('4 numeric digits');
      }
    });

    it('should reject MCC with wrong length with INVALID_MCC_LENGTH code', () => {
      try {
        validateMerchantCategory('541'); // Too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
        expect((error as ValidationError).expectedFormat).toBe('4 numeric digits');
      }
    });

    it('should reject MCC with non-numeric characters with INVALID_MCC_FORMAT code', () => {
      try {
        validateMerchantCategory('541A');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
        expect((error as ValidationError).expectedFormat).toBe('4 numeric digits');
      }
    });
  });

  describe('Scenario 7: Combined numeric validations', () => {
    it('should validate multiple numeric fields in sequence', () => {
      // All valid
      expect(() => {
        validateAmount('180000');
        validateCurrency('704');
        validateMerchantCategory('5411');
      }).not.toThrow();
    });

    it('should detect errors across different numeric validators', () => {
      // Invalid amount
      try {
        validateAmount('-180000');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }

      // Invalid currency
      try {
        validateCurrency('840');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }

      // Invalid MCC
      try {
        validateMerchantCategory('ABC1');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
      }
    });
  });

  describe('Scenario 8: Whitespace handling across numeric validators', () => {
    it('should trim whitespace for all numeric validators', () => {
      expect(() => validateAmount('  180000  ')).not.toThrow();
      expect(() => validateCurrency('  704  ')).not.toThrow();
      expect(() => validateMerchantCategory('  5411  ')).not.toThrow();
    });
  });
});
