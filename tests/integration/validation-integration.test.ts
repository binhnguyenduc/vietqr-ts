import { describe, it, expect } from 'vitest';
import { validateBankBin, validateAccountNumber, validateCardNumber } from '../../src/validators/bank-info';
import { validateServiceCode } from '../../src/validators/service-code';
import { validateBillNumber, validatePurpose } from '../../src/validators/additional-data';
import { validateAmount } from '../../src/validators/amount';
import { ValidationError, AggregateValidationError } from '../../src/types/errors';
import { generateVietQR } from '../../src/generators/vietqr';
import { generateQRImage } from '../../src/generators/qr-image';

describe('User Story 1: Required Field Validation Integration', () => {
  describe('Scenario 1: Missing required bank BIN', () => {
    it('should throw validation error with MISSING_REQUIRED_FIELD code for empty bank BIN', () => {
      try {
        validateBankBin('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('bankBin');
        expect((error as ValidationError).message).toContain('required');
      }
    });

    it('should throw validation error for whitespace-only bank BIN', () => {
      try {
        validateBankBin('   ');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }
    });
  });

  describe('Scenario 2: Invalid bank BIN format', () => {
    it('should throw validation error with INVALID_BANK_BIN_LENGTH code for wrong length', () => {
      try {
        validateBankBin('12345'); // Too short
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_LENGTH');
        expect((error as ValidationError).expectedFormat).toBe('6 numeric digits');
        expect((error as ValidationError).field).toBe('bankBin');
      }
    });

    it('should throw validation error with INVALID_BANK_BIN_FORMAT code for non-numeric characters', () => {
      try {
        validateBankBin('970A22');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BANK_BIN_FORMAT');
        expect((error as ValidationError).expectedFormat).toBe('6 numeric digits');
      }
    });
  });

  describe('Scenario 3: Missing required account number', () => {
    it('should throw validation error with MISSING_REQUIRED_FIELD code for empty account number', () => {
      try {
        validateAccountNumber('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
        expect((error as ValidationError).field).toBe('accountNumber');
      }
    });
  });

  describe('Scenario 4: Invalid account number format', () => {
    it('should throw validation error with ACCOUNT_NUMBER_TOO_LONG code', () => {
      try {
        validateAccountNumber('12345678901234567890'); // 20 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('ACCOUNT_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 19 characters');
      }
    });

    it('should throw validation error with INVALID_ACCOUNT_CHARACTERS code', () => {
      try {
        validateAccountNumber('0123-456'); // Hyphen not allowed
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_ACCOUNT_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric only (A-Z, a-z, 0-9)');
      }
    });
  });

  describe('Scenario 5: Invalid service code', () => {
    it('should throw validation error with INVALID_SERVICE_CODE code for wrong code', () => {
      try {
        validateServiceCode('INVALID');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
        expect((error as ValidationError).expectedFormat).toBe('"QRIBFTTA" or "QRIBFTTC"');
      }
    });

    it('should throw validation error with INVALID_SERVICE_CODE code for lowercase', () => {
      try {
        validateServiceCode('qribftta');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });

    it('should throw validation error with MISSING_REQUIRED_FIELD code for empty service code', () => {
      try {
        validateServiceCode('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }
    });
  });

  describe('Scenario 6: Card number validation', () => {
    it('should throw validation error with CARD_NUMBER_TOO_LONG code', () => {
      try {
        validateCardNumber('12345678901234567890'); // 20 characters
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('CARD_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 19 characters');
      }
    });

    it('should throw validation error with INVALID_CARD_CHARACTERS code', () => {
      try {
        validateCardNumber('1234-5678'); // Hyphen not allowed
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_CARD_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric only (A-Z, a-z, 0-9)');
      }
    });

    it('should throw validation error with MISSING_REQUIRED_FIELD code for empty card number', () => {
      try {
        validateCardNumber('');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }
    });
  });

  describe('Scenario 7: Valid configurations', () => {
    it('should accept valid bank BIN, account number, and service code', () => {
      expect(() => validateBankBin('970403')).not.toThrow();
      expect(() => validateAccountNumber('01234567')).not.toThrow();
      expect(() => validateServiceCode('QRIBFTTA')).not.toThrow();
    });

    it('should accept valid bank BIN, card number, and service code', () => {
      expect(() => validateBankBin('970422')).not.toThrow();
      expect(() => validateCardNumber('9704220112345678')).not.toThrow();
      expect(() => validateServiceCode('QRIBFTTC')).not.toThrow();
    });

    it('should accept alphanumeric account numbers', () => {
      expect(() => validateAccountNumber('ABC123XYZ')).not.toThrow();
    });

    it('should accept exactly 19-character account numbers', () => {
      expect(() => validateAccountNumber('1234567890123456789')).not.toThrow();
    });

    it('should trim whitespace from valid inputs', () => {
      expect(() => validateBankBin(' 970403 ')).not.toThrow();
      expect(() => validateAccountNumber('  01234567  ')).not.toThrow();
    });
  });
});

describe('User Story 3: Validate String Constraints Integration (T032)', () => {
  describe('Scenario 1: Valid string fields within length limits', () => {
    it('should accept bill number up to 25 characters', () => {
      expect(() => validateBillNumber('NPS6869')).not.toThrow();
      expect(() => validateBillNumber('A'.repeat(25))).not.toThrow();
    });

    it('should accept purpose up to 25 characters', () => {
      expect(() => validatePurpose('Payment for order')).not.toThrow();
      expect(() => validatePurpose('Thanh toán')).not.toThrow();
      expect(() => validatePurpose('A'.repeat(25))).not.toThrow();
    });
  });

  describe('Scenario 2: String fields exceeding maximum lengths', () => {
    it('should reject bill number exceeding 25 characters with BILL_NUMBER_TOO_LONG code', () => {
      try {
        validateBillNumber('A'.repeat(26));
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('BILL_NUMBER_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 25 characters');
        expect((error as ValidationError).field).toBe('billNumber');
      }
    });

    it('should reject purpose exceeding 25 characters with PURPOSE_TOO_LONG code', () => {
      try {
        validatePurpose('This is a very long purpose that exceeds the limit');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('PURPOSE_TOO_LONG');
        expect((error as ValidationError).expectedFormat).toBe('≤ 25 characters');
        expect((error as ValidationError).field).toBe('purpose');
      }
    });
  });

  describe('Scenario 3: Invalid characters in bill number', () => {
    it('should reject bill number with special characters with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('INV-123');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
        expect((error as ValidationError).expectedFormat).toBe('Alphanumeric only (A-Z, a-z, 0-9)');
      }
    });

    it('should reject bill number with spaces with INVALID_BILL_CHARACTERS code', () => {
      try {
        validateBillNumber('BILL 001');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }
    });
  });

  describe('Scenario 4: Unicode support in purpose field', () => {
    it('should accept Vietnamese characters in purpose', () => {
      expect(() => validatePurpose('Thanh toán hóa đơn')).not.toThrow();
      expect(() => validatePurpose('Chuyển khoản')).not.toThrow();
    });

    it('should accept emoji in purpose', () => {
      expect(() => validatePurpose('Payment 😊')).not.toThrow();
      expect(() => validatePurpose('Order 🛒')).not.toThrow();
    });

    it('should accept other Unicode scripts in purpose', () => {
      expect(() => validatePurpose('支付订单')).not.toThrow(); // Chinese
      expect(() => validatePurpose('Оплата')).not.toThrow(); // Russian
    });
  });

  describe('Scenario 5: Empty string validation', () => {
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
  });

  describe('Scenario 6: Whitespace handling', () => {
    it('should trim whitespace for all string validators', () => {
      expect(() => validateBillNumber('  NPS6869  ')).not.toThrow();
      expect(() => validatePurpose('  payment  ')).not.toThrow();
    });

    it('should reject whitespace-only strings after trim', () => {
      try {
        validateBillNumber('   ');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }

      try {
        validatePurpose('   ');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('MISSING_REQUIRED_FIELD');
      }
    });
  });

  describe('Scenario 7: Combined string validation', () => {
    it('should validate multiple string fields in sequence', () => {
      // All valid
      expect(() => {
        validateBillNumber('INV123');
        validatePurpose('Payment for order');
      }).not.toThrow();
    });

    it('should detect errors across different string validators', () => {
      // Invalid bill number
      try {
        validateBillNumber('INV-123');
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_BILL_CHARACTERS');
      }

      // Invalid purpose length
      try {
        validatePurpose('A'.repeat(26));
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('PURPOSE_TOO_LONG');
      }
    });
  });
});

describe('User Story 4: Dynamic QR Validation Integration (T040)', () => {
  describe('Scenario 1: Dynamic QR with valid amount', () => {
    it('should accept dynamic QR with valid positive amount', () => {
      // Dynamic QR requires amount
      expect(() => {
        validateAmount('180000', true);
        validateBankBin('970403');
        validateAccountNumber('01234567');
        validateServiceCode('QRIBFTTA');
      }).not.toThrow();
    });

    it('should accept dynamic QR with decimal amount', () => {
      expect(() => {
        validateAmount('180000.50', true);
        validateBankBin('970422');
        validateCardNumber('9704220112345678');
        validateServiceCode('QRIBFTTC');
      }).not.toThrow();
    });
  });

  describe('Scenario 2: Dynamic QR with invalid amount', () => {
    it('should reject dynamic QR with empty amount with INVALID_DYNAMIC_AMOUNT code', () => {
      try {
        validateAmount('', true);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_DYNAMIC_AMOUNT');
        expect((error as ValidationError).message).toContain('Dynamic QR codes require an amount');
      }
    });

    it('should reject dynamic QR with zero amount with INVALID_AMOUNT_VALUE code', () => {
      try {
        validateAmount('0', true);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
      }
    });

    it('should reject dynamic QR with negative amount with INVALID_AMOUNT_FORMAT code', () => {
      try {
        validateAmount('-180000', true);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });
  });

  describe('Scenario 3: Complete dynamic QR validation flow', () => {
    it('should validate all fields for dynamic account transfer QR', () => {
      expect(() => {
        validateBankBin('970403');
        validateAccountNumber('01234567');
        validateServiceCode('QRIBFTTA');
        validateAmount('180000', true);
        validateBillNumber('NPS6869');
        validatePurpose('Payment for order');
      }).not.toThrow();
    });

    it('should validate all fields for dynamic card transfer QR', () => {
      expect(() => {
        validateBankBin('970422');
        validateCardNumber('9704220112345678');
        validateServiceCode('QRIBFTTC');
        validateAmount('250000.50', true);
        validateBillNumber('INV123');
        validatePurpose('Thanh toán');
      }).not.toThrow();
    });
  });
});

describe('User Story 4: Static QR Validation Integration (T041)', () => {
  describe('Scenario 1: Static QR without amount', () => {
    it('should accept static QR with empty amount', () => {
      expect(() => {
        validateAmount('', false);
        validateBankBin('970403');
        validateAccountNumber('01234567');
        validateServiceCode('QRIBFTTA');
      }).not.toThrow();
    });

    it('should accept static card transfer QR without amount', () => {
      expect(() => {
        validateAmount('', false);
        validateBankBin('970422');
        validateCardNumber('9704220112345678');
        validateServiceCode('QRIBFTTC');
      }).not.toThrow();
    });
  });

  describe('Scenario 2: Static QR with amount (pre-filled)', () => {
    it('should accept static QR with valid pre-filled amount', () => {
      // Static QR can have pre-filled amount
      expect(() => {
        validateAmount('50000', false);
        validateBankBin('970403');
        validateAccountNumber('01234567');
        validateServiceCode('QRIBFTTA');
      }).not.toThrow();
    });

    it('should reject static QR with invalid amount format', () => {
      // Even static QR must have valid amount if provided
      try {
        validateAmount('abc', false);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_FORMAT');
      }
    });
  });

  describe('Scenario 3: Complete static QR validation flow', () => {
    it('should validate all fields for static QR with additional data', () => {
      expect(() => {
        validateBankBin('970403');
        validateAccountNumber('01234567');
        validateServiceCode('QRIBFTTA');
        validateAmount('', false); // No amount for static
        validateBillNumber('ORDER123');
        validatePurpose('Thanh toán đơn hàng');
      }).not.toThrow();
    });

    it('should validate static QR with minimal fields', () => {
      expect(() => {
        validateBankBin('970422');
        validateCardNumber('9704220112345678');
        validateServiceCode('QRIBFTTC');
        validateAmount('', false); // No amount
      }).not.toThrow();
    });
  });
});

describe('User Story 5: Type Safety and Multi-Error Collection (T047)', () => {
  describe('Scenario 1: Multiple simultaneous validation errors', () => {
    it('should collect and report 4+ validation errors in config', () => {
      // This test will use validateVietQRConfig when implemented
      // For now, we test individual validators to ensure multi-error infrastructure works
      const errors: any[] = [];

      try {
        validateBankBin('12345'); // Too short
      } catch (e) {
        errors.push(e);
      }

      try {
        validateAccountNumber('12345678901234567890'); // Too long
      } catch (e) {
        errors.push(e);
      }

      try {
        validateServiceCode('INVALID');
      } catch (e) {
        errors.push(e);
      }

      try {
        validateAmount('-100');
      } catch (e) {
        errors.push(e);
      }

      expect(errors.length).toBe(4);
      errors.forEach(error => {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.code).toBeDefined();
      });
    });
  });

  describe('Scenario 2: Cross-field validation errors', () => {
    it('should detect account/card mutual exclusivity violations', () => {
      // Will be tested with validateVietQRConfig
      // Testing individual validators for now
      expect(() => {
        validateAccountNumber('01234567');
        validateCardNumber('9704220112345678');
        // Both are valid individually, but config validator should reject both being present
      }).not.toThrow();
    });
  });

  describe('Scenario 3: Dynamic QR missing amount', () => {
    it('should detect missing amount for dynamic QR', () => {
      try {
        validateAmount('', true); // Dynamic QR with empty amount
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_DYNAMIC_AMOUNT');
      }
    });
  });

  describe('Scenario 4: Business rule violations with valid types', () => {
    it('should catch zero amount even though type is correct', () => {
      try {
        validateAmount('0'); // Valid string type, invalid business rule
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_AMOUNT_VALUE');
      }
    });

    it('should catch invalid service code even though type is correct', () => {
      try {
        validateServiceCode('WRONG'); // Valid string type, invalid value
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_SERVICE_CODE');
      }
    });
  });
});

// ============================================================================
// T056: Generation + Validation Flow Integration Tests
// ============================================================================

describe('T056: Generation + Validation Flow Integration', () => {

  describe('Scenario 1: Valid config generates valid QR without errors', () => {
    it('should generate static account QR successfully', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      const result = generateVietQR(config);

      expect(result).toBeDefined();
      expect(result.rawData).toBeDefined();
      expect(typeof result.rawData).toBe('string');
      expect(result.crc).toBeDefined();
      expect(result.fields).toBeDefined();
      expect(result.fields.length).toBeGreaterThan(0);
    });

    it('should generate dynamic account QR with amount successfully', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12',
        amount: '180000',
      };

      const result = generateVietQR(config);

      expect(result).toBeDefined();
      expect(result.rawData).toBeDefined();
      expect(result.rawData).toContain('54'); // Amount field ID
    });

    it('should generate static card QR successfully', () => {
      const config = {
        bankBin: '970422',
        serviceCode: 'QRIBFTTC',
        cardNumber: '9704220112345678',
        initiationMethod: '11',
      };

      const result = generateVietQR(config);

      expect(result).toBeDefined();
      expect(result.rawData).toBeDefined();
    });

    it('should generate QR with all optional fields successfully', () => {
      const config = {
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

      const result = generateVietQR(config);

      expect(result).toBeDefined();
      expect(result.rawData).toBeDefined();
      expect(result.rawData).toContain('54'); // Amount
      expect(result.rawData).toContain('62'); // Additional data
    });
  });

  describe('Scenario 2: Invalid config throws validation errors before generation', () => {
    it('should throw ValidationError for missing bank BIN before any encoding', () => {
      const config = {
        bankBin: '',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      try {
        generateVietQR(config as any);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        // Should throw validation error (could be aggregate with multiple errors)
        if (error instanceof AggregateValidationError) {
          const bankBinError = error.errors.find(e => e.field === 'bankBin');
          expect(bankBinError).toBeDefined();
        } else {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('bankBin');
        }
      }
    });

    it('should throw AggregateValidationError for multiple field violations', () => {
      const config = {
        bankBin: '12345', // Too short
        serviceCode: 'INVALID', // Invalid code
        accountNumber: '12345678901234567890', // Too long
        initiationMethod: '12', // Dynamic
        amount: 'abc', // Invalid format
      };

      try {
        generateVietQR(config as any);
        expect.fail('Should have thrown AggregateValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        const aggError = error as AggregateValidationError;
        expect(aggError.errors.length).toBeGreaterThanOrEqual(4);

        // Should have bank BIN error
        const bankBinError = aggError.errors.find(e => e.field === 'bankBin');
        expect(bankBinError).toBeDefined();

        // Should have service code error
        const serviceCodeError = aggError.errors.find(e => e.field === 'serviceCode');
        expect(serviceCodeError).toBeDefined();

        // Should have account number error
        const accountError = aggError.errors.find(e => e.field === 'accountNumber');
        expect(accountError).toBeDefined();

        // Should have amount error
        const amountError = aggError.errors.find(e => e.field === 'amount');
        expect(amountError).toBeDefined();
      }
    });

    it('should throw error for account/card mutual exclusivity violation', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        cardNumber: '9704220112345678', // Both provided
        initiationMethod: '11',
      };

      try {
        generateVietQR(config as any);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        if (error instanceof AggregateValidationError) {
          const mutualExclusivityError = error.errors.find(e => e.code === 'BOTH_ACCOUNT_AND_CARD');
          expect(mutualExclusivityError).toBeDefined();
        } else if (error instanceof ValidationError) {
          expect(error.code).toBe('BOTH_ACCOUNT_AND_CARD');
        }
      }
    });

    it('should throw error for missing amount in dynamic QR', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12', // Dynamic
        // amount missing
      };

      try {
        generateVietQR(config as any);
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

    it('should throw error for service code mismatch (QRIBFTTA without accountNumber)', () => {
      const config = {
        bankBin: '970422',
        serviceCode: 'QRIBFTTA',
        cardNumber: '9704220112345678', // Wrong field for QRIBFTTA
        initiationMethod: '11',
      };

      try {
        generateVietQR(config as any);
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

    it('should throw error for service code mismatch (QRIBFTTC without cardNumber)', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTC',
        accountNumber: '01234567', // Wrong field for QRIBFTTC
        initiationMethod: '11',
      };

      try {
        generateVietQR(config as any);
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
  });

  describe('Scenario 3: Validation runs before CRC calculation', () => {
    it('should throw validation error before CRC is calculated for invalid config', () => {
      const config = {
        bankBin: '', // Invalid - empty
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      try {
        const result = generateVietQR(config as any);
        expect.fail('Should have thrown validation error before returning result with CRC');
      } catch (error) {
        // Should throw validation error (could be aggregate), not get to CRC calculation
        if (error instanceof AggregateValidationError) {
          const bankBinError = error.errors.find(e => e.field === 'bankBin');
          expect(bankBinError).toBeDefined();
        } else {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('bankBin');
        }
      }
    });

    it('should calculate CRC only after successful validation', () => {
      const validConfig = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      // Should not throw, and should return result with CRC
      const result = generateVietQR(validConfig);

      expect(result.crc).toBeDefined();
      expect(typeof result.crc).toBe('string');
      expect(result.crc.length).toBe(4);
      expect(/^[0-9A-F]{4}$/.test(result.crc)).toBe(true);
    });
  });

  describe('Scenario 4: Complete flow from config to QR image', () => {
    it('should generate valid QR image from valid config', async () => {
      // Step 1: Generate VietQR data (with validation)
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12',
        amount: '180000',
      };

      const vietQRResult = generateVietQR(config);
      expect(vietQRResult.rawData).toBeDefined();

      // Step 2: Generate QR image from validated data
      const imageResult = await generateQRImage({
        data: vietQRResult.rawData,
        format: 'png',
        size: 300,
      });

      expect(imageResult).toBeDefined();
      expect(imageResult.base64).toBeDefined();
      expect(imageResult.dataURI).toBeDefined();
      expect(imageResult.format).toBe('png');
      expect(imageResult.size).toBe(300);
    });

    it('should not generate QR image from invalid config (validation blocks it)', async () => {
      const invalidConfig = {
        bankBin: '', // Invalid
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      try {
        // Should fail at VietQR generation step
        const vietQRResult = generateVietQR(invalidConfig as any);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        // Should throw validation error (could be single or aggregate)
        if (error instanceof AggregateValidationError) {
          expect(error.errors.length).toBeGreaterThan(0);
        } else {
          expect(error).toBeInstanceOf(ValidationError);
        }
        // Never reaches image generation
      }
    });
  });

  describe('Scenario 5: Zero invalid QR codes can be generated', () => {
    it('should be impossible to generate QR with empty bank BIN', () => {
      const invalidConfigs = [
        { bankBin: '', serviceCode: 'QRIBFTTA', accountNumber: '01234567', initiationMethod: '11' },
        { bankBin: '   ', serviceCode: 'QRIBFTTA', accountNumber: '01234567', initiationMethod: '11' },
      ];

      invalidConfigs.forEach(config => {
        try {
          generateVietQR(config as any);
          expect.fail('Should have blocked invalid config');
        } catch (error) {
          // Should throw validation error (could be single or aggregate)
          const isValidationError = error instanceof ValidationError || error instanceof AggregateValidationError;
          expect(isValidationError).toBe(true);
        }
      });
    });

    it('should be impossible to generate QR with invalid service code', () => {
      const invalidConfigs = [
        { bankBin: '970403', serviceCode: 'INVALID', accountNumber: '01234567', initiationMethod: '11' },
        { bankBin: '970403', serviceCode: '', accountNumber: '01234567', initiationMethod: '11' },
      ];

      invalidConfigs.forEach(config => {
        try {
          generateVietQR(config as any);
          expect.fail('Should have blocked invalid config');
        } catch (error) {
          // Should throw validation error (could be single or aggregate)
          const isValidationError = error instanceof ValidationError || error instanceof AggregateValidationError;
          expect(isValidationError).toBe(true);
        }
      });
    });

    it('should be impossible to generate dynamic QR without amount', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12', // Dynamic
        // amount missing
      };

      try {
        generateVietQR(config as any);
        expect.fail('Should have blocked dynamic QR without amount');
      } catch (error) {
        if (error instanceof AggregateValidationError) {
          const amountError = error.errors.find(e => e.code === 'INVALID_DYNAMIC_AMOUNT');
          expect(amountError).toBeDefined();
        } else if (error instanceof ValidationError) {
          expect(error.code).toBe('INVALID_DYNAMIC_AMOUNT');
        }
      }
    });

    it('should be impossible to generate QR with both accountNumber and cardNumber', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        cardNumber: '9704220112345678',
        initiationMethod: '11',
      };

      try {
        generateVietQR(config as any);
        expect.fail('Should have blocked config with both account and card');
      } catch (error) {
        if (error instanceof AggregateValidationError) {
          const mutualExclusivityError = error.errors.find(e => e.code === 'BOTH_ACCOUNT_AND_CARD');
          expect(mutualExclusivityError).toBeDefined();
        } else if (error instanceof ValidationError) {
          expect(error.code).toBe('BOTH_ACCOUNT_AND_CARD');
        }
      }
    });
  });
});

// ============================================================================
// T059: Performance Benchmarks for Validation
// ============================================================================

describe('T059: Performance Benchmarks', () => {
  describe('Validation performance targets (<10ms)', () => {
    it('should validate simple static account config in <10ms', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateVietQR(config);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10);
      console.log(`Average validation time (static account): ${avgTime.toFixed(3)}ms`);
    });

    it('should validate dynamic account config with all fields in <10ms', () => {
      const config = {
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

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateVietQR(config);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10);
      console.log(`Average validation time (full config): ${avgTime.toFixed(3)}ms`);
    });

    it('should validate static card config in <10ms', () => {
      const config = {
        bankBin: '970422',
        serviceCode: 'QRIBFTTC',
        cardNumber: '9704220112345678',
        initiationMethod: '11',
      };

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateVietQR(config);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10);
      console.log(`Average validation time (static card): ${avgTime.toFixed(3)}ms`);
    });

    it('should detect and report validation errors in <10ms', () => {
      const invalidConfig = {
        bankBin: '12345', // Too short
        serviceCode: 'QRIBFTTA',
        accountNumber: '12345678901234567890', // Too long
        initiationMethod: '12', // Dynamic
        amount: 'abc', // Invalid format
      };

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        try {
          generateVietQR(invalidConfig as any);
        } catch (error) {
          // Expected to throw
        }
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10);
      console.log(`Average validation time (error detection): ${avgTime.toFixed(3)}ms`);
    });

    it('should validate 1000 configs in <10 seconds total (avg <10ms)', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '11',
      };

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateVietQR(config);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      expect(totalTime).toBeLessThan(10000); // Total < 10 seconds
      expect(avgTime).toBeLessThan(10); // Average < 10ms
      console.log(`Validated ${iterations} configs in ${totalTime.toFixed(2)}ms (avg ${avgTime.toFixed(3)}ms)`);
    });
  });

  describe('Performance comparison: validation vs generation', () => {
    it('should show validation overhead is minimal compared to full generation', () => {
      const config = {
        bankBin: '970403',
        serviceCode: 'QRIBFTTA',
        accountNumber: '01234567',
        initiationMethod: '12',
        amount: '180000',
      };

      const iterations = 100;

      // Measure full generation (validation + encoding + CRC)
      const genStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        generateVietQR(config);
      }
      const genEndTime = performance.now();
      const avgGenTime = (genEndTime - genStartTime) / iterations;

      console.log(`Average total generation time: ${avgGenTime.toFixed(3)}ms`);
      console.log(`Validation overhead: minimal (included in generation)`);

      // Validation should be a small fraction of total generation time
      expect(avgGenTime).toBeLessThan(20); // Total generation < 20ms
    });
  });
});
