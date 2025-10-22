# Generation API

Functions for generating VietQR data and QR code images.

## generateVietQR()

Generate VietQR data string compliant with NAPAS IBFT v1.5.2 specification.

### Signature

```typescript
function generateVietQR(config: VietQRConfig): VietQRData
```

### Parameters

- **config** (`VietQRConfig`): Configuration for VietQR generation

```typescript
interface VietQRConfig {
  /** Bank BIN code (6 digits) */
  bankBin: string;

  /** Account number (optional, required for QRIBFTTA) */
  accountNumber?: string;

  /** Card number (optional, required for QRIBFTTC) */
  cardNumber?: string;

  /** Service code: QRIBFTTA (account) or QRIBFTTC (card) */
  serviceCode: 'QRIBFTTA' | 'QRIBFTTC';

  /** Initiation method: '11' (static) or '12' (dynamic) */
  initiationMethod: '11' | '12';

  /** Transaction amount (optional) */
  amount?: string;

  /** Currency code (optional, default: '704' for VND) */
  currency?: string;

  /** Country code (optional, default: 'VN') */
  country?: string;

  /** Bill number (optional) */
  billNumber?: string;

  /** Reference label (optional) */
  referenceLabel?: string;

  /** Purpose/description (optional) */
  purpose?: string;
}
```

### Returns

`VietQRData` - Generated QR data with raw string, CRC, and fields

```typescript
interface VietQRData {
  /** Raw EMVCo QR data string */
  rawData: string;

  /** CRC checksum (4 hex characters) */
  crc: string;

  /** Array of encoded TLV fields */
  fields: QRField[];
}

interface QRField {
  /** Field ID (2 digits) */
  id: string;

  /** Field length (2 digits) */
  length: string;

  /** Field value (decoded) */
  value: string;

  /** Encoded field (ID+Length+Value) */
  encoded: string;
}
```

### Examples

#### Static Account QR (Reusable)

```typescript
import { generateVietQR } from 'vietqr';

// Generate reusable QR for account
const qr = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '11' // Static
});

console.log('QR String:', qr.rawData);
console.log('CRC:', qr.crc);
```

#### Dynamic QR with Amount (One-time)

```typescript
import { generateVietQR } from 'vietqr';

// Generate one-time QR with specific amount
const qr = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '12', // Dynamic
  amount: '50000',
  purpose: 'Payment for invoice #12345'
});

console.log('QR String:', qr.rawData);
```

#### Card-based QR

```typescript
import { generateVietQR } from 'vietqr';

const qr = generateVietQR({
  bankBin: '970403',
  cardNumber: '1234567890123456',
  serviceCode: 'QRIBFTTC', // Card service
  initiationMethod: '11'
});
```

#### Complete Configuration

```typescript
import { generateVietQR } from 'vietqr';

const qr = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '12',
  amount: '100000',
  currency: '704',     // VND (default)
  country: 'VN',       // Vietnam (default)
  billNumber: 'INV-2024-001',
  referenceLabel: 'ORDER123',
  purpose: 'Monthly subscription payment'
});

console.log('Generated QR:', qr.rawData);
console.log('Fields:', qr.fields.map(f => `${f.id}: ${f.value}`));
```

#### Error Handling

```typescript
import { generateVietQR, ValidationError, AggregateValidationError } from 'vietqr';

try {
  const qr = generateVietQR({
    bankBin: '970403',
    accountNumber: '01234567',
    serviceCode: 'QRIBFTTA',
    initiationMethod: '11'
  });

  console.log('Success:', qr.rawData);

} catch (error) {
  if (error instanceof AggregateValidationError) {
    console.error('Validation errors:');
    error.errors.forEach(err => {
      console.error(`  ${err.field}: ${err.message}`);
    });
  } else if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.field} - ${error.message}`);
  } else {
    console.error('Generation failed:', error.message);
  }
}
```

---

## generateQRImage()

Generate QR code image from data string.

### Signature

```typescript
function generateQRImage(config: QRImageConfig): Promise<QRImageResult>
```

### Parameters

- **config** (`QRImageConfig`): QR image generation configuration

```typescript
interface QRImageConfig {
  /** QR data string to encode */
  data: string;

  /** Image format: 'png' or 'svg' (default: 'png') */
  format?: 'png' | 'svg';

  /** Image size in pixels (default: 256) */
  size?: number;

  /** Error correction level: 'L', 'M', 'Q', 'H' (default: 'M') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  /** Margin/quiet zone in modules (default: 4) */
  margin?: number;

  /** Color options */
  color?: {
    /** Dark color (default: '#000000') */
    dark: string;
    /** Light color (default: '#FFFFFF') */
    light: string;
  };
}
```

### Returns

`Promise<QRImageResult>` - Generated QR code image data

```typescript
interface QRImageResult {
  /** Base64-encoded image data */
  base64: string;

  /** Data URI (data:image/png;base64,...) */
  dataURI: string;

  /** Image format used */
  format: 'png' | 'svg';

  /** Image size in pixels */
  size: number;

  /** Error correction level used */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}
```

### Error Correction Levels

- **L (Low)**: ~7% error recovery
- **M (Medium)**: ~15% error recovery (default, recommended)
- **Q (Quartile)**: ~25% error recovery
- **H (High)**: ~30% error recovery

### Examples

#### Basic PNG QR Code

```typescript
import { generateVietQR, generateQRImage } from 'vietqr';

// Generate VietQR data
const qrData = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '11'
});

// Generate PNG image
const image = await generateQRImage({
  data: qrData.rawData
});

console.log('Base64:', image.base64);
console.log('Data URI:', image.dataURI);
```

#### SVG QR Code

```typescript
import { generateVietQR, generateQRImage } from 'vietqr';

const qrData = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '11'
});

// Generate SVG image
const image = await generateQRImage({
  data: qrData.rawData,
  format: 'svg'
});

// SVG can be embedded directly in HTML
console.log('<img src="' + image.dataURI + '" />');
```

#### Custom Size and Colors

```typescript
import { generateQRImage } from 'vietqr';

const image = await generateQRImage({
  data: qrData.rawData,
  size: 512,              // Larger image
  errorCorrectionLevel: 'H', // Higher error correction
  margin: 2,              // Smaller margin
  color: {
    dark: '#0066CC',      // Blue QR code
    light: '#F0F0F0'      // Light gray background
  }
});
```

#### Save to File (Node.js)

```typescript
import { writeFileSync } from 'fs';
import { generateVietQR, generateQRImage } from 'vietqr';

const qrData = generateVietQR({
  bankBin: '970403',
  accountNumber: '01234567',
  serviceCode: 'QRIBFTTA',
  initiationMethod: '11',
  amount: '50000'
});

// Generate PNG
const image = await generateQRImage({
  data: qrData.rawData,
  format: 'png',
  size: 512
});

// Save to file
const buffer = Buffer.from(image.base64, 'base64');
writeFileSync('qr-code.png', buffer);

console.log('QR code saved to qr-code.png');
```

#### Display in Browser

```typescript
import { generateVietQR, generateQRImage } from 'vietqr';

async function displayQRCode() {
  const qrData = generateVietQR({
    bankBin: '970403',
    accountNumber: '01234567',
    serviceCode: 'QRIBFTTA',
    initiationMethod: '11'
  });

  const image = await generateQRImage({
    data: qrData.rawData,
    format: 'png',
    size: 300
  });

  // Create image element
  const img = document.createElement('img');
  img.src = image.dataURI;
  img.alt = 'VietQR Code';

  // Add to page
  document.body.appendChild(img);
}
```

#### Error Handling

```typescript
import { generateQRImage, ImageEncodingError } from 'vietqr';

try {
  const image = await generateQRImage({
    data: qrData.rawData,
    format: 'png'
  });

  console.log('Image generated successfully');

} catch (error) {
  if (error instanceof ImageEncodingError) {
    console.error('Image encoding failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## Complete Workflow Example

### Generate and Display QR Code

```typescript
import { generateVietQR, generateQRImage, validateVietQRConfig } from 'vietqr';

async function createPaymentQR(
  bankBin: string,
  accountNumber: string,
  amount: string,
  description: string
) {
  try {
    // Step 1: Prepare configuration
    const config = {
      bankBin,
      accountNumber,
      serviceCode: 'QRIBFTTA' as const,
      initiationMethod: '12' as const, // Dynamic with amount
      amount,
      purpose: description
    };

    // Step 2: Validate configuration (throws on error)
    validateVietQRConfig(config);

    // Step 3: Generate VietQR data
    const qrData = generateVietQR(config);

    console.log('Generated QR string:', qrData.rawData);
    console.log('CRC:', qrData.crc);

    // Step 4: Generate QR code image
    const qrImage = await generateQRImage({
      data: qrData.rawData,
      format: 'png',
      size: 400,
      errorCorrectionLevel: 'M',
      margin: 4
    });

    return {
      success: true,
      qrString: qrData.rawData,
      imageBase64: qrImage.base64,
      imageDataURI: qrImage.dataURI
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage
const result = await createPaymentQR(
  '970403',
  '01234567',
  '50000',
  'Payment for Order #12345'
);

if (result.success) {
  console.log('QR Code generated successfully');
  console.log('Display with:', result.imageDataURI);
} else {
  console.error('Failed:', result.error);
}
```

### Web API Endpoint (Express)

```typescript
import express from 'express';
import { generateVietQR, generateQRImage, ValidationError } from 'vietqr';

const app = express();
app.use(express.json());

app.post('/api/generate-qr', async (req, res) => {
  try {
    const {
      bankBin,
      accountNumber,
      amount,
      description,
      format = 'png',
      size = 300
    } = req.body;

    // Validate required fields
    if (!bankBin || !accountNumber) {
      return res.status(400).json({
        error: 'Missing required fields: bankBin, accountNumber'
      });
    }

    // Generate VietQR data
    const qrData = generateVietQR({
      bankBin,
      accountNumber,
      serviceCode: 'QRIBFTTA',
      initiationMethod: amount ? '12' : '11',
      amount,
      purpose: description
    });

    // Generate image
    const qrImage = await generateQRImage({
      data: qrData.rawData,
      format,
      size,
      errorCorrectionLevel: 'M'
    });

    res.json({
      success: true,
      qrString: qrData.rawData,
      image: {
        format: qrImage.format,
        size: qrImage.size,
        base64: qrImage.base64,
        dataURI: qrImage.dataURI
      }
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        field: error.field,
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Generation failed',
      message: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('QR generation API listening on port 3000');
});
```

### Batch Generation

```typescript
import { generateVietQR, generateQRImage } from 'vietqr';
import { writeFileSync } from 'fs';

interface PaymentRequest {
  orderId: string;
  accountNumber: string;
  amount: string;
  description: string;
}

async function generateBatchQRCodes(
  bankBin: string,
  payments: PaymentRequest[]
) {
  const results = [];

  for (const payment of payments) {
    try {
      // Generate QR data
      const qrData = generateVietQR({
        bankBin,
        accountNumber: payment.accountNumber,
        serviceCode: 'QRIBFTTA',
        initiationMethod: '12',
        amount: payment.amount,
        purpose: payment.description
      });

      // Generate image
      const qrImage = await generateQRImage({
        data: qrData.rawData,
        format: 'png',
        size: 400
      });

      // Save to file
      const filename = `qr-${payment.orderId}.png`;
      const buffer = Buffer.from(qrImage.base64, 'base64');
      writeFileSync(filename, buffer);

      results.push({
        orderId: payment.orderId,
        success: true,
        filename
      });

      console.log(`✅ Generated ${filename}`);

    } catch (error) {
      results.push({
        orderId: payment.orderId,
        success: false,
        error: error.message
      });

      console.error(`❌ Failed ${payment.orderId}: ${error.message}`);
    }
  }

  return results;
}

// Usage
const payments = [
  {
    orderId: 'ORD001',
    accountNumber: '01234567',
    amount: '50000',
    description: 'Order #001'
  },
  {
    orderId: 'ORD002',
    accountNumber: '01234567',
    amount: '75000',
    description: 'Order #002'
  }
];

const results = await generateBatchQRCodes('970403', payments);
console.log(`Generated ${results.filter(r => r.success).length} QR codes`);
```
