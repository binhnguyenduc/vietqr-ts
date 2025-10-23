/**
 * QR Code Image Generation Example
 *
 * Demonstrates how to generate QR code images in different formats:
 * 1. PNG format with custom styling
 * 2. SVG format
 * 3. Saving to file (Node.js)
 * 4. Browser usage with base64 data URLs
 */

import { generateQRImage } from 'vietqr-ts';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// ========================================
// Example 1: Generate PNG QR Code
// ========================================
console.log('=== Example 1: PNG QR Code ===');

const pngResult = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '50000',
  message: 'Payment for services'
}, {
  format: 'png',
  width: 400,
  errorCorrectionLevel: 'M',
  margin: 4
});

console.log('PNG generated:');
console.log('  Format:', pngResult.format);
console.log('  Width:', pngResult.width);
console.log('  Buffer size:', pngResult.buffer.length, 'bytes');
console.log('  VietQR data:', pngResult.vietqr.rawData.substring(0, 50) + '...');
console.log('');

// Save PNG to file (Node.js)
const pngPath = join(process.cwd(), 'examples', 'output', 'payment-qr.png');
await writeFile(pngPath, pngResult.buffer);
console.log('✅ PNG saved to:', pngPath);
console.log('');

// ========================================
// Example 2: Generate SVG QR Code
// ========================================
console.log('=== Example 2: SVG QR Code ===');

const svgResult = await generateQRImage({
  bankBin: '970415',
  accountNumber: '9876543210',
  serviceCode: 'QRIBFTTA',
  amount: '100000'
}, {
  format: 'svg',
  width: 300,
  errorCorrectionLevel: 'H' // High error correction for better scanning
});

console.log('SVG generated:');
console.log('  Format:', svgResult.format);
console.log('  Size:', svgResult.buffer.length, 'bytes');
console.log('');

// Save SVG to file (Node.js)
const svgPath = join(process.cwd(), 'examples', 'output', 'payment-qr.svg');
await writeFile(svgPath, svgResult.buffer);
console.log('✅ SVG saved to:', svgPath);
console.log('');

// ========================================
// Example 3: Custom Styled QR Code
// ========================================
console.log('=== Example 3: Custom Styled QR Code ===');

const styledResult = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '250000',
  message: 'Premium Service Payment'
}, {
  format: 'png',
  width: 500,
  errorCorrectionLevel: 'Q',
  margin: 6,
  color: {
    dark: '#003366',  // Dark blue modules
    light: '#FFFFFF'  // White background
  }
});

console.log('Styled QR generated:');
console.log('  Custom colors applied');
console.log('  Dark color: #003366');
console.log('  Light color: #FFFFFF');
console.log('');

const styledPath = join(process.cwd(), 'examples', 'output', 'styled-qr.png');
await writeFile(styledPath, styledResult.buffer);
console.log('✅ Styled QR saved to:', styledPath);
console.log('');

// ========================================
// Example 4: Browser Usage (Base64)
// ========================================
console.log('=== Example 4: Browser Usage ===');

const browserResult = await generateQRImage({
  bankBin: '970422',
  accountNumber: '0123456789',
  serviceCode: 'QRIBFTTA',
  amount: '75000'
}, {
  format: 'png',
  width: 350
});

console.log('For browser usage:');
console.log('  Data URL (truncated):', browserResult.dataUrl.substring(0, 80) + '...');
console.log('');
console.log('HTML usage:');
console.log('  <img src="' + browserResult.dataUrl.substring(0, 50) + '..." alt="QR Code" />');
console.log('');
console.log('JavaScript usage:');
console.log('  const img = document.getElementById("qr-code");');
console.log('  img.src = result.dataUrl;');
console.log('');

// ========================================
// Example 5: Error Correction Levels
// ========================================
console.log('=== Example 5: Error Correction Levels ===');

const errorLevels = ['L', 'M', 'Q', 'H'] as const;

console.log('Generating QR codes with different error correction levels:');
console.log('');

for (const level of errorLevels) {
  const result = await generateQRImage({
    bankBin: '970422',
    accountNumber: '0123456789',
    serviceCode: 'QRIBFTTA',
    amount: '50000'
  }, {
    format: 'png',
    width: 300,
    errorCorrectionLevel: level
  });

  const levelNames = {
    L: 'Low (7% recovery)',
    M: 'Medium (15% recovery)',
    Q: 'Quartile (25% recovery)',
    H: 'High (30% recovery)'
  };

  console.log(`  ${level}: ${levelNames[level]}`);
  console.log(`     Size: ${result.buffer.length} bytes`);

  const levelPath = join(process.cwd(), 'examples', 'output', `qr-level-${level}.png`);
  await writeFile(levelPath, result.buffer);
}
console.log('');
console.log('✅ All error correction level examples saved');
console.log('');
console.log('Recommendation:');
console.log('  - Use L for large, clean displays');
console.log('  - Use M for general purpose (default)');
console.log('  - Use Q for moderate damage resistance');
console.log('  - Use H when QR might be damaged or partially obscured');
