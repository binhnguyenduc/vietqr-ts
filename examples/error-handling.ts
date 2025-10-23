/**
 * Error Handling Example
 *
 * Demonstrates comprehensive error handling for VietQR operations:
 * 1. Generation validation errors
 * 2. Parsing errors
 * 3. Validation errors
 * 4. Corrupted data handling
 * 5. Best practices for production code
 */

import {
  generateVietQR,
  validateVietQRConfig,
  parse,
  validate,
  ValidationContext,
  ValidationError,
  type VietQRConfig
} from 'vietqr-ts';

// ========================================
// Example 1: Generation Validation Errors
// ========================================
console.log('=== Example 1: Generation Validation Errors ===');

try {
  const invalidConfig: VietQRConfig = {
    bankBin: '123',           // ❌ Invalid: too short (needs 6 digits)
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA'
  };

  generateVietQR(invalidConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('❌ Validation failed:');
    console.error(`   Field: ${error.field}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Expected: ${error.expectedFormat}`);
  }
}
console.log('');

// ========================================
// Example 2: Collect All Validation Errors
// ========================================
console.log('=== Example 2: Collect All Validation Errors ===');

const problematicConfig: VietQRConfig = {
  bankBin: '12345',          // ❌ Too short
  accountNumber: '01234567890123456789012', // ❌ Too long (>19 chars)
  serviceCode: 'INVALID',    // ❌ Invalid service code
  amount: '-100'             // ❌ Negative amount
};

const context = new ValidationContext();
validateVietQRConfig(problematicConfig, context);

if (context.hasErrors()) {
  console.error('❌ Multiple validation errors found:');
  context.getErrors().forEach((error, index) => {
    console.error(`   ${index + 1}. ${error.field}: ${error.message} [${error.code}]`);
  });
} else {
  console.log('✅ Configuration valid');
}
console.log('');

// ========================================
// Example 3: Parsing Errors
// ========================================
console.log('=== Example 3: Parsing Errors ===');

const invalidQRString = 'INVALID_QR_STRING';
const parseResult = parse(invalidQRString);

if (parseResult.success) {
  console.log('✅ Parsing successful');
} else {
  console.error('❌ Parsing failed:');
  console.error(`   Type: ${parseResult.error.type}`);
  console.error(`   Message: ${parseResult.error.message}`);
  console.error(`   Details: ${parseResult.error.details || 'N/A'}`);
}
console.log('');

// ========================================
// Example 4: Validation Errors
// ========================================
console.log('=== Example 4: Validation Errors ===');

// Generate a valid QR first
const validQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
});

// Simulate corrupted data by modifying the QR string
const corruptedQR = validQR.rawData.slice(0, -10); // Remove last 10 chars

const corruptedParseResult = parse(corruptedQR);

if (corruptedParseResult.success) {
  const validation = validate(corruptedParseResult.data, corruptedQR);

  if (validation.isValid) {
    console.log('✅ Validation passed');
  } else {
    console.error('❌ Validation failed:');
    validation.errors.forEach((error, index) => {
      console.error(`   ${index + 1}. ${error.field}: ${error.message}`);
      console.error(`      Code: ${error.code}`);
      if (error.expectedFormat) {
        console.error(`      Expected: ${error.expectedFormat}`);
      }
    });
  }

  if (validation.isCorrupted) {
    console.warn('⚠️  WARNING: Data appears corrupted or truncated');
  }
}
console.log('');

// ========================================
// Example 5: Production Error Handling
// ========================================
console.log('=== Example 5: Production Error Handling ===');

async function processPaymentQR(qrString: string): Promise<void> {
  try {
    // Step 1: Parse QR string
    const parseResult = parse(qrString);

    if (!parseResult.success) {
      throw new Error(`QR parsing failed: ${parseResult.error.message}`);
    }

    // Step 2: Validate parsed data
    const validation = validate(parseResult.data, qrString);

    // Step 3: Check for corruption
    if (validation.isCorrupted) {
      console.warn('⚠️  QR data may be corrupted');

      // Decide based on business logic
      const hasCriticalFields = parseResult.data.bankCode &&
                                parseResult.data.accountNumber;

      if (!hasCriticalFields) {
        throw new Error('Critical payment fields missing - cannot process');
      }

      console.log('   Critical fields present - proceeding with caution');
    }

    // Step 4: Check validation errors
    if (!validation.isValid) {
      const criticalErrors = validation.errors.filter(e =>
        e.code === 'CHECKSUM_MISMATCH' ||
        e.code === 'INVALID_CURRENCY' ||
        e.code === 'MISSING_REQUIRED_FIELD'
      );

      if (criticalErrors.length > 0) {
        throw new Error(`Critical validation errors: ${
          criticalErrors.map(e => e.message).join(', ')
        }`);
      }

      // Log non-critical errors but continue
      console.warn('⚠️  Non-critical validation issues:');
      validation.errors.forEach(e => {
        console.warn(`     ${e.field}: ${e.message}`);
      });
    }

    // Step 5: Verify amount matches user expectation (for dynamic QR)
    if (parseResult.data.amount) {
      const expectedAmount = '50000'; // From user input

      if (parseResult.data.amount !== expectedAmount) {
        throw new Error(
          `Amount mismatch: QR has ${parseResult.data.amount}, ` +
          `expected ${expectedAmount}`
        );
      }
    }

    // Step 6: All checks passed - safe to process
    console.log('✅ Payment QR validated successfully');
    console.log(`   Bank: ${parseResult.data.bankCode}`);
    console.log(`   Account: ${parseResult.data.accountNumber}`);
    console.log(`   Amount: ${parseResult.data.amount || 'User to enter'}`);
    console.log('   Ready for payment processing');

  } catch (error) {
    console.error('❌ Payment processing error:');

    if (error instanceof ValidationError) {
      console.error(`   Validation: ${error.message}`);
      console.error(`   Field: ${error.field}`);
      console.error(`   Code: ${error.code}`);
    } else if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Unknown error: ${error}`);
    }

    // Re-throw for caller to handle
    throw error;
  }
}

// Test production error handling
try {
  await processPaymentQR(validQR.rawData);
} catch (error) {
  console.error('Payment processing failed');
}
console.log('');

// ========================================
// Example 6: Specific Error Code Handling
// ========================================
console.log('=== Example 6: Specific Error Code Handling ===');

const testConfigs: VietQRConfig[] = [
  {
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
    amount: 'abc123' // Invalid format
  },
  {
    bankBin: '970422',
    accountNumber: '01234567890123456789012', // Too long
    serviceCode: 'QRIBFTTA'
  }
];

testConfigs.forEach((config, index) => {
  console.log(`Test ${index + 1}:`);

  try {
    validateVietQRConfig(config);
    console.log('  ✅ Valid');
  } catch (error) {
    if (error instanceof ValidationError) {
      switch (error.code) {
        case 'INVALID_AMOUNT_FORMAT':
          console.error('  ❌ Amount must be numeric');
          console.error('     Use format: "50000" or "50000.50"');
          break;

        case 'ACCOUNT_NUMBER_TOO_LONG':
          console.error('  ❌ Account number too long');
          console.error('     Maximum length: 19 characters');
          break;

        case 'INVALID_BANK_BIN_LENGTH':
          console.error('  ❌ Bank BIN must be exactly 6 digits');
          break;

        default:
          console.error(`  ❌ ${error.message}`);
      }
    }
  }
});
