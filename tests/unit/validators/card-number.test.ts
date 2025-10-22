import { describe, it, expect } from 'vitest';
import { validateCardNumber } from '../../../src/validators/bank-info';

describe('validateCardNumber', () => {
  describe('Valid Card Numbers', () => {
    it('should accept standard card numbers', () => {
      expect(() => validateCardNumber('9704031101234567')).not.toThrow();
      expect(() => validateCardNumber('1234567890123456')).not.toThrow();
    });

    it('should accept card numbers up to 19 characters', () => {
      expect(() => validateCardNumber('1234567890123456789')).not.toThrow(); // 19 chars (max)
      expect(() => validateCardNumber('123456789012345678')).not.toThrow(); // 18 chars
    });

    it('should accept single character card number', () => {
      expect(() => validateCardNumber('1')).not.toThrow();
    });

    it('should accept alphanumeric card numbers', () => {
      expect(() => validateCardNumber('ABC123XYZ456')).not.toThrow();
      expect(() => validateCardNumber('CARD1234567890')).not.toThrow();
    });
  });

  describe('Invalid Card Numbers', () => {
    it('should reject empty card number', () => {
      expect(() => validateCardNumber('')).toThrow('Card number is required');
    });

    it('should reject null or undefined', () => {
      expect(() => validateCardNumber(null as any)).toThrow('Card number must be a string');
      expect(() => validateCardNumber(undefined as any)).toThrow('Card number must be a string');
    });

    it('should reject card number exceeding 19 characters', () => {
      expect(() => validateCardNumber('1'.repeat(20))).toThrow(/19.*character/i);
      expect(() => validateCardNumber('12345678901234567890')).toThrow(/19.*character/i);
    });

    it('should reject card numbers with special characters', () => {
      expect(() => validateCardNumber('9704-0311-0123-4567')).toThrow(/alphanumeric/i);
      expect(() => validateCardNumber('9704 0311 0123 4567')).toThrow(/alphanumeric/i);
      expect(() => validateCardNumber('card@number!')).toThrow(/alphanumeric/i);
    });

    it('should reject card numbers with Unicode characters', () => {
      expect(() => validateCardNumber('9704€311')).toThrow(/alphanumeric/i);
      expect(() => validateCardNumber('カード番号')).toThrow(/alphanumeric/i);
    });
  });

  describe('Type Coercion', () => {
    it('should reject number type (require string)', () => {
      expect(() => validateCardNumber(1234567890123456 as any)).toThrow(
        'Card number must be a string'
      );
    });

    it('should handle whitespace trimming', () => {
      expect(() => validateCardNumber('  9704031101234567  ')).not.toThrow();
      expect(() => validateCardNumber('\n9704031101234567\n')).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should accept exactly 19 characters', () => {
      const cardNumber = '1'.repeat(19);
      expect(() => validateCardNumber(cardNumber)).not.toThrow();
    });

    it('should reject 20 characters', () => {
      const cardNumber = '1'.repeat(20);
      expect(() => validateCardNumber(cardNumber)).toThrow(/19.*character/i);
    });
  });
});
