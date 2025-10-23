# Frequently Asked Questions (FAQ)

Common questions and answers about VietQR library usage, troubleshooting, and best practices.

## Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Usage Questions](#usage-questions)
- [Error Handling](#error-handling)
- [Performance & Optimization](#performance--optimization)
- [Security & Compliance](#security--compliance)
- [Integration & Deployment](#integration--deployment)
- [Troubleshooting](#troubleshooting)

## General Questions

### What is VietQR?

VietQR is a TypeScript library for generating, parsing, and validating Vietnamese QR payment codes that comply with NAPAS IBFT v1.5.2 and EMVCo specifications. It enables developers to easily integrate Vietnamese domestic payment QR codes into their applications.

### What can I use VietQR for?

Common use cases include:
- E-commerce checkout QR codes
- Point-of-sale payment terminals
- Invoice payment generation
- Peer-to-peer money transfers
- Donation/tipping systems
- Mobile banking apps
- Payment gateway integrations

### Is VietQR free to use?

Yes! VietQR is open source under the MIT License. You can use it in both commercial and non-commercial projects for free.

### Does VietQR work in browsers?

Yes! VietQR supports both Node.js and modern browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+). It provides both ESM and CommonJS builds.

### What Node.js version do I need?

VietQR requires Node.js 18.0.0 or later. We recommend using the latest LTS version for best performance and security.

## Installation & Setup

### How do I install VietQR?

```bash
npm install vietqr-ts
```

Or with yarn:
```bash
yarn add vietqr-ts
```

Or with pnpm:
```bash
pnpm add vietqr-ts
```

### Do I need additional dependencies?

No, all dependencies are bundled with the package. Just install VietQR and you're ready to go.

### How do I use VietQR with TypeScript?

VietQR is written in TypeScript and includes full type definitions. No additional setup needed:

```typescript
import { generateVietQR, type VietQRConfig } from 'vietqr-ts';

const config: VietQRConfig = {
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
};

const result = generateVietQR(config);
```

### Can I use VietQR with React/Vue/Angular?

Yes! VietQR is framework-agnostic and works with any JavaScript framework:

**React:**
```tsx
import { generateQRImage } from 'vietqr-ts';

function PaymentQR() {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    async function loadQR() {
      const result = await generateQRImage({
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
        amount: '50000'
      });
      setQrDataUrl(result.dataUrl);
    }
    loadQR();
  }, []);

  return <img src={qrDataUrl} alt="Payment QR" />;
}
```

## Usage Questions

### What's the difference between static and dynamic QR codes?

**Static QR** (no amount):
- User enters the amount when scanning
- Reusable for multiple payments
- Good for donations, tips, or variable amounts

```typescript
const staticQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
  // No amount = static QR
});
```

**Dynamic QR** (with amount):
- Fixed payment amount embedded in QR
- One-time use recommended
- Good for invoices, orders, fixed payments

```typescript
const dynamicQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000' // With amount = dynamic QR
});
```

### How do I generate a QR code image?

Use `generateQRImage()` for PNG or SVG output:

```typescript
import { generateQRImage } from 'vietqr-ts';

const qrImage = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
}, {
  format: 'png',        // or 'svg'
  width: 400,           // pixels
  errorCorrectionLevel: 'M'
});

// Use in browser
document.getElementById('qr').src = qrImage.dataUrl;

// Or save to file (Node.js)
await fs.writeFile('qr.png', qrImage.buffer);
```

### How do I parse a scanned QR code?

Use `parse()` to extract payment information:

```typescript
import { parse } from 'vietqr-ts';

const qrString = "00020101021238570010A000000727...";
const result = parse(qrString);

if (result.success) {
  console.log('Bank:', result.data.bankCode);
  console.log('Account:', result.data.accountNumber);
  console.log('Amount:', result.data.amount);
} else {
  console.error('Error:', result.error.message);
}
```

### How do I validate a QR code?

Always validate after parsing:

```typescript
import { parse, validate } from 'vietqr-ts';

const result = parse(qrString);

if (result.success) {
  const validation = validate(result.data, qrString);

  if (validation.isValid && !validation.isCorrupted) {
    // Safe to process payment
    processPayment(result.data);
  } else {
    // Show errors to user
    validation.errors.forEach(error => {
      console.error(error.message);
    });
  }
}
```

### What service codes are supported?

VietQR supports two service codes:

- **QRIBFTTA**: Account-based transfers (most common)
- **QRIBFTTC**: Card-based transfers

```typescript
// Account transfer
const accountQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});

// Card transfer
const cardQR = generateVietQR({
  bankBin: '970422',
  cardNumber: '9876543210123456',
  serviceCode: 'QRIBFTTC'
});
```

### Can I add a message to the QR code?

Yes, use the `message` field:

```typescript
const qr = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000',
  message: 'Payment for Order #12345' // Up to 500 characters
});
```

### How do I customize QR code colors?

Use the `color` option in `generateQRImage()`:

```typescript
const qr = await generateQRImage(config, {
  format: 'png',
  width: 400,
  color: {
    dark: '#003366',  // Dark blue modules
    light: '#FFFFFF'  // White background
  }
});
```

## Error Handling

### Why am I getting "Invalid bank BIN" error?

Bank BIN must be exactly 6 numeric digits:

```typescript
// ❌ Wrong
bankBin: '123'      // Too short
bankBin: '12345678' // Too long
bankBin: 'ABC123'   // Non-numeric

// ✅ Correct
bankBin: '970422'   // Exactly 6 digits
```

### What does "Account number too long" mean?

Account numbers are limited to 19 characters:

```typescript
// ❌ Wrong
accountNumber: '012345678901234567890' // 21 chars

// ✅ Correct
accountNumber: '0123456789'           // Within limit
```

### How do I handle validation errors?

Catch `ValidationError` for specific error handling:

```typescript
import { ValidationError } from 'vietqr-ts';

try {
  const qr = generateVietQR(config);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Field: ${error.field}`);
    console.error(`Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
    console.error(`Expected: ${error.expectedFormat}`);
  }
}
```

### What should I do if QR parsing fails?

Check the error type and handle appropriately:

```typescript
const result = parse(qrString);

if (!result.success) {
  switch (result.error.type) {
    case 'INVALID_FORMAT':
      console.error('QR string format is invalid');
      break;
    case 'PARSE_ERROR':
      console.error('Failed to parse QR structure');
      break;
    default:
      console.error('Unexpected error:', result.error.message);
  }
}
```

## Performance & Optimization

### How fast is VietQR?

Typical performance:
- QR Generation: <10ms
- String Parsing: <100ms
- Validation: <50ms
- PNG Image: <200ms
- SVG Image: <100ms

### Can I cache generated QR codes?

Yes! Cache QR images for identical payment details:

```typescript
const cache = new Map<string, QRImageResult>();

function getCachedQR(key: string, config: VietQRConfig) {
  if (!cache.has(key)) {
    cache.set(key, await generateQRImage(config));
  }
  return cache.get(key);
}

const cacheKey = `${bankBin}-${accountNumber}-${amount}`;
const qr = await getCachedQR(cacheKey, config);
```

### Should I generate QR codes on the server or client?

**Server-side** (recommended):
- Better performance
- Reduced client-side bundle size
- Easier caching
- More secure validation

**Client-side**:
- No server required
- Offline capability
- Real-time updates

### Which error correction level should I use?

| Level | Recovery | Use Case |
|-------|----------|----------|
| L | 7% | Large, clean displays |
| M | 15% | **General purpose (recommended)** |
| Q | 25% | Moderate damage resistance |
| H | 30% | Damaged or obscured QR codes |

```typescript
const qr = await generateQRImage(config, {
  errorCorrectionLevel: 'M' // Default and recommended
});
```

## Security & Compliance

### Is VietQR secure?

VietQR implements several security measures:
- Input validation and sanitization
- CRC checksum verification
- Type-safe API preventing injection
- No secret handling (delegated to payment processor)

However, you must:
- Verify amounts match user expectations
- Use HTTPS for transmission
- Validate on both client and server
- Implement fraud detection

### Does VietQR comply with NAPAS specifications?

Yes! VietQR is fully compliant with:
- NAPAS IBFT v1.5.2
- EMVCo QR Code Specification
- ISO 4217 (Currency codes)
- ISO 3166-1 (Country codes)

### How does CRC checksum work?

CRC-16-CCITT (polynomial 0x1021) prevents data corruption:

```typescript
import { verifyCRC } from 'vietqr-ts';

const isValid = verifyCRC(qrString);
if (!isValid) {
  console.error('QR code corrupted or tampered');
}
```

**Important**: CRC detects *accidental* corruption, not *malicious* tampering. Always implement additional security measures.

### Can QR codes be tampered with?

Physical QR codes can be replaced or overlaid. Mitigation strategies:
- Use tamper-evident materials
- Implement QR registration systems
- Monitor for unusual transaction patterns
- Require user confirmation for amounts

### Should I validate amounts before payment?

**Always!** Never trust QR code amounts without verification:

```typescript
const result = parse(qrString);

if (result.success && result.data.amount) {
  // Show amount to user for confirmation
  const confirmed = await getUserConfirmation(result.data.amount);

  if (confirmed !== result.data.amount) {
    throw new Error('Amount mismatch - possible tampering');
  }
}
```

## Integration & Deployment

### Can I use VietQR in production?

Yes, but ensure you:
1. Test thoroughly with real banking apps
2. Implement comprehensive error handling
3. Add fraud detection mechanisms
4. Use HTTPS for all QR transmission
5. Comply with payment regulations
6. Have proper logging and monitoring

### Do I need a license to use VietQR commercially?

No special license required. VietQR is MIT licensed, allowing commercial use with minimal restrictions.

### How do I integrate with payment gateways?

VietQR generates QR codes; actual payment processing requires integration with Vietnamese payment gateways:

1. Generate QR with VietQR
2. Display QR to customer
3. Customer scans with banking app
4. Payment gateway processes transaction
5. Receive webhook/callback from gateway
6. Verify payment and complete order

### Can I use VietQR offline?

QR **generation** works offline. QR **payment processing** requires internet connectivity to communicate with banks.

## Troubleshooting

### QR code won't scan in banking app

**Common causes:**

1. **QR too small**: Use minimum 300px width
```typescript
generateQRImage(config, { width: 400 }) // Larger is better
```

2. **Low error correction**: Increase robustness
```typescript
generateQRImage(config, { errorCorrectionLevel: 'H' })
```

3. **Invalid data**: Validate before generating
```typescript
validateVietQRConfig(config); // Throws on error
```

4. **Wrong service code**: Verify bank account vs card
```typescript
serviceCode: 'QRIBFTTA' // For bank accounts
```

### Amount not showing in banking app

For dynamic QR (with amount), ensure:

```typescript
// ✅ Correct - amount as string
amount: '50000'

// ❌ Wrong - amount as number
amount: 50000
```

### TypeScript errors when importing

Ensure you have TypeScript 5.0+ and proper module resolution:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // or "node16"
    "esModuleInterop": true
  }
}
```

### "Module not found" error

Check your import path and package installation:

```typescript
// ✅ Correct
import { generateVietQR } from 'vietqr-ts';

// ❌ Wrong
import { generateVietQR } from 'vietqr-ts/dist/index';
```

### Bundle size too large

VietQR is tree-shakeable. Import only what you need:

```typescript
// ✅ Better - tree-shakeable
import { generateVietQR } from 'vietqr-ts';

// ❌ Larger bundle - imports everything
import * as VietQR from 'vietqr-ts';
```

### Images not generating in browser

Ensure you're using `async/await`:

```typescript
// ✅ Correct
const qr = await generateQRImage(config);

// ❌ Wrong - missing await
const qr = generateQRImage(config);
```

## Still Have Questions?

- 📖 [API Documentation](./api/)
- 💬 [GitHub Discussions](https://github.com/binhnguyenduc/vietqr-ts/discussions)
- 🐛 [Report Issues](https://github.com/binhnguyenduc/vietqr-ts/issues)
- 📧 [Email Support](mailto:binh.d.nguyen165@gmail.com)
- 🔒 [Security Issues](../SECURITY.md)
