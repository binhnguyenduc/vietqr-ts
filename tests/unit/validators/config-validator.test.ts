import { describe, it, expect } from 'vitest';
import { validateVietQRConfig } from '../../../src/validators/config-validator';
import { ValidationError, AggregateValidationError } from '../../../src/types/errors';
import type { VietQRConfig } from '../../../src/types/config';

describe('validateVietQRConfig', () => {
  describe('Multi-Error Collection (T045)', () => {
    it('should collect multiple validation errors and throw AggregateValidationError', () => {
      const invalidConfig: Partial<VietQRConfig> = {
        bankBin: '12345', // Too short
        serviceCode: 'QRIBFTTA',
        accountNumber: '12345678901234567890', // Too long
        amount: 'abc', // Invalid format
      };

      try {
        validateVietQRConfig(invalidConfig as any);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(3);

        // Should contain bank BIN error
        const bankBinError = aggError.errors.find(e => e.field === 'bankBin');
        expect(bankBinError).toBeDefined();
        expect(bankBinError?.code).toBe('INVALID_BANK_BIN_LENGTH');

        // Should contain account number error
        const accountError = aggError.errors.find(e => e.field === 'accountNumber');
        expect(accountError).toBeDefined();
        expect(accountError?.code).toBe('ACCOUNT_NUMBER_TOO_LONG');

        // Should contain amount error
        const amountError = aggError.errors.find(e => e.field === 'amount');
        expect(amountError).toBeDefined();
        expect(amountError?.code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });

    it('should collect all field validation errors in a single pass', () => {
      const invalidConfig: Partial<VietQRConfig> = {
        bankBin: '', // Missing
        serviceCode: 'INVALID' as any, // Invalid
        initiationMethod: '12', // Dynamic QR
        amount: '', // Missing for dynamic QR
      };

      try {
        validateVietQRConfig(invalidConfig as any);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should include all errors with proper error codes', () => {
      const invalidConfig: Partial<VietQRConfig> = {
        bankBin: '970A22', // Non-numeric
        serviceCode: 'QRIBFTTA',
        accountNumber: '', // Missing
        initiationMethod: '11',
      };

      try {
        validateVietQRConfig(invalidConfig as any);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        const aggError = error as AggregateValidationError;

        // All errors should have codes
        aggError.errors.forEach(err => {
          expect(err.code).toBeDefined();
          expect(typeof err.code).toBe('string');
        });
      }
    });

    it('should handle 4+ simultaneous violations', () => {
      const invalidConfig: Partial<VietQRConfig> = {
        bankBin: '123', // Too short
        serviceCode: 'INVALID' as any, // Invalid
        accountNumber: 'acc-123', // Invalid characters
        initiationMethod: '12', // Dynamic
        amount: '-100', // Negative
      };

      try {
        validateVietQRConfig(invalidConfig as any);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('Cross-Field Validation (T046)', () => {
    describe('Account/Card Mutual Exclusivity', () => {
      it('should reject config with both accountNumber and cardNumber', () => {
        const config: Partial<VietQRConfig> = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          accountNumber: '01234567',
          cardNumber: '9704220112345678', // Both provided
          initiationMethod: '11',
        };

        try {
          validateVietQRConfig(config as any);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          if (error instanceof AggregateValidationError) {
            const bothError = error.errors.find(e => e.code === 'BOTH_ACCOUNT_AND_CARD');
            expect(bothError).toBeDefined();
          } else if (error instanceof ValidationError) {
            expect(error.code).toBe('BOTH_ACCOUNT_AND_CARD');
          }
        }
      });

      it('should reject config with neither accountNumber nor cardNumber', () => {
        const config: Partial<VietQRConfig> = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          initiationMethod: '11',
          // Neither accountNumber nor cardNumber provided
        };

        try {
          validateVietQRConfig(config as any);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          if (error instanceof AggregateValidationError) {
            const missingError = error.errors.find(e => e.code === 'MISSING_ACCOUNT_OR_CARD');
            expect(missingError).toBeDefined();
          } else if (error instanceof ValidationError) {
            expect(error.code).toBe('MISSING_ACCOUNT_OR_CARD');
          }
        }
      });
    });

    describe('Service Code Dependencies', () => {
      it('should require accountNumber when serviceCode is QRIBFTTA', () => {
        const config: Partial<VietQRConfig> = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          cardNumber: '9704220112345678', // Wrong field for QRIBFTTA
          initiationMethod: '11',
        };

        try {
          validateVietQRConfig(config as any);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          if (error instanceof AggregateValidationError) {
            const accountRequiredError = error.errors.find(e => e.code === 'ACCOUNT_REQUIRED_FOR_QRIBFTTA');
            expect(accountRequiredError).toBeDefined();
          } else if (error instanceof ValidationError) {
            expect(error.code).toBe('ACCOUNT_REQUIRED_FOR_QRIBFTTA');
          }
        }
      });

      it('should require cardNumber when serviceCode is QRIBFTTC', () => {
        const config: Partial<VietQRConfig> = {
          bankBin: '970422',
          serviceCode: 'QRIBFTTC',
          accountNumber: '01234567', // Wrong field for QRIBFTTC
          initiationMethod: '11',
        };

        try {
          validateVietQRConfig(config as any);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          if (error instanceof AggregateValidationError) {
            const cardRequiredError = error.errors.find(e => e.code === 'CARD_REQUIRED_FOR_QRIBFTTC');
            expect(cardRequiredError).toBeDefined();
          } else if (error instanceof ValidationError) {
            expect(error.code).toBe('CARD_REQUIRED_FOR_QRIBFTTC');
          }
        }
      });

      it('should accept accountNumber with QRIBFTTA', () => {
        const config: VietQRConfig = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          accountNumber: '01234567',
          initiationMethod: '11',
        };

        expect(() => validateVietQRConfig(config)).not.toThrow();
      });

      it('should accept cardNumber with QRIBFTTC', () => {
        const config: VietQRConfig = {
          bankBin: '970422',
          serviceCode: 'QRIBFTTC',
          cardNumber: '9704220112345678',
          initiationMethod: '11',
        };

        expect(() => validateVietQRConfig(config)).not.toThrow();
      });
    });

    describe('Dynamic QR Validation', () => {
      it('should require amount for dynamic QR (initiationMethod = 12)', () => {
        const config: Partial<VietQRConfig> = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          accountNumber: '01234567',
          initiationMethod: '12', // Dynamic
          // amount missing
        };

        try {
          validateVietQRConfig(config as any);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          if (error instanceof AggregateValidationError) {
            const amountError = error.errors.find(e => e.field === 'amount');
            expect(amountError).toBeDefined();
            expect(amountError?.code).toBe('INVALID_DYNAMIC_AMOUNT');
          } else if (error instanceof ValidationError) {
            expect(error.code).toBe('INVALID_DYNAMIC_AMOUNT');
          }
        }
      });

      it('should allow empty amount for static QR (initiationMethod = 11)', () => {
        const config: VietQRConfig = {
          bankBin: '970403',
          serviceCode: 'QRIBFTTA',
          accountNumber: '01234567',
          initiationMethod: '11', // Static
          // amount not provided (user will fill in)
        };

        expect(() => validateVietQRConfig(config)).not.toThrow();
      });
    });
  });

  describe('Valid Configurations', () => {
    it('should accept valid static account transfer QR', () => {
      const config: VietQRConfig = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid static card transfer QR', () => {
      const config: VietQRConfig = {
        bankBin: '970422',
        serviceCode: 'QRIBFTTC',
        cardNumber: '9704220112345678',
        initiationMethod: '11',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid dynamic account transfer QR with amount', () => {
      const config: VietQRConfig = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12',
        amount: '180000',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid dynamic card transfer QR with amount', () => {
      const config: VietQRConfig = {
        bankBin: '970422',
        serviceCode: 'QRIBFTTC',
        cardNumber: '9704220112345678',
        initiationMethod: '12',
        amount: '250000.50',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });

    it('should accept valid config with optional fields', () => {
      const config: VietQRConfig = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12',
        amount: '180000',
        currency: '704',
        country: 'VN',
        billNumber: 'NPS6869',
        purpose: 'Payment for order',
        referenceLabel: 'ORDER123',
      };

      expect(() => validateVietQRConfig(config)).not.toThrow();
    });
  });
});
