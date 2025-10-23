# Utilities API

Utility functions and helpers for VietQR operations.

## CRC Functions

### calculateCRC()

Calculate CRC-16/CCITT-FALSE checksum for QR data.

#### Signature

```typescript
function calculateCRC(data: string): string
```

#### Parameters

- **data** (`string`): QR data string without CRC field

#### Returns

`string` - 4-character uppercase hexadecimal CRC checksum

#### Examples

```typescript
import { calculateCRC } from 'vietqr-ts';

// Calculate CRC for partial QR string
const partialQR = '00020101021238540010A000000727012400069704030113012345676304';
const crc = calculateCRC(partialQR);

console.log('CRC:', crc); // e.g., "A1B2"

// Complete QR string
const completeQR = partialQR + crc;
console.log('Complete QR:', completeQR);
```

#### Algorithm Details

Uses CRC-16/CCITT-FALSE algorithm per ISO/IEC 13239:
- Polynomial: 0x1021
- Initial value: 0xFFFF
- No final XOR
- No reflection

---

### verifyCRC()

Verify CRC checksum of complete QR string.

#### Signature

```typescript
function verifyCRC(qrString: string): boolean
```

#### Parameters

- **qrString** (`string`): Complete QR string including CRC field (ID=63)

#### Returns

`boolean` - `true` if CRC is valid, `false` otherwise

#### Examples

```typescript
import { verifyCRC } from 'vietqr-ts';

const qrString = '00020101021238540010A00000072701240006970403011301234567630463049876';

if (verifyCRC(qrString)) {
  console.log('✅ CRC checksum valid');
} else {
  console.error('❌ CRC checksum invalid - data may be corrupted');
}
```

#### Validation Logic

```typescript
import { verifyCRC, calculateCRC } from 'vietqr-ts';

// Manual CRC verification
const qrString = '...';
const qrWithoutCRC = qrString.substring(0, qrString.length - 4);
const providedCRC = qrString.substring(qrString.length - 4);
const calculatedCRC = calculateCRC(qrWithoutCRC + '6304');

console.log('Provided CRC:', providedCRC);
console.log('Calculated CRC:', calculatedCRC);
console.log('Valid:', providedCRC === calculatedCRC);

// Using verifyCRC (same result)
console.log('Valid:', verifyCRC(qrString));
```

---

## Encoding Functions

### encodeField()

Encode a field into TLV format.

#### Signature

```typescript
function encodeField(id: string, value: string): string
```

#### Parameters

- **id** (`string`): 2-digit field ID (e.g., "38", "54")
- **value** (`string`): Field value to encode

#### Returns

`string` - Encoded TLV string in format `ID + LENGTH + VALUE`

#### Examples

```typescript
import { encodeField } from 'vietqr-ts';

// Encode merchant category
const mcc = encodeField('52', '0000');
console.log(mcc); // "52040000"
// 52 = ID, 04 = length, 0000 = value

// Encode amount
const amount = encodeField('54', '50000');
console.log(amount); // "54055000"
// 54 = ID, 05 = length, 50000 = value

// Encode purpose
const purpose = encodeField('08', 'Payment for order');
console.log(purpose); // "08181Payment for order"
// 08 = ID, 18 = length (24 decimal), Payment for order = value
```

#### Field Length Encoding

Length is encoded as 2-digit decimal number:
- `"01"` to `"99"` for lengths 1-99
- Zero-padded (e.g., `"05"` for length 5)

```typescript
import { encodeField } from 'vietqr-ts';

console.log(encodeField('01', 'A'));        // "010141"
console.log(encodeField('01', 'AB'));       // "010242"
console.log(encodeField('01', 'ABC'));      // "01034ABC"
console.log(encodeField('01', 'ABCDEFGHI')); // "01094ABCDEFGHI"
```

---

### encodeFieldWithDetails()

Encode field into TLV format with detailed structure.

#### Signature

```typescript
function encodeFieldWithDetails(
  id: string,
  value: string
): QRField | null
```

#### Parameters

- **id** (`string`): 2-digit field ID
- **value** (`string`): Field value to encode

#### Returns

`QRField | null` - Detailed field structure or `null` for invalid input

```typescript
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

#### Examples

```typescript
import { encodeFieldWithDetails } from 'vietqr-ts';

// Encode with details
const field = encodeFieldWithDetails('54', '50000');

if (field) {
  console.log('ID:', field.id);           // "54"
  console.log('Length:', field.length);   // "05"
  console.log('Value:', field.value);     // "50000"
  console.log('Encoded:', field.encoded); // "54055000"
}
```

#### Validation

```typescript
import { encodeFieldWithDetails } from 'vietqr-ts';

// Invalid ID (not 2 digits)
const invalid1 = encodeFieldWithDetails('1', 'value');
console.log(invalid1); // null

// Invalid ID (non-numeric)
const invalid2 = encodeFieldWithDetails('AB', 'value');
console.log(invalid2); // null

// Valid field
const valid = encodeFieldWithDetails('01', '01');
console.log(valid); // { id: '01', length: '02', value: '01', encoded: '010201' }
```

---

## Type Guards

### isDynamicQR()

Check if parsed QR data represents a dynamic (one-time) QR code.

#### Signature

```typescript
function isDynamicQR(data: VietQRData): boolean
```

#### Parameters

- **data** (`VietQRData`): Parsed VietQR data

#### Returns

`boolean` - `true` if QR is dynamic, `false` otherwise

#### Examples

```typescript
import { parse, isDynamicQR, isSuccessResult } from 'vietqr-ts';

const result = parse(qrString);

if (isSuccessResult(result)) {
  if (isDynamicQR(result.data)) {
    console.log('Dynamic QR - Use once only');
    console.log('Amount:', result.data.amount);
  } else {
    console.log('Static QR - Reusable');
  }
}
```

#### Use Cases

```typescript
import { parse, isDynamicQR, isSuccessResult } from 'vietqr-ts';

function processPayment(qrString: string) {
  const result = parse(qrString);

  if (!isSuccessResult(result)) {
    return { error: 'Parse failed' };
  }

  if (isDynamicQR(result.data)) {
    // Dynamic QR: amount is fixed
    return {
      type: 'dynamic',
      amount: result.data.amount,
      allowCustomAmount: false
    };
  } else {
    // Static QR: user can enter amount
    return {
      type: 'static',
      allowCustomAmount: true
    };
  }
}
```

---

### isStaticQR()

Check if parsed QR data represents a static (reusable) QR code.

#### Signature

```typescript
function isStaticQR(data: VietQRData): boolean
```

#### Parameters

- **data** (`VietQRData`): Parsed VietQR data

#### Returns

`boolean` - `true` if QR is static, `false` otherwise

#### Examples

```typescript
import { parse, isStaticQR, isSuccessResult } from 'vietqr-ts';

const result = parse(qrString);

if (isSuccessResult(result)) {
  if (isStaticQR(result.data)) {
    console.log('Static QR - Can be reused');
    console.log('Bank:', result.data.bankCode);
    console.log('Account:', result.data.accountNumber);
  }
}
```

#### Payment Flow

```typescript
import { parse, isStaticQR, isSuccessResult } from 'vietqr-ts';

function createPaymentIntent(qrString: string, userAmount?: string) {
  const result = parse(qrString);

  if (!isSuccessResult(result)) {
    throw new Error('Invalid QR code');
  }

  if (isStaticQR(result.data)) {
    // Static QR: require user to provide amount
    if (!userAmount) {
      throw new Error('Amount required for static QR');
    }

    return {
      bankCode: result.data.bankCode,
      accountNumber: result.data.accountNumber,
      amount: userAmount,
      message: result.data.message
    };
  } else {
    // Dynamic QR: use embedded amount
    return {
      bankCode: result.data.bankCode,
      accountNumber: result.data.accountNumber,
      amount: result.data.amount!,
      message: result.data.message
    };
  }
}
```

---

## Constants

### NAPAS_GUID

NAPAS globally unique identifier for VietQR.

```typescript
const NAPAS_GUID = "A000000727";
```

**Usage**:
```typescript
import { NAPAS_GUID } from 'vietqr-ts';

console.log('NAPAS GUID:', NAPAS_GUID); // "A000000727"

// Used in Field 38 (GUID)
const field38 = `3810${NAPAS_GUID}`;
```

---

### DEFAULT_CURRENCY

Default currency code for Vietnamese Dong.

```typescript
const DEFAULT_CURRENCY = "704";
```

**Usage**:
```typescript
import { DEFAULT_CURRENCY } from 'vietqr-ts';

console.log('VND Currency Code:', DEFAULT_CURRENCY); // "704"
```

---

### DEFAULT_COUNTRY

Default country code for Vietnam.

```typescript
const DEFAULT_COUNTRY = "VN";
```

**Usage**:
```typescript
import { DEFAULT_COUNTRY } from 'vietqr-ts';

console.log('Vietnam Country Code:', DEFAULT_COUNTRY); // "VN"
```

---

### DEFAULT_MCC

Default merchant category code.

```typescript
const DEFAULT_MCC = "0000";
```

**Usage**:
```typescript
import { DEFAULT_MCC } from 'vietqr-ts';

console.log('Default MCC:', DEFAULT_MCC); // "0000"
```

---

## Complete Examples

### Build QR String Manually

```typescript
import { encodeField, calculateCRC, NAPAS_GUID } from 'vietqr-ts';

// Build QR string step by step
const fields = [
  encodeField('00', '01'),              // Payload format indicator
  encodeField('01', '11'),              // Initiation method (static)
  // Field 38: Consumer account information
  `3854${
    encodeField('00', NAPAS_GUID) +     // GUID
    encodeField('01', '0006970403') +   // BIN + Service code
    encodeField('02', '01234567')       // Account number
  }`,
  encodeField('52', '0000'),            // Merchant category
  encodeField('53', '704'),             // Currency
  encodeField('58', 'VN')               // Country
];

const partialQR = fields.join('') + '6304';
const crc = calculateCRC(partialQR);
const completeQR = partialQR + crc;

console.log('Complete QR:', completeQR);
```

### Verify and Extract QR Components

```typescript
import { verifyCRC, encodeField } from 'vietqr-ts';

function analyzeQRString(qrString: string) {
  // Verify CRC first
  if (!verifyCRC(qrString)) {
    return { error: 'Invalid CRC checksum' };
  }

  // Extract fields manually (simplified)
  const fields: any = {};
  let pos = 0;

  while (pos < qrString.length - 4) { // Exclude CRC
    const id = qrString.substring(pos, pos + 2);
    const length = parseInt(qrString.substring(pos + 2, pos + 4), 10);
    const value = qrString.substring(pos + 4, pos + 4 + length);

    fields[id] = value;
    pos += 4 + length;
  }

  return {
    valid: true,
    fields,
    crc: qrString.substring(qrString.length - 4)
  };
}
```

### Custom Field Encoder

```typescript
import { encodeField } from 'vietqr-ts';

class QRBuilder {
  private fields: Map<string, string> = new Map();

  addField(id: string, value: string): this {
    this.fields.set(id, value);
    return this;
  }

  build(): string {
    // Sort fields by ID
    const sorted = Array.from(this.fields.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    // Encode all fields except CRC
    const encoded = sorted
      .filter(([id]) => id !== '63')
      .map(([id, value]) => encodeField(id, value))
      .join('');

    // Add CRC placeholder
    const withCRCPlaceholder = encoded + '6304';

    // Calculate and append real CRC
    const crc = calculateCRC(withCRCPlaceholder);
    return withCRCPlaceholder + crc;
  }
}

// Usage
const builder = new QRBuilder();
builder
  .addField('00', '01')
  .addField('01', '11')
  .addField('52', '0000')
  .addField('53', '704')
  .addField('58', 'VN');

const qrString = builder.build();
console.log('QR String:', qrString);
```

### Safe Type Checking

```typescript
import {
  parse,
  isSuccessResult,
  isErrorResult,
  isDynamicQR,
  isStaticQR
} from 'vietqr-ts';

function processQRCode(qrString: string) {
  const result = parse(qrString);

  // Type-safe error checking
  if (isErrorResult(result)) {
    return {
      success: false,
      error: result.error.message,
      errorType: result.error.type
    };
  }

  // Type-safe success checking
  if (isSuccessResult(result)) {
    const data = result.data;

    return {
      success: true,
      qrType: isDynamicQR(data) ? 'dynamic' : 'static',
      isReusable: isStaticQR(data),
      hasAmount: !!data.amount,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber
    };
  }

  // Unreachable
  return { success: false, error: 'Unknown error' };
}
```
