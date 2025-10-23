# VietQR-TS Troubleshooting Guide

**Library**: vietqr-ts
**Version**: 1.0.0
**Category**: Error Handling & Debugging

## Overview

Common issues, error messages, solutions, and debugging strategies for VietQR-TS library.

---

## Quick Diagnostics

### Is my QR code valid?

```typescript
import { parse, validate, verifyCRC } from 'vietqr-ts';

const qrString = "your-qr-string-here";

// Step 1: Check CRC
console.log('CRC valid:', verifyCRC(qrString));

// Step 2: Try parsing
const parseResult = parse(qrString);
console.log('Parse result:', parseResult);

// Step 3: Validate if parsed successfully
if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);
  console.log('Validation:', validation);
}
```

---

## Common Errors and Solutions

### Error: "Bank BIN must be exactly 6 digits"

**Cause**: Invalid or incorrectly formatted bank BIN

**Solutions:**

```typescript
// ❌ Wrong - not 6 digits
generateVietQR({
  bankBin: '9704',  // Too short
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});

// ❌ Wrong - contains non-digits
generateVietQR({
  bankBin: 'MB9704',  // Has letters
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});

// ✅ Correct - exactly 6 digits
generateVietQR({
  bankBin: '970422',  // MB Bank
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});
```

**Common Bank BINs:**
- MB Bank: `970422`
- Vietinbank: `970415`
- Vietcombank: `970436`
- BIDV: `970418`
- Agribank: `970405`
- Techcombank: `970407`
- ACB: `970416`
- VPBank: `970432`

---

### Error: "No QR code found in image"

**Cause**: Image doesn't contain a readable QR code

**Solutions:**

```typescript
// 1. Check image quality
const isValidSize = isValidImageSize(imageBuffer);
if (!isValidSize) {
  console.error('Image too large (max 2MB)');
}

// 2. Check image format
const format = detectImageFormat(imageBuffer);
console.log('Format:', format); // Should be 'png' or 'jpeg'

// 3. Ensure QR code is visible and clear
// - Adequate resolution (minimum 300x300 pixels)
// - Good contrast
// - Not blurry or distorted
// - QR code occupies significant portion of image

// 4. Try preprocessing image
// - Crop to QR code only
// - Increase contrast
// - Remove noise
```

**Example: Image Validation**

```typescript
async function validateQRImage(imageBuffer: Buffer): Promise<string[]> {
  const issues: string[] = [];

  // Check size
  if (!isValidImageSize(imageBuffer)) {
    issues.push('Image exceeds 2MB size limit');
  }

  // Check format
  const format = detectImageFormat(imageBuffer);
  if (format !== 'png' && format !== 'jpeg') {
    issues.push(`Unsupported format: ${format} (use PNG or JPEG)`);
  }

  // Check dimensions (requires image library)
  // const dimensions = await getImageDimensions(imageBuffer);
  // if (dimensions.width < 300 || dimensions.height < 300) {
  //   issues.push('Image resolution too low (minimum 300x300)');
  // }

  return issues;
}
```

---

### Error: "Message exceeds maximum length (25 characters)"

**Cause**: Payment message is longer than NAPAS specification allows

**Solutions:**

```typescript
// ❌ Wrong - message too long
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  message: 'Payment for invoice number INV-2024-0001' // 42 characters
});

// ✅ Solution 1: Truncate message
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  message: 'Payment for order #1234'.substring(0, 25) // 25 characters
});

// ✅ Solution 2: Use billNumber for tracking
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  message: 'Invoice payment',
  billNumber: 'INV-2024-0001' // Use billNumber for tracking
});

// ✅ Solution 3: Helper function
function sanitizeMessage(message: string): string {
  if (message.length <= 25) return message;
  return message.substring(0, 22) + '...'; // Truncate with ellipsis
}
```

---

### Error: "Invalid service code"

**Cause**: Service code is not QRIBFTTA or QRIBFTTC

**Solutions:**

```typescript
// ❌ Wrong service codes
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'TRANSFER' // Invalid
});

generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'qribftta' // Wrong case
});

// ✅ Correct service codes
// For account-based transfer
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA' // Account number
});

// For card-based transfer
generateVietQR({
  bankBin: '970422',
  accountNumber: '9876543210123456', // Card number
  serviceCode: 'QRIBFTTC' // Card number
});
```

**Service Code Guide:**
- `QRIBFTTA` - Use with **account number**
- `QRIBFTTC` - Use with **card number**

---

### Error: "CRC checksum verification failed"

**Cause**: QR string has been modified or corrupted

**Solutions:**

```typescript
// Verify CRC manually
const qrString = "00020101...6304XXXX";
const isValid = verifyCRC(qrString);

if (!isValid) {
  // Option 1: Regenerate QR from original data
  const parseResult = parse(qrString.substring(0, qrString.length - 4));
  if (parseResult.success) {
    const newQR = generateVietQR({
      bankBin: parseResult.data.bankCode!,
      accountNumber: parseResult.data.accountNumber!,
      serviceCode: parseResult.data.serviceCode!,
      amount: parseResult.data.amount
    });
    console.log('Regenerated QR:', newQR.rawData);
  }

  // Option 2: Recalculate CRC
  const dataWithoutCRC = qrString.substring(0, qrString.length - 4);
  const newCRC = calculateCRC(dataWithoutCRC);
  const correctedQR = dataWithoutCRC + newCRC;
  console.log('Corrected QR:', correctedQR);
}
```

**Prevention:**

```typescript
// Always use library-generated QR strings
const qrData = generateVietQR(config);
const qrString = qrData.rawData; // CRC automatically calculated

// Don't manually modify QR strings
// ❌ const modified = qrString.replace('...', '...'); // Breaks CRC
```

---

### Error: "Image format not supported"

**Cause**: Image is not PNG or JPEG format

**Solutions:**

```typescript
import { detectImageFormat } from 'vietqr-ts';

async function convertToSupportedFormat(file: File): Promise<Buffer> {
  const format = detectImageFormat(await file.arrayBuffer());

  if (format === 'png' || format === 'jpeg') {
    return Buffer.from(await file.arrayBuffer());
  }

  // Convert to PNG using canvas (browser)
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });

  return Buffer.from(await blob.arrayBuffer());
}
```

**Supported Formats:**
- ✅ PNG (recommended)
- ✅ JPEG/JPG
- ❌ SVG (not supported for decoding)
- ❌ WebP (not supported)
- ❌ GIF (not supported)

---

### Error: "Image size exceeds 2MB limit"

**Cause**: Image file is larger than 2MB

**Solutions:**

```typescript
// Solution 1: Compress image before processing
async function compressImage(buffer: Buffer, maxSizeBytes: number): Promise<Buffer> {
  // Using sharp library (install: npm install sharp)
  const sharp = require('sharp');

  let quality = 90;
  let compressed = buffer;

  while (compressed.length > maxSizeBytes && quality > 10) {
    compressed = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
    quality -= 10;
  }

  return compressed;
}

// Solution 2: Resize image
async function resizeImage(buffer: Buffer, maxDimension: number): Promise<Buffer> {
  const sharp = require('sharp');

  return await sharp(buffer)
    .resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
}

// Usage
const originalBuffer = await fs.readFile('large-qr.png');

// Check size first
if (!isValidImageSize(originalBuffer)) {
  const resized = await resizeImage(originalBuffer, 1000);
  const result = decode(resized);
} else {
  const result = decode(originalBuffer);
}
```

---

### Error: "Amount must be a positive number"

**Cause**: Invalid amount value provided

**Solutions:**

```typescript
// ❌ Wrong amounts
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: -1000 // Negative
});

generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: 0 // Zero (use undefined for static QR)
});

generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: NaN // Not a number
});

// ✅ Correct amounts
generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: 50000 // Positive number
});

generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
  // amount: undefined - Static QR (omit amount)
});

// ✅ Amount validation helper
function validateAmount(amount: number | undefined): number | undefined {
  if (amount === undefined) return undefined;
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return Math.floor(amount); // Ensure integer
}
```

---

## Module Import Issues

### Error: "Cannot find module 'vietqr-ts'"

**Cause**: Package not installed or incorrect import

**Solutions:**

```bash
# Install package
npm install vietqr-ts

# Or using yarn
yarn add vietqr-ts

# Or using pnpm
pnpm add vietqr-ts
```

```typescript
// ✅ Correct imports
// ESM
import { generateVietQR } from 'vietqr-ts';

// CommonJS
const { generateVietQR } = require('vietqr-ts');

// ❌ Wrong imports
import vietqr from 'vietqr-ts'; // Default import not supported
import { generateVietQR } from 'vietqr'; // Wrong package name
```

---

### TypeScript: "Could not find a declaration file"

**Cause**: TypeScript types not recognized

**Solutions:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

```typescript
// Check types are working
import { VietQRConfig } from 'vietqr-ts';

const config: VietQRConfig = {
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
};
// TypeScript should provide autocomplete and type checking
```

---

## Performance Issues

### Issue: Slow QR generation for large batches

**Solutions:**

```typescript
// Problem: Sequential processing
async function slowBatchGeneration(configs: VietQRConfig[]) {
  const results = [];
  for (const config of configs) {
    const qr = await generateQRImage(generateVietQR(config).rawData);
    results.push(qr);
  }
  return results;
}

// Solution: Parallel processing
async function fastBatchGeneration(configs: VietQRConfig[]) {
  return await Promise.all(
    configs.map(async (config) => {
      const qrData = generateVietQR(config);
      return await generateQRImage(qrData.rawData);
    })
  );
}

// With rate limiting for very large batches
async function rateLimitedBatchGeneration(
  configs: VietQRConfig[],
  concurrency: number = 10
) {
  const results = [];

  for (let i = 0; i < configs.length; i += concurrency) {
    const batch = configs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (config) => {
        const qrData = generateVietQR(config);
        return await generateQRImage(qrData.rawData);
      })
    );
    results.push(...batchResults);
  }

  return results;
}
```

---

### Issue: High memory usage

**Solutions:**

```typescript
// Problem: Storing all QR images in memory
const allQRs = [];
for (let i = 0; i < 1000; i++) {
  const qr = await generateQRImage(data);
  allQRs.push(qr); // Accumulates in memory
}

// Solution 1: Stream processing
async function* generateQRStream(configs: VietQRConfig[]) {
  for (const config of configs) {
    const qrData = generateVietQR(config);
    const image = await generateQRImage(qrData.rawData);
    yield image;
  }
}

// Usage
for await (const qr of generateQRStream(configs)) {
  await saveToFile(qr); // Process and discard
}

// Solution 2: Process in smaller chunks
async function processInChunks(
  configs: VietQRConfig[],
  chunkSize: number = 100
) {
  for (let i = 0; i < configs.length; i += chunkSize) {
    const chunk = configs.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async (config) => {
        const qrData = generateVietQR(config);
        return await generateQRImage(qrData.rawData);
      })
    );

    // Process results immediately
    await processResults(results);
    // Results are garbage collected after processing
  }
}
```

---

## Browser-Specific Issues

### Issue: QR images not displaying in browser

**Solutions:**

```typescript
// Problem: Not handling data URL correctly
const qrImage = await generateQRImage(qrData);
img.src = qrImage; // Should work

// If not working, check:
console.log(qrImage.substring(0, 50)); // Should start with "data:image/"

// Solution: Explicit data URL handling
const qrImage = await generateQRImage(qrData, { format: 'png' });

if (qrImage.startsWith('data:image/png;base64,')) {
  img.src = qrImage;
} else {
  console.error('Invalid image data URL');
}
```

---

### Issue: CORS errors when loading QR images

**Solutions:**

```typescript
// If serving QR from API
// Server-side (Express.js)
app.get('/api/qr/:id', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*'); // Or specific origin
  res.set('Content-Type', 'image/png');
  // ... send QR image
});

// Client-side: Use data URL instead of API URL
const qrImage = await generateQRImage(qrData);
img.src = qrImage; // Data URL - no CORS issues
```

---

## Debugging Strategies

### Enable verbose logging

```typescript
function debugQRGeneration(config: VietQRConfig) {
  console.log('Input config:', JSON.stringify(config, null, 2));

  const qrData = generateVietQR(config);
  console.log('Generated QR string:', qrData.rawData);
  console.log('QR length:', qrData.rawData.length);
  console.log('Is dynamic:', qrData.isDynamic);

  const crcValid = verifyCRC(qrData.rawData);
  console.log('CRC valid:', crcValid);

  const parseResult = parse(qrData.rawData);
  console.log('Parse result:', JSON.stringify(parseResult, null, 2));

  if (parseResult.success) {
    const validation = validate(parseResult.data, qrData.rawData);
    console.log('Validation:', JSON.stringify(validation, null, 2));
  }

  return qrData;
}
```

---

### Inspect QR string structure

```typescript
function inspectQRString(qrString: string) {
  console.log('QR String:', qrString);
  console.log('Length:', qrString.length);

  // Parse TLV structure
  let index = 0;
  const fields = [];

  while (index < qrString.length - 4) { // -4 for CRC
    const tag = qrString.substring(index, index + 2);
    const length = parseInt(qrString.substring(index + 2, index + 4), 10);
    const value = qrString.substring(index + 4, index + 4 + length);

    fields.push({ tag, length, value });
    index += 4 + length;
  }

  const crc = qrString.substring(qrString.length - 4);
  fields.push({ tag: '63', length: 4, value: crc });

  console.table(fields);
}

// Usage
const qrData = generateVietQR({ /* config */ });
inspectQRString(qrData.rawData);
```

---

## Getting Help

### Check existing issues

1. Search GitHub issues: https://github.com/binhnguyenduc/vietqr-ts/issues
2. Review closed issues for solutions
3. Check discussions for similar questions

### Create a minimal reproduction

```typescript
// Good bug report example
const config = {
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: 50000
};

const qrData = generateVietQR(config);
console.log(qrData); // Share exact output

// Include:
// - Node.js version: node --version
// - Package version: npm list vietqr-ts
// - Operating system
// - Error messages (full stack trace)
```

### Report a bug

Include:
1. **Environment**: Node.js version, OS, package version
2. **Code**: Minimal reproduction code
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full stack traces
6. **Screenshots**: If UI-related

---

## Related Documentation

- [API Reference](./api-reference.md) - Complete API documentation
- [Common Patterns](./common-patterns.md) - Usage patterns and recipes
- [NAPAS Specification](https://napas.com.vn) - Official NAPAS IBFT documentation
