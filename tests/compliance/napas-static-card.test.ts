import { describe, it, expect } from 'vitest';
import { generateVietQR } from '../../src/generators/vietqr';

/**
 * NAPAS IBFT v1.5.2 Compliance Test - Static Card QR
 *
 * Reference: qr_format_v1.5.2.md line 953
 * Test Data: 00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN63044F52
 *
 * This test ensures the library generates QR data that matches the official NAPAS
 * specification example for card-based transfers, including the correct CRC-16-CCITT checksum.
 */
describe('NAPAS Compliance: Static Card QR', () => {
  it('should generate QR matching NAPAS reference example (4F52 CRC)', () => {
    // NAPAS specification reference data (qr_format_v1.5.2.md line 953)
    const expectedQRData =
      '00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN63044F52';

    // Test configuration from NAPAS example
    const config = {
      bankBin: '970403',
      cardNumber: '9704031101234567',
      serviceCode: 'QRIBFTTC' as const,
    };

    // Generate VietQR data
    const result = generateVietQR(config);

    // Verify character-for-character match with NAPAS specification
    expect(result.rawData).toBe(expectedQRData);

    // Verify CRC matches NAPAS expected value
    expect(result.crc).toBe('4F52');
  });

  it('should parse individual EMVCo fields correctly for card transfer', () => {
    // Test configuration
    const config = {
      bankBin: '970403',
      cardNumber: '9704031101234567',
      serviceCode: 'QRIBFTTC' as const,
    };

    const result = generateVietQR(config);

    // Verify field structure (EMVCo ID/Length/Value format)
    const fieldMap = new Map(result.fields.map((f) => [f.id, f]));

    // Payload Format Indicator (ID 00)
    expect(fieldMap.get('00')?.value).toBe('01');

    // Point of Initiation Method (ID 01)
    expect(fieldMap.get('01')?.value).toBe('11'); // Static QR = 11

    // Merchant Account Information (ID 38) - NAPAS GUID
    const merchantField = fieldMap.get('38');
    expect(merchantField).toBeDefined();
    expect(merchantField?.value).toContain('A000000727'); // NAPAS GUID
    expect(merchantField?.value).toContain('QRIBFTTC'); // Card service code

    // Transaction Currency (ID 53)
    expect(fieldMap.get('53')?.value).toBe('704'); // VND currency code

    // Country Code (ID 58)
    expect(fieldMap.get('58')?.value).toBe('VN'); // Vietnam

    // CRC (ID 63) - should be valid 4-character hex
    expect(fieldMap.get('63')?.value).toMatch(/^[0-9A-F]{4}$/);
  });

  it('should validate card number parameters', () => {
    // Missing cardNumber
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        cardNumber: '',
        serviceCode: 'QRIBFTTC',
      })
    ).toThrow(/Card number is required|Service code QRIBFTTC requires cardNumber/);

    // Card number exceeding 19 characters
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        cardNumber: '12345678901234567890',
        serviceCode: 'QRIBFTTC',
      })
    ).toThrow(/19.*character/i);

    // Invalid service code for card
    expect(() =>
      generateVietQR({
        bankBin: '970403',
        cardNumber: '9704031101234567',
        serviceCode: 'INVALID' as any,
      })
    ).toThrow(/Service code must be one of|Invalid service code/);
  });

  it('should handle different card numbers', () => {
    const config = {
      bankBin: '970403',
      cardNumber: '9704031109876543',
      serviceCode: 'QRIBFTTC' as const,
    };

    const result = generateVietQR(config);

    // Verify structure is valid (has CRC, rawData, fields)
    expect(result.rawData).toMatch(/^000201/); // Starts with payload format
    expect(result.rawData).toMatch(/6304[0-9A-F]{4}$/); // Ends with CRC field
    expect(result.crc).toMatch(/^[0-9A-F]{4}$/); // CRC is 4 hex chars
    expect(result.fields.length).toBeGreaterThan(0);
  });
});
