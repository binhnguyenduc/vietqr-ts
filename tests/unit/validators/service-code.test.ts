import { describe, it, expect } from 'vitest';
import { validateServiceCode } from '../../../src/validators/service-code';
import { ValidationError } from '../../../src/types/errors';

describe('validateServiceCode', () => {
  describe('Valid Service Codes', () => {
    it('should accept QRIBFTTA (account transfer)', () => {
      expect(() => validateServiceCode('QRIBFTTA')).not.toThrow();
    });

    it('should accept QRIBFTTC (card transfer)', () => {
      expect(() => validateServiceCode('QRIBFTTC')).not.toThrow();
    });

    it('should be case-sensitive', () => {
      // Only uppercase variants are valid per NAPAS spec
      expect(() => validateServiceCode('QRIBFTTA')).not.toThrow();
      expect(() => validateServiceCode('QRIBFTTC')).not.toThrow();
    });
  });

  describe('Invalid Service Codes', () => {
    it('should reject empty service code with MISSING_REQUIRED_FIELD code', () => {
      try {
        validateServiceCode('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('serviceCode');
      }
    });

    it('should reject null or undefined with type error', () => {
      expect(() => validateServiceCode(null as any)).toThrow('Service code must be a string');
      expect(() => validateServiceCode(undefined as any)).toThrow('Service code must be a string');
    });

    it('should reject lowercase service codes with INVALID_SERVICE_CODE code', () => {
      try {
        validateServiceCode('qribftta');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
        expect((error as ValidationError).expectedFormat).toBe('"QRIBFTTA" or "QRIBFTTC"');
        expect((error as ValidationError).field).toBe('serviceCode');
      }

      try {
        validateServiceCode('qribfttc');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });

    it('should reject mixed case service codes with INVALID_SERVICE_CODE code', () => {
      try {
        validateServiceCode('QribFTTA');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }

      try {
        validateServiceCode('qrIBfttc');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });

    it('should reject unknown service codes with INVALID_SERVICE_CODE code', () => {
      try {
        validateServiceCode('INVALID');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
        expect((error as ValidationError).expectedFormat).toBe('"QRIBFTTA" or "QRIBFTTC"');
      }

      try {
        validateServiceCode('QRIBFTXX');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });

    it('should reject service codes with extra characters with INVALID_SERVICE_CODE code', () => {
      try {
        validateServiceCode('QRIBFTTA ');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }

      try {
        validateServiceCode('QRIBFTTA1');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });

    it('should reject similar but incorrect codes with INVALID_SERVICE_CODE code', () => {
      try {
        validateServiceCode('QRIBFTA'); // Missing T
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }

      try {
        validateServiceCode('QRIBFTTAA'); // Extra A
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });
  });

  describe('Type Validation', () => {
    it('should reject number type', () => {
      expect(() => validateServiceCode(123 as any)).toThrow(/string/i);
    });

    it('should reject boolean type', () => {
      expect(() => validateServiceCode(true as any)).toThrow(/string/i);
    });

    it('should reject object type', () => {
      expect(() => validateServiceCode({ code: 'QRIBFTTA' } as any)).toThrow(/string/i);
    });
  });

  describe('Whitespace Handling', () => {
    it('should reject service codes with leading whitespace', () => {
      expect(() => validateServiceCode(' QRIBFTTA')).toThrow(/QRIBFTTA.*QRIBFTTC/i);
    });

    it('should reject service codes with trailing whitespace', () => {
      expect(() => validateServiceCode('QRIBFTTA ')).toThrow(/QRIBFTTA.*QRIBFTTC/i);
    });

    it('should reject service codes with internal whitespace', () => {
      expect(() => validateServiceCode('QRIBF TTA')).toThrow(/QRIBFTTA.*QRIBFTTC/i);
    });
  });

  describe('Specification Compliance', () => {
    it('should only accept NAPAS IBFT v1.5.2 service codes', () => {
      // Per NAPAS spec, only two service codes are valid:
      // - QRIBFTTA: QR IBFT to Account
      // - QRIBFTTC: QR IBFT to Card
      const validCodes = ['QRIBFTTA', 'QRIBFTTC'];

      validCodes.forEach((code) => {
        expect(() => validateServiceCode(code)).not.toThrow();
      });

      // Any other code should throw
      const invalidCodes = ['QRIBFTTD', 'QRIBFTTE', 'QRIBFTTF'];

      invalidCodes.forEach((code) => {
        expect(() => validateServiceCode(code)).toThrow(/QRIBFTTA.*QRIBFTTC/i);
      });
    });
  });
});
