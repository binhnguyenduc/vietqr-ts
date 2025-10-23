/**
 * Basic Usage Example
 *
 * Demonstrates the most common use cases for VietQR library:
 * 1. Generating static QR codes (user enters amount)
 * 2. Generating dynamic QR codes (fixed amount)
 * 3. Parsing QR strings
 * 4. Validating parsed data
 */

import { generateVietQR, parse, validate } from 'vietqr-ts';

// ========================================
// Example 1: Generate Static QR Code
// ========================================
// Static QR codes let users enter the amount themselves
console.log('=== Example 1: Static QR Code ===');

const staticQR = generateVietQR({
  bankBin: '970422',           // VCB - Vietcombank
  accountNumber: '0123456789', // Bank account number
  serviceCode: 'QRIBFTTA'      // Account transfer service
});

console.log('Static QR String:', staticQR.rawData);
console.log('QR Type:', staticQR.qrType); // 'static'
console.log('');

// ========================================
// Example 2: Generate Dynamic QR Code
// ========================================
// Dynamic QR codes have a fixed amount embedded
console.log('=== Example 2: Dynamic QR Code ===');

const dynamicQR = generateVietQR({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000',                      // 50,000 VND
  message: 'Payment for Order #12345'   // Optional description
});

console.log('Dynamic QR String:', dynamicQR.rawData);
console.log('QR Type:', dynamicQR.qrType); // 'dynamic'
console.log('Amount:', dynamicQR.amount); // '50000'
console.log('');

// ========================================
// Example 3: Parse QR String
// ========================================
console.log('=== Example 3: Parse QR String ===');

const qrString = dynamicQR.rawData;
const parseResult = parse(qrString);

if (parseResult.success) {
  console.log('✅ Parsing successful!');
  console.log('Bank Code:', parseResult.data.bankCode);
  console.log('Account Number:', parseResult.data.accountNumber);
  console.log('Amount:', parseResult.data.amount);
  console.log('Message:', parseResult.data.message);
  console.log('Currency:', parseResult.data.currency); // '704' (VND)
  console.log('Country:', parseResult.data.countryCode); // 'VN'
} else {
  console.error('❌ Parsing failed:', parseResult.error.message);
}
console.log('');

// ========================================
// Example 4: Validate Parsed Data
// ========================================
console.log('=== Example 4: Validate Parsed Data ===');

if (parseResult.success) {
  const validation = validate(parseResult.data, qrString);

  if (validation.isValid) {
    console.log('✅ QR code is valid and safe to process');

    // Check for data corruption
    if (validation.isCorrupted) {
      console.warn('⚠️  Warning: Data may be corrupted or truncated');
    }
  } else {
    console.error('❌ Validation failed with errors:');
    validation.errors.forEach(error => {
      console.error(`  - ${error.field}: ${error.message} [${error.code}]`);
    });
  }
}
console.log('');

// ========================================
// Example 5: Complete Payment Flow
// ========================================
console.log('=== Example 5: Complete Payment Flow ===');

// Merchant generates QR for 100,000 VND payment
const merchantQR = generateVietQR({
  bankBin: '970415',           // Vietinbank
  accountNumber: '9876543210',
  serviceCode: 'QRIBFTTA',
  amount: '100000',
  message: 'Cafe payment',
  billNumber: 'BILL-2024-001'
});

console.log('Merchant QR generated:', merchantQR.rawData.substring(0, 50) + '...');

// Customer scans and app parses the QR
const customerParse = parse(merchantQR.rawData);

if (customerParse.success) {
  // Validate before showing to user
  const customerValidation = validate(customerParse.data, merchantQR.rawData);

  if (customerValidation.isValid && !customerValidation.isCorrupted) {
    // Safe to display payment details to customer
    console.log('\n📱 Customer sees:');
    console.log(`  Pay to account: ${customerParse.data.accountNumber}`);
    console.log(`  Bank: ${customerParse.data.bankCode}`);
    console.log(`  Amount: ${customerParse.data.amount} VND`);
    console.log(`  Description: ${customerParse.data.message}`);
    console.log(`  Bill: ${customerParse.data.billNumber}`);
    console.log('\n✅ Payment details verified - ready for confirmation');
  } else {
    console.error('❌ Invalid QR code - do not process payment');
  }
}
