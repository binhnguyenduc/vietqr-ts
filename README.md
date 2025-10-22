# VietQR

TypeScript library for generating, parsing, and validating EMVCo-compliant VietQR data strings based on NAPAS IBFT v1.5.2 specification.

[![npm version](https://img.shields.io/npm/v/vietqr.svg)](https://www.npmjs.com/package/vietqr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **QR Generation**: Generate EMVCo-compliant VietQR strings for static and dynamic payments
- ✅ **Image Encoding**: Encode VietQR strings as PNG/SVG QR code images
- ✅ **String Parsing**: Parse VietQR strings to extract payment information
- ✅ **Data Validation**: Validate parsed data against NAPAS IBFT v1.5.2 specification
- ✅ **Type Safety**: Full TypeScript type definitions with IDE auto-completion
- ✅ **Dual Format**: Supports both CommonJS and ESM
- ✅ **Zero Config**: Works out of the box with sensible defaults
- ✅ **Battle Tested**: >98% test coverage with comprehensive test suites

## Installation

```bash
npm install vietqr
```

## Quick Start

### Generate VietQR

```typescript
import { generateVietQR } from 'vietqr';

// Generate static QR (user enters amount)
const staticQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});

console.log(staticQR.rawData); // VietQR string

// Generate dynamic QR (fixed amount)
const dynamicQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000',
  message: 'Payment for invoice #123'
});
```

### Generate QR Code Image

```typescript
import { generateQRImage } from 'vietqr';

const result = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
}, {
  format: 'png',
  width: 400,
  errorCorrectionLevel: 'M'
});

// Node.js: Save to file
import fs from 'fs/promises';
await fs.writeFile('qr.png', result.buffer);

// Browser: Create image element
const blob = new Blob([result.buffer], { type: 'image/png' });
const url = URL.createObjectURL(blob);
document.getElementById('qr-image').src = url;

// Or use base64 data URL
document.getElementById('qr-image').src = result.dataUrl;
```

### Parse VietQR String

```typescript
import { parse } from 'vietqr';

const qrString = "00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405500005802VN62160812Test Payment6304XXXX";
const result = parse(qrString);

if (result.success) {
  console.log('Bank Code:', result.data.bankCode);        // "970422"
  console.log('Account:', result.data.accountNumber);     // "0123456789"
  console.log('Amount:', result.data.amount);             // "50000"
  console.log('Message:', result.data.message);           // "Test Payment"
  console.log('Currency:', result.data.currency);         // "704" (VND)
  console.log('Country:', result.data.countryCode);       // "VN"
} else {
  console.error('Parse error:', result.error.message);
}
```

### Validate Parsed Data

```typescript
import { parse, validate } from 'vietqr';

const parseResult = parse(qrString);

if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);

  if (validation.isValid) {
    console.log('✓ Valid VietQR payment data');
    // Safe to process payment
  } else {
    console.error('✗ Validation failed:');
    validation.errors.forEach(err => {
      console.error(`  - ${err.field}: ${err.message}`);
    });
  }

  if (validation.isCorrupted) {
    console.warn('⚠ Data may be truncated or corrupted');
  }
}
```

## API Reference

### Generation API

#### `generateVietQR(config: VietQRConfig): VietQRResult`

Generate a VietQR data string from configuration.

**Parameters:**
- `config.bankBin` (string): Bank identifier (BIN) - 6 digits
- `config.accountNumber` (string): Bank account number (max 19 digits)
- `config.serviceCode` (string): Service code (`'QRIBFTTA'` for account, `'QRIBFTTC'` for card)
- `config.amount` (string, optional): Transaction amount in VND (for dynamic QR)
- `config.message` (string, optional): Payment description (max 500 characters)
- `config.purpose` (string, optional): Transaction purpose code (max 25 characters)
- `config.billNumber` (string, optional): Bill/invoice reference (max 25 characters)
- `config.merchantCategory` (string, optional): Merchant category code (4 digits)

**Returns:**
```typescript
{
  rawData: string;      // VietQR string
  qrType: 'static' | 'dynamic';
  bankBin: string;
  accountNumber: string;
  amount?: string;
  crc: string;
}
```

**Example:**
```typescript
const qr = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000',
  message: 'Payment for invoice #123',
  billNumber: 'INV-123'
});
```

#### `generateQRImage(config: VietQRConfig, options?: QRImageConfig): Promise<QRImageResult>`

Generate a QR code image from VietQR configuration.

**Parameters:**
- `config`: Same as `generateVietQR()`
- `options.format` (`'png' | 'svg'`, default: `'png'`): Output image format
- `options.width` (number, default: `300`): QR code width in pixels
- `options.errorCorrectionLevel` (`'L' | 'M' | 'Q' | 'H'`, default: `'M'`): Error correction level
- `options.margin` (number, default: `4`): Quiet zone margin size
- `options.color.dark` (string, default: `'#000000'`): Dark module color
- `options.color.light` (string, default: `'#FFFFFF'`): Light module color

**Returns:**
```typescript
{
  buffer: Buffer | Uint8Array;  // Image binary data
  dataUrl: string;              // Base64 data URL
  format: 'png' | 'svg';
  width: number;
  vietqr: VietQRResult;         // Generated VietQR data
}
```

**Example:**
```typescript
const qrImage = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
}, {
  format: 'svg',
  width: 400,
  errorCorrectionLevel: 'H',
  color: {
    dark: '#003366',
    light: '#FFFFFF'
  }
});
```

### Parsing API

#### `parse(qrString: string): ParseResult<VietQRData>`

Parse a VietQR string to extract payment information.

**Parameters:**
- `qrString` (string): EMV QR formatted VietQR string

**Returns:**
```typescript
{
  success: boolean;
  data?: VietQRData;      // Present if success = true
  error?: DecodingError;  // Present if success = false
}
```

**VietQRData Structure:**
```typescript
{
  // Payment Information
  bankCode: string;           // Bank identifier (BIN or CITAD)
  accountNumber: string;      // Bank account/card number
  amount?: string;            // Transaction amount (optional for static QR)
  currency: string;           // ISO 4217 currency code (must be "704" for VND)

  // Additional Data
  message?: string;           // Payment description
  purposeCode?: string;       // Transaction purpose code
  billNumber?: string;        // Bill/invoice reference

  // QR Metadata
  initiationMethod: 'static' | 'dynamic';
  merchantCategory?: string;  // 4-digit MCC code
  countryCode: string;        // ISO 3166-1 alpha-2 (must be "VN")

  // Technical Fields
  payloadFormatIndicator: string;  // EMV QR version (must be "01")
  crc: string;                     // CRC-16-CCITT checksum
}
```

**Example:**
```typescript
const result = parse(qrString);

if (result.success) {
  console.log('Payment to:', result.data.accountNumber);
  console.log('Amount:', result.data.amount);
} else {
  console.error('Parse failed:', result.error.message);
}
```

### Validation API

#### `validate(data: VietQRData, qrString: string): ValidationResult`

Validate parsed VietQR data against NAPAS IBFT v1.5.2 specification.

**Parameters:**
- `data`: Parsed VietQR data (from `parse()`)
- `qrString`: Original QR string (required for CRC verification)

**Returns:**
```typescript
{
  isValid: boolean;              // Overall validation status
  isCorrupted: boolean;          // Data corruption/truncation flag
  errors: ValidationError[];     // Array of validation errors
  warnings?: ValidationWarning[]; // Non-critical issues
}
```

**ValidationError Structure:**
```typescript
{
  field: string;              // Field that failed validation
  code: ValidationErrorCode;  // Machine-readable error code
  message: string;            // Human-readable description
  expectedFormat?: string;    // Expected format/constraint
  actualValue?: string;       // Actual value (sanitized)
}
```

**Example:**
```typescript
const parseResult = parse(qrString);

if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);

  if (!validation.isValid) {
    validation.errors.forEach(error => {
      console.error(`${error.field}: ${error.message}`);
    });
  }

  if (validation.isCorrupted) {
    console.warn('QR data may be corrupted');
  }
}
```

### Utility Functions

#### Type Guards

```typescript
import {
  isSuccessResult,
  isErrorResult,
  isDynamicQR,
  isStaticQR
} from 'vietqr';

// Check parse result status
if (isSuccessResult(result)) {
  // TypeScript knows result.data is defined
  processPayment(result.data);
}

if (isErrorResult(result)) {
  // TypeScript knows result.error is defined
  logError(result.error);
}

// Check QR type
if (isDynamicQR(data)) {
  console.log('Fixed amount:', data.amount);
}

if (isStaticQR(data)) {
  console.log('User will enter amount');
}
```

#### CRC Functions

```typescript
import { calculateCRC, verifyCRC } from 'vietqr';

// Calculate CRC for QR string (without CRC field)
const qrWithoutCRC = "00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405500005802VN62160812Test Payment6304";
const crc = calculateCRC(qrWithoutCRC);
console.log('CRC:', crc); // e.g., "ABCD"

// Verify CRC of complete QR string
const isValid = verifyCRC(qrString);
console.log('CRC valid:', isValid);
```

#### Constants

```typescript
import {
  NAPAS_GUID,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
  DEFAULT_MCC
} from 'vietqr';

console.log(NAPAS_GUID);        // "A000000727"
console.log(DEFAULT_CURRENCY);  // "704" (VND)
console.log(DEFAULT_COUNTRY);   // "VN"
console.log(DEFAULT_MCC);       // "5812" (Restaurants)
```

## Error Handling

### Generation Validation Errors

VietQR validates all input data before generating QR codes. Use `validateVietQRConfig()` to validate configurations or catch `ValidationError` exceptions:

```typescript
import { validateVietQRConfig, ValidationContext, ValidationError, type ValidationErrorCode } from 'vietqr';

// Option 1: Validate configuration explicitly
const config = {
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
};

try {
  validateVietQRConfig(config);
  // Config is valid, proceed with generation
  const qr = generateVietQR(config);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`${error.field}: ${error.message}`);
    console.error('Error code:', error.code);
    console.error('Expected format:', error.expectedFormat);
  }
}

// Option 2: Collect all validation errors (don't stop at first error)
const context = new ValidationContext();

validateVietQRConfig(config, context);

if (context.hasErrors()) {
  console.error('Validation failed with errors:');
  context.getErrors().forEach(error => {
    console.error(`  - ${error.field}: ${error.message} [${error.code}]`);
  });
  // Don't proceed with generation
} else {
  // All validations passed
  const qr = generateVietQR(config);
}

// Option 3: Handle specific error codes
try {
  validateVietQRConfig(config);
} catch (error) {
  if (error instanceof ValidationError) {
    switch (error.code as ValidationErrorCode) {
      case 'INVALID_BANK_BIN_LENGTH':
        console.error('Bank BIN must be exactly 6 digits');
        break;

      case 'ACCOUNT_NUMBER_TOO_LONG':
        console.error('Account number cannot exceed 19 characters');
        break;

      case 'INVALID_AMOUNT_FORMAT':
        console.error('Amount must be a valid number (e.g., "50000" or "50000.50")');
        break;

      case 'MISSING_ACCOUNT_OR_CARD':
        console.error('Must provide either accountNumber or cardNumber');
        break;

      default:
        console.error(`${error.field}: ${error.message}`);
    }
  }
}
```

### Parse Errors

```typescript
import { DecodingErrorType } from 'vietqr';

const result = parse(qrString);

if (!result.success) {
  switch (result.error.type) {
    case DecodingErrorType.INVALID_FORMAT:
      console.error('QR string format is invalid');
      break;

    case DecodingErrorType.PARSE_ERROR:
      console.error('Failed to parse QR structure');
      break;

    default:
      console.error('Unexpected error:', result.error.message);
  }
}
```

### Decoding Validation Errors

```typescript
import { ValidationErrorCode } from 'vietqr';

validation.errors.forEach(error => {
  switch (error.code) {
    case ValidationErrorCode.CHECKSUM_MISMATCH:
      console.error('QR data corrupted - checksum mismatch');
      break;

    case ValidationErrorCode.INVALID_CURRENCY:
      console.error('Only VND currency is supported');
      break;

    case ValidationErrorCode.MISSING_REQUIRED_FIELD:
      console.error(`Required field missing: ${error.field}`);
      break;

    case ValidationErrorCode.LENGTH_EXCEEDED:
      console.error(`Field ${error.field} exceeds maximum length`);
      break;

    default:
      console.error(`${error.field}: ${error.message}`);
  }
});
```

### Validation Error Code Reference

VietQR provides machine-readable error codes for programmatic error handling. See detailed documentation in `src/validators/error-codes.ts`.

#### Required Field Errors
| Code | Description |
|------|-------------|
| `MISSING_REQUIRED_FIELD` | Required field is undefined, null, or empty after trimming |
| `MISSING_ACCOUNT_OR_CARD` | Either accountNumber or cardNumber must be provided |
| `BOTH_ACCOUNT_AND_CARD` | Cannot provide both accountNumber and cardNumber |

#### Bank Validation Errors
| Code | Description |
|------|-------------|
| `INVALID_BANK_BIN` | Bank BIN format or length error (general) |
| `INVALID_BANK_BIN_FORMAT` | Bank BIN contains non-numeric characters |
| `INVALID_BANK_BIN_LENGTH` | Bank BIN is not exactly 6 digits |

#### Account/Card Validation Errors
| Code | Description |
|------|-------------|
| `INVALID_ACCOUNT_NUMBER` | Account number validation error (general) |
| `ACCOUNT_NUMBER_TOO_LONG` | Account number exceeds 19 characters |
| `INVALID_ACCOUNT_CHARACTERS` | Account number contains non-alphanumeric characters |
| `INVALID_CARD_NUMBER` | Card number validation error (general) |
| `CARD_NUMBER_TOO_LONG` | Card number exceeds 19 characters |
| `INVALID_CARD_CHARACTERS` | Card number contains non-alphanumeric characters |

#### Service Code Errors
| Code | Description |
|------|-------------|
| `INVALID_SERVICE_CODE` | Service code must be QRIBFTTA or QRIBFTTC |
| `ACCOUNT_REQUIRED_FOR_QRIBFTTA` | QRIBFTTA service code requires accountNumber |
| `CARD_REQUIRED_FOR_QRIBFTTC` | QRIBFTTC service code requires cardNumber |

#### Amount Validation Errors
| Code | Description |
|------|-------------|
| `INVALID_AMOUNT_FORMAT` | Amount contains non-numeric characters or invalid decimal format |
| `INVALID_AMOUNT_VALUE` | Amount must be a positive number (> 0) |
| `AMOUNT_TOO_LONG` | Amount exceeds 13 characters (including decimal point) |
| `INVALID_DYNAMIC_AMOUNT` | Dynamic QR codes require a valid positive amount |

#### Currency/Country Errors
| Code | Description |
|------|-------------|
| `INVALID_CURRENCY_CODE` | Currency code must be "704" (Vietnamese Dong - VND) |
| `INVALID_COUNTRY_CODE` | Country code must be "VN" (Vietnam) |

#### Merchant Category Errors
| Code | Description |
|------|-------------|
| `INVALID_MCC_CODE` | Merchant category code validation error (general) |
| `INVALID_MCC_LENGTH` | Merchant category code must be exactly 4 digits |
| `INVALID_MCC_FORMAT` | Merchant category code must contain only numeric characters |

#### Additional Data Errors
| Code | Description |
|------|-------------|
| `MESSAGE_TOO_LONG` | Message exceeds 500 characters |
| `BILL_NUMBER_TOO_LONG` | Bill number exceeds 25 characters |
| `INVALID_BILL_CHARACTERS` | Bill number contains invalid characters (only alphanumeric, hyphen, underscore allowed) |
| `PURPOSE_TOO_LONG` | Purpose exceeds 25 characters |
| `REFERENCE_LABEL_TOO_LONG` | Reference label exceeds 25 characters |
| `INVALID_REFERENCE_CHARACTERS` | Reference label contains non-alphanumeric characters |

### Handling Corrupted Data

VietQR gracefully handles corrupted or truncated data:

```typescript
const result = parse(corruptedQRString);

if (result.success) {
  const validation = validate(result.data, corruptedQRString);

  if (validation.isCorrupted) {
    console.warn('QR data is corrupted but partial data extracted:');
    console.log('Bank:', result.data.bankCode);
    console.log('Account:', result.data.accountNumber);

    // Decide whether to use partial data based on business logic
    const hasCriticalFields = result.data.bankCode && result.data.accountNumber;
    if (hasCriticalFields) {
      console.log('Critical fields present, can proceed with caution');
    }
  }
}
```

## TypeScript Support

VietQR is written in TypeScript and provides full type definitions:

```typescript
import type {
  VietQRConfig,
  VietQRResult,
  QRImageConfig,
  QRImageResult,
  VietQRData,
  ParseResult,
  ValidationResult,
  ValidationError,
  DecodingError
} from 'vietqr';

// All types are exported and fully documented
```

## Browser Support

VietQR works in both Node.js and modern browsers:

- **Node.js**: 18.x or later
- **Browsers**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+

### Browser Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>VietQR Demo</title>
</head>
<body>
  <div id="qr-container"></div>

  <script type="module">
    import { generateQRImage } from 'https://unpkg.com/vietqr';

    const result = await generateQRImage({
      bankBin: '970422',
      accountNumber: '0123456789',
      serviceCode: 'QRIBFTTA',
      amount: '50000',
      message: 'Payment for order #123'
    });

    const img = document.createElement('img');
    img.src = result.dataUrl;
    document.getElementById('qr-container').appendChild(img);
  </script>
</body>
</html>
```

## Testing

VietQR includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Overall**: >98% coverage
- **Unit Tests**: 625+ passing tests
- **Integration Tests**: Complete workflow coverage
- **Compliance Tests**: NAPAS IBFT v1.5.2 specification validation

## Performance

- **QR Generation**: <10ms for typical configurations
- **String Parsing**: <100ms for standard VietQR strings
- **Validation**: <50ms for typical data
- **Image Encoding**: <200ms for PNG, <100ms for SVG

## Specification Compliance

VietQR implements:

- ✅ **NAPAS IBFT v1.5.2**: Vietnamese domestic payment QR specification
- ✅ **EMV QR Code Specification**: Tag-Length-Value (TLV) format
- ✅ **ISO 4217**: Currency codes (VND = 704)
- ✅ **ISO 3166-1**: Country codes (Vietnam = VN)
- ✅ **CRC-16-CCITT**: Checksum verification with polynomial 0x1021

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting pull requests.

## License

MIT © [Your Name]

## Related Projects

- [QRCode](https://github.com/soldair/node-qrcode) - QR code generation library
- [NAPAS](https://napas.com.vn) - Vietnam National Payment Corporation

## Support

- **Issues**: [GitHub Issues](https://github.com/binhnguyenduc/vietqr/issues)
- **Documentation**: [API Reference](./docs/api/)
- **Specification**: [NAPAS IBFT v1.5.2](https://napas.com.vn)

---

**Made with ❤️ for the Vietnamese payment ecosystem**
