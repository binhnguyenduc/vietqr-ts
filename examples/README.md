# VietQR Examples

This directory contains practical examples demonstrating how to use the VietQR library in various scenarios.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)

The most common use cases for VietQR:
- Generating static QR codes (user enters amount)
- Generating dynamic QR codes (fixed amount)
- Parsing QR code strings
- Validating parsed data
- Complete payment flow example

**Run:**
```bash
npx tsx examples/basic-usage.ts
```

### 2. QR Image Generation (`qr-image-generation.ts`)

Creating QR code images in different formats:
- PNG format with custom styling
- SVG format
- Saving to files (Node.js)
- Browser usage with base64 data URLs
- Different error correction levels

**Run:**
```bash
npx tsx examples/qr-image-generation.ts
```

### 3. Error Handling (`error-handling.ts`)

Comprehensive error handling patterns:
- Generation validation errors
- Collecting all validation errors
- Parsing errors
- Validation errors
- Corrupted data handling
- Production-ready error handling
- Specific error code handling

**Run:**
```bash
npx tsx examples/error-handling.ts
```

### 4. Browser Example (`browser-example.html`)

Interactive web page demonstrating browser usage:
- Form-based QR generation
- Real-time QR code display
- Download functionality
- Responsive design

**Run:**
```bash
# Serve the HTML file with any static server
npx serve examples/
# Then open http://localhost:3000/browser-example.html
```

## Prerequisites

Install required dependencies:

```bash
npm install
npm install -D tsx  # For running TypeScript examples
```

## Output Directory

Image generation examples save files to `examples/output/`. Create this directory if it doesn't exist:

```bash
mkdir -p examples/output
```

## Quick Start

Run all examples at once:

```bash
# Basic usage
npx tsx examples/basic-usage.ts

# QR image generation
npx tsx examples/qr-image-generation.ts

# Error handling
npx tsx examples/error-handling.ts
```

## Integration Patterns

### Node.js / TypeScript

```typescript
import { generateVietQR, parse, validate } from 'vietqr-ts';

const qr = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000'
});

console.log(qr.rawData);
```

### ES Modules

```javascript
import { generateVietQR } from 'vietqr-ts';

const qr = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});
```

### CommonJS

```javascript
const { generateVietQR } = require('vietqr-ts');

const qr = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA'
});
```

### Browser (via CDN)

```html
<script type="module">
  import { generateQRImage } from 'https://unpkg.com/vietqr-ts';

  const result = await generateQRImage({
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
    amount: '50000'
  });

  document.getElementById('qr-image').src = result.dataUrl;
</script>
```

## Common Use Cases

### 1. E-commerce Checkout

```typescript
// Generate QR for order payment
const orderQR = generateQRImage({
  bankBin: merchantBank,
  accountNumber: merchantAccount,
  serviceCode: 'QRIBFTTA',
  amount: orderTotal.toString(),
  message: `Order #${orderId}`,
  billNumber: orderId
}, {
  format: 'png',
  width: 400
});

// Display QR to customer
displayQRCode(orderQR.dataUrl);
```

### 2. Payment Terminal

```typescript
// Generate QR for point-of-sale
const terminalQR = generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: saleAmount,
  merchantCategory: '5812' // Restaurant
}, {
  format: 'svg', // SVG for terminal display
  width: 300
});
```

### 3. Invoice Payment

```typescript
// Generate QR for invoice
const invoiceQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: invoiceAmount,
  message: invoiceDescription,
  billNumber: invoiceNumber,
  purpose: 'PAYMENT'
});

// Embed in PDF invoice
embedInPDF(invoiceQR.rawData);
```

### 4. Donation / Tipping

```typescript
// Static QR for donations (no fixed amount)
const donationQR = generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  message: 'Support our cause'
}, {
  format: 'svg',
  width: 500
});
```

## Best Practices

### Security

1. **Always validate QR data before processing payments**
   ```typescript
   const result = parse(qrString);
   if (result.success) {
     const validation = validate(result.data, qrString);
     if (validation.isValid && !validation.isCorrupted) {
       // Safe to process
     }
   }
   ```

2. **Verify amounts match user expectations**
   ```typescript
   if (parsedData.amount !== expectedAmount) {
     throw new Error('Amount mismatch');
   }
   ```

3. **Use HTTPS for QR transmission**
   - Never transmit QR data over unencrypted connections
   - Implement proper authentication for payment endpoints

### Performance

1. **Cache generated QR images**
   ```typescript
   const cache = new Map();
   const cacheKey = `${bankBin}-${accountNumber}-${amount}`;

   if (!cache.has(cacheKey)) {
     cache.set(cacheKey, await generateQRImage(config));
   }
   ```

2. **Use appropriate error correction levels**
   - `L` (7%): Clean displays, largest QR
   - `M` (15%): General purpose (default)
   - `Q` (25%): Moderate damage resistance
   - `H` (30%): Maximum reliability, smallest modules

### User Experience

1. **Provide clear payment instructions**
   ```typescript
   console.log(`Scan QR to pay ${amount} VND`);
   console.log(`To: ${accountNumber} (${bankName})`);
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     const qr = generateVietQR(config);
   } catch (error) {
     if (error instanceof ValidationError) {
       showUserFriendlyError(error.message);
     }
   }
   ```

3. **Support both static and dynamic QR**
   - Static: User flexibility (any amount)
   - Dynamic: Fixed amount (faster checkout)

## Testing

Test your integration with these scenarios:

```bash
# 1. Valid static QR
npx tsx examples/basic-usage.ts

# 2. Valid dynamic QR
npx tsx examples/basic-usage.ts

# 3. Error handling
npx tsx examples/error-handling.ts

# 4. Image generation
npx tsx examples/qr-image-generation.ts
```

## Troubleshooting

### Common Issues

**Issue: "Module not found"**
```bash
# Solution: Install dependencies
npm install
```

**Issue: "Cannot find module 'tsx'"**
```bash
# Solution: Install tsx
npm install -D tsx
```

**Issue: Images not saving**
```bash
# Solution: Create output directory
mkdir -p examples/output
```

**Issue: Browser example not working**
```bash
# Solution: Use a static file server
npx serve examples/
```

## Additional Resources

- [API Documentation](../docs/api/)
- [CONTRIBUTING Guide](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [NAPAS IBFT Specification](https://napas.com.vn)
