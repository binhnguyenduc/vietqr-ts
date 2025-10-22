import { describe, it, expect } from 'vitest';
import { ValidationError, AggregateValidationError } from '../../../src/types/errors';

describe('ValidationError', () => {
  describe('Basic Functionality', () => {
    it('should create error with required properties', () => {
      const error = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN must be exactly 6 digits'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('bankBin');
      expect(error.value).toBe('12345');
      expect(error.rule).toBe('length');
      expect(error.message).toBe('Bank BIN must be exactly 6 digits');
    });

    it('should capture stack trace', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });

    it('should handle various value types', () => {
      const testCases = [
        { value: null, expected: null },
        { value: undefined, expected: undefined },
        { value: 123, expected: 123 },
        { value: true, expected: true },
        { value: { nested: 'object' }, expected: { nested: 'object' } },
        { value: ['array'], expected: ['array'] },
      ];

      testCases.forEach(({ value, expected }) => {
        const error = new ValidationError('field', value, 'rule', 'message');
        expect(error.value).toEqual(expected);
      });
    });
  });

  describe('Enhanced Properties - Error Code', () => {
    it('should create error with optional error code', () => {
      const error = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN must be exactly 6 digits',
        'INVALID_BANK_BIN_LENGTH'
      );

      expect(error.code).toBe('INVALID_BANK_BIN_LENGTH');
    });

    it('should have undefined code when not provided', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');

      expect(error.code).toBeUndefined();
    });

    it('should support various error code patterns', () => {
      const testCodes = [
        'INVALID_BANK_BIN_LENGTH',
        'ACCOUNT_NUMBER_TOO_LONG',
        'MISSING_REQUIRED_FIELD',
        'INVALID_AMOUNT_FORMAT',
      ];

      testCodes.forEach((code) => {
        const error = new ValidationError('field', 'value', 'rule', 'message', code);
        expect(error.code).toBe(code);
      });
    });
  });

  describe('Enhanced Properties - Expected Format', () => {
    it('should create error with optional expected format', () => {
      const error = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN must be exactly 6 digits',
        'INVALID_BANK_BIN_LENGTH',
        '6 numeric digits'
      );

      expect(error.expectedFormat).toBe('6 numeric digits');
    });

    it('should have undefined expectedFormat when not provided', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');

      expect(error.expectedFormat).toBeUndefined();
    });

    it('should support various expected format descriptions', () => {
      const testFormats = [
        '6 numeric digits',
        '≤ 19 characters',
        '"QRIBFTTA" or "QRIBFTTC"',
        '> 0',
        'Numeric with optional decimal',
      ];

      testFormats.forEach((format) => {
        const error = new ValidationError(
          'field',
          'value',
          'rule',
          'message',
          undefined,
          format
        );
        expect(error.expectedFormat).toBe(format);
      });
    });
  });

  describe('Complete Enhanced Error', () => {
    it('should create error with all properties', () => {
      const error = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN must be exactly 6 digits. Expected: 6 numeric digits, Received: "12345" (5 digits)',
        'INVALID_BANK_BIN_LENGTH',
        '6 numeric digits'
      );

      expect(error.field).toBe('bankBin');
      expect(error.value).toBe('12345');
      expect(error.rule).toBe('length');
      expect(error.message).toContain('Bank BIN must be exactly 6 digits');
      expect(error.message).toContain('Expected: 6 numeric digits');
      expect(error.message).toContain('Received: "12345"');
      expect(error.code).toBe('INVALID_BANK_BIN_LENGTH');
      expect(error.expectedFormat).toBe('6 numeric digits');
    });

    it('should support code without expectedFormat', () => {
      const error = new ValidationError(
        'field',
        'value',
        'rule',
        'message',
        'ERROR_CODE'
      );

      expect(error.code).toBe('ERROR_CODE');
      expect(error.expectedFormat).toBeUndefined();
    });

    it('should support expectedFormat without code', () => {
      const error = new ValidationError(
        'field',
        'value',
        'rule',
        'message',
        undefined,
        'expected format'
      );

      expect(error.code).toBeUndefined();
      expect(error.expectedFormat).toBe('expected format');
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with existing 4-parameter constructor calls', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');

      expect(error.field).toBe('field');
      expect(error.value).toBe('value');
      expect(error.rule).toBe('rule');
      expect(error.message).toBe('message');
      expect(error.code).toBeUndefined();
      expect(error.expectedFormat).toBeUndefined();
    });
  });

  describe('Property Immutability', () => {
    it('should have readonly properties enforced by TypeScript', () => {
      const error = new ValidationError(
        'field',
        'value',
        'rule',
        'message',
        'CODE',
        'format'
      );

      // TypeScript enforces readonly at compile time
      // Runtime JavaScript doesn't enforce immutability without Object.freeze
      // This test verifies the properties exist and are accessible
      expect(error.field).toBe('field');
      expect(error.value).toBe('value');
      expect(error.rule).toBe('rule');
      expect(error.code).toBe('CODE');
      expect(error.expectedFormat).toBe('format');
    });
  });
});

describe('AggregateValidationError', () => {
  describe('Basic Functionality', () => {
    it('should aggregate multiple validation errors', () => {
      const error1 = new ValidationError('field1', 'value1', 'rule1', 'Error 1');
      const error2 = new ValidationError('field2', 'value2', 'rule2', 'Error 2');
      const error3 = new ValidationError('field3', 'value3', 'rule3', 'Error 3');

      const aggregateError = new AggregateValidationError([error1, error2, error3]);

      expect(aggregateError).toBeInstanceOf(Error);
      expect(aggregateError).toBeInstanceOf(AggregateValidationError);
      expect(aggregateError.name).toBe('AggregateValidationError');
      expect(aggregateError.errors).toHaveLength(3);
      expect(aggregateError.errors[0]).toBe(error1);
      expect(aggregateError.errors[1]).toBe(error2);
      expect(aggregateError.errors[2]).toBe(error3);
    });

    it('should generate descriptive message', () => {
      const error1 = new ValidationError('bankBin', '12345', 'length', 'Bank BIN too short');
      const error2 = new ValidationError('amount', '-500', 'value', 'Amount must be positive');

      const aggregateError = new AggregateValidationError([error1, error2]);

      expect(aggregateError.message).toContain('Validation failed with 2 error(s)');
      expect(aggregateError.message).toContain('bankBin: Bank BIN too short');
      expect(aggregateError.message).toContain('amount: Amount must be positive');
    });

    it('should handle single error', () => {
      const error = new ValidationError('field', 'value', 'rule', 'Single error');

      const aggregateError = new AggregateValidationError([error]);

      expect(aggregateError.errors).toHaveLength(1);
      expect(aggregateError.message).toContain('Validation failed with 1 error(s)');
    });

    it('should capture stack trace', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');
      const aggregateError = new AggregateValidationError([error]);

      expect(aggregateError.stack).toBeDefined();
      expect(aggregateError.stack).toContain('AggregateValidationError');
    });
  });

  describe('Enhanced Error Integration', () => {
    it('should aggregate errors with error codes', () => {
      const error1 = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN too short',
        'INVALID_BANK_BIN_LENGTH'
      );
      const error2 = new ValidationError(
        'amount',
        '-500',
        'value',
        'Amount negative',
        'INVALID_AMOUNT_VALUE'
      );

      const aggregateError = new AggregateValidationError([error1, error2]);

      expect(aggregateError.errors[0].code).toBe('INVALID_BANK_BIN_LENGTH');
      expect(aggregateError.errors[1].code).toBe('INVALID_AMOUNT_VALUE');
    });

    it('should aggregate errors with expected formats', () => {
      const error1 = new ValidationError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN invalid',
        'INVALID_BANK_BIN_LENGTH',
        '6 numeric digits'
      );
      const error2 = new ValidationError(
        'amount',
        '-500',
        'value',
        'Amount invalid',
        'INVALID_AMOUNT_VALUE',
        '> 0'
      );

      const aggregateError = new AggregateValidationError([error1, error2]);

      expect(aggregateError.errors[0].expectedFormat).toBe('6 numeric digits');
      expect(aggregateError.errors[1].expectedFormat).toBe('> 0');
    });

    it('should handle mixed enhanced and basic errors', () => {
      const basicError = new ValidationError('field1', 'value1', 'rule1', 'Basic error');
      const enhancedError = new ValidationError(
        'field2',
        'value2',
        'rule2',
        'Enhanced error',
        'ERROR_CODE',
        'expected format'
      );

      const aggregateError = new AggregateValidationError([basicError, enhancedError]);

      expect(aggregateError.errors).toHaveLength(2);
      expect(aggregateError.errors[0].code).toBeUndefined();
      expect(aggregateError.errors[1].code).toBe('ERROR_CODE');
    });
  });

  describe('Property Immutability', () => {
    it('should have readonly errors array enforced by TypeScript', () => {
      const error = new ValidationError('field', 'value', 'rule', 'message');
      const aggregateError = new AggregateValidationError([error]);

      // TypeScript enforces readonly at compile time
      // This test verifies the errors array exists and is accessible
      expect(aggregateError.errors).toHaveLength(1);
      expect(aggregateError.errors[0]).toBe(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error array', () => {
      const aggregateError = new AggregateValidationError([]);

      expect(aggregateError.errors).toHaveLength(0);
      expect(aggregateError.message).toContain('Validation failed with 0 error(s)');
    });

    it('should handle large number of errors', () => {
      const errors = Array.from({ length: 100 }, (_, i) =>
        new ValidationError(`field${i}`, `value${i}`, 'rule', `Error ${i}`)
      );

      const aggregateError = new AggregateValidationError(errors);

      expect(aggregateError.errors).toHaveLength(100);
      expect(aggregateError.message).toContain('Validation failed with 100 error(s)');
    });
  });
});
