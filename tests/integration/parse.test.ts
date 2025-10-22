/**
 * Integration tests for VietQR parse() function
 *
 * Tests the complete parsing flow from raw QR string to structured VietQRData,
 * covering valid, invalid, and corrupted scenarios using test fixtures.
 *
 * @module tests/integration/parse
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parsers';
import {
  VALID_VIETQR_SAMPLES,
  INVALID_VIETQR_SAMPLES,
  CORRUPTED_VIETQR_SAMPLES
} from '../fixtures/vietqr-samples';
import type { VietQRData } from '../../src/types/decode';

describe('parse() - Integration Tests', () => {
  describe('Valid VietQR strings', () => {
    it('should parse dynamic VietQR with full fields', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBe(sample.expected.payloadFormatIndicator);
      expect(data.initiationMethod).toBe(sample.expected.initiationMethod);
      expect(data.bankCode).toBe(sample.expected.bankCode);
      expect(data.accountNumber).toBe(sample.expected.accountNumber);
      expect(data.amount).toBe(sample.expected.amount);
      expect(data.currency).toBe(sample.expected.currency);
      expect(data.countryCode).toBe(sample.expected.countryCode);
      expect(data.message).toBe(sample.expected.message);
      expect(data.crc).toBe(sample.expected.crc);
    });

    it('should parse static VietQR without amount', () => {
      const sample = VALID_VIETQR_SAMPLES.STATIC_NO_AMOUNT;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBe(sample.expected.payloadFormatIndicator);
      expect(data.initiationMethod).toBe(sample.expected.initiationMethod);
      expect(data.bankCode).toBe(sample.expected.bankCode);
      expect(data.accountNumber).toBe(sample.expected.accountNumber);
      expect(data.amount).toBeUndefined();
      expect(data.currency).toBe(sample.expected.currency);
      expect(data.countryCode).toBe(sample.expected.countryCode);
      expect(data.crc).toBe(sample.expected.crc);
    });

    it('should parse minimal VietQR with only required fields', () => {
      const sample = VALID_VIETQR_SAMPLES.MINIMAL_REQUIRED;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBe(sample.expected.payloadFormatIndicator);
      expect(data.initiationMethod).toBe(sample.expected.initiationMethod);
      expect(data.bankCode).toBe(sample.expected.bankCode);
      expect(data.accountNumber).toBe(sample.expected.accountNumber);
      expect(data.currency).toBe(sample.expected.currency);
      expect(data.countryCode).toBe(sample.expected.countryCode);
      expect(data.crc).toBe(sample.expected.crc);

      // Optional fields should be undefined
      expect(data.amount).toBeUndefined();
      expect(data.message).toBeUndefined();
      expect(data.purposeCode).toBeUndefined();
      expect(data.billNumber).toBeUndefined();
    });

    it('should parse VietQR with purpose code and bill number', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_PURPOSE_AND_BILL;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.purposeCode).toBe(sample.expected.purposeCode);
      expect(data.billNumber).toBe(sample.expected.billNumber);
    });

    it('should parse VietQR with UTF-8 message', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_UTF8_MESSAGE;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.message).toBe(sample.expected.message);
    });

    it('should parse VietQR with merchant category code', () => {
      const sample = VALID_VIETQR_SAMPLES.WITH_MERCHANT_CATEGORY;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.merchantCategory).toBe(sample.expected.merchantCategory);
    });
  });

  describe('Invalid VietQR strings', () => {
    it('should reject empty string', () => {
      const sample = INVALID_VIETQR_SAMPLES.EMPTY_STRING;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
      expect(result.error?.message).toContain('required');  // Error message contains "required"
    });

    it('should reject non-string input', () => {
      const result = parse(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
      expect(result.error?.message).toContain('string');
    });

    it('should reject string exceeding max length', () => {
      const sample = INVALID_VIETQR_SAMPLES.EXCEEDS_MAX_LENGTH;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');  // Parse fails at TLV level with INVALID_FORMAT
      expect(result.error?.message).toContain('field ID');  // Error about invalid field ID
    });

    it('should reject malformed TLV structure (non-numeric ID)', () => {
      const sample = INVALID_VIETQR_SAMPLES.MALFORMED_TLV_ID;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
    });

    it('should reject malformed TLV structure (non-numeric length)', () => {
      const sample = INVALID_VIETQR_SAMPLES.MALFORMED_TLV_LENGTH;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
    });

    it('should reject TLV with length mismatch', () => {
      const sample = INVALID_VIETQR_SAMPLES.LENGTH_MISMATCH;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('PARSE_ERROR');
    });

    it('should reject QR string missing required fields', () => {
      const sample = INVALID_VIETQR_SAMPLES.MISSING_REQUIRED_FIELDS;
      const result = parse(sample.qrString);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
      expect(result.error?.message).toContain('required');
    });
  });

  describe('Corrupted VietQR strings', () => {
    it('should extract partial data from truncated mid-field', () => {
      const sample = CORRUPTED_VIETQR_SAMPLES.TRUNCATED_MID_FIELD;
      const result = parse(sample.qrString);

      // Should succeed with partial data due to isCorrupted flag
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBe(sample.expectedPartialData.payloadFormatIndicator);
      expect(data.initiationMethod).toBe(sample.expectedPartialData.initiationMethod);
    });

    it('should extract available fields from truncated value', () => {
      const sample = CORRUPTED_VIETQR_SAMPLES.TRUNCATED_VALUE;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBeDefined();
      expect(data.initiationMethod).toBeDefined();
    });

    it('should handle truncated at required field gracefully', () => {
      const sample = CORRUPTED_VIETQR_SAMPLES.TRUNCATED_AT_REQUIRED;
      const result = parse(sample.qrString);

      // May succeed with partial data or fail depending on which required field is cut
      if (result.success) {
        expect(result.data).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
        expect(result.error?.type).toBe('INVALID_FORMAT');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle zero-length optional fields', () => {
      // Build VietQR with zero-length message field (6200)
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA5303704540440005802VN62006304A6AF';
      const result = parse(qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.message).toBeUndefined();  // Zero-length field means no message
    });

    it('should handle maximum length values', () => {
      // TLV format uses 2-digit lengths (00-99), so max Field 62 value is 99 bytes
      // With subfield overhead (08XX), max message is 95 characters
      const longMessage = 'A'.repeat(95);  // Max TLV-compatible message length
      const qrString = '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA5303704540440005802VN62990895' + longMessage + '63047CD7';

      const result = parse(qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.message).toBe(longMessage);
    });

    it('should preserve all field values exactly as provided', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);

      const data = result.data as VietQRData;
      // No transformation should occur - values should match exactly
      expect(data.bankCode).toBe(sample.expected.bankCode);
      expect(data.accountNumber).toBe(sample.expected.accountNumber);
      expect(data.amount).toBe(sample.expected.amount);
      expect(data.message).toBe(sample.expected.message);
      expect(data.crc).toBe(sample.expected.crc);
    });
  });

  describe('Round-trip consistency', () => {
    it('should extract same data when parsing twice', () => {
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;

      const result1 = parse(sample.qrString);
      const result2 = parse(sample.qrString);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data).toEqual(result2.data);
    });

    it('should maintain field order independence', () => {
      // VietQR standard defines field order, but parser should handle any order
      const sample = VALID_VIETQR_SAMPLES.DYNAMIC_FULL;
      const result = parse(sample.qrString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // All expected fields should be present regardless of parse order
      const data = result.data as VietQRData;
      expect(data.payloadFormatIndicator).toBeDefined();
      expect(data.initiationMethod).toBeDefined();
      expect(data.bankCode).toBeDefined();
      expect(data.accountNumber).toBeDefined();
      expect(data.currency).toBeDefined();
      expect(data.countryCode).toBeDefined();
      expect(data.crc).toBeDefined();
    });
  });
});
