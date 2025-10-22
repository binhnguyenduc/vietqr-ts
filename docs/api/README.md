# VietQR API Reference

Complete API documentation for the VietQR TypeScript library.

## Overview

VietQR is a TypeScript library for generating and decoding Vietnamese QR payment codes compliant with NAPAS IBFT v1.5.2 specification.

## Installation

```bash
npm install vietqr
```

## Quick Start

```typescript
import { generateVietQR, generateQRImage } from 'vietqr';

// Generate VietQR data
const qrData = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '11',
  amount: '50000'
});

// Generate QR code image
const qrImage = await generateQRImage({
  data: qrData.rawData,
  format: 'png',
  size: 300
});

console.log('QR Image:', qrImage.dataURI);
```

## API Categories

### [Generation API](./generation.md)

Functions for generating VietQR data and QR code images.

- **`generateVietQR(config)`** - Generate VietQR data string
- **`generateQRImage(config)`** - Generate QR code image (PNG/SVG)
- **`validateVietQRConfig(config)`** - Validate generation configuration

[View Generation API Documentation →](./generation.md)

### [Parsing API](./parsing.md)

Functions for parsing VietQR strings into structured data.

- **`parse(qrString)`** - Parse VietQR string
- **`parseWithOptions(qrString, options)`** - Parse with advanced options
  - `strictMode` - Reject QR with missing required fields
  - `extractPartialOnError` - Extract available fields on errors
  - `maxLength` - Custom maximum QR string length

[View Parsing API Documentation →](./parsing.md)

### [Validation API](./validation.md)

Functions for validating parsed VietQR data.

- **`validate(data, qrString)`** - Validate parsed data
- **`validateWithOptions(data, qrString, options)`** - Validate with advanced options
  - `skipCRCCheck` - Skip CRC verification for performance
  - `customFieldLimits` - Custom length limits per field
  - `treatWarningsAsErrors` - Strict validation mode
  - `skipCorruptionDetection` - Skip corruption detection

[View Validation API Documentation →](./validation.md)

### [Decoding API](./decoding.md)

Functions for decoding VietQR data from images.

- **`decode(imageBuffer)`** - Decode QR from image
- **`decodeAndValidate(imageBuffer)`** - Decode and validate in one step
- **`isValidImageSize(imageBuffer)`** - Check image size limits
- **`detectImageFormat(imageBuffer)`** - Detect image format (PNG/JPEG)

[View Decoding API Documentation →](./decoding.md)

### [Utilities API](./utilities.md)

Utility functions and helpers.

- **CRC Functions**: `calculateCRC()`, `verifyCRC()`
- **Encoding Functions**: `encodeField()`, `encodeFieldWithDetails()`
- **Type Guards**: `isDynamicQR()`, `isStaticQR()`, `isSuccessResult()`, `isErrorResult()`
- **Constants**: `NAPAS_GUID`, `DEFAULT_CURRENCY`, `DEFAULT_COUNTRY`, `DEFAULT_MCC`

[View Utilities API Documentation →](./utilities.md)

## Common Types

### VietQRConfig

Configuration for generating VietQR data.

```typescript
interface VietQRConfig {
  bankBin: string;
  accountNumber?: string;
  cardNumber?: string;
  serviceCode: 'QRIBFTTA' | 'QRIBFTTC';
  initiationMethod: '11' | '12';
  amount?: string;
  currency?: string;
  country?: string;
  billNumber?: string;
  referenceLabel?: string;
  purpose?: string;
}
```

### VietQRData (Generation)

Generated VietQR data structure.

```typescript
interface VietQRData {
  rawData: string;
  crc: string;
  fields: QRField[];
}
```

### ParsedVietQRData

Parsed VietQR data structure.

```typescript
interface ParsedVietQRData {
  bankCode: string;
  accountNumber: string;
  amount?: string;
  currency: string;
  message?: string;
  purposeCode?: string;
  billNumber?: string;
  initiationMethod: 'static' | 'dynamic';
  merchantCategory?: string;
  countryCode: string;
  payloadFormatIndicator: string;
  crc: string;
}
```

### ParseResult

Result of parsing operations.

```typescript
interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: DecodingError;
}
```

### ValidationResult

Result of validation operations.

```typescript
interface ValidationResult {
  isValid: boolean;
  isCorrupted: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}
```

### QRImageConfig

Configuration for QR image generation.

```typescript
interface QRImageConfig {
  data: string;
  format?: 'png' | 'svg';
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}
```

### QRImageResult

Generated QR image result.

```typescript
interface QRImageResult {
  base64: string;
  dataURI: string;
  format: 'png' | 'svg';
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}
```

## Error Types

### ValidationError

Error class for validation failures.

```typescript
class ValidationError extends Error {
  readonly field: string;
  readonly value: unknown;
  readonly rule: string;
}
```

### AggregateValidationError

Error class for multiple validation failures.

```typescript
class AggregateValidationError extends Error {
  readonly errors: ValidationError[];
}
```

### QRGenerationError

Error class for QR generation failures.

```typescript
class QRGenerationError extends Error {
  readonly cause?: Error;
}
```

### ImageEncodingError

Error class for image encoding failures.

```typescript
class ImageEncodingError extends Error {
  readonly cause?: Error;
}
```

### DecodingError

Error information for decoding failures.

```typescript
interface DecodingError {
  type: DecodingErrorType;
  message: string;
  field?: string;
  position?: number;
}

enum DecodingErrorType {
  PARSE_ERROR,
  INVALID_FORMAT,
  IMAGE_DECODE_ERROR,
  SIZE_LIMIT_EXCEEDED,
  UNSUPPORTED_FORMAT,
  MULTIPLE_QR_CODES,
  NO_QR_CODE_FOUND
}
```

## Enums

### ValidationErrorCode

```typescript
enum ValidationErrorCode {
  MISSING_REQUIRED_FIELD,
  INVALID_FORMAT,
  LENGTH_EXCEEDED,
  LENGTH_TOO_SHORT,
  INVALID_CHARACTER,
  CHECKSUM_MISMATCH,
  INVALID_CURRENCY,
  INVALID_COUNTRY,
  INVALID_AMOUNT,
  UNKNOWN_FIELD
}
```

### ValidationWarningCode

```typescript
enum ValidationWarningCode {
  PARTIAL_DATA,
  DEPRECATED_FIELD,
  UNUSUAL_PATTERN,
  MISSING_OPTIONAL_FIELD
}
```

## Constants

### Field Constraints

```typescript
const FIELD_CONSTRAINTS = {
  BANK_CODE_BIN_LENGTH: 6,
  BANK_CODE_CITAD_LENGTH: 8,
  ACCOUNT_NUMBER_MAX: 19,
  AMOUNT_MAX: 13,
  CURRENCY_LENGTH: 3,
  MESSAGE_MAX: 500,
  PURPOSE_CODE_MAX: 25,
  BILL_NUMBER_MAX: 25,
  COUNTRY_CODE_LENGTH: 2,
  MERCHANT_CATEGORY_LENGTH: 4,
  CRC_LENGTH: 4
};
```

### Required Values

```typescript
const REQUIRED_VALUES = {
  CURRENCY_VND: "704",
  COUNTRY_CODE_VN: "VN",
  PAYLOAD_FORMAT_INDICATOR: "01",
  INITIATION_STATIC: "11",
  INITIATION_DYNAMIC: "12"
};
```

### Size Limits

```typescript
const MAX_IMAGE_SIZE: number;        // 10 MB
const MAX_QR_STRING_LENGTH = 4096;   // 4 KB
```

## Usage Patterns

### Complete Generation Workflow

```typescript
import {
  generateVietQR,
  generateQRImage,
  validateVietQRConfig
} from 'vietqr';

// 1. Validate configuration
const config = {
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA' as const,
  initiationMethod: '11' as const,
  amount: '50000'
};

validateVietQRConfig(config);

// 2. Generate QR data
const qrData = generateVietQR(config);

// 3. Generate QR image
const qrImage = await generateQRImage({
  data: qrData.rawData,
  format: 'png',
  size: 300
});

console.log('QR Image Data URI:', qrImage.dataURI);
```

### Complete Parsing and Validation Workflow

```typescript
import {
  parse,
  validate,
  isSuccessResult,
  isErrorResult
} from 'vietqr';

// 1. Parse QR string
const parseResult = parse(qrString);

if (isErrorResult(parseResult)) {
  console.error('Parse failed:', parseResult.error.message);
  return;
}

// 2. Validate parsed data
const validation = validate(parseResult.data, qrString);

if (!validation.isValid) {
  console.error('Validation failed:');
  validation.errors.forEach(err => {
    console.error(`  ${err.field}: ${err.message}`);
  });
  return;
}

if (validation.isCorrupted) {
  console.warn('Warning: QR may be corrupted');
}

console.log('✅ Valid QR data:', parseResult.data);
```

### Complete Image Decoding Workflow

```typescript
import {
  decode,
  validate,
  isSuccessResult
} from 'vietqr';

// 1. Decode image
const decodeResult = decode(imageBuffer);

if (!isSuccessResult(decodeResult)) {
  console.error('Decode failed:', decodeResult.error.message);
  return;
}

// 2. Validate decoded data
// (For complete validation, use decodeAndValidate instead)
const qrString = 'reconstructed-from-data';
const validation = validate(decodeResult.data, qrString);

if (validation.isValid) {
  console.log('✅ Valid QR code from image');
  console.log('Data:', decodeResult.data);
} else {
  console.error('❌ Invalid QR code');
}
```

### Advanced Options Workflow

```typescript
import {
  parseWithOptions,
  validateWithOptions,
  isSuccessResult
} from 'vietqr';

// 1. Parse with strict mode
const parseResult = parseWithOptions(qrString, {
  strictMode: true,
  maxLength: 2048
});

if (!isSuccessResult(parseResult)) {
  console.error('Parse failed:', parseResult.error.message);
  return;
}

// 2. Validate with custom limits
const validation = validateWithOptions(
  parseResult.data,
  qrString,
  {
    customFieldLimits: {
      accountNumberMax: 15,
      messageMax: 200
    },
    treatWarningsAsErrors: true
  }
);

if (!validation.isValid) {
  console.error('Strict validation failed');
}
```

## TypeScript Support

This library is written in TypeScript and provides full type definitions.

### Import Types

```typescript
import type {
  VietQRConfig,
  VietQRData,
  ParsedVietQRData,
  ParseResult,
  ParseOptions,
  ValidationResult,
  ValidationOptions,
  CustomFieldLimits,
  QRImageConfig,
  QRImageResult,
  ValidationError,
  ValidationWarning,
  DecodingError
} from 'vietqr';
```

### Type Guards

```typescript
import {
  isSuccessResult,
  isErrorResult,
  isDynamicQR,
  isStaticQR
} from 'vietqr';

const result = parse(qrString);

if (isSuccessResult(result)) {
  // TypeScript knows result.data is defined
  const data = result.data;

  if (isDynamicQR(data)) {
    // Handle dynamic QR
  } else {
    // Handle static QR
  }
}

if (isErrorResult(result)) {
  // TypeScript knows result.error is defined
  console.error(result.error.message);
}
```

## Support

- **Documentation**: [https://github.com/binhnguyenduc/vietqr](https://github.com/binhnguyenduc/vietqr)
- **Issues**: [https://github.com/binhnguyenduc/vietqr/issues](https://github.com/binhnguyenduc/vietqr/issues)
- **Specification**: NAPAS IBFT v1.5.2

## License

See LICENSE file in repository root.
