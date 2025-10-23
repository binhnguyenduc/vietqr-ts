# VietQR-TS API Reference

**Library**: vietqr-ts
**Version**: 1.0.0
**Type**: TypeScript/JavaScript
**Platform**: Node.js 20+, Browser (ES2020+)

## Overview

VietQR-TS provides EMVCo-compliant Vietnamese QR payment code generation, parsing, validation, and image handling following NAPAS IBFT v1.5.2 specification.

---

## Core Functions

### generateVietQR

Generate EMVCo-compliant VietQR data strings for static or dynamic payments.

**Signature:**
```typescript
function generateVietQR(config: VietQRConfig): VietQRResult
```

**Parameters:**

- `config: VietQRConfig` - Configuration object with payment details

**VietQRConfig Type:**
```typescript
interface VietQRConfig {
  bankBin: string;           // 6-digit bank identification number (required)
  accountNumber: string;     // Account number or card number (required)
  serviceCode: string;       // Service code: 'QRIBFTTA' or 'QRIBFTTC' (required)
  amount?: number;           // Payment amount in VND (optional, for dynamic QR)
  message?: string;          // Payment description (optional, max 25 chars)
  billNumber?: string;       // Invoice/bill number (optional)
  purpose?: string;          // Payment purpose code (optional)
  merchantCategory?: string; // Merchant category code (optional)
}
```

**Returns:**

```typescript
interface VietQRResult {
  rawData: string;           // Complete VietQR string with CRC
  qrString: string;          // Same as rawData (alias for compatibility)
  amount?: number;           // Amount if specified (dynamic QR)
  message?: string;          // Message if specified
  isDynamic: boolean;        // true if amount specified, false otherwise
}
```

**Examples:**

```typescript
// Static QR - user enters amount at payment time
const staticQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});
console.log(staticQR.rawData);
// Output: "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304XXXX"

// Dynamic QR - fixed amount payment
const dynamicQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: 50000,
  message: 'Payment for order #123'
});
console.log(dynamicQR.amount); // 50000
console.log(dynamicQR.isDynamic); // true

// Full featured QR with all optional fields
const fullQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: 100000,
  message: 'Invoice payment',
  billNumber: 'INV-2024-001',
  purpose: 'BILL_PAYMENT',
  merchantCategory: '5411' // Grocery stores
});
```

**Service Codes:**
- `QRIBFTTA` - Account number based transfer
- `QRIBFTTC` - Card number based transfer

**Common Bank BINs:**
- `970422` - MB Bank
- `970415` - Vietinbank
- `970436` - Vietcombank
- `970418` - BIDV
- `970405` - Agribank

---

### generateQRImage

Generate QR code image (PNG or SVG) from VietQR data string.

**Signature:**
```typescript
function generateQRImage(
  data: string,
  options?: QRImageOptions
): Promise<string>
```

**Parameters:**

- `data: string` - VietQR data string (from generateVietQR)
- `options?: QRImageOptions` - Image generation options

**QRImageOptions Type:**
```typescript
interface QRImageOptions {
  format?: 'png' | 'svg';           // Image format (default: 'png')
  size?: number;                    // QR code size in pixels (default: 300)
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction (default: 'M')
  margin?: number;                  // Quiet zone margin (default: 4)
  darkColor?: string;               // Dark module color (default: '#000000')
  lightColor?: string;              // Light module color (default: '#FFFFFF')
}
```

**Returns:**

`Promise<string>` - Data URL (base64 encoded image)

**Examples:**

```typescript
// Generate PNG QR code (default)
const qrData = generateVietQR({ /* config */ }).rawData;
const pngImage = await generateQRImage(qrData);
// Returns: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."

// Generate SVG QR code
const svgImage = await generateQRImage(qrData, { format: 'svg' });
// Returns: "data:image/svg+xml;utf8,<svg xmlns=..."

// Custom sized PNG with high error correction
const customQR = await generateQRImage(qrData, {
  format: 'png',
  size: 500,
  errorCorrectionLevel: 'H',
  margin: 2
});

// Custom colored QR code
const coloredQR = await generateQRImage(qrData, {
  darkColor: '#1E40AF',  // Blue
  lightColor: '#F3F4F6'  // Light gray
});

// Browser usage - display in img element
const img = document.createElement('img');
img.src = await generateQRImage(qrData);
document.body.appendChild(img);

// Node.js usage - save to file
import fs from 'fs/promises';
const imageData = await generateQRImage(qrData);
const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
await fs.writeFile('qr-code.png', Buffer.from(base64Data, 'base64'));
```

**Error Correction Levels:**
- `L` - Low (7% recovery)
- `M` - Medium (15% recovery) - Default, recommended
- `Q` - Quartile (25% recovery)
- `H` - High (30% recovery) - Use for logos/branding

---

### parse

Parse VietQR string to extract payment information.

**Signature:**
```typescript
function parse(qrString: string): ParseResult<VietQRData>
```

**Parameters:**

- `qrString: string` - VietQR data string to parse

**Returns:**

```typescript
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ParseError };

interface VietQRData {
  version: string;              // EMV version (e.g., "01")
  initiationMethod?: string;    // "11" static, "12" dynamic
  bankCode?: string;            // Bank BIN
  accountNumber?: string;       // Account/card number
  serviceCode?: string;         // "QRIBFTTA" or "QRIBFTTC"
  amount?: number;              // Payment amount (if dynamic)
  currency?: string;            // Currency code ("704" for VND)
  country?: string;             // Country code ("VN")
  message?: string;             // Payment message
  billNumber?: string;          // Bill/invoice number
  purpose?: string;             // Payment purpose
  merchantCategory?: string;    // Merchant category code
  crc?: string;                 // CRC checksum
}
```

**Examples:**

```typescript
// Parse static QR
const qrString = "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF";
const result = parse(qrString);

if (result.success) {
  console.log(result.data.bankCode);      // "970422"
  console.log(result.data.accountNumber); // "0123456789"
  console.log(result.data.serviceCode);   // "QRIBFTTA"
  console.log(result.data.amount);        // undefined (static QR)
} else {
  console.error(result.error.message);
}

// Parse dynamic QR with amount
const dynamicQR = "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA540650005453037045802VN6304XXXX";
const dynamicResult = parse(dynamicQR);

if (dynamicResult.success) {
  console.log(dynamicResult.data.amount); // 50000
}

// Handle parse errors
const invalidQR = "invalid-qr-string";
const errorResult = parse(invalidQR);

if (!errorResult.success) {
  console.log(errorResult.error.type);    // "PARSE_ERROR"
  console.log(errorResult.error.message); // Descriptive error
}

// Type guard usage
import { isSuccessResult } from 'vietqr-ts';

const parseResult = parse(qrString);
if (isSuccessResult(parseResult)) {
  // TypeScript knows parseResult.data exists
  const amount = parseResult.data.amount;
}
```

---

### validate

Validate parsed VietQR data against NAPAS IBFT v1.5.2 specification.

**Signature:**
```typescript
function validate(
  data: VietQRData,
  originalQrString?: string
): ValidationResult
```

**Parameters:**

- `data: VietQRData` - Parsed VietQR data
- `originalQrString?: string` - Original QR string for CRC validation (optional)

**Returns:**

```typescript
interface ValidationResult {
  isValid: boolean;              // Overall validation status
  errors: ValidationError[];     // Array of validation errors
  warnings?: ValidationWarning[]; // Array of warnings (non-critical)
}

interface ValidationError {
  field: string;      // Field name that failed validation
  message: string;    // Error description
  code: string;       // Machine-readable error code
}
```

**Examples:**

```typescript
// Validate parsed data
const parseResult = parse(qrString);
if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);

  if (validation.isValid) {
    console.log('✓ Valid VietQR');
  } else {
    console.log('✗ Invalid VietQR');
    validation.errors.forEach(err => {
      console.log(`${err.field}: ${err.message}`);
    });
  }
}

// Validate without CRC check
const dataOnly = validate(parseResult.data);

// Example validation errors
{
  isValid: false,
  errors: [
    {
      field: 'bankCode',
      message: 'Bank BIN must be exactly 6 digits',
      code: 'INVALID_BANK_BIN'
    },
    {
      field: 'amount',
      message: 'Amount must be positive',
      code: 'INVALID_AMOUNT'
    }
  ]
}

// Common validation scenarios
const scenarios = [
  { field: 'accountNumber', code: 'MISSING_ACCOUNT_NUMBER' },
  { field: 'serviceCode', code: 'INVALID_SERVICE_CODE' },
  { field: 'crc', code: 'INVALID_CRC' },
  { field: 'message', code: 'MESSAGE_TOO_LONG' }
];
```

---

### decode

Decode QR code from image (PNG/JPEG) to extract VietQR string and parse data.

**Signature:**
```typescript
function decode(imageBuffer: Buffer | Uint8Array): ParseResult<VietQRData>
```

**Parameters:**

- `imageBuffer: Buffer | Uint8Array` - Image data (PNG or JPEG)

**Returns:**

Same as `parse()` - `ParseResult<VietQRData>`

**Examples:**

```typescript
// Node.js - decode from file
import fs from 'fs/promises';

const imageBuffer = await fs.readFile('qr-code.png');
const result = decode(imageBuffer);

if (result.success) {
  console.log('Bank:', result.data.bankCode);
  console.log('Account:', result.data.accountNumber);
  console.log('Amount:', result.data.amount);
} else {
  console.error('Decode failed:', result.error.message);
}

// Browser - decode from file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const result = decode(uint8Array);
  if (result.success) {
    console.log('Decoded data:', result.data);
  }
});

// Handle decode errors
const invalidImage = Buffer.from('not-an-image');
const errorResult = decode(invalidImage);

if (!errorResult.success) {
  console.log(errorResult.error.type);
  // Possible types: "IMAGE_DECODE_ERROR", "NO_QR_CODE_FOUND",
  //                 "UNSUPPORTED_FORMAT", "SIZE_LIMIT_EXCEEDED"
}
```

**Supported Formats:**
- PNG (recommended)
- JPEG/JPG

**Size Limits:**
- Maximum file size: 2MB

---

### decodeAndValidate

Decode QR code from image and validate the parsed data.

**Signature:**
```typescript
function decodeAndValidate(
  imageBuffer: Buffer | Uint8Array
): ParseResult<ValidationResult>
```

**Parameters:**

- `imageBuffer: Buffer | Uint8Array` - Image data (PNG or JPEG)

**Returns:**

`ParseResult<ValidationResult>` - Validation result or error

**Examples:**

```typescript
// Decode and validate in one step
const imageBuffer = await fs.readFile('qr-code.png');
const result = decodeAndValidate(imageBuffer);

if (result.success) {
  if (result.data.isValid) {
    console.log('✓ Valid VietQR payment code');
    // Safe to process payment
  } else {
    console.warn('✗ Invalid VietQR data');
    result.data.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
} else {
  console.error('Decode failed:', result.error.message);
}

// Payment processing workflow
async function processQRPayment(imageBuffer: Buffer) {
  const result = decodeAndValidate(imageBuffer);

  if (!result.success) {
    throw new Error(`QR decode failed: ${result.error.message}`);
  }

  if (!result.data.isValid) {
    const errors = result.data.errors.map(e => e.message).join(', ');
    throw new Error(`Invalid QR: ${errors}`);
  }

  // QR is valid, extract data
  const parseResult = decode(imageBuffer);
  if (parseResult.success) {
    return {
      bank: parseResult.data.bankCode,
      account: parseResult.data.accountNumber,
      amount: parseResult.data.amount,
      message: parseResult.data.message
    };
  }
}
```

---

## Utility Functions

### calculateCRC

Calculate CRC-16-CCITT checksum for VietQR string.

**Signature:**
```typescript
function calculateCRC(data: string): string
```

**Parameters:**

- `data: string` - VietQR data without CRC field

**Returns:**

`string` - 4-character hexadecimal CRC checksum

**Example:**

```typescript
const partialQR = "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304";
const crc = calculateCRC(partialQR);
console.log(crc); // "A3CF"

const completeQR = partialQR + crc;
```

---

### verifyCRC

Verify CRC checksum of complete VietQR string.

**Signature:**
```typescript
function verifyCRC(qrString: string): boolean
```

**Parameters:**

- `qrString: string` - Complete VietQR string with CRC

**Returns:**

`boolean` - true if CRC is valid, false otherwise

**Example:**

```typescript
const validQR = "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF";
console.log(verifyCRC(validQR)); // true

const invalidQR = "00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304FFFF";
console.log(verifyCRC(invalidQR)); // false
```

---

### isValidImageSize

Check if image buffer size is within acceptable limits (< 2MB).

**Signature:**
```typescript
function isValidImageSize(buffer: Buffer | Uint8Array): boolean
```

**Parameters:**

- `buffer: Buffer | Uint8Array` - Image data

**Returns:**

`boolean` - true if size is valid, false if exceeds limit

**Example:**

```typescript
const imageBuffer = await fs.readFile('qr-code.png');

if (!isValidImageSize(imageBuffer)) {
  console.error('Image too large (max 2MB)');
} else {
  const result = decode(imageBuffer);
}
```

---

### detectImageFormat

Detect image format from buffer (PNG, JPEG, or unknown).

**Signature:**
```typescript
function detectImageFormat(buffer: Buffer | Uint8Array): ImageFormat

type ImageFormat = 'png' | 'jpeg' | 'svg' | 'unknown';
```

**Parameters:**

- `buffer: Buffer | Uint8Array` - Image data

**Returns:**

`ImageFormat` - Detected format or 'unknown'

**Example:**

```typescript
const buffer = await fs.readFile('image.png');
const format = detectImageFormat(buffer);

console.log(format); // "png"

if (format === 'unknown') {
  console.error('Unsupported image format');
}
```

---

## Type Guards

### isSuccessResult

Type guard to check if ParseResult is successful.

**Signature:**
```typescript
function isSuccessResult<T>(result: ParseResult<T>): result is { success: true; data: T }
```

**Example:**

```typescript
const result = parse(qrString);

if (isSuccessResult(result)) {
  // TypeScript knows result.data exists
  console.log(result.data.bankCode);
}
```

---

### isErrorResult

Type guard to check if ParseResult is an error.

**Signature:**
```typescript
function isErrorResult<T>(result: ParseResult<T>): result is { success: false; error: ParseError }
```

**Example:**

```typescript
const result = decode(imageBuffer);

if (isErrorResult(result)) {
  // TypeScript knows result.error exists
  console.error(result.error.message);
}
```

---

### isDynamicQR

Check if VietQRData represents a dynamic QR (has amount).

**Signature:**
```typescript
function isDynamicQR(data: VietQRData): boolean
```

**Example:**

```typescript
const parseResult = parse(qrString);

if (parseResult.success && isDynamicQR(parseResult.data)) {
  console.log(`Amount: ${parseResult.data.amount} VND`);
}
```

---

### isStaticQR

Check if VietQRData represents a static QR (no amount).

**Signature:**
```typescript
function isStaticQR(data: VietQRData): boolean
```

**Example:**

```typescript
if (parseResult.success && isStaticQR(parseResult.data)) {
  console.log('User must enter amount');
}
```

---

## Constants

### NAPAS_GUID

NAPAS globally unique identifier for VietQR.

```typescript
const NAPAS_GUID = 'A000000727';
```

---

### VIETNAM_COUNTRY_CODE

ISO 3166-1 country code for Vietnam.

```typescript
const VIETNAM_COUNTRY_CODE = 'VN';
```

---

### VND_CURRENCY_CODE

ISO 4217 currency code for Vietnamese Dong.

```typescript
const VND_CURRENCY_CODE = '704';
```

---

## Error Codes

### DecodingErrorType

```typescript
enum DecodingErrorType {
  IMAGE_DECODE_ERROR = 'IMAGE_DECODE_ERROR',
  NO_QR_CODE_FOUND = 'NO_QR_CODE_FOUND',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  SIZE_LIMIT_EXCEEDED = 'SIZE_LIMIT_EXCEEDED',
  PARSE_ERROR = 'PARSE_ERROR'
}
```

### Common Validation Error Codes

- `INVALID_BANK_BIN` - Bank BIN must be 6 digits
- `MISSING_ACCOUNT_NUMBER` - Account number required
- `INVALID_SERVICE_CODE` - Must be QRIBFTTA or QRIBFTTC
- `INVALID_AMOUNT` - Amount must be positive number
- `MESSAGE_TOO_LONG` - Message exceeds 25 characters
- `INVALID_CRC` - CRC checksum verification failed

---

## Platform Support

**Node.js:**
- Version: 20.x or later
- Module formats: ESM, CommonJS
- All functions supported

**Browser:**
- Modern browsers (ES2020+)
- Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- All functions supported
- Use bundler (webpack/vite) for optimal compatibility

**Import Styles:**

```typescript
// ESM (recommended)
import { generateVietQR, generateQRImage } from 'vietqr-ts';

// CommonJS
const { generateVietQR, generateQRImage } = require('vietqr-ts');

// Browser (via bundler)
import { generateVietQR } from 'vietqr-ts';
```
