# VietQR-TS Common Patterns and Recipes

**Library**: vietqr-ts
**Version**: 1.0.0
**Category**: Usage Patterns

## Overview

Common usage patterns, recipes, and best practices for VietQR-TS library.

---

## Pattern: Basic Payment QR Generation

**Use Case**: Generate a simple payment QR code for bank transfer

**Code:**

```typescript
import { generateVietQR, generateQRImage } from 'vietqr-ts';

async function createPaymentQR(
  bankBin: string,
  accountNumber: string,
  amount?: number
) {
  // Generate VietQR data
  const qrData = generateVietQR({
    bankBin,
    accountNumber,
    serviceCode: 'QRIBFTTA',
    amount
  });

  // Generate QR code image
  const imageDataUrl = await generateQRImage(qrData.rawData, {
    size: 300,
    errorCorrectionLevel: 'M'
  });

  return {
    qrString: qrData.rawData,
    imageUrl: imageDataUrl,
    isStatic: !qrData.isDynamic
  };
}

// Usage
const result = await createPaymentQR('970422', '0123456789', 50000);
console.log('QR Code:', result.imageUrl);
```

**When to Use:**
- Simple payment flows
- Fixed beneficiary account
- Optional amount specification

---

## Pattern: Invoice Payment QR

**Use Case**: Generate QR code for invoice payment with tracking

**Code:**

```typescript
interface InvoicePayment {
  bankBin: string;
  accountNumber: string;
  invoiceNumber: string;
  amount: number;
  description: string;
}

async function createInvoiceQR(invoice: InvoicePayment) {
  const qrData = generateVietQR({
    bankBin: invoice.bankBin,
    accountNumber: invoice.accountNumber,
    serviceCode: 'QRIBFTTA',
    amount: invoice.amount,
    billNumber: invoice.invoiceNumber,
    message: invoice.description.substring(0, 25) // Max 25 chars
  });

  // Generate with high error correction for printing
  const qrImage = await generateQRImage(qrData.rawData, {
    size: 400,
    errorCorrectionLevel: 'H',
    margin: 4
  });

  return {
    qrCode: qrImage,
    qrString: qrData.rawData,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount
  };
}

// Usage
const invoiceQR = await createInvoiceQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  invoiceNumber: 'INV-2024-0001',
  amount: 1500000,
  description: 'Payment for consulting services'
});
```

**When to Use:**
- Invoice/bill payment systems
- Payment tracking required
- Fixed amount transactions

---

## Pattern: QR Code Validation Before Processing

**Use Case**: Validate scanned QR before payment processing

**Code:**

```typescript
import { decode, decodeAndValidate, isSuccessResult } from 'vietqr-ts';

async function validatePaymentQR(imageBuffer: Buffer) {
  // Step 1: Decode and validate
  const validationResult = decodeAndValidate(imageBuffer);

  if (!isSuccessResult(validationResult)) {
    return {
      valid: false,
      error: validationResult.error.message
    };
  }

  if (!validationResult.data.isValid) {
    return {
      valid: false,
      errors: validationResult.data.errors.map(e => e.message)
    };
  }

  // Step 2: Decode to get data
  const decodeResult = decode(imageBuffer);

  if (!isSuccessResult(decodeResult)) {
    return {
      valid: false,
      error: 'Failed to decode QR data'
    };
  }

  // Step 3: Business logic validation
  const data = decodeResult.data;

  if (data.amount && data.amount < 1000) {
    return {
      valid: false,
      error: 'Minimum payment amount is 1,000 VND'
    };
  }

  if (data.amount && data.amount > 500000000) {
    return {
      valid: false,
      error: 'Maximum payment amount is 500,000,000 VND'
    };
  }

  return {
    valid: true,
    data: {
      bank: data.bankCode,
      account: data.accountNumber,
      amount: data.amount,
      message: data.message,
      billNumber: data.billNumber
    }
  };
}

// Usage
const result = await validatePaymentQR(scannedImageBuffer);
if (result.valid) {
  processPayment(result.data);
} else {
  showError(result.error || result.errors.join(', '));
}
```

**When to Use:**
- Payment processing systems
- Security-critical applications
- User-generated QR codes

---

## Pattern: Multi-Format QR Generation

**Use Case**: Generate both PNG and SVG versions of QR code

**Code:**

```typescript
async function generateMultiFormatQR(config: VietQRConfig) {
  const qrData = generateVietQR(config);

  const [pngImage, svgImage] = await Promise.all([
    generateQRImage(qrData.rawData, { format: 'png', size: 300 }),
    generateQRImage(qrData.rawData, { format: 'svg', size: 300 })
  ]);

  return {
    qrString: qrData.rawData,
    png: pngImage,
    svg: svgImage,
    metadata: {
      amount: qrData.amount,
      isDynamic: qrData.isDynamic,
      message: qrData.message
    }
  };
}

// Usage - serve appropriate format based on client
app.get('/api/qr/:format', async (req, res) => {
  const qr = await generateMultiFormatQR({
    bankBin: '970422',
    accountNumber: '0123456789',
    amount: 50000
  });

  if (req.params.format === 'svg') {
    res.type('image/svg+xml');
    const svgData = qr.svg.replace(/^data:image\/svg\+xml;utf8,/, '');
    res.send(decodeURIComponent(svgData));
  } else {
    res.type('image/png');
    const base64Data = qr.png.replace(/^data:image\/png;base64,/, '');
    res.send(Buffer.from(base64Data, 'base64'));
  }
});
```

**When to Use:**
- Web applications (SVG for web, PNG for downloads)
- Email integration (PNG for compatibility)
- Print materials (high-res PNG/SVG)

---

## Pattern: Branded QR Code Generation

**Use Case**: Generate QR codes with custom brand colors

**Code:**

```typescript
interface BrandColors {
  primary: string;
  background: string;
}

async function createBrandedQR(
  config: VietQRConfig,
  brandColors: BrandColors
) {
  const qrData = generateVietQR(config);

  const qrImage = await generateQRImage(qrData.rawData, {
    size: 400,
    errorCorrectionLevel: 'H', // High correction for colored QR
    darkColor: brandColors.primary,
    lightColor: brandColors.background,
    margin: 3
  });

  return qrImage;
}

// Usage
const companyBrand = {
  primary: '#1E40AF',    // Company blue
  background: '#F3F4F6'  // Light gray
};

const brandedQR = await createBrandedQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  amount: 100000
}, companyBrand);
```

**Best Practices:**
- Use high error correction level (H) for colored QR
- Ensure sufficient contrast between colors
- Test scannability with target devices
- Avoid very light or very dark background colors

---

## Pattern: Batch QR Generation

**Use Case**: Generate multiple QR codes for different accounts/amounts

**Code:**

```typescript
interface BatchPayment {
  id: string;
  bankBin: string;
  accountNumber: string;
  amount: number;
  message: string;
}

async function generateBatchQRCodes(payments: BatchPayment[]) {
  const results = await Promise.all(
    payments.map(async (payment) => {
      const qrData = generateVietQR({
        bankBin: payment.bankBin,
        accountNumber: payment.accountNumber,
        serviceCode: 'QRIBFTTA',
        amount: payment.amount,
        message: payment.message
      });

      const qrImage = await generateQRImage(qrData.rawData);

      return {
        id: payment.id,
        qrCode: qrImage,
        qrString: qrData.rawData,
        amount: payment.amount
      };
    })
  );

  return results;
}

// Usage
const payments = [
  { id: 'P001', bankBin: '970422', accountNumber: '0123456789', amount: 50000, message: 'Order #1' },
  { id: 'P002', bankBin: '970415', accountNumber: '9876543210', amount: 75000, message: 'Order #2' },
  { id: 'P003', bankBin: '970436', accountNumber: '5555555555', amount: 100000, message: 'Order #3' }
];

const qrCodes = await generateBatchQRCodes(payments);
```

**Performance Tips:**
- Use Promise.all() for parallel generation
- Consider rate limiting for large batches
- Implement retry logic for failures
- Cache generated QR codes when possible

---

## Pattern: QR Code Caching

**Use Case**: Cache generated QR codes to avoid regeneration

**Code:**

```typescript
class QRCodeCache {
  private cache = new Map<string, { qr: string; image: string; timestamp: number }>();
  private readonly TTL = 3600000; // 1 hour

  private getCacheKey(config: VietQRConfig): string {
    return JSON.stringify({
      bankBin: config.bankBin,
      accountNumber: config.accountNumber,
      amount: config.amount,
      serviceCode: config.serviceCode
    });
  }

  async getOrGenerate(config: VietQRConfig): Promise<{ qr: string; image: string }> {
    const key = this.getCacheKey(config);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return { qr: cached.qr, image: cached.image };
    }

    const qrData = generateVietQR(config);
    const image = await generateQRImage(qrData.rawData);

    this.cache.set(key, {
      qr: qrData.rawData,
      image,
      timestamp: Date.now()
    });

    return { qr: qrData.rawData, image };
  }

  clear(): void {
    this.cache.clear();
  }

  evictExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage
const qrCache = new QRCodeCache();

// Generate or retrieve from cache
const result = await qrCache.getOrGenerate({
  bankBin: '970422',
  accountNumber: '0123456789',
  amount: 50000,
  serviceCode: 'QRIBFTTA'
});

// Periodic cleanup
setInterval(() => qrCache.evictExpired(), 600000); // Every 10 minutes
```

**When to Use:**
- High-traffic applications
- Repeated QR generation for same parameters
- Static QR codes that don't change

---

## Pattern: QR Scanner Integration

**Use Case**: Integrate QR scanning in web application

**Code:**

```typescript
// Browser-based QR scanner
class QRScanner {
  async scanFromFile(file: File): Promise<VietQRData | null> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const result = decode(uint8Array);

    if (!isSuccessResult(result)) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async scanFromCamera(videoElement: HTMLVideoElement): Promise<VietQRData | null> {
    // Capture frame from video
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoElement, 0, 0);

    // Convert to buffer
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const result = decode(uint8Array);

    if (!isSuccessResult(result)) {
      return null;
    }

    return result.data;
  }
}

// Usage in React component
function QRScannerComponent() {
  const [scannedData, setScannedData] = useState<VietQRData | null>(null);
  const scanner = new QRScanner();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await scanner.scanFromFile(file);
      setScannedData(data);
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {scannedData && (
        <div>
          <p>Bank: {scannedData.bankCode}</p>
          <p>Account: {scannedData.accountNumber}</p>
          <p>Amount: {scannedData.amount} VND</p>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern: Error Handling with Type Guards

**Use Case**: Robust error handling with TypeScript type safety

**Code:**

```typescript
import { decode, isSuccessResult, isErrorResult, DecodingErrorType } from 'vietqr-ts';

function handleQRDecode(imageBuffer: Buffer) {
  const result = decode(imageBuffer);

  if (isErrorResult(result)) {
    switch (result.error.type) {
      case DecodingErrorType.NO_QR_CODE_FOUND:
        return { success: false, message: 'No QR code found in image' };

      case DecodingErrorType.UNSUPPORTED_FORMAT:
        return { success: false, message: 'Image format not supported (use PNG or JPEG)' };

      case DecodingErrorType.SIZE_LIMIT_EXCEEDED:
        return { success: false, message: 'Image too large (max 2MB)' };

      case DecodingErrorType.IMAGE_DECODE_ERROR:
        return { success: false, message: 'Failed to decode image' };

      case DecodingErrorType.PARSE_ERROR:
        return { success: false, message: 'Invalid QR code format' };

      default:
        return { success: false, message: result.error.message };
    }
  }

  // TypeScript knows result.data exists here
  return {
    success: true,
    data: result.data
  };
}
```

---

## Pattern: Real-time Amount Update

**Use Case**: Generate new QR when amount changes

**Code:**

```typescript
import { useEffect, useState } from 'react';

function DynamicQRGenerator() {
  const [amount, setAmount] = useState<number>(0);
  const [qrImage, setQRImage] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (amount <= 0) {
        setQRImage('');
        return;
      }

      const qrData = generateVietQR({
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
        amount
      });

      const image = await generateQRImage(qrData.rawData);
      setQRImage(image);
    };

    // Debounce to avoid excessive regeneration
    const timeout = setTimeout(generateQR, 300);
    return () => clearTimeout(timeout);
  }, [amount]);

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount"
      />
      {qrImage && <img src={qrImage} alt="Payment QR Code" />}
    </div>
  );
}
```

---

## Performance Best Practices

### 1. Use Parallel Processing

```typescript
// Good - parallel
const [qr1, qr2, qr3] = await Promise.all([
  generateQRImage(data1),
  generateQRImage(data2),
  generateQRImage(data3)
]);

// Bad - sequential
const qr1 = await generateQRImage(data1);
const qr2 = await generateQRImage(data2);
const qr3 = await generateQRImage(data3);
```

### 2. Cache Static QR Codes

```typescript
// Cache QR codes that don't change
const STATIC_QR_CACHE = new Map();

function getCachedQR(key: string, generator: () => Promise<string>) {
  if (STATIC_QR_CACHE.has(key)) {
    return STATIC_QR_CACHE.get(key);
  }

  const qr = generator();
  STATIC_QR_CACHE.set(key, qr);
  return qr;
}
```

### 3. Optimize Image Size

```typescript
// For web display - smaller size
const webQR = await generateQRImage(data, { size: 200 });

// For print - larger size
const printQR = await generateQRImage(data, { size: 600 });

// For mobile - medium size
const mobileQR = await generateQRImage(data, { size: 300 });
```

---

## Security Best Practices

### 1. Validate Input Data

```typescript
function sanitizeConfig(config: VietQRConfig): VietQRConfig {
  return {
    ...config,
    message: config.message?.substring(0, 25), // Enforce max length
    amount: config.amount && config.amount > 0 ? config.amount : undefined
  };
}
```

### 2. Verify Decoded Data

```typescript
function verifyPaymentData(data: VietQRData): boolean {
  if (!data.bankCode || data.bankCode.length !== 6) return false;
  if (!data.accountNumber) return false;
  if (data.amount && data.amount < 0) return false;
  return true;
}
```

### 3. Use HTTPS for QR Images

```typescript
// Good - secure transmission
<img src="https://api.example.com/qr/12345" />

// Bad - insecure transmission
<img src="http://api.example.com/qr/12345" />
```
