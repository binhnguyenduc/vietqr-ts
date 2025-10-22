import { describe, it, expect } from 'vitest';
import { validateVietQRConfig } from '../../../src/validators';
import { AggregateValidationError } from '../../../src/types/errors';

describe('validateVietQRConfig (Aggregate Validation)', () => {
  describe('Valid Configurations', () => {
    it('should accept valid static account QR config', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '01234567',
        serviceCode: 'QRIBFTTA' as const,
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid static card QR config', () => {
      const config = {
        bankBin: '970403',
        cardNumber: '9704031101234567',
        serviceCode: 'QRIBFTTC' as const,
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid dynamic account QR config', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '0011012345678',
        serviceCode: 'QRIBFTTA' as const,
        amount: '180000',
        billNumber: 'NPS6869',
        purpose: 'thanh toan don hang',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });
  });

  describe('Single Validation Failures', () => {
    it('should throw AggregateValidationError for invalid bank BIN', () => {
      const config = {
        bankBin: '97040', // Only 5 digits
        accountNumber: '01234567',
        serviceCode: 'QRIBFTTA' as const,
      };

      expect(() => validateVietQRConfig(config)).toThrow(AggregateValidationError);

      try {
        validateVietQRConfig(config);
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;
        expect(aggError.errors).toHaveLength(1);
        expect(aggError.errors[0].field).toBe('bankBin');
        expect(aggError.errors[0].message).toContain('6 digits');
      }
    });

    it('should throw AggregateValidationError for invalid service code', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '01234567',
        serviceCode: 'INVALID' as any,
      };

      expect(() => validateVietQRConfig(config)).toThrow(AggregateValidationError);

      try {
        validateVietQRConfig(config);
      } catch (error) {
        const aggError = error as AggregateValidationError;
        expect(aggError.errors).toHaveLength(1);
        expect(aggError.errors[0].field).toBe('serviceCode');
        expect(aggError.errors[0].message).toContain('QRIBFTTA');
        expect(aggError.errors[0].message).toContain('QRIBFTTC');
      }
    });

    it('should throw AggregateValidationError for missing account number', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '',
        serviceCode: 'QRIBFTTA' as const,
      };

      expect(() => validateVietQRConfig(config)).toThrow(AggregateValidationError);

      try {
        validateVietQRConfig(config);
      } catch (error) {
        const aggError = error as AggregateValidationError;
        // Aggregate validator adds config-level error + field-level error
        expect(aggError.errors.length).toBeGreaterThanOrEqual(1);
        const accountError = aggError.errors.find((e) => e.field === 'accountNumber');
        expect(accountError).toBeDefined();
        expect(accountError?.message).toContain('accountNumber');
      }
    });
  });

  describe('Multiple Validation Failures', () => {
    it('should collect all validation errors together', () => {
      const config = {
        bankBin: '97040', // Invalid: only 5 digits
        serviceCode: 'INVALID' as any, // Invalid: not QRIBFTTA or QRIBFTTC
      } as any;

      try {
        validateVietQRConfig(config);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;

        // Should have at least 2 validation errors (bankBin, serviceCode)
        expect(aggError.errors.length).toBeGreaterThanOrEqual(2);

        // Check that error fields are present
        const errorFields = aggError.errors.map((e) => e.field);
        expect(errorFields).toContain('bankBin');
        expect(errorFields).toContain('serviceCode');

        // Verify error messages are descriptive
        const bankBinError = aggError.errors.find((e) => e.field === 'bankBin');
        expect(bankBinError?.message).toContain('6 digits');

        const serviceError = aggError.errors.find((e) => e.field === 'serviceCode');
        expect(serviceError?.message).toContain('QRIBFTTA');
      }
    });

    it('should collect dynamic QR validation errors', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '01234567',
        serviceCode: 'QRIBFTTA' as const,
        amount: '12345678901234', // Invalid: exceeds 13 chars
        billNumber: 'A'.repeat(26), // Invalid: exceeds 25 chars
        purpose: 'B'.repeat(26), // Invalid: exceeds 25 chars
      };

      try {
        validateVietQRConfig(config);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        const aggError = error as AggregateValidationError;

        // Should have 3 validation errors (amount, billNumber, purpose)
        expect(aggError.errors).toHaveLength(3);

        const errorFields = aggError.errors.map((e) => e.field);
        expect(errorFields).toContain('amount');
        expect(errorFields).toContain('billNumber');
        expect(errorFields).toContain('purpose');
      }
    });

    it('should format aggregate error message clearly', () => {
      const config = {
        bankBin: '97040',
        accountNumber: '',
        serviceCode: 'INVALID' as any,
      };

      try {
        validateVietQRConfig(config);
      } catch (error) {
        const aggError = error as AggregateValidationError;

        // Check message format - aggregate validator adds config-level validation
        expect(aggError.message).toContain('Validation failed with');
        expect(aggError.message).toContain('error(s)');
        expect(aggError.message).toContain('bankBin:');
        expect(aggError.message).toContain('serviceCode:');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should validate card transfer requires cardNumber not accountNumber', () => {
      const config = {
        bankBin: '970403',
        accountNumber: '01234567', // Wrong field for card transfer
        serviceCode: 'QRIBFTTC' as const,
      };

      try {
        validateVietQRConfig(config);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(1);
        const cardError = aggError.errors.find((e) => e.field === 'cardNumber');
        expect(cardError).toBeDefined();
        // Aggregate validator provides service-code specific error message
        expect(cardError?.message).toContain('cardNumber');
      }
    });

    it('should validate account transfer requires accountNumber not cardNumber', () => {
      const config = {
        bankBin: '970403',
        cardNumber: '9704031101234567', // Wrong field for account transfer
        serviceCode: 'QRIBFTTA' as const,
      };

      try {
        validateVietQRConfig(config);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(1);
        const accountError = aggError.errors.find((e) => e.field === 'accountNumber');
        expect(accountError).toBeDefined();
        // Aggregate validator provides service-code specific error message
        expect(accountError?.message).toContain('accountNumber');
      }
    });
  });
});
