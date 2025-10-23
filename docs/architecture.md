# VietQR Architecture

This document explains the design decisions, architectural patterns, and implementation details of the VietQR TypeScript library.

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Core Architecture](#core-architecture)
- [Module Organization](#module-organization)
- [Data Flow](#data-flow)
- [Type System](#type-system)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Security Architecture](#security-architecture)
- [Testing Strategy](#testing-strategy)

## Overview

VietQR is designed as a pure TypeScript library for generating and parsing Vietnamese QR payment codes compliant with NAPAS IBFT v1.5.2 and EMVCo specifications.

### Key Goals

1. **Type Safety**: Full TypeScript support with strict typing
2. **Compliance**: 100% adherence to NAPAS IBFT v1.5.2 specification
3. **Developer Experience**: Intuitive API with comprehensive error messages
4. **Performance**: Efficient generation and parsing (<200ms for most operations)
5. **Reliability**: >98% test coverage with edge case handling
6. **Cross-Platform**: Works in Node.js and modern browsers

## Design Principles

### 1. Separation of Concerns

The library is organized into distinct, focused modules:

```
src/
├── generators/      # QR data generation logic
├── parsers/         # QR string parsing logic
├── validators/      # Validation rules and error handling
├── decoders/        # Image-to-QR decoding
├── types/           # TypeScript type definitions
└── utils/           # Shared utilities (CRC, encoding)
```

### 2. Immutability

All functions are pure with no side effects:

```typescript
// ✅ Pure function - always returns new data
function generateVietQR(config: VietQRConfig): VietQRResult {
  return { ...computedData };
}

// ❌ Avoided - no mutation of inputs
function generateVietQR(config: VietQRConfig): void {
  config.crc = calculateCRC(config); // Mutates input
}
```

### 3. Progressive Validation

Validation happens at multiple stages:

1. **Input Validation**: Before generation/parsing
2. **Business Rule Validation**: During processing
3. **Output Validation**: After generation
4. **Integrity Validation**: CRC checksum verification

### 4. Fail-Fast with Clear Errors

Errors are detected early with actionable messages:

```typescript
throw new ValidationError(
  'bankBin',
  'INVALID_BANK_BIN_LENGTH',
  'Bank BIN must be exactly 6 digits',
  '6 numeric characters'
);
```

## Core Architecture

### Component Diagram

```
┌─────────────────────────────────────────────┐
│           Public API Layer                  │
│  generateVietQR | parse | validate          │
│  generateQRImage | calculateCRC             │
└──────────────┬──────────────────────────────┘
               │
┌──────────────┴──────────────────────────────┐
│         Business Logic Layer                │
├─────────────────────────────────────────────┤
│ Generators    │ Parsers    │ Validators     │
│ - VietQR Gen  │ - TLV      │ - Field Val    │
│ - Additional  │ - VietQR   │ - Business     │
│ - Consumer    │ - Image    │ - CRC          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────┴──────────────────────────────┐
│          Utility Layer                      │
│  Encoding | CRC | Constants | Helpers       │
└─────────────────────────────────────────────┘
```

### Generation Flow

```
User Config
    ↓
Validation
    ↓
Consumer Account Info (Tag 38)
    ↓
Additional Data (Tag 62)
    ↓
Assemble EMV TLV Structure
    ↓
Calculate CRC
    ↓
Return VietQR String
```

### Parsing Flow

```
QR String
    ↓
Format Detection
    ↓
TLV Parsing
    ↓
VietQR Data Extraction
    ↓
Validation (optional)
    ↓
Return Parsed Data
```

## Module Organization

### Generators

**Purpose**: Create EMVCo-compliant QR data strings

**Key Files**:
- `vietqr.ts`: Main generation orchestrator
- `consumer-account-info.ts`: Tag 38 (bank/account info)
- `additional-data.ts`: Tag 62 (message, bill number, etc.)
- `qr-image.ts`: Image generation wrapper

**Design Pattern**: Builder pattern for composing TLV structure

```typescript
// Composition of TLV tags
const tag38 = buildConsumerAccountInfo(config);
const tag62 = buildAdditionalData(config);
const assembled = assembleTLV([tag38, tag62, ...]);
const withCRC = appendCRC(assembled);
```

### Parsers

**Purpose**: Extract payment information from QR strings

**Key Files**:
- `tlv-parser.ts`: Generic Tag-Length-Value parser
- `vietqr-parser.ts`: VietQR-specific extraction logic
- `parse-with-options.ts`: Parser configuration

**Design Pattern**: Recursive descent parser for nested TLV

```typescript
function parseTLV(data: string): Tag[] {
  while (hasMoreData) {
    const tag = extractTag();
    const length = extractLength();
    const value = extractValue(length);

    if (isNestedTag(tag)) {
      return parseTLV(value); // Recursive
    }

    tags.push({ tag, length, value });
  }
}
```

### Validators

**Purpose**: Ensure data correctness and compliance

**Key Files**:
- `config-validator.ts`: Input configuration validation
- `field-validators.ts`: Individual field rules
- `business-rules-validator.ts`: Business logic validation
- `crc-validator.ts`: Checksum verification
- `error-builder.ts`: Structured error creation

**Design Pattern**: Validation context pattern for error accumulation

```typescript
const context = new ValidationContext();

validateBankBin(config.bankBin, context);
validateAccount(config.accountNumber, context);
validateAmount(config.amount, context);

if (context.hasErrors()) {
  throw context.getErrors();
}
```

### Decoders

**Purpose**: Extract QR data from images

**Key Files**:
- `qr-extractor.ts`: QR code detection and extraction
- `image-validator.ts`: Image format validation
- `format-detector.ts`: Auto-detect image format (PNG/JPEG/SVG)

**Design Pattern**: Strategy pattern for format-specific handling

```typescript
const detector = new FormatDetector();
const format = detector.detect(buffer);

const strategy = formatStrategies[format];
const qrString = strategy.extract(buffer);
```

## Data Flow

### Generation Pipeline

```typescript
// 1. User provides configuration
const config = {
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
};

// 2. Validation layer
validateVietQRConfig(config);

// 3. Generation layer
const tag38 = generateConsumerAccountInfo(config);
const tag62 = generateAdditionalData(config);

// 4. Assembly layer
const tlvData = assembleTLVStructure([
  { tag: '00', value: '01' },        // Payload format
  { tag: '01', value: '12' },        // Initiation method
  { tag: '38', value: tag38 },       // Consumer account
  { tag: '53', value: '704' },       // Currency
  { tag: '58', value: 'VN' },        // Country
  { tag: '62', value: tag62 }        // Additional data
]);

// 5. CRC calculation
const crc = calculateCRC(tlvData + '6304');
const final = tlvData + '6304' + crc;

// 6. Return result
return {
  rawData: final,
  qrType: config.amount ? 'dynamic' : 'static',
  bankBin: config.bankBin,
  accountNumber: config.accountNumber,
  amount: config.amount,
  crc
};
```

### Parsing Pipeline

```typescript
// 1. Receive QR string
const qrString = "00020101021238570010A000000727...";

// 2. TLV parsing
const tags = parseTLV(qrString);

// 3. Extract VietQR-specific data
const tag38 = findTag(tags, '38');
const nestedTags = parseTLV(tag38.value);

const napasGUID = findTag(nestedTags, '00');
const consumerInfo = findTag(nestedTags, '01');
const serviceInfo = findTag(nestedTags, '02');

// 4. Parse consumer info
const bankBin = consumerInfo.value.substring(0, 6);
const accountNumber = consumerInfo.value.substring(6, 25);

// 5. Parse additional data (Tag 62)
const tag62 = findTag(tags, '62');
const additionalData = parseTLV(tag62.value);

// 6. Return structured data
return {
  success: true,
  data: {
    bankCode: bankBin,
    accountNumber,
    amount,
    message,
    currency: '704',
    countryCode: 'VN'
  }
};
```

## Type System

### Type Hierarchy

```typescript
// Input types
interface VietQRConfig {
  bankBin: string;
  accountNumber?: string;
  cardNumber?: string;
  serviceCode: 'QRIBFTTA' | 'QRIBFTTC';
  amount?: string;
  message?: string;
  billNumber?: string;
  purpose?: string;
  merchantCategory?: string;
}

// Output types
interface VietQRResult {
  rawData: string;
  qrType: 'static' | 'dynamic';
  bankBin: string;
  accountNumber: string;
  amount?: string;
  crc: string;
}

// Parsing types
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: DecodingError };

// Validation types
interface ValidationResult {
  isValid: boolean;
  isCorrupted: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}
```

### Type Guards

```typescript
export function isSuccessResult<T>(
  result: ParseResult<T>
): result is { success: true; data: T } {
  return result.success === true;
}

export function isDynamicQR(data: VietQRData): boolean {
  return data.initiationMethod === 'dynamic' && !!data.amount;
}
```

## Error Handling

### Error Hierarchy

```
Error
  ├── ValidationError          # Invalid configuration/data
  ├── DecodingError           # Parsing failures
  ├── EncodingError           # Generation failures
  └── ImageProcessingError    # Image decoding failures
```

### Validation Error Codes

Structured error codes enable programmatic handling:

```typescript
enum ValidationErrorCode {
  // Required fields
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  MISSING_ACCOUNT_OR_CARD = 'MISSING_ACCOUNT_OR_CARD',

  // Bank validation
  INVALID_BANK_BIN = 'INVALID_BANK_BIN',
  INVALID_BANK_BIN_FORMAT = 'INVALID_BANK_BIN_FORMAT',
  INVALID_BANK_BIN_LENGTH = 'INVALID_BANK_BIN_LENGTH',

  // Amount validation
  INVALID_AMOUNT_FORMAT = 'INVALID_AMOUNT_FORMAT',
  INVALID_AMOUNT_VALUE = 'INVALID_AMOUNT_VALUE',

  // ... more codes
}
```

### Error Context

Errors include rich context for debugging:

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public code: ValidationErrorCode,
    public message: string,
    public expectedFormat?: string,
    public actualValue?: string
  ) {
    super(message);
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Early Validation**: Fail fast on invalid inputs
2. **Lazy Computation**: Calculate CRC only when needed
3. **String Building**: Use array join for TLV assembly
4. **Caching**: Memoize regex patterns and constants
5. **Buffer Reuse**: Minimize allocations in image processing

### Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| QR Generation | <10ms | ~5ms |
| String Parsing | <100ms | ~30ms |
| Validation | <50ms | ~15ms |
| PNG Encoding | <200ms | ~150ms |
| SVG Encoding | <100ms | ~50ms |

### Benchmarking

```typescript
// Simple benchmarks in tests
const start = performance.now();
const result = generateVietQR(config);
const duration = performance.now() - start;

expect(duration).toBeLessThan(10); // 10ms threshold
```

## Security Architecture

### Input Sanitization

All inputs are validated and sanitized:

```typescript
function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable
}
```

### CRC Verification

Checksum prevents tampering detection:

```typescript
function verifyCRC(qrString: string): boolean {
  const crcTag = '6304';
  const crcIndex = qrString.indexOf(crcTag);

  const dataWithoutCRC = qrString.substring(0, crcIndex + 4);
  const providedCRC = qrString.substring(crcIndex + 4);

  const calculatedCRC = calculateCRC(dataWithoutCRC);

  return calculatedCRC === providedCRC;
}
```

### Security Best Practices

1. **No Secrets**: Library doesn't handle sensitive data
2. **Immutable Outputs**: Return new objects, never mutate
3. **Type Safety**: Prevent injection via strong typing
4. **Validation**: Multi-layer validation prevents malformed data
5. **Error Messages**: Don't leak sensitive information

## Testing Strategy

### Test Pyramid

```
       ┌─────────────┐
       │   E2E (5%)  │  Full workflow tests
       ├─────────────┤
       │ Integration │  Module interaction tests
       │    (20%)    │
       ├─────────────┤
       │    Unit     │  Individual function tests
       │    (75%)    │
       └─────────────┘
```

### Coverage Requirements

- Overall: >98%
- Critical paths (generation/validation): 100%
- Utility functions: >95%
- Type definitions: N/A (compile-time)

### Test Categories

1. **Unit Tests**: Individual functions in isolation
2. **Integration Tests**: Module interactions
3. **Compliance Tests**: NAPAS IBFT specification adherence
4. **Edge Case Tests**: Boundary conditions and error paths
5. **Performance Tests**: Benchmark critical operations

### Example Test Structure

```typescript
describe('VietQR Generation', () => {
  describe('Static QR', () => {
    it('should generate valid static QR', () => {
      const result = generateVietQR({
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA'
      });

      expect(result.qrType).toBe('static');
      expect(result.amount).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should reject invalid bank BIN', () => {
      expect(() => {
        generateVietQR({
          bankBin: '123',  // Too short
          accountNumber: '0123456789',
          serviceCode: 'QRIBFTTA'
        });
      }).toThrow(ValidationError);
    });
  });
});
```

## Future Considerations

### Planned Improvements

1. **Performance**: WebAssembly for CRC calculation
2. **Features**: QR code scanning from images
3. **Compliance**: Support for future NAPAS specification updates
4. **Platform**: React Native bindings
5. **Optimization**: Tree-shaking improvements

### Backward Compatibility

- Semantic versioning strictly followed
- Deprecation warnings before removal
- Migration guides for breaking changes
- Support for previous major version

## Related Documents

- [API Documentation](./api/)
- [CONTRIBUTING Guide](../CONTRIBUTING.md)
- [FAQ](./faq.md)
- [Security Policy](../SECURITY.md)
