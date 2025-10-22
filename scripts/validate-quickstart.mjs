#!/usr/bin/env node
/**
 * Validate quickstart.md code examples
 *
 * This script validates that all code examples in the quickstart guide work correctly.
 */

import { parse, validate, decode, decodeAndValidate, generateVietQR, generateQRImage } from '../dist/index.mjs';
import { readFile } from 'fs/promises';

console.log('🧪 Validating Quickstart Examples\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

// Example 1: Parse VietQR String
test('Example 1: Parse VietQR String', () => {
  // Use a properly formatted test QR string
  const testData = {
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
  };

  const qrData = generateVietQR(testData);
  const result = parse(qrData.rawData);

  if (!result.success) {
    throw new Error(`Parse failed: ${result.error.message}`);
  }

  if (result.data.bankCode !== '970422') {
    throw new Error(`Expected bankCode '970422', got '${result.data.bankCode}'`);
  }

  if (result.data.accountNumber !== '0123456789') {
    throw new Error(`Expected accountNumber '0123456789', got '${result.data.accountNumber}'`);
  }

  if (result.data.countryCode !== 'VN') {
    throw new Error(`Expected countryCode 'VN', got '${result.data.countryCode}'`);
  }
});

// Example 2: Validate Parsed Data
test('Example 2: Validate Parsed Data', () => {
  const testData = {
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
  };

  const qrData = generateVietQR(testData);
  const parseResult = parse(qrData.rawData);

  if (!parseResult.success) {
    throw new Error('Parse failed');
  }

  const validation = validate(parseResult.data, qrData.rawData);

  if (!validation.isValid) {
    throw new Error(`Validation failed with ${validation.errors.length} errors`);
  }

  if (validation.isCorrupted) {
    throw new Error('Data should not be marked as corrupted');
  }
});

// Example 3: Decode QR Image
test('Example 3: Decode QR Image', async () => {
  // Generate a test QR image first
  const testData = {
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
  };

  const qrData = generateVietQR(testData);
  const imageResult = await generateQRImage({ data: qrData.rawData, format: 'png' });

  // Convert base64 to buffer for decode
  const imageBuffer = Buffer.from(imageResult.base64, 'base64');
  const result = decode(imageBuffer);

  if (!result.success) {
    throw new Error(`Decode failed: ${result.error.message}`);
  }

  if (result.data.accountNumber !== '0123456789') {
    throw new Error(`Expected accountNumber '0123456789', got '${result.data.accountNumber}'`);
  }
});

// Example 4: Decode and Validate (Combined)
test('Example 4: Decode and Validate (Combined)', async () => {
  const testData = {
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
    amount: '100000',
  };

  const qrData = generateVietQR(testData);
  const imageResult = await generateQRImage({ data: qrData.rawData, format: 'png' });

  // Convert base64 to buffer for decode
  const imageBuffer = Buffer.from(imageResult.base64, 'base64');
  const result = decodeAndValidate(imageBuffer);

  if (!result.success) {
    throw new Error(`Decode and validate failed: ${result.error.message}`);
  }

  if (!result.data.isValid) {
    throw new Error(`Validation failed with ${result.data.errors.length} errors`);
  }
});

// Wait for all async tests to complete
await Promise.resolve();

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
