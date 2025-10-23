# Decoding API

Functions for decoding VietQR data from images.

## decode()

Decode VietQR data from a QR code image.

### Signature

```typescript
function decode(
  imageBuffer: Buffer | Uint8Array
): ParseResult<VietQRData>
```

### Parameters

- **imageBuffer** (`Buffer | Uint8Array`): Image data in PNG or JPEG format

### Returns

`ParseResult<VietQRData>` - Result containing parsed data or error

### Examples

#### Decode from File (Node.js)

```typescript
import { readFileSync } from 'fs';
import { decode } from 'vietqr-ts';

// Read image file
const imageBuffer = readFileSync('qr-code.png');

// Decode QR code
const result = decode(imageBuffer);

if (result.success) {
  console.log('Bank:', result.data.bankCode);
  console.log('Account:', result.data.accountNumber);
  console.log('Amount:', result.data.amount);
} else {
  console.error('Decode failed:', result.error.message);
}
```

#### Decode from HTTP Response (Node.js)

```typescript
import fetch from 'node-fetch';
import { decode } from 'vietqr-ts';

// Fetch QR code image
const response = await fetch('https://example.com/qr-code.png');
const imageBuffer = Buffer.from(await response.arrayBuffer());

// Decode
const result = decode(imageBuffer);

if (result.success) {
  console.log('Decoded:', result.data);
}
```

#### Decode from Base64

```typescript
import { decode } from 'vietqr-ts';

// Convert base64 to buffer
const base64Image = 'iVBORw0KGgoAAAANS...';
const imageBuffer = Buffer.from(base64Image, 'base64');

// Decode
const result = decode(imageBuffer);
```

#### Error Handling

```typescript
import { decode, DecodingErrorType } from 'vietqr-ts';

const result = decode(imageBuffer);

if (!result.success) {
  switch (result.error.type) {
    case DecodingErrorType.NO_QR_CODE_FOUND:
      console.error('No QR code detected in image');
      break;

    case DecodingErrorType.IMAGE_DECODE_ERROR:
      console.error('Invalid or corrupted image format');
      break;

    case DecodingErrorType.UNSUPPORTED_FORMAT:
      console.error('Image format not supported (use PNG or JPEG)');
      break;

    case DecodingErrorType.SIZE_LIMIT_EXCEEDED:
      console.error('Image file too large (max 10MB)');
      break;

    case DecodingErrorType.MULTIPLE_QR_CODES:
      console.error('Multiple QR codes found - only one expected');
      break;

    case DecodingErrorType.PARSE_ERROR:
      console.error('QR code contains invalid VietQR data');
      break;
  }
}
```

---

## decodeAndValidate()

Decode and validate VietQR data from image in one step.

### Signature

```typescript
function decodeAndValidate(
  imageBuffer: Buffer | Uint8Array
): ParseResult<ValidationResult>
```

### Parameters

- **imageBuffer** (`Buffer | Uint8Array`): Image data in PNG or JPEG format

### Returns

`ParseResult<ValidationResult>` - Result containing validation result or error

### Examples

#### Basic Usage

```typescript
import { decodeAndValidate } from 'vietqr-ts';

const result = decodeAndValidate(imageBuffer);

if (result.success) {
  const validation = result.data;

  if (validation.isValid) {
    console.log('✅ Valid VietQR code');
  } else {
    console.log('❌ Invalid VietQR code');
    validation.errors.forEach(err => {
      console.log(`  ${err.field}: ${err.message}`);
    });
  }
} else {
  console.error('Decode failed:', result.error.message);
}
```

#### Complete Workflow

```typescript
import {
  decodeAndValidate,
  isSuccessResult,
  ValidationErrorCode
} from 'vietqr-ts';

const result = decodeAndValidate(imageBuffer);

if (!isSuccessResult(result)) {
  console.error('Failed to decode image:', result.error.message);
  return;
}

const validation = result.data;

// Check if data is valid
if (!validation.isValid) {
  console.error('❌ Validation failed');

  // Check for specific errors
  const hasCRCError = validation.errors.some(
    err => err.code === ValidationErrorCode.CHECKSUM_MISMATCH
  );

  if (hasCRCError) {
    console.error('  CRC checksum failed - QR may be corrupted');
  }

  return;
}

// Check for corruption signs
if (validation.isCorrupted) {
  console.warn('⚠️  QR code may be corrupted or tampered');
}

// Check warnings
if (validation.warnings && validation.warnings.length > 0) {
  console.log('ℹ️  Warnings:');
  validation.warnings.forEach(warn => {
    console.log(`  ${warn.field}: ${warn.message}`);
  });
}

console.log('✅ QR code is valid');
```

#### Production Usage

```typescript
import { readFileSync } from 'fs';
import { decodeAndValidate } from 'vietqr-ts';

function processQRImage(imagePath: string) {
  try {
    const imageBuffer = readFileSync(imagePath);
    const result = decodeAndValidate(imageBuffer);

    if (!result.success) {
      return {
        success: false,
        error: `Image decode failed: ${result.error.message}`
      };
    }

    const validation = result.data;

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid VietQR data',
        details: validation.errors.map(e => e.message)
      };
    }

    if (validation.isCorrupted) {
      return {
        success: false,
        error: 'QR code appears corrupted or tampered'
      };
    }

    return {
      success: true,
      warnings: validation.warnings
    };

  } catch (error) {
    return {
      success: false,
      error: `File operation failed: ${error.message}`
    };
  }
}
```

---

## Helper Functions

### isValidImageSize()

Check if image buffer size is within limits.

```typescript
function isValidImageSize(
  imageBuffer: Buffer | Uint8Array
): boolean
```

**Parameters**:
- **imageBuffer** (`Buffer | Uint8Array`): Image data to check

**Returns**: `boolean` - `true` if size is valid, `false` otherwise

**Example**:
```typescript
import { isValidImageSize, MAX_IMAGE_SIZE } from 'vietqr-ts';

if (!isValidImageSize(imageBuffer)) {
  console.error(`Image too large (max ${MAX_IMAGE_SIZE} bytes)`);
  return;
}

// Proceed with decoding
const result = decode(imageBuffer);
```

---

### detectImageFormat()

Detect image format from buffer.

```typescript
function detectImageFormat(
  imageBuffer: Buffer | Uint8Array
): ImageFormat

type ImageFormat = 'png' | 'jpeg' | 'unknown';
```

**Parameters**:
- **imageBuffer** (`Buffer | Uint8Array`): Image data to analyze

**Returns**: `ImageFormat` - Detected format: `'png'`, `'jpeg'`, or `'unknown'`

**Example**:
```typescript
import { detectImageFormat } from 'vietqr-ts';

const format = detectImageFormat(imageBuffer);

switch (format) {
  case 'png':
    console.log('PNG image detected');
    break;
  case 'jpeg':
    console.log('JPEG image detected');
    break;
  case 'unknown':
    console.error('Unsupported image format');
    return;
}

// Proceed with decoding
const result = decode(imageBuffer);
```

---

## Constants

### MAX_IMAGE_SIZE

Maximum allowed image file size in bytes.

```typescript
const MAX_IMAGE_SIZE: number; // 10 MB
```

**Usage**:
```typescript
import { MAX_IMAGE_SIZE } from 'vietqr-ts';

console.log(`Maximum image size: ${MAX_IMAGE_SIZE} bytes`);
console.log(`Maximum image size: ${MAX_IMAGE_SIZE / 1024 / 1024} MB`);
```

---

## Complete Examples

### Web API Endpoint (Express)

```typescript
import express from 'express';
import multer from 'multer';
import { decodeAndValidate, isSuccessResult, MAX_IMAGE_SIZE } from 'vietqr-ts';

const app = express();
const upload = multer({
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are supported'));
    }
  }
});

app.post('/api/decode-qr', upload.single('qr_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const result = decodeAndValidate(req.file.buffer);

  if (!isSuccessResult(result)) {
    return res.status(400).json({
      error: 'Decode failed',
      message: result.error.message,
      type: result.error.type
    });
  }

  const validation = result.data;

  if (!validation.isValid) {
    return res.status(422).json({
      error: 'Invalid VietQR data',
      errors: validation.errors,
      warnings: validation.warnings
    });
  }

  if (validation.isCorrupted) {
    return res.status(422).json({
      error: 'QR code appears corrupted',
      warnings: ['Data integrity check failed']
    });
  }

  res.json({
    success: true,
    warnings: validation.warnings,
    message: 'QR code decoded and validated successfully'
  });
});

app.listen(3000, () => {
  console.log('QR decode API listening on port 3000');
});
```

### Batch Processing

```typescript
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { decode, isSuccessResult } from 'vietqr-ts';

function batchDecodeQRImages(directoryPath: string) {
  const files = readdirSync(directoryPath);
  const results = [];

  for (const file of files) {
    if (!file.match(/\.(png|jpe?g)$/i)) {
      continue; // Skip non-image files
    }

    const filePath = join(directoryPath, file);
    console.log(`Processing ${file}...`);

    try {
      const imageBuffer = readFileSync(filePath);
      const result = decode(imageBuffer);

      if (isSuccessResult(result)) {
        results.push({
          file,
          success: true,
          data: result.data
        });
        console.log(`  ✅ Decoded successfully`);
      } else {
        results.push({
          file,
          success: false,
          error: result.error.message
        });
        console.log(`  ❌ Failed: ${result.error.message}`);
      }
    } catch (error) {
      results.push({
        file,
        success: false,
        error: error.message
      });
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  return results;
}

// Usage
const results = batchDecodeQRImages('./qr-images');
console.log(`\nProcessed ${results.length} files`);
console.log(`Success: ${results.filter(r => r.success).length}`);
console.log(`Failed: ${results.filter(r => !r.success).length}`);
```

### Image Validation Pipeline

```typescript
import { readFileSync } from 'fs';
import {
  isValidImageSize,
  detectImageFormat,
  decode,
  validate,
  isSuccessResult
} from 'vietqr-ts';

function validateQRImagePipeline(imagePath: string, qrString?: string) {
  // Step 1: Read image
  let imageBuffer: Buffer;
  try {
    imageBuffer = readFileSync(imagePath);
  } catch (error) {
    return { step: 'read', error: 'Failed to read image file' };
  }

  // Step 2: Check size
  if (!isValidImageSize(imageBuffer)) {
    return { step: 'size', error: 'Image size exceeds limit' };
  }

  // Step 3: Check format
  const format = detectImageFormat(imageBuffer);
  if (format === 'unknown') {
    return { step: 'format', error: 'Unsupported image format' };
  }

  // Step 4: Decode QR
  const decodeResult = decode(imageBuffer);
  if (!isSuccessResult(decodeResult)) {
    return {
      step: 'decode',
      error: decodeResult.error.message,
      type: decodeResult.error.type
    };
  }

  // Step 5: Extract original QR string if needed
  const extractedQRString = qrString || 'reconstructed-from-data';

  // Step 6: Validate data
  const validation = validate(decodeResult.data, extractedQRString);

  return {
    step: 'complete',
    format,
    data: decodeResult.data,
    validation: {
      isValid: validation.isValid,
      isCorrupted: validation.isCorrupted,
      errorCount: validation.errors.length,
      warningCount: validation.warnings?.length || 0
    }
  };
}
```
