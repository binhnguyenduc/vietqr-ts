# Validation API

Functions for validating parsed VietQR data.

## validate()

Validate parsed VietQR data against NAPAS IBFT v1.5.2 specification.

### Signature

```typescript
function validate(
  data: VietQRData,
  qrString: string
): ValidationResult
```

### Parameters

- **data** (`VietQRData`): Parsed VietQR data to validate
- **qrString** (`string`): Original QR string (required for CRC verification)

### Returns

`ValidationResult` - Comprehensive validation result

```typescript
interface ValidationResult {
  /** Whether data passes all validation checks */
  isValid: boolean;

  /** Whether data shows signs of corruption */
  isCorrupted: boolean;

  /** List of validation errors found */
  errors: ValidationError[];

  /** Optional warnings (non-critical issues) */
  warnings?: ValidationWarning[];
}
```

### Examples

#### Basic Validation

```typescript
import { parse, validate } from 'vietqr-ts';

const parseResult = parse(qrString);

if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);

  if (validation.isValid) {
    console.log('✅ Valid VietQR data');
  } else {
    console.log('❌ Validation errors:');
    validation.errors.forEach(err => {
      console.log(`  ${err.field}: ${err.message}`);
    });
  }
}
```

#### Check for Corruption

```typescript
import { parse, validate } from 'vietqr-ts';

const parseResult = parse(qrString);
const validation = validate(parseResult.data, qrString);

if (validation.isCorrupted) {
  console.warn('⚠️  QR code may be corrupted or tampered with');
}
```

#### Handle Warnings

```typescript
import { parse, validate } from 'vietqr-ts';

const parseResult = parse(qrString);
const validation = validate(parseResult.data, qrString);

if (validation.warnings && validation.warnings.length > 0) {
  console.log('⚠️  Warnings:');
  validation.warnings.forEach(warn => {
    console.log(`  ${warn.field}: ${warn.message}`);
  });
}
```

---

## validateWithOptions()

Validate parsed VietQR data with advanced options.

### Signature

```typescript
function validateWithOptions(
  data: VietQRData,
  qrString: string,
  options?: ValidationOptions
): ValidationResult
```

### Parameters

- **data** (`VietQRData`): Parsed VietQR data to validate
- **qrString** (`string`): Original QR string
- **options** (`ValidationOptions`, optional): Advanced validation options

```typescript
interface ValidationOptions {
  /** Skip CRC checksum verification (for performance) */
  skipCRCCheck?: boolean;

  /** Custom field length limits */
  customFieldLimits?: CustomFieldLimits;

  /** Treat warnings as errors */
  treatWarningsAsErrors?: boolean;

  /** Skip corruption detection */
  skipCorruptionDetection?: boolean;
}

interface CustomFieldLimits {
  /** Custom max account number length (default: 19) */
  accountNumberMax?: number;

  /** Custom max amount length (default: 13) */
  amountMax?: number;

  /** Custom max message byte length (default: 500) */
  messageMax?: number;

  /** Custom max purpose code length (default: 25) */
  purposeCodeMax?: number;

  /** Custom max bill number length (default: 25) */
  billNumberMax?: number;
}
```

### Returns

`ValidationResult` - Validation result with applied options

### Examples

#### Skip CRC Check for Performance

```typescript
import { parse, validateWithOptions } from 'vietqr-ts';

const parseResult = parse(qrString);

// Skip expensive CRC verification
const validation = validateWithOptions(parseResult.data, qrString, {
  skipCRCCheck: true
});
```

#### Custom Field Limits

```typescript
import { parse, validateWithOptions } from 'vietqr-ts';

const parseResult = parse(qrString);

// Stricter validation with custom limits
const validation = validateWithOptions(parseResult.data, qrString, {
  customFieldLimits: {
    accountNumberMax: 15,  // Max 15 digits instead of 19
    messageMax: 200,       // Max 200 bytes instead of 500
    amountMax: 10          // Max 10 chars instead of 13
  }
});
```

#### Treat Warnings as Errors

```typescript
import { parse, validateWithOptions } from 'vietqr-ts';

const parseResult = parse(qrString);

// Strict mode: all warnings become errors
const validation = validateWithOptions(parseResult.data, qrString, {
  treatWarningsAsErrors: true
});

// Now isValid will be false if there are any warnings
if (!validation.isValid) {
  console.error('Validation failed (strict mode)');
}
```

#### Skip Corruption Detection

```typescript
import { parse, validateWithOptions } from 'vietqr-ts';

const parseResult = parse(qrString);

// Skip corruption detection for performance
const validation = validateWithOptions(parseResult.data, qrString, {
  skipCorruptionDetection: true
});

// validation.isCorrupted will always be false
```

#### Combined Options

```typescript
import { parse, validateWithOptions } from 'vietqr-ts';

const parseResult = parse(qrString);

const validation = validateWithOptions(parseResult.data, qrString, {
  skipCRCCheck: true,
  customFieldLimits: {
    accountNumberMax: 12,
    messageMax: 100
  },
  treatWarningsAsErrors: false,
  skipCorruptionDetection: true
});
```

### Option Details

#### skipCRCCheck

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, skips CRC checksum verification. Use for performance optimization when CRC has been previously verified.

#### customFieldLimits

- **Type**: `CustomFieldLimits`
- **Default**: `undefined`
- **Description**: Override default field length limits. Useful for stricter validation or supporting bank-specific constraints.

#### treatWarningsAsErrors

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, converts all warnings to errors. Use for strict validation where warnings are unacceptable.

#### skipCorruptionDetection

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, skips corruption detection logic. Use for performance optimization.

---

## ValidationError Type

Validation error information.

```typescript
interface ValidationError {
  /** Field that failed validation */
  field: string;

  /** Error code classification */
  code: ValidationErrorCode;

  /** Human-readable error message */
  message: string;

  /** Expected format (optional) */
  expectedFormat?: string;

  /** Actual value that failed (optional, may be redacted) */
  actualValue?: string;
}

enum ValidationErrorCode {
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  LENGTH_EXCEEDED = "LENGTH_EXCEEDED",
  LENGTH_TOO_SHORT = "LENGTH_TOO_SHORT",
  INVALID_CHARACTER = "INVALID_CHARACTER",
  CHECKSUM_MISMATCH = "CHECKSUM_MISMATCH",
  INVALID_CURRENCY = "INVALID_CURRENCY",
  INVALID_COUNTRY = "INVALID_COUNTRY",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  UNKNOWN_FIELD = "UNKNOWN_FIELD"
}
```

### Error Code Details

- **MISSING_REQUIRED_FIELD**: Required field is missing or empty
- **INVALID_FORMAT**: Field format doesn't match expected pattern
- **LENGTH_EXCEEDED**: Field exceeds maximum length
- **LENGTH_TOO_SHORT**: Field is shorter than minimum length
- **INVALID_CHARACTER**: Field contains invalid characters
- **CHECKSUM_MISMATCH**: CRC checksum verification failed
- **INVALID_CURRENCY**: Currency code is invalid
- **INVALID_COUNTRY**: Country code is invalid
- **INVALID_AMOUNT**: Amount format is invalid
- **UNKNOWN_FIELD**: Unrecognized field ID in QR data

---

## ValidationWarning Type

Validation warning for non-critical issues.

```typescript
interface ValidationWarning {
  /** Field with potential issue */
  field: string;

  /** Warning code classification */
  code: ValidationWarningCode;

  /** Human-readable warning message */
  message: string;
}

enum ValidationWarningCode {
  PARTIAL_DATA = "PARTIAL_DATA",
  DEPRECATED_FIELD = "DEPRECATED_FIELD",
  UNUSUAL_PATTERN = "UNUSUAL_PATTERN",
  MISSING_OPTIONAL_FIELD = "MISSING_OPTIONAL_FIELD"
}
```

### Warning Code Details

- **PARTIAL_DATA**: Some optional data is missing
- **DEPRECATED_FIELD**: Field is deprecated in specification
- **UNUSUAL_PATTERN**: Field has unusual but valid pattern
- **MISSING_OPTIONAL_FIELD**: Recommended optional field is missing

---

## Validation Workflow

### Complete Validation Flow

```typescript
import {
  parse,
  validate,
  isSuccessResult,
  ValidationErrorCode
} from 'vietqr-ts';

const parseResult = parse(qrString);

if (!isSuccessResult(parseResult)) {
  console.error('Parse failed:', parseResult.error.message);
  return;
}

const validation = validate(parseResult.data, qrString);

// Check overall validity
if (!validation.isValid) {
  console.error('Validation failed with errors:');

  // Group errors by code
  const errorsByCode = validation.errors.reduce((acc, err) => {
    if (!acc[err.code]) acc[err.code] = [];
    acc[err.code].push(err);
    return acc;
  }, {} as Record<ValidationErrorCode, ValidationError[]>);

  // Handle specific error types
  if (errorsByCode[ValidationErrorCode.CHECKSUM_MISMATCH]) {
    console.error('  CRC verification failed - data may be corrupted');
  }

  if (errorsByCode[ValidationErrorCode.INVALID_FORMAT]) {
    console.error('  Format errors found:');
    errorsByCode[ValidationErrorCode.INVALID_FORMAT].forEach(err => {
      console.error(`    ${err.field}: ${err.message}`);
    });
  }

  return;
}

// Check for corruption
if (validation.isCorrupted) {
  console.warn('⚠️  Data may be corrupted - proceed with caution');
}

// Check warnings
if (validation.warnings && validation.warnings.length > 0) {
  console.log('ℹ️  Non-critical issues found:');
  validation.warnings.forEach(warn => {
    console.log(`  ${warn.field}: ${warn.message}`);
  });
}

console.log('✅ Validation passed');
```

### Custom Validation Rules

```typescript
import { parse, validateWithOptions, ValidationErrorCode } from 'vietqr-ts';

function validateBankSpecificRules(qrString: string) {
  const parseResult = parse(qrString);

  if (!parseResult.success) {
    return { valid: false, reason: 'Parse failed' };
  }

  // Bank-specific constraints
  const validation = validateWithOptions(parseResult.data, qrString, {
    customFieldLimits: {
      accountNumberMax: 10,  // Bank requires max 10 digits
      messageMax: 50,        // Bank limits message to 50 bytes
      amountMax: 12          // Bank limits amount to 12 chars
    },
    treatWarningsAsErrors: true  // Strict mode for production
  });

  // Additional custom checks
  if (parseResult.data.bankCode !== '970403') {
    return { valid: false, reason: 'Unsupported bank' };
  }

  if (parseResult.data.amount && parseFloat(parseResult.data.amount) > 50000000) {
    return { valid: false, reason: 'Amount exceeds bank limit' };
  }

  return {
    valid: validation.isValid,
    reason: validation.isValid ? 'OK' : validation.errors[0].message,
    warnings: validation.warnings
  };
}
```
