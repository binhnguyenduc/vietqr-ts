import { describe, it, expect } from 'vitest';
import { ValidationContext } from '../../../src/validators/validation-context';
import { ValidationError, AggregateValidationError } from '../../../src/types/errors';

describe('ValidationContext', () => {
  describe('Constructor', () => {
    it('should initialize with config', () => {
      const config = { bankBin: '970403', accountNumber: '01234567' };
      const context = new ValidationContext(config);

      expect(context.config).toBe(config);
      expect(context.errors).toEqual([]);
      expect(context.errorCount).toBe(0);
      expect(context.hasErrors()).toBe(false);
    });

    it('should accept any config type', () => {
      const testConfigs = [
        { obj: 'object' },
        'string',
        123,
        null,
        undefined,
        ['array'],
      ];

      testConfigs.forEach((config) => {
        const context = new ValidationContext(config);
        expect(context.config).toBe(config);
      });
    });
  });

  describe('addError', () => {
    it('should add validation error to context', () => {
      const context = new ValidationContext({});
      const error = new ValidationError('field', 'value', 'rule', 'message');

      context.addError(error);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0]).toBe(error);
      expect(context.hasErrors()).toBe(true);
      expect(context.errorCount).toBe(1);
    });

    it('should add multiple errors', () => {
      const context = new ValidationContext({});
      const error1 = new ValidationError('field1', 'value1', 'rule1', 'Error 1');
      const error2 = new ValidationError('field2', 'value2', 'rule2', 'Error 2');
      const error3 = new ValidationError('field3', 'value3', 'rule3', 'Error 3');

      context.addError(error1);
      context.addError(error2);
      context.addError(error3);

      expect(context.errors).toHaveLength(3);
      expect(context.errors[0]).toBe(error1);
      expect(context.errors[1]).toBe(error2);
      expect(context.errors[2]).toBe(error3);
      expect(context.errorCount).toBe(3);
    });

    it('should maintain error order', () => {
      const context = new ValidationContext({});
      const errors = Array.from({ length: 10 }, (_, i) =>
        new ValidationError(`field${i}`, `value${i}`, 'rule', `Error ${i}`)
      );

      errors.forEach((error) => context.addError(error));

      expect(context.errors).toHaveLength(10);
      errors.forEach((error, i) => {
        expect(context.errors[i]).toBe(error);
      });
    });
  });

  describe('tryValidate', () => {
    it('should execute validation function successfully', () => {
      const context = new ValidationContext({});
      let executed = false;

      const result = context.tryValidate(() => {
        executed = true;
      });

      expect(executed).toBe(true);
      expect(result).toBe(true);
      expect(context.hasErrors()).toBe(false);
    });

    it('should catch ValidationError and add to context', () => {
      const context = new ValidationContext({});
      const expectedError = new ValidationError('field', 'value', 'rule', 'message');

      const result = context.tryValidate(() => {
        throw expectedError;
      });

      expect(result).toBe(false);
      expect(context.hasErrors()).toBe(true);
      expect(context.errors).toHaveLength(1);
      expect(context.errors[0]).toBe(expectedError);
    });

    it('should re-throw non-ValidationError errors', () => {
      const context = new ValidationContext({});
      const genericError = new Error('Generic error');

      expect(() => {
        context.tryValidate(() => {
          throw genericError;
        });
      }).toThrow(genericError);
    });

    it('should catch multiple ValidationErrors from different tryValidate calls', () => {
      const context = new ValidationContext({});

      context.tryValidate(() => {
        throw new ValidationError('field1', 'value1', 'rule1', 'Error 1');
      });

      context.tryValidate(() => {
        throw new ValidationError('field2', 'value2', 'rule2', 'Error 2');
      });

      context.tryValidate(() => {
        // This one succeeds
      });

      context.tryValidate(() => {
        throw new ValidationError('field3', 'value3', 'rule3', 'Error 3');
      });

      expect(context.errors).toHaveLength(3);
      expect(context.errors[0].field).toBe('field1');
      expect(context.errors[1].field).toBe('field2');
      expect(context.errors[2].field).toBe('field3');
    });

    it('should handle enhanced ValidationError with code and expectedFormat', () => {
      const context = new ValidationContext({});

      context.tryValidate(() => {
        throw new ValidationError(
          'bankBin',
          '12345',
          'length',
          'Bank BIN too short',
          'INVALID_BANK_BIN_LENGTH',
          '6 numeric digits'
        );
      });

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('INVALID_BANK_BIN_LENGTH');
      expect(context.errors[0].expectedFormat).toBe('6 numeric digits');
    });
  });

  describe('throwIfErrors', () => {
    it('should not throw when no errors exist', () => {
      const context = new ValidationContext({});

      expect(() => context.throwIfErrors()).not.toThrow();
    });

    it('should throw AggregateValidationError when errors exist', () => {
      const context = new ValidationContext({});
      const error = new ValidationError('field', 'value', 'rule', 'message');
      context.addError(error);

      expect(() => context.throwIfErrors()).toThrow(AggregateValidationError);
    });

    it('should include all errors in thrown AggregateValidationError', () => {
      const context = new ValidationContext({});
      const error1 = new ValidationError('field1', 'value1', 'rule1', 'Error 1');
      const error2 = new ValidationError('field2', 'value2', 'rule2', 'Error 2');
      const error3 = new ValidationError('field3', 'value3', 'rule3', 'Error 3');

      context.addError(error1);
      context.addError(error2);
      context.addError(error3);

      try {
        context.throwIfErrors();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        if (error instanceof AggregateValidationError) {
          expect(error.errors).toHaveLength(3);
          expect(error.errors[0]).toBe(error1);
          expect(error.errors[1]).toBe(error2);
          expect(error.errors[2]).toBe(error3);
        }
      }
    });

    it('should work after multiple tryValidate calls', () => {
      const context = new ValidationContext({});

      context.tryValidate(() => {
        throw new ValidationError('field1', 'value1', 'rule1', 'Error 1');
      });

      context.tryValidate(() => {
        throw new ValidationError('field2', 'value2', 'rule2', 'Error 2');
      });

      expect(() => context.throwIfErrors()).toThrow(AggregateValidationError);
    });
  });

  describe('hasErrors', () => {
    it('should return false when no errors', () => {
      const context = new ValidationContext({});

      expect(context.hasErrors()).toBe(false);
    });

    it('should return true when errors exist', () => {
      const context = new ValidationContext({});
      context.addError(new ValidationError('field', 'value', 'rule', 'message'));

      expect(context.hasErrors()).toBe(true);
    });
  });

  describe('errorCount', () => {
    it('should return 0 when no errors', () => {
      const context = new ValidationContext({});

      expect(context.errorCount).toBe(0);
    });

    it('should return correct count of errors', () => {
      const context = new ValidationContext({});

      expect(context.errorCount).toBe(0);

      context.addError(new ValidationError('field1', 'value1', 'rule1', 'Error 1'));
      expect(context.errorCount).toBe(1);

      context.addError(new ValidationError('field2', 'value2', 'rule2', 'Error 2'));
      expect(context.errorCount).toBe(2);

      context.addError(new ValidationError('field3', 'value3', 'rule3', 'Error 3'));
      expect(context.errorCount).toBe(3);
    });
  });

  describe('createError', () => {
    it('should create basic ValidationError', () => {
      const context = new ValidationContext({});

      const error = context.createError('field', 'value', 'rule', 'message');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.field).toBe('field');
      expect(error.value).toBe('value');
      expect(error.rule).toBe('rule');
      expect(error.message).toBe('message');
      expect(error.code).toBeUndefined();
      expect(error.expectedFormat).toBeUndefined();
    });

    it('should create ValidationError with error code', () => {
      const context = new ValidationContext({});

      const error = context.createError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN too short',
        'INVALID_BANK_BIN_LENGTH'
      );

      expect(error.code).toBe('INVALID_BANK_BIN_LENGTH');
      expect(error.expectedFormat).toBeUndefined();
    });

    it('should create ValidationError with expected format', () => {
      const context = new ValidationContext({});

      const error = context.createError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN too short',
        undefined,
        '6 numeric digits'
      );

      expect(error.code).toBeUndefined();
      expect(error.expectedFormat).toBe('6 numeric digits');
    });

    it('should create ValidationError with both code and expected format', () => {
      const context = new ValidationContext({});

      const error = context.createError(
        'bankBin',
        '12345',
        'length',
        'Bank BIN must be exactly 6 digits',
        'INVALID_BANK_BIN_LENGTH',
        '6 numeric digits'
      );

      expect(error.code).toBe('INVALID_BANK_BIN_LENGTH');
      expect(error.expectedFormat).toBe('6 numeric digits');
    });

    it('should create error with readonly code and expectedFormat', () => {
      const context = new ValidationContext({});

      const error = context.createError(
        'field',
        'value',
        'rule',
        'message',
        'CODE',
        'format'
      );

      // Verify properties are defined and enumerable
      expect(Object.getOwnPropertyDescriptor(error, 'code')).toMatchObject({
        value: 'CODE',
        enumerable: true,
        writable: false,
      });

      expect(Object.getOwnPropertyDescriptor(error, 'expectedFormat')).toMatchObject({
        value: 'format',
        enumerable: true,
        writable: false,
      });
    });
  });

  describe('Complete Validation Workflow', () => {
    it('should support typical validation workflow', () => {
      const config = {
        bankBin: '12345', // Too short
        accountNumber: 'VERYLONG'.repeat(10), // Too long
        serviceCode: 'INVALID', // Invalid code
      };

      const context = new ValidationContext(config);

      // Simulate validators
      context.tryValidate(() => {
        if (config.bankBin.length !== 6) {
          throw new ValidationError(
            'bankBin',
            config.bankBin,
            'length',
            'Bank BIN must be 6 digits',
            'INVALID_BANK_BIN_LENGTH',
            '6 numeric digits'
          );
        }
      });

      context.tryValidate(() => {
        if (config.accountNumber.length > 19) {
          throw new ValidationError(
            'accountNumber',
            config.accountNumber,
            'length',
            'Account number too long',
            'ACCOUNT_NUMBER_TOO_LONG',
            '≤ 19 characters'
          );
        }
      });

      context.tryValidate(() => {
        const validCodes = ['QRIBFTTA', 'QRIBFTTC'];
        if (!validCodes.includes(config.serviceCode)) {
          throw new ValidationError(
            'serviceCode',
            config.serviceCode,
            'enum',
            'Invalid service code',
            'INVALID_SERVICE_CODE',
            '"QRIBFTTA" or "QRIBFTTC"'
          );
        }
      });

      expect(context.hasErrors()).toBe(true);
      expect(context.errorCount).toBe(3);

      try {
        context.throwIfErrors();
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateValidationError);
        if (error instanceof AggregateValidationError) {
          expect(error.errors).toHaveLength(3);
          expect(error.errors[0].code).toBe('INVALID_BANK_BIN_LENGTH');
          expect(error.errors[1].code).toBe('ACCOUNT_NUMBER_TOO_LONG');
          expect(error.errors[2].code).toBe('INVALID_SERVICE_CODE');
        }
      }
    });

    it('should allow partial validation success', () => {
      const config = {
        bankBin: '970403', // Valid
        accountNumber: 'TOOLONG'.repeat(10), // Invalid
        serviceCode: 'QRIBFTTA', // Valid
      };

      const context = new ValidationContext(config);

      // Valid bank BIN
      const result1 = context.tryValidate(() => {
        if (config.bankBin.length !== 6) {
          throw new ValidationError('bankBin', config.bankBin, 'length', 'Invalid');
        }
      });

      // Invalid account number
      const result2 = context.tryValidate(() => {
        if (config.accountNumber.length > 19) {
          throw new ValidationError(
            'accountNumber',
            config.accountNumber,
            'length',
            'Too long'
          );
        }
      });

      // Valid service code
      const result3 = context.tryValidate(() => {
        const validCodes = ['QRIBFTTA', 'QRIBFTTC'];
        if (!validCodes.includes(config.serviceCode)) {
          throw new ValidationError('serviceCode', config.serviceCode, 'enum', 'Invalid');
        }
      });

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(true);
      expect(context.errorCount).toBe(1);
      expect(context.errors[0].field).toBe('accountNumber');
    });
  });
});
