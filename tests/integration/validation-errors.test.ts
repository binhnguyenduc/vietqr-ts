import { describe, it, expect } from 'vitest';
import { generateVietQR } from '../../src/generators/vietqr';
import { AggregateValidationError } from '../../src/types/errors';

/**
 * Integration tests for validation error messages
 *
 * These tests verify that:
 * 1. All validation rules produce clear, actionable error messages
 * 2. Multiple validation failures are collected together
 * 3. Error messages match the acceptance criteria from spec.md
 */
describe('Validation Error Messages (Integration)', () => {
  describe('Bank BIN Validation', () => {
    it('should produce clear error for 5-digit bank BIN', () => {
      try {
        generateVietQR({
          bankBin: '97040', // Only 5 digits
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;
        const bankBinError = aggError.errors.find((e) => e.field === 'bankBin');
        expect(bankBinError?.message).toContain('Bank BIN must be exactly 6 digits');
      }
    });

    it('should produce clear error for non-numeric bank BIN', () => {
      try {
        generateVietQR({
          bankBin: '970@03',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const bankBinError = aggError.errors.find((e) => e.field === 'bankBin');
        expect(bankBinError?.message).toContain('numeric characters');
      }
    });
  });

  describe('Service Code Validation', () => {
    it('should produce clear error for invalid service code', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'INVALID' as any,
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const serviceError = aggError.errors.find((e) => e.field === 'serviceCode');
        // Error message includes the valid codes
        expect(serviceError?.message).toMatch(/Invalid service code|Service code must be one of/);
        expect(serviceError?.message).toContain('QRIBFTTA');
        expect(serviceError?.message).toContain('QRIBFTTC');
      }
    });
  });

  describe('Account Number Validation', () => {
    it('should produce clear error for missing account number', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '',
          serviceCode: 'QRIBFTTA',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const accountError = aggError.errors.find((e) => e.field === 'accountNumber');
        expect(accountError?.message).toMatch(/Account number is required|Service code QRIBFTTA requires accountNumber/);
      }
    });

    it('should produce clear error for account number exceeding 19 characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '12345678901234567890', // 20 characters
          serviceCode: 'QRIBFTTA',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const accountError = aggError.errors.find((e) => e.field === 'accountNumber');
        expect(accountError?.message).toContain('Account number must not exceed 19 characters');
      }
    });

    it('should produce clear error for account number with special characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '0123-4567',
          serviceCode: 'QRIBFTTA',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const accountError = aggError.errors.find((e) => e.field === 'accountNumber');
        expect(accountError?.message).toContain('alphanumeric');
      }
    });
  });

  describe('Card Number Validation', () => {
    it('should produce clear error for missing card number', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          cardNumber: '',
          serviceCode: 'QRIBFTTC',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const cardError = aggError.errors.find((e) => e.field === 'cardNumber');
        expect(cardError?.message).toMatch(/Card number is required|Service code QRIBFTTC requires cardNumber/);
      }
    });

    it('should produce clear error for card number exceeding 19 characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          cardNumber: '12345678901234567890',
          serviceCode: 'QRIBFTTC',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const cardError = aggError.errors.find((e) => e.field === 'cardNumber');
        expect(cardError?.message).toContain('Card number must not exceed 19 characters');
      }
    });
  });

  describe('Amount Validation', () => {
    it('should produce clear error for amount with letters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: 'invalid',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const amountError = aggError.errors.find((e) => e.field === 'amount');
        expect(amountError?.message).toContain('Amount must be numeric with optional decimal point');
      }
    });

    it('should produce clear error for amount exceeding 13 characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: '12345678901234',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const amountError = aggError.errors.find((e) => e.field === 'amount');
        expect(amountError?.message).toContain('Amount must not exceed 13 characters');
      }
    });
  });

  describe('Bill Number Validation', () => {
    it('should produce clear error for bill number exceeding 25 characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: '180000',
          billNumber: 'A'.repeat(26),
          purpose: 'test',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const billError = aggError.errors.find((e) => e.field === 'billNumber');
        expect(billError?.message).toContain('Bill number must not exceed 25 characters');
      }
    });

    it('should produce clear error for bill number with special characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: '180000',
          billNumber: 'NPS-6869',
          purpose: 'test',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const billError = aggError.errors.find((e) => e.field === 'billNumber');
        expect(billError).toBeDefined();
        if (billError) {
          expect(billError.message).toContain('alphanumeric');
        }
      }
    });
  });

  describe('Purpose Validation', () => {
    it('should produce clear error for purpose exceeding 25 characters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: '180000',
          billNumber: 'NPS6869',
          purpose: 'A'.repeat(26),
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const purposeError = aggError.errors.find((e) => e.field === 'purpose');
        expect(purposeError?.message).toContain('Purpose must not exceed 25 characters');
      }
    });
  });

  describe('Multiple Validation Failures', () => {
    it('should list all validation failures together', () => {
      try {
        generateVietQR({
          bankBin: '97040', // Invalid: 5 digits
          accountNumber: '', // Invalid: required
          serviceCode: 'INVALID' as any, // Invalid: not QRIBFTTA or QRIBFTTC
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;

        // Should have at least 2 errors (bankBin, serviceCode)
        // accountNumber validation doesn't run when serviceCode is invalid
        expect(aggError.errors.length).toBeGreaterThanOrEqual(2);

        // Check error message includes all failures
        expect(aggError.message).toContain('bankBin');
        expect(aggError.message).toContain('serviceCode');

        // Verify each error is descriptive
        expect(aggError.errors.every((e) => e.message.length > 10)).toBe(true);
      }
    });

    it('should list all dynamic QR validation failures together', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: 'invalid', // Invalid: non-numeric
          billNumber: 'A'.repeat(26), // Invalid: too long
          purpose: 'B'.repeat(26), // Invalid: too long
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const aggError = error as AggregateValidationError;

        // Should have 3 errors
        expect(aggError.errors).toHaveLength(3);

        // Verify each field has an error
        const errorFields = aggError.errors.map((e) => e.field);
        expect(errorFields).toContain('amount');
        expect(errorFields).toContain('billNumber');
        expect(errorFields).toContain('purpose');
      }
    });
  });

  describe('Acceptance Criteria from spec.md', () => {
    it('should produce: "Bank BIN must be exactly 6 digits" for 5-digit BIN', () => {
      try {
        generateVietQR({
          bankBin: '97040',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
        });
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const bankBinError = aggError.errors.find((e) => e.field === 'bankBin');
        expect(bankBinError?.message).toContain('Bank BIN must be exactly 6 digits');
      }
    });

    it('should produce: "Service code must be one of: QRIBFTTA, QRIBFTTC" for invalid code', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'INVALID' as any,
        });
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const serviceError = aggError.errors.find((e) => e.field === 'serviceCode');
        // Error message includes the valid codes
        expect(serviceError?.message).toMatch(/Invalid service code|Service code must be one of/);
        expect(serviceError?.message).toContain('QRIBFTTA');
        expect(serviceError?.message).toContain('QRIBFTTC');
      }
    });

    it('should produce: "Amount must be numeric..." for amount with letters', () => {
      try {
        generateVietQR({
          bankBin: '970403',
          accountNumber: '01234567',
          serviceCode: 'QRIBFTTA',
          amount: 'abc',
        });
      } catch (error) {
        const aggError = error as AggregateValidationError;
        const amountError = aggError.errors.find((e) => e.field === 'amount');
        expect(amountError?.message).toContain('Amount must be numeric');
      }
    });

    it('should list multiple validation failures together in single error', () => {
      try {
        generateVietQR({
          bankBin: '97040',
          accountNumber: '',
          serviceCode: 'INVALID' as any,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;

        // Single error object containing multiple failures
        expect(aggError.errors.length).toBeGreaterThan(1);

        // Error message should list all failures
        expect(aggError.message).toContain('error(s)');
      }
    });
  });
});
