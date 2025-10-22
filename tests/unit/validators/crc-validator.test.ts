/**
 * Unit tests for VietQR CRC-16-CCITT validator
 *
 * Tests CRC checksum verification per NAPAS IBFT v1.5.2 specification.
 * These tests follow TDD - they will FAIL until validators are implemented.
 *
 * @module tests/unit/validators/crc-validator
 */

import { describe, it, expect } from 'vitest';
import { validateCRC, verifyCRC, calculateCRC } from '../../../src/validators/crc-validator';
import { VALID_VIETQR_SAMPLES, INVALID_VIETQR_SAMPLES } from '../../fixtures/vietqr-samples';

describe('validateCRC', () => {
  describe('Valid CRC checksums', () => {
    it('should accept valid CRC from dynamic full sample', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should accept valid CRC from static sample', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should accept valid CRC from minimal sample', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should accept CRC with lowercase hex characters', () => {
      // CRC validation should be case-insensitive
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304a3cf';
      const crc = 'a3cf'; // lowercase version of A3CF
      const result = validateCRC(qrString, crc);
      expect(result).toBeNull();
    });

    it('should accept CRC with uppercase hex characters', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF';
      const crc = 'A3CF';
      const result = validateCRC(qrString, crc);
      expect(result).toBeNull();
    });
  });

  describe('Invalid CRC checksums', () => {
    it('should reject incorrect CRC', () => {
      const sample = INVALID_VIETQR_SAMPLES.INVALID_CRC;
      // Using the QR string and intentionally wrong CRC
      const result = validateCRC(sample.qrString, '0000');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('CHECKSUM_MISMATCH');
      expect(result?.field).toBe('crc');
    });

    it('should reject CRC with wrong length (3 characters)', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, 'B7C');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject CRC with wrong length (5 characters)', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, 'B7C9A');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty CRC', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, '');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject undefined CRC', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, undefined as any);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should reject CRC with non-hexadecimal characters', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, 'GHIJ');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_FORMAT');
    });

    it('should reject CRC with special characters', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, 'B7-C');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });

    it('should reject CRC with spaces', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const result = validateCRC(qrString, 'B7 C');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CHARACTER');
    });
  });

  describe('CRC calculation edge cases', () => {
    it('should validate CRC for QR string with minimal required fields', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should validate CRC for QR string with all optional fields', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_WITH_OPTIONALS;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should validate CRC for QR string with UTF-8 characters', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_UTF8_MESSAGE;
      const result = validateCRC(sample.qrString, sample.expected.crc);
      expect(result).toBeNull();
    });

    it('should detect single bit flip in CRC', () => {
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CE';
      const correctCRC = 'A3CF';
      const flippedCRC = 'A3CE'; // Last bit flipped
      const result = validateCRC(qrString, flippedCRC);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('CHECKSUM_MISMATCH');
    });
  });
});

describe('verifyCRC', () => {
  describe('Complete QR string verification', () => {
    it('should verify valid complete QR string', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const result = verifyCRC(sample.qrString);
      expect(result).toBe(true);
    });

    it('should verify valid static QR string', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const result = verifyCRC(sample.qrString);
      expect(result).toBe(true);
    });

    it('should reject QR string with tampered data', () => {
      // Take valid QR string and modify one character before CRC
      const validQR = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const tamperedQR = validQR.slice(0, 50) + '9' + validQR.slice(51);
      const result = verifyCRC(tamperedQR);
      expect(result).toBe(false);
    });

    it('should reject QR string with incorrect CRC', () => {
      const sample = INVALID_VIETQR_SAMPLES.INVALID_CRC;
      const result = verifyCRC(sample.qrString);
      expect(result).toBe(false);
    });

    it('should reject QR string without CRC field', () => {
      const qrWithoutCRC = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN';
      const result = verifyCRC(qrWithoutCRC);
      expect(result).toBe(false);
    });

    it('should reject QR string with malformed CRC field', () => {
      const qrWithMalformedCRC = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6302XX';
      const result = verifyCRC(qrWithMalformedCRC);
      expect(result).toBe(false);
    });
  });

  describe('CRC verification with different QR lengths', () => {
    it('should verify short valid QR string', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const result = verifyCRC(sample.qrString);
      expect(result).toBe(true);
    });

    it('should verify long valid QR string with optional fields', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_WITH_OPTIONALS;
      const result = verifyCRC(sample.qrString);
      expect(result).toBe(true);
    });
  });
});

describe('calculateCRC', () => {
  describe('CRC-16-CCITT calculation', () => {
    it('should calculate correct CRC for dynamic full sample', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      // Extract QR string without CRC (everything before "6304")
      const dataWithoutCRC = sample.qrString.slice(0, -4);
      const calculatedCRC = calculateCRC(dataWithoutCRC);
      expect(calculatedCRC.toUpperCase()).toBe(sample.expected.crc.toUpperCase());
    });

    it('should calculate correct CRC for static sample', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const dataWithoutCRC = sample.qrString.slice(0, -4);
      const calculatedCRC = calculateCRC(dataWithoutCRC);
      expect(calculatedCRC.toUpperCase()).toBe(sample.expected.crc.toUpperCase());
    });

    it('should calculate correct CRC for minimal sample', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const dataWithoutCRC = sample.qrString.slice(0, -4);
      const calculatedCRC = calculateCRC(dataWithoutCRC);
      expect(calculatedCRC.toUpperCase()).toBe(sample.expected.crc.toUpperCase());
    });

    it('should return 4-character hexadecimal CRC', () => {
      const data = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const crc = calculateCRC(data);
      expect(crc).toMatch(/^[0-9A-Fa-f]{4}$/);
    });

    it('should produce different CRCs for different data', () => {
      const data1 = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const data2 = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802US6304';
      const crc1 = calculateCRC(data1);
      const crc2 = calculateCRC(data2);
      expect(crc1).not.toBe(crc2);
    });

    it('should produce same CRC for identical data', () => {
      const data = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304';
      const crc1 = calculateCRC(data);
      const crc2 = calculateCRC(data);
      expect(crc1).toBe(crc2);
    });
  });

  describe('CRC calculation edge cases', () => {
    it('should handle empty string', () => {
      const crc = calculateCRC('');
      expect(crc).toMatch(/^[0-9A-Fa-f]{4}$/);
    });

    it('should handle single character', () => {
      const crc = calculateCRC('A');
      expect(crc).toMatch(/^[0-9A-Fa-f]{4}$/);
    });

    it('should handle UTF-8 characters', () => {
      const data = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN62250821Thanh toán hóa đơn6304';
      const crc = calculateCRC(data);
      expect(crc).toMatch(/^[0-9A-Fa-f]{4}$/);
    });

    it('should handle very long strings', () => {
      const longData = '0002010102' + 'A'.repeat(500) + '6304';
      const crc = calculateCRC(longData);
      expect(crc).toMatch(/^[0-9A-Fa-f]{4}$/);
    });
  });

  describe('CRC-16-CCITT polynomial (0x1021)', () => {
    it('should use CRC-16-CCITT algorithm', () => {
      // Known test vector for CRC-16-CCITT
      // "123456789" should produce CRC 0x29B1
      const testData = '123456789';
      const expectedCRC = '29B1';
      const calculatedCRC = calculateCRC(testData);
      expect(calculatedCRC.toUpperCase()).toBe(expectedCRC);
    });

    it('should initialize with 0xFFFF', () => {
      // CRC-16-CCITT spec requires initial value of 0xFFFF
      // Empty string CRC should reflect this initialization
      const emptyCRC = calculateCRC('');
      expect(emptyCRC).not.toBe('0000');
    });
  });
});

describe('CRC mismatch detection scenarios', () => {
  describe('Data corruption detection', () => {
    it('should detect single character change', () => {
      const original = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const corrupted = original.slice(0, 20) + 'X' + original.slice(21);
      const result = verifyCRC(corrupted);
      expect(result).toBe(false);
    });

    it('should detect amount tampering', () => {
      // Change amount from 50000 to 90000
      const original = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const tampered = original.replace('50000', '90000');
      const result = verifyCRC(tampered);
      expect(result).toBe(false);
    });

    it('should detect bank code tampering', () => {
      const original = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const tampered = original.replace('970422', '970415');
      const result = verifyCRC(tampered);
      expect(result).toBe(false);
    });

    it('should detect account number tampering', () => {
      const original = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      const tampered = original.replace('0123456789020', '9876543210000');
      const result = verifyCRC(tampered);
      expect(result).toBe(false);
    });

    it('should detect field insertion', () => {
      const original = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT.qrString;
      // Insert a fake field before CRC
      const insertedField = original.slice(0, -8) + '9903ABC' + original.slice(-8);
      const result = verifyCRC(insertedField);
      expect(result).toBe(false);
    });

    it('should detect field deletion', () => {
      const original = VALID_VIETQR_SAMPLES.DYNAMIC_FULL.qrString;
      // Remove message field and keep original CRC (should fail)
      const withoutMessage = original.replace(/62\d{2}08\d{2}.+?(?=63)/, '');
      const result = verifyCRC(withoutMessage);
      expect(result).toBe(false);
    });
  });

  describe('Malformed CRC field detection', () => {
    it('should detect truncated CRC', () => {
      const qr = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6302B7';
      const result = verifyCRC(qr);
      expect(result).toBe(false);
    });

    it('should detect CRC field with wrong TLV ID', () => {
      const qr = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6204B7C9';
      const result = verifyCRC(qr);
      expect(result).toBe(false);
    });

    it('should detect CRC field with wrong TLV length', () => {
      const qr = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6305B7C9A';
      const result = verifyCRC(qr);
      expect(result).toBe(false);
    });
  });
});

describe('Integration with parse result validation', () => {
  it('should mark parsed data as corrupted when CRC fails', () => {
    const sample = INVALID_VIETQR_SAMPLES.INVALID_CRC;
    const isValid = verifyCRC(sample.qrString);
    expect(isValid).toBe(false);
    // This should trigger isCorrupted flag in ValidationResult
  });

  it('should allow valid data to pass CRC verification', () => {
    const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
    const isValid = verifyCRC(sample.qrString);
    expect(isValid).toBe(true);
    // This should not set isCorrupted flag
  });
});
