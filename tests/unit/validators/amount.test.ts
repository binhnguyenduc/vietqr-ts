import { describe, it, expect } from 'vitest';
import { validateAmount } from '../../../src/validators/amount';
import { ValidationError } from '../../../src/types/errors';

describe('validateAmount', () => {
  describe('Valid Amounts', () => {
    it('should accept integer amounts', () => {
      expect(() => validateAmount('180000')).not.toThrow();
      expect(() => validateAmount('1000')).not.toThrow();
      expect(() => validateAmount('1')).not.toThrow();
    });

    it('should accept amounts with decimal point', () => {
      expect(() => validateAmount('180000.50')).not.toThrow();
      expect(() => validateAmount('1000.99')).not.toThrow();
      expect(() => validateAmount('0.5')).not.toThrow();
    });

    it('should accept amounts up to 13 characters', () => {
      expect(() => validateAmount('1234567890123')).not.toThrow(); // 13 chars (max)
      expect(() => validateAmount('123456789012')).not.toThrow(); // 12 chars
      expect(() => validateAmount('12345.1234567')).not.toThrow(); // 13 chars with decimal
    });

    it('should accept small positive amounts', () => {
      expect(() => validateAmount('0.01')).not.toThrow();
      expect(() => validateAmount('0.1')).not.toThrow();
      expect(() => validateAmount('1')).not.toThrow();
    });
  });

  describe('Invalid Amounts', () => {
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

    it('should reject null or undefined with type error', () => {
      expect(() => validateAmount(null as any)).toThrow('Amount must be a string');
      expect(() => validateAmount(undefined as any)).toThrow('Amount must be a string');
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

      try {
        validateAmount('1234567890.123'); // 14 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('AMOUNT_TOO_LONG');
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

      try {
        validateAmount('123abc');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }

      try {
        validateAmount('12.34.56');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });

    it('should reject amounts with special characters with INVALID_AMOUNT_FORMAT code', () => {
      try {
        validateAmount('$180000');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }

      try {
        validateAmount('180,000');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });

    it('should reject negative amounts with INVALID_AMOUNT_FORMAT code', () => {
      try {
        validateAmount('-180000');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }

      try {
        validateAmount('-100.50');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
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

      try {
        validateAmount('0.00');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
      }
    });

    it('should reject amounts with multiple decimal points with INVALID_AMOUNT_FORMAT code', () => {
      try {
        validateAmount('180.000.00');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateAmount(180000 as any)).toThrow('Amount must be a string');
      expect(() => validateAmount(1000.50 as any)).toThrow('Amount must be a string');
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateAmount('  180000  ')).not.toThrow();
      expect(() => validateAmount('\n180000.50\n')).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 13 characters', () => {
      const amount = '1234567890123';
      expect(() => validateAmount(amount)).not.toThrow();
    });

    it('should reject 14 characters', () => {
      const amount = '12345678901234';
      expect(() => validateAmount(amount)).toThrow(/13.*character/i);
    });

    it('should accept amount with single decimal digit', () => {
      expect(() => validateAmount('180000.5')).not.toThrow();
    });

    it('should accept amount with multiple decimal digits', () => {
      expect(() => validateAmount('180000.50')).not.toThrow();
      expect(() => validateAmount('1000.999')).not.toThrow();
    });

    it('should reject amount starting with decimal point', () => {
      expect(() => validateAmount('.50')).toThrow(/numeric/i);
    });

    it('should reject amount ending with decimal point', () => {
      expect(() => validateAmount('180000.')).toThrow(/numeric/i);
    });
  });

  describe('Dynamic QR Validation (T039)', () => {
    describe('Zero amount for dynamic QR context', () => {
      it('should reject zero amount with INVALID_AMOUNT_VALUE code', () => {
        try {
          validateAmount('0', true); // isDynamic = true
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
          expect((error as ValidationError).expectedFormat).toBe('> 0');
          expect((error as ValidationError).message).toContain('Amount must be positive');
        }
      });

      it('should reject zero decimal amount with INVALID_AMOUNT_VALUE code', () => {
        try {
          validateAmount('0.00', true); // isDynamic = true
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
        }
      });
    });

    describe('Empty amount for dynamic QR context', () => {
      it('should reject empty amount for dynamic QR with INVALID_DYNAMIC_AMOUNT code', () => {
        try {
          validateAmount('', true); // isDynamic = true, empty amount
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).code).toBe('INVALID_DYNAMIC_AMOUNT');
          expect((error as ValidationError).message).toContain('Dynamic QR codes require an amount');
        }
      });

      it('should reject whitespace-only amount for dynamic QR with INVALID_DYNAMIC_AMOUNT code', () => {
        try {
          validateAmount('   ', true); // isDynamic = true, whitespace only
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).code).toBe('INVALID_DYNAMIC_AMOUNT');
        }
      });
    });

    describe('Static QR amount validation', () => {
      it('should allow empty amount for static QR (isDynamic = false)', () => {
        expect(() => validateAmount('', false)).not.toThrow();
      });

      it('should allow undefined for static QR when amount is optional', () => {
        // Static QR doesn't require amount
        expect(() => validateAmount('', false)).not.toThrow();
      });

      it('should still validate format if amount is provided for static QR', () => {
        // If static QR has amount, it must still be valid
        try {
          validateAmount('abc', false);
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
        }
      });
    });

    describe('Valid dynamic QR amounts', () => {
      it('should accept valid positive amount for dynamic QR', () => {
        expect(() => validateAmount('180000', true)).not.toThrow();
        expect(() => validateAmount('180000.50', true)).not.toThrow();
        expect(() => validateAmount('1', true)).not.toThrow();
        expect(() => validateAmount('0.01', true)).not.toThrow();
      });
    });
  });
});
