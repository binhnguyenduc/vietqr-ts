# Parsing API

Functions for parsing VietQR strings into structured data.

## parse()

Parse a VietQR string into structured data.

### Signature

```typescript
function parse(qrString: string): ParseResult<VietQRData>
```

### Parameters

- **qrString** (`string`): The VietQR string to parse (EMV TLV format)

### Returns

`ParseResult<VietQRData>` - Result object containing either parsed data or error

```typescript
interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: DecodingError;
}
```

### Examples

```typescript
import { parse } from 'vietqr-ts';

// Parse a VietQR string
const result = parse('00020101021238540010A00000072701240006970403011301234567...');

if (result.success) {
  console.log('Bank Code:', result.data.bankCode);
  console.log('Account:', result.data.accountNumber);
  console.log('Amount:', result.data.amount);
} else {
  console.error('Parse error:', result.error.message);
}
```

### Error Handling

```typescript
import { parse, isErrorResult, DecodingErrorType } from 'vietqr-ts';

const result = parse(qrString);

if (isErrorResult(result)) {
  switch (result.error.type) {
    case DecodingErrorType.PARSE_ERROR:
      console.error('Invalid TLV format');
      break;
    case DecodingErrorType.INVALID_FORMAT:
      console.error('Invalid QR format');
      break;
  }
}
```

---

## parseWithOptions()

Parse a VietQR string with advanced options.

### Signature

```typescript
function parseWithOptions(
  qrString: string,
  options?: ParseOptions
): ParseResult<VietQRData>
```

### Parameters

- **qrString** (`string`): The VietQR string to parse
- **options** (`ParseOptions`, optional): Advanced parsing options

```typescript
interface ParseOptions {
  /** Reject QR with missing required fields */
  strictMode?: boolean;

  /** Extract available fields even on errors */
  extractPartialOnError?: boolean;

  /** Custom maximum QR string length */
  maxLength?: number;
}
```

### Returns

`ParseResult<VietQRData>` - Result object with parsed data or error

### Examples

#### Strict Mode

```typescript
import { parseWithOptions } from 'vietqr-ts';

// Reject QR codes missing any essential fields
const result = parseWithOptions(qrString, {
  strictMode: true
});

if (!result.success) {
  console.error('QR code missing required fields');
}
```

#### Extract Partial Data

```typescript
import { parseWithOptions } from 'vietqr-ts';

// Extract whatever fields are available
const result = parseWithOptions(corruptedQR, {
  extractPartialOnError: true
});

if (result.success) {
  // May have incomplete data
  console.log('Available data:', result.data);
} else if (result.data) {
  // Partial data extracted despite error
  console.log('Partial data:', result.data);
  console.log('Error:', result.error.message);
}
```

#### Custom Length Limit

```typescript
import { parseWithOptions } from 'vietqr-ts';

// Custom maximum length
const result = parseWithOptions(qrString, {
  maxLength: 1024 // Lower limit
});
```

#### Combined Options

```typescript
import { parseWithOptions } from 'vietqr-ts';

const result = parseWithOptions(qrString, {
  strictMode: true,
  maxLength: 2048,
  extractPartialOnError: false
});
```

### Option Details

#### strictMode

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, rejects QR codes missing any essential fields:
  - `payloadFormatIndicator`
  - `initiationMethod`
  - `bankCode`
  - `accountNumber`
  - `currency`
  - `countryCode`
  - `crc`

#### extractPartialOnError

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, returns available fields even when parsing fails. Useful for debugging corrupted QR codes.

#### maxLength

- **Type**: `number`
- **Default**: `4096`
- **Description**: Maximum allowed length for QR string. Rejects longer strings with `SIZE_LIMIT_EXCEEDED` error.

---

## VietQRData Type

Parsed VietQR data structure.

```typescript
interface VietQRData {
  /** Bank identification code (6 or 8 digits) */
  bankCode: string;

  /** Account number (1-19 digits) */
  accountNumber: string;

  /** Transaction amount (optional, max 13 chars) */
  amount?: string;

  /** Currency code (3 digits, typically "704" for VND) */
  currency: string;

  /** Additional message/description (optional, max 500 bytes UTF-8) */
  message?: string;

  /** Purpose/reference code (optional, max 25 chars) */
  purposeCode?: string;

  /** Bill number (optional, max 25 chars) */
  billNumber?: string;

  /** Initiation method: "static" (reusable) or "dynamic" (one-time) */
  initiationMethod: 'static' | 'dynamic';

  /** Merchant category code (optional, 4 digits) */
  merchantCategory?: string;

  /** Country code (2 chars, typically "VN") */
  countryCode: string;

  /** Payload format indicator (typically "01") */
  payloadFormatIndicator: string;

  /** CRC checksum (4 hex chars) */
  crc: string;
}
```

---

## DecodingError Type

Error information when parsing fails.

```typescript
interface DecodingError {
  /** Error type classification */
  type: DecodingErrorType;

  /** Human-readable error message */
  message: string;

  /** Field that caused the error (optional) */
  field?: string;

  /** Position in string where error occurred (optional) */
  position?: number;
}

enum DecodingErrorType {
  PARSE_ERROR = "PARSE_ERROR",
  INVALID_FORMAT = "INVALID_FORMAT",
  IMAGE_DECODE_ERROR = "IMAGE_DECODE_ERROR",
  SIZE_LIMIT_EXCEEDED = "SIZE_LIMIT_EXCEEDED",
  UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT",
  MULTIPLE_QR_CODES = "MULTIPLE_QR_CODES",
  NO_QR_CODE_FOUND = "NO_QR_CODE_FOUND"
}
```

---

## Type Guards

Helper functions for type checking parse results.

### isSuccessResult()

```typescript
function isSuccessResult<T>(result: ParseResult<T>): result is {
  success: true;
  data: T;
  error: undefined;
}
```

**Example**:
```typescript
import { parse, isSuccessResult } from 'vietqr-ts';

const result = parse(qrString);

if (isSuccessResult(result)) {
  // TypeScript knows result.data is defined
  console.log(result.data.bankCode);
}
```

### isErrorResult()

```typescript
function isErrorResult<T>(result: ParseResult<T>): result is {
  success: false;
  data: undefined;
  error: DecodingError;
}
```

**Example**:
```typescript
import { parse, isErrorResult } from 'vietqr-ts';

const result = parse(qrString);

if (isErrorResult(result)) {
  // TypeScript knows result.error is defined
  console.error(result.error.type, result.error.message);
}
```

---

## Constants

### MAX_QR_STRING_LENGTH

Maximum allowed QR string length.

```typescript
const MAX_QR_STRING_LENGTH = 4096;
```

### FIELD_CONSTRAINTS

Field length constraints per NAPAS IBFT v1.5.2 specification.

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

### REQUIRED_VALUES

Standard values for Vietnamese QR codes.

```typescript
const REQUIRED_VALUES = {
  CURRENCY_VND: "704",
  COUNTRY_CODE_VN: "VN",
  PAYLOAD_FORMAT_INDICATOR: "01",
  INITIATION_STATIC: "11",
  INITIATION_DYNAMIC: "12"
};
```
