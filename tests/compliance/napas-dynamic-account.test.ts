import { describe, it, expect } from 'vitest';
import { generateVietQR } from '../../src/generators/vietqr';

/**
 * NAPAS IBFT v1.5.2 Compliance Test - Dynamic Account QR
 *
 * Reference: qr_format_v1.5.2.md line 981
 * Test Data: 00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E
 *
 * This test ensures the library generates QR data that matches the official NAPAS
 * specification example for dynamic account transfers with pre-filled amount and metadata,
 * including the correct CRC-16-CCITT checksum.
 */
describe('NAPAS Compliance: Dynamic Account QR', () => {
  it('should generate QR matching NAPAS reference example (2E2E CRC)', () => {
    // NAPAS specification reference data (qr_format_v1.5.2.md line 981)
    const expectedQRData =
      '00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E';

    // Test configuration from NAPAS example
    const config = {
      bankBin: '970403',
      accountNumber: '0011012345678',
      serviceCode: 'QRIBFTTA' as const,
      amount: '180000',
      billNumber: 'NPS6869',
      purpose: 'thanh toan don hang',
    };

    // Generate VietQR data
    const result = generateVietQR(config);

    // Verify character-for-character match with NAPAS specification
    expect(result.rawData).toBe(expectedQRData);

    // Verify CRC matches NAPAS expected value
    expect(result.crc).toBe('2E2E');
  });

  it('should parse individual EMVCo fields correctly for dynamic account transfer', () => {
    // Test configuration
    const config = {
      bankBin: '970403',
      accountNumber: '0011012345678',
      serviceCode: 'QRIBFTTA' as const,
      amount: '180000',
      billNumber: 'NPS6869',
      purpose: 'thanh toan don hang',
    };

    const result = generateVietQR(config);

    // Verify field structure (EMVCo ID/Length/Value format)
    const fieldMap = new Map(result.fields.map((f) => [f.id, f]));

    // Payload Format Indicator (ID 00)
    expect(fieldMap.get('00')?.value).toBe('01');

    // Point of Initiation Method (ID 01)
    expect(fieldMap.get('01')?.value).toBe('12'); // Dynamic QR = 12

    // Merchant Account Information (ID 38) - NAPAS GUID
    const merchantField = fieldMap.get('38');
    expect(merchantField).toBeDefined();
    expect(merchantField?.value).toContain('A000000727'); // NAPAS GUID
    expect(merchantField?.value).toContain('QRIBFTTA'); // Account service code

    // Transaction Currency (ID 53)
    expect(fieldMap.get('53')?.value).toBe('704'); // VND currency code

    // Transaction Amount (ID 54)
    expect(fieldMap.get('54')?.value).toBe('180000');

    // Country Code (ID 58)
    expect(fieldMap.get('58')?.value).toBe('VN'); // Vietnam

    // Additional Data (ID 62) - Bill number and purpose
    const additionalDataField = fieldMap.get('62');
    expect(additionalDataField).toBeDefined();
    expect(additionalDataField?.value).toContain('NPS6869'); // Bill number
    expect(additionalDataField?.value).toContain('thanh toan don hang'); // Purpose

    // CRC (ID 63) - should be valid 4-character hex
    expect(fieldMap.get('63')?.value).toMatch(/^[0-9A-F]{4}$/);
  });

  it('should validate amount parameters', () => {
    // Amount exceeding 13 characters
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        accountNumber: '0011012345678',
        serviceCode: 'QRIBFTTA',
        amount: '12345678901234',
        billNumber: 'NPS6869',
        purpose: 'test',
      })
    ).toThrow(/13.*character/i);

    // Invalid amount format
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        accountNumber: '0011012345678',
        serviceCode: 'QRIBFTTA',
        amount: 'invalid',
        billNumber: 'NPS6869',
        purpose: 'test',
      })
    ).toThrow(/numeric/i);
  });

  it('should validate additional data parameters', () => {
    // Bill number exceeding 25 characters
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        accountNumber: '0011012345678',
        serviceCode: 'QRIBFTTA',
        amount: '180000',
        billNumber: 'A'.repeat(26),
        purpose: 'test',
      })
    ).toThrow(/25.*character/i);

    // Purpose exceeding 25 characters
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        accountNumber: '0011012345678',
        serviceCode: 'QRIBFTTA',
        amount: '180000',
        billNumber: 'NPS6869',
        purpose: 'A'.repeat(26),
      })
    ).toThrow(/25.*character/i);
  });

  it('should handle different amounts and purposes', () => {
    const config = {
      bankBin: '970403',
      accountNumber: '0011012345678',
      serviceCode: 'QRIBFTTA' as const,
      amount: '50000.50',
      billNumber: 'INV123',
      purpose: 'payment for order',
    };

    const result = generateVietQR(config);

    // Verify structure is valid (has CRC, rawData, fields)
    expect(result.rawData).toMatch(/^000201/); // Starts with payload format
    expect(result.rawData).toMatch(/6304[0-9A-F]{4}$/); // Ends with CRC field
    expect(result.crc).toMatch(/^[0-9A-F]{4}$/); // CRC is 4 hex chars
    expect(result.fields.length).toBeGreaterThan(0);

    // Verify dynamic QR indicator
    const fieldMap = new Map(result.fields.map((f) => [f.id, f]));
    expect(fieldMap.get('01')?.value).toBe('12'); // Dynamic QR
    expect(fieldMap.get('54')?.value).toBe('50000.50'); // Amount with decimal
  });
});
