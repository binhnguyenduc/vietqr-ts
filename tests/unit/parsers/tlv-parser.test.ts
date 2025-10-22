/**
 * Unit tests for EMV QR TLV (Tag-Length-Value) parser
 *
 * @module tests/unit/parsers/tlv-parser
 */

import { describe, it, expect } from 'vitest';
import { parseTLV, TLVField } from '../../../src/parsers/tlv-parser';

describe('TLV Parser', () => {
  describe('parseTLV - Valid TLV structures', () => {
    it('should parse single TLV field', () => {
      // Field ID: 00, Length: 02, Value: 01
      const input = '000201';
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0]).toEqual({
        id: '00',
        length: 2,
        value: '01'
      });
    });

    it('should parse multiple TLV fields', () => {
      // Field 00 (length 2): "01", Field 01 (length 2): "12"
      const input = '000201010212';
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields).toHaveLength(2);
      expect(result.fields[0].id).toBe('00');
      expect(result.fields[0].value).toBe('01');
      expect(result.fields[1].id).toBe('01');
      expect(result.fields[1].value).toBe('12');
    });

    it('should parse nested TLV structures', () => {
      // Merchant account field (ID 38) containing sub-fields
      const input = '38600010A00000072701270006970422011215012345678902080208QRIBFTTA';
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0].id).toBe('38');
      expect(result.fields[0].length).toBe(60);
      expect(result.fields[0].value).toBe('0010A00000072701270006970422011215012345678902080208QRIBFTTA');
    });

    it('should handle zero-length fields', () => {
      const input = '6500';  // Field 65, length 00
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields[0].length).toBe(0);
      expect(result.fields[0].value).toBe('');
    });
  });

  describe('parseTLV - Invalid TLV structures', () => {
    it('should fail on malformed field ID (non-numeric)', () => {
      const input = 'XX0201';
      const result = parseTLV(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVALID_FORMAT');
    });

    it('should fail on malformed length (non-numeric)', () => {
      const input = '00XX01';
      const result = parseTLV(input);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('INVALID_FORMAT');
    });

    it('should fail when value length doesn\'t match declared length', () => {
      // Declares length 10 but only provides 2 characters
      const input = '001001';
      const result = parseTLV(input);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('PARSE_ERROR');
    });

    it('should fail on incomplete field (missing value)', () => {
      const input = '0002';  // ID and length but no value
      const result = parseTLV(input);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('PARSE_ERROR');
    });
  });

  describe('parseTLV - Truncated/corrupted data', () => {
    it('should extract partial fields from truncated data', () => {
      // Valid field followed by incomplete field
      const input = '0002010102';  // First field complete, second field incomplete
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields).toHaveLength(1);  // Only first field extracted
      expect(result.isCorrupted).toBe(true);
      expect(result.fields[0].value).toBe('01');
    });

    it('should flag corruption when field is cut mid-value', () => {
      const input = '00050123';  // Declares length 5 but only has 3 chars
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.isCorrupted).toBe(true);
      expect(result.fields).toHaveLength(0);  // Cannot extract incomplete field
    });

    it('should handle empty string as corrupted', () => {
      const input = '';
      const result = parseTLV(input);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('INVALID_FORMAT');
    });
  });

  describe('parseTLV - Edge cases', () => {
    it('should handle maximum length value (99 characters)', () => {
      const input = '5099' + 'A'.repeat(99);
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields[0].length).toBe(99);
      expect(result.fields[0].value).toBe('A'.repeat(99));
    });

    it('should parse field with numeric-only value', () => {
      const input = '5303704';  // Currency code "704"
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields[0].value).toBe('704');
    });

    it('should parse field with alphanumeric value', () => {
      const input = '5802VN';  // Country code "VN"
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields[0].value).toBe('VN');
    });

    it('should handle special characters in UTF-8 values', () => {
      const messageBytes = Buffer.from('Thanh toán', 'utf-8');
      const length = messageBytes.length.toString().padStart(2, '0');
      const input = '62' + length + '08' + length + 'Thanh toán';  // UTF-8 message in additional data field
      const result = parseTLV(input);

      expect(result.success).toBe(true);
      expect(result.fields.length).toBeGreaterThan(0);
    });
  });
});
