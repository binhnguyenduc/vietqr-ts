import { describe, it, expect } from 'vitest';
import { validateMerchantCategory } from '../../../src/validators/merchant-category';
import { ValidationError } from '../../../src/types/errors';

describe('validateMerchantCategory', () => {
  describe('Valid Merchant Category Codes', () => {
    it('should accept 4-digit numeric MCC codes', () => {
      expect(() => validateMerchantCategory('5411')).not.toThrow(); // Grocery stores
      expect(() => validateMerchantCategory('5812')).not.toThrow(); // Restaurants
      expect(() => validateMerchantCategory('7011')).not.toThrow(); // Hotels
      expect(() => validateMerchantCategory('0742')).not.toThrow(); // Veterinary services
    });

    it('should accept MCC with leading zeros', () => {
      expect(() => validateMerchantCategory('0001')).not.toThrow();
      expect(() => validateMerchantCategory('0100')).not.toThrow();
    });

    it('should trim whitespace and accept valid MCC', () => {
      expect(() => validateMerchantCategory('  5411  ')).not.toThrow();
      expect(() => validateMerchantCategory('\n5812\n')).not.toThrow();
    });
  });

  describe('Invalid Merchant Category Codes', () => {
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

    it('should reject null or undefined with type error', () => {
      expect(() => validateMerchantCategory(null as any)).toThrow('Merchant category must be a string');
      expect(() => validateMerchantCategory(undefined as any)).toThrow('Merchant category must be a string');
    });

    it('should reject MCC with wrong length with INVALID_MCC_LENGTH code', () => {
      try {
        validateMerchantCategory('541'); // Too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
        expect((error as ValidationError).expectedFormat).toBe('4 numeric digits');
        expect((error as ValidationError).field).toBe('merchantCategory');
      }

      try {
        validateMerchantCategory('54111'); // Too long
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
      }

      try {
        validateMerchantCategory('1'); // Way too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
      }
    });

    it('should reject MCC with non-numeric characters with INVALID_MCC_FORMAT code', () => {
      try {
        validateMerchantCategory('541A'); // Letter
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
        expect((error as ValidationError).expectedFormat).toBe('4 numeric digits');
      }

      try {
        validateMerchantCategory('54-1'); // Hyphen
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
      }

      try {
        validateMerchantCategory('54.1'); // Decimal point
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
      }
    });

    it('should reject MCC with special characters with INVALID_MCC_FORMAT or INVALID_MCC_LENGTH code', () => {
      try {
        validateMerchantCategory('$5411'); // 5 chars - length error
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
      }

      try {
        validateMerchantCategory('5411$'); // 5 chars - length error
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
      }

      try {
        validateMerchantCategory('54 1'); // 4 chars but contains space - format error
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
      }
    });
  });

  describe('Type Validation', () => {
    it('should reject number type', () => {
      expect(() => validateMerchantCategory(5411 as any)).toThrow(/string/i);
    });

    it('should reject boolean type', () => {
      expect(() => validateMerchantCategory(true as any)).toThrow(/string/i);
    });

    it('should reject object type', () => {
      expect(() => validateMerchantCategory({ code: '5411' } as any)).toThrow(/string/i);
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 4 digits', () => {
      expect(() => validateMerchantCategory('1234')).not.toThrow();
    });

    it('should reject 3 digits', () => {
      expect(() => validateMerchantCategory('123')).toThrow(/4.*digit/i);
    });

    it('should reject 5 digits', () => {
      expect(() => validateMerchantCategory('12345')).toThrow(/4.*digit/i);
    });

    it('should accept all zeros', () => {
      expect(() => validateMerchantCategory('0000')).not.toThrow();
    });

    it('should accept all nines', () => {
      expect(() => validateMerchantCategory('9999')).not.toThrow();
    });
  });

  describe('Whitespace Handling', () => {
    it('should reject MCC with internal whitespace (length then format check)', () => {
      try {
        validateMerchantCategory('54 11'); // 5 chars including space
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        // Length check happens first, so this is 5 chars total
        expect((error as ValidationError).code).toBe('INVALID_MCC_LENGTH');
      }

      try {
        validateMerchantCategory('5 41'); // 4 chars but contains space
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        // Exactly 4 chars, but format check fails
        expect((error as ValidationError).code).toBe('INVALID_MCC_FORMAT');
      }
    });

    it('should accept MCC with leading/trailing whitespace (trimmed)', () => {
      expect(() => validateMerchantCategory(' 5411 ')).not.toThrow();
      expect(() => validateMerchantCategory('\t5411\t')).not.toThrow();
    });
  });
});
