import { describe, it, expect } from 'vitest';
import { validateBankBin, validateAccountNumber, validateCardNumber } from '../../../src/validators/bank-info';
import { validateServiceCode } from '../../../src/validators/service-code';
import { validateAmount } from '../../../src/validators/amount';
import { validateBillNumber, validatePurpose, validateReferenceLabel } from '../../../src/validators/additional-data';
import { ValidationError } from '../../../src/types/errors';

// ============================================================================
// T061: Edge Case Tests - undefined vs null vs empty string
// ============================================================================

describe('Edge Cases: Type Coercion and Nullish Values', () => {
  describe('Bank BIN edge cases', () => {
    it('should reject undefined bank BIN', () => {
      expect(() => validateBankBin(undefined as any)).toThrow(ValidationError);
    });

    it('should reject null bank BIN', () => {
      expect(() => validateBankBin(null as any)).toThrow(ValidationError);
    });

    it('should reject empty string bank BIN', () => {
      expect(() => validateBankBin('')).toThrow(ValidationError);
    });

    it('should reject bank BIN with only whitespace', () => {
      expect(() => validateBankBin('   ')).toThrow(ValidationError);
    });

    it('should handle bank BIN with Unicode whitespace characters', () => {
      // Unicode whitespace should be trimmed - valid after trim
      // \u00A0 (non-breaking space) around valid BIN
      expect(() => validateBankBin('\u00A0970403\u00A0')).not.toThrow();

      // Unicode whitespace only - invalid (empty after trim or not 6 digits)
      expect(() => validateBankBin('\u2003\u2003')).toThrow(ValidationError);
      expect(() => validateBankBin('\u3000\u3000\u3000\u3000\u3000\u3000')).toThrow(ValidationError);
    });

    it('should handle bank BIN with leading/trailing standard whitespace', () => {
      // Should trim and accept valid BIN
      expect(() => validateBankBin('  970403  ')).not.toThrow();
    });
  });

  describe('Service Code edge cases', () => {
    it('should reject undefined service code', () => {
      expect(() => validateServiceCode(undefined as any)).toThrow(ValidationError);
    });

    it('should reject null service code', () => {
      expect(() => validateServiceCode(null as any)).toThrow(ValidationError);
    });

    it('should reject empty string service code', () => {
      expect(() => validateServiceCode('')).toThrow(ValidationError);
    });

    it('should reject service code with whitespace padding', () => {
      expect(() => validateServiceCode('  QRIBFTTA  ')).toThrow(ValidationError);
    });
  });

  describe('Account Number edge cases', () => {
    it('should reject undefined account number', () => {
      expect(() => validateAccountNumber(undefined as any)).toThrow(ValidationError);
    });

    it('should reject null account number', () => {
      expect(() => validateAccountNumber(null as any)).toThrow(ValidationError);
    });

    it('should reject empty string account number', () => {
      expect(() => validateAccountNumber('')).toThrow(ValidationError);
    });

    it('should handle account number with leading/trailing whitespace', () => {
      expect(() => validateAccountNumber('  01234567  ')).not.toThrow();
    });

    it('should handle account number with Unicode whitespace', () => {
      // Unicode whitespace should be trimmed - valid after trim
      expect(() => validateAccountNumber('\u00A001234567\u00A0')).not.toThrow();
    });
  });

  describe('Amount edge cases', () => {
    it('should reject undefined amount (when required for dynamic QR)', () => {
      expect(() => validateAmount(undefined as any, true)).toThrow(ValidationError);
    });

    it('should reject null amount (when required for dynamic QR)', () => {
      expect(() => validateAmount(null as any, true)).toThrow(ValidationError);
    });

    it('should handle empty amount for static QR (optional)', () => {
      expect(() => validateAmount('', false)).not.toThrow();
    });

    it('should handle amount with leading/trailing whitespace', () => {
      expect(() => validateAmount('  180000  ', false)).not.toThrow();
    });

    it('should reject amount with only whitespace (when required)', () => {
      expect(() => validateAmount('   ', true)).toThrow(ValidationError);
    });

    it('should handle amount with Unicode whitespace characters', () => {
      // Unicode whitespace should be trimmed - valid after trim
      expect(() => validateAmount('\u00A0180000\u00A0', false)).not.toThrow();
    });
  });
});

// ============================================================================
// T061: Edge Case Tests - Special Characters and Unicode
// ============================================================================

describe('Edge Cases: Special Characters and Unicode', () => {
  describe('Bank BIN special characters', () => {
    it('should reject bank BIN with special characters', () => {
      expect(() => validateBankBin('970-403')).toThrow(ValidationError);
      expect(() => validateBankBin('970.403')).toThrow(ValidationError);
      expect(() => validateBankBin('970_403')).toThrow(ValidationError);
      expect(() => validateBankBin('970 403')).toThrow(ValidationError);
    });

    it('should reject bank BIN with Unicode digits (not ASCII)', () => {
      // Arabic-Indic digits (٩٧٠٤٠٣)
      expect(() => validateBankBin('\u0669\u0667\u0660\u0664\u0660\u0663')).toThrow(ValidationError);
      // Devanagari digits (९७०४०३)
      expect(() => validateBankBin('\u096F\u096D\u0966\u096A\u0966\u0969')).toThrow(ValidationError);
    });

    it('should reject bank BIN with emoji digits', () => {
      expect(() => validateBankBin('9️⃣7️⃣0️⃣4️⃣0️⃣3️⃣')).toThrow(ValidationError);
    });
  });

  describe('Account/Card Number special characters', () => {
    it('should reject account number with special characters', () => {
      expect(() => validateAccountNumber('0123-4567')).toThrow(ValidationError);
      expect(() => validateAccountNumber('0123 4567')).toThrow(ValidationError);
      expect(() => validateAccountNumber('0123.4567')).toThrow(ValidationError);
    });

    it('should accept account number with valid alphanumeric characters', () => {
      expect(() => validateAccountNumber('ABC123XYZ')).not.toThrow();
      expect(() => validateAccountNumber('0123456789')).not.toThrow();
    });

    it('should reject account number with Unicode letters (non-ASCII)', () => {
      expect(() => validateAccountNumber('АБВ123')).toThrow(ValidationError); // Cyrillic
      expect(() => validateAccountNumber('中文123')).toThrow(ValidationError); // Chinese
    });

    it('should reject card number with hyphens or spaces', () => {
      expect(() => validateCardNumber('9704-2201-1234-5678')).toThrow(ValidationError);
      expect(() => validateCardNumber('9704 2201 1234 5678')).toThrow(ValidationError);
    });
  });

  describe('Amount special characters', () => {
    it('should reject amount with thousand separators', () => {
      expect(() => validateAmount('180,000', false)).toThrow(ValidationError);
      // Note: '180.000' is a valid decimal number (180 with 3 decimal places), not a thousand separator
    });

    it('should reject amount with currency symbols', () => {
      expect(() => validateAmount('$180000', false)).toThrow(ValidationError);
      expect(() => validateAmount('180000đ', false)).toThrow(ValidationError);
      expect(() => validateAmount('¥180000', false)).toThrow(ValidationError);
    });

    it('should reject amount with spaces or underscores', () => {
      expect(() => validateAmount('180 000', false)).toThrow(ValidationError);
      expect(() => validateAmount('180_000', false)).toThrow(ValidationError);
    });

    it('should accept valid decimal amounts', () => {
      expect(() => validateAmount('180000.50', false)).not.toThrow();
      expect(() => validateAmount('180000.00', false)).not.toThrow();
      expect(() => validateAmount('0.99', false)).not.toThrow();
    });
  });

  describe('Text field special characters', () => {
    it('should handle billNumber with special characters (if allowed by spec)', () => {
      // billNumber allows alphanumeric
      expect(() => validateBillNumber('NPS-6869')).not.toThrow();
      expect(() => validateBillNumber('NPS_6869')).not.toThrow();
    });

    it('should handle purpose with Unicode characters', () => {
      expect(() => validatePurpose('Thanh toán đơn hàng')).not.toThrow(); // Vietnamese
      expect(() => validatePurpose('支付订单')).not.toThrow(); // Chinese
    });

    it('should reject purpose with newline characters', () => {
      expect(() => validatePurpose('Line1\nLine2')).toThrow(ValidationError);
      expect(() => validatePurpose('Line1\rLine2')).toThrow(ValidationError);
      expect(() => validatePurpose('Line1\r\nLine2')).toThrow(ValidationError);
    });

    it('should reject purpose with tab characters', () => {
      expect(() => validatePurpose('Text\tWith\tTabs')).toThrow(ValidationError);
    });
  });
});

// ============================================================================
// T061: Edge Case Tests - Boundary Conditions
// ============================================================================

describe('Edge Cases: Boundary Conditions', () => {
  describe('Length boundaries', () => {
    it('should accept account number at exact max length (19 chars)', () => {
      expect(() => validateAccountNumber('1234567890123456789')).not.toThrow();
    });

    it('should reject account number exceeding max length (20 chars)', () => {
      expect(() => validateAccountNumber('12345678901234567890')).toThrow(ValidationError);
    });

    it('should accept card number at exact max length (19 chars)', () => {
      expect(() => validateCardNumber('1234567890123456789')).not.toThrow();
    });

    it('should reject card number exceeding max length (20 chars)', () => {
      expect(() => validateCardNumber('12345678901234567890')).toThrow(ValidationError);
    });

    it('should accept amount at exact max length (13 chars)', () => {
      expect(() => validateAmount('9999999999.99', false)).not.toThrow();
    });

    it('should reject amount exceeding max length (14 chars)', () => {
      expect(() => validateAmount('99999999999.99', false)).toThrow(ValidationError);
    });

    it('should accept billNumber at exact max length (25 chars)', () => {
      expect(() => validateBillNumber('1234567890123456789012345')).not.toThrow();
    });

    it('should reject billNumber exceeding max length (26 chars)', () => {
      expect(() => validateBillNumber('12345678901234567890123456')).toThrow(ValidationError);
    });

    it('should accept purpose at exact max length (25 chars)', () => {
      expect(() => validatePurpose('1234567890123456789012345')).not.toThrow();
    });

    it('should reject purpose exceeding max length (26 chars)', () => {
      expect(() => validatePurpose('12345678901234567890123456')).toThrow(ValidationError);
    });
  });

  describe('Numeric boundaries', () => {
    it('should reject zero amount (must be positive)', () => {
      // Per NAPAS spec, amounts must be positive (> 0)
      expect(() => validateAmount('0', false)).toThrow(ValidationError);
      expect(() => validateAmount('0.00', false)).toThrow(ValidationError);
    });

    it('should reject negative amounts', () => {
      expect(() => validateAmount('-100', false)).toThrow(ValidationError);
      expect(() => validateAmount('-0.01', false)).toThrow(ValidationError);
    });

    it('should accept very small positive amounts', () => {
      expect(() => validateAmount('0.01', false)).not.toThrow();
      expect(() => validateAmount('0.001', false)).not.toThrow();
    });

    it('should accept very large amounts (within length limit)', () => {
      expect(() => validateAmount('9999999999', false)).not.toThrow();
      expect(() => validateAmount('999999999.99', false)).not.toThrow();
    });
  });
});

// ============================================================================
// T062: Optional Field Validation Edge Cases
// ============================================================================

describe('Edge Cases: Optional Field Validation', () => {
  describe('Optional fields when provided but invalid', () => {
    it('should reject invalid billNumber when provided', () => {
      // Even though optional, if provided must be valid
      expect(() => validateBillNumber('12345678901234567890123456')).toThrow(ValidationError);
    });

    it('should reject invalid purpose when provided', () => {
      expect(() => validatePurpose('12345678901234567890123456')).toThrow(ValidationError);
    });

    it('should reject invalid referenceLabel when provided', () => {
      expect(() => validateReferenceLabel('12345678901234567890123456')).toThrow(ValidationError);
    });

    it('should reject invalid amount for static QR when provided', () => {
      expect(() => validateAmount('invalid', false)).toThrow(ValidationError);
      expect(() => validateAmount('abc123', false)).toThrow(ValidationError);
    });
  });

  describe('Optional fields with edge case values', () => {
    it('should handle billNumber with only numbers', () => {
      expect(() => validateBillNumber('1234567890')).not.toThrow();
    });

    it('should handle billNumber with only letters', () => {
      expect(() => validateBillNumber('ABCDEFGHIJ')).not.toThrow();
    });

    it('should handle billNumber with mixed alphanumeric', () => {
      expect(() => validateBillNumber('ABC123XYZ789')).not.toThrow();
    });

    it('should handle purpose with minimum length (1 char)', () => {
      expect(() => validatePurpose('A')).not.toThrow();
    });

    it('should handle referenceLabel with minimum length (1 char)', () => {
      expect(() => validateReferenceLabel('A')).not.toThrow();
    });

    it('should handle amount with very small values', () => {
      expect(() => validateAmount('0.001', false)).not.toThrow();
      expect(() => validateAmount('0.0001', false)).not.toThrow();
    });

    it('should handle amount with many decimal places', () => {
      expect(() => validateAmount('100.123456', false)).not.toThrow();
    });
  });

  describe('Optional fields with whitespace variations', () => {
    it('should handle billNumber with leading/trailing whitespace', () => {
      expect(() => validateBillNumber('  NPS6869  ')).not.toThrow();
    });

    it('should handle purpose with leading/trailing whitespace', () => {
      expect(() => validatePurpose('  Payment for order  ')).not.toThrow();
    });

    it('should handle referenceLabel with leading/trailing whitespace', () => {
      expect(() => validateReferenceLabel('  ORDER123  ')).not.toThrow();
    });

    it('should reject billNumber with only whitespace (if provided)', () => {
      expect(() => validateBillNumber('   ')).toThrow(ValidationError);
    });

    it('should reject purpose with only whitespace (if provided)', () => {
      expect(() => validatePurpose('   ')).toThrow(ValidationError);
    });

    it('should reject referenceLabel with only whitespace (if provided)', () => {
      expect(() => validateReferenceLabel('   ')).toThrow(ValidationError);
    });
  });
});

// ============================================================================
// T062: Type Coercion Edge Cases
// ============================================================================

describe('Edge Cases: Type Coercion and Non-String Inputs', () => {
  describe('Numeric inputs to string validators', () => {
    it('should reject numeric input to bank BIN (must be string)', () => {
      expect(() => validateBankBin(970403 as any)).toThrow(ValidationError);
    });

    it('should reject numeric input to account number (must be string)', () => {
      expect(() => validateAccountNumber(1234567 as any)).toThrow(ValidationError);
    });

    it('should reject numeric input to amount (must be string)', () => {
      expect(() => validateAmount(180000 as any, false)).toThrow(ValidationError);
    });
  });

  describe('Boolean inputs', () => {
    it('should reject boolean input to bank BIN', () => {
      expect(() => validateBankBin(true as any)).toThrow(ValidationError);
      expect(() => validateBankBin(false as any)).toThrow(ValidationError);
    });

    it('should reject boolean input to service code', () => {
      expect(() => validateServiceCode(true as any)).toThrow(ValidationError);
    });
  });

  describe('Object inputs', () => {
    it('should reject object input to bank BIN', () => {
      expect(() => validateBankBin({ value: '970403' } as any)).toThrow(ValidationError);
    });

    it('should reject array input to account number', () => {
      expect(() => validateAccountNumber(['0', '1', '2', '3'] as any)).toThrow(ValidationError);
    });
  });

  describe('Function inputs', () => {
    it('should reject function input to validators', () => {
      const fn = () => '970403';
      expect(() => validateBankBin(fn as any)).toThrow(ValidationError);
    });
  });
});
