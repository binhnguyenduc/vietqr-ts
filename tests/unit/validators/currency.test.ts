import { describe, it, expect } from 'vitest';
import { validateCurrency } from '../../../src/validators/currency';
import { ValidationError } from '../../../src/types/errors';

describe('validateCurrency', () => {
  describe('Valid Currency', () => {
    it('should accept "704" (VND)', () => {
      expect(() => validateCurrency('704')).not.toThrow();
    });

    it('should trim whitespace and accept valid currency', () => {
      expect(() => validateCurrency('  704  ')).not.toThrow();
      expect(() => validateCurrency('\n704\n')).not.toThrow();
    });
  });

  describe('Invalid Currency Codes', () => {
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

    it('should reject null or undefined with type error', () => {
      expect(() => validateCurrency(null as any)).toThrow('Currency must be a string');
      expect(() => validateCurrency(undefined as any)).toThrow('Currency must be a string');
    });

    it('should reject non-"704" currency codes with INVALID_CURRENCY_CODE code', () => {
      try {
        validateCurrency('840'); // USD
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
        expect((error as ValidationError).expectedFormat).toBe('"704" (VND)');
        expect((error as ValidationError).field).toBe('currency');
      }

      try {
        validateCurrency('978'); // EUR
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }
    });

    it('should reject invalid currency format with INVALID_CURRENCY_CODE code', () => {
      try {
        validateCurrency('VND'); // String instead of numeric code
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }

      try {
        validateCurrency('70'); // Too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }

      try {
        validateCurrency('7040'); // Too long
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }
    });

    it('should accept currency codes with leading/trailing whitespace (trimmed)', () => {
      // Whitespace is trimmed, so '704 ' becomes '704' which is valid
      expect(() => validateCurrency('704 ')).not.toThrow();
      expect(() => validateCurrency(' 704')).not.toThrow();
      expect(() => validateCurrency(' 704 ')).not.toThrow();
    });

    it('should reject currency codes with special characters with INVALID_CURRENCY_CODE code', () => {
      try {
        validateCurrency('$704');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }

      try {
        validateCurrency('704$');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CURRENCY_CODE');
      }
    });
  });

  describe('Type Validation', () => {
    it('should reject number type', () => {
      expect(() => validateCurrency(704 as any)).toThrow(/string/i);
    });

    it('should reject boolean type', () => {
      expect(() => validateCurrency(true as any)).toThrow(/string/i);
    });

    it('should reject object type', () => {
      expect(() => validateCurrency({ code: '704' } as any)).toThrow(/string/i);
    });
  });

  describe('Specification Compliance', () => {
    it('should only accept VND currency code (704) per NAPAS IBFT v1.5.2', () => {
      // Per NAPAS spec, only VND (704) is valid for VietQR
      expect(() => validateCurrency('704')).not.toThrow();

      // Any other currency code should throw
      const invalidCurrencies = ['840', '978', '156', '392', '036'];

      invalidCurrencies.forEach((code) => {
        expect(() => validateCurrency(code)).toThrow(/704/i);
      });
    });
  });
});
