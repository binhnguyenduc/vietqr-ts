/**
 * Test fixtures for VietQR decoding tests
 *
 * Contains valid, invalid, and corrupted VietQR strings for comprehensive testing
 */

import type { VietQRData } from '../../src/types/decode';

/**
 * Valid VietQR string samples
 */
export const VALID_VIETQR_SAMPLES = {
  /**
   * Dynamic QR with all fields (bank code, account, amount, message)
   */
  DYNAMIC_FULL: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405500005802VN62160812Test Payment630495B6',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'dynamic' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      amount: '50000',
      currency: '704',
      countryCode: 'VN',
      message: 'Test Payment',
      crc: '95B6'
    }
  },

  /**
   * Static QR without amount (customer enters amount)
   */
  STATIC_NO_AMOUNT: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      currency: '704',
      countryCode: 'VN',
      amount: undefined,
      crc: 'A3CF'
    }
  },

  /**
   * Dynamic QR with optional fields (purpose code, bill number)
   */
  DYNAMIC_WITH_OPTIONALS: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405100005802VN62350809Test Memo0706PAYBIL0908INV-20246304074A',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'dynamic' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      amount: '10000',
      currency: '704',
      countryCode: 'VN',
      message: 'Test Memo',
      purposeCode: 'PAYBIL',
      billNumber: 'INV-2024',
      crc: '074A'
    }
  },

  /**
   * Minimum valid VietQR (required fields only)
   */
  MINIMUM_VALID: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      currency: '704',
      countryCode: 'VN',
      crc: 'A3CF'
    }
  },

  /**
   * Minimal required fields only
   */
  MINIMAL_REQUIRED: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304A3CF',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      currency: '704',
      countryCode: 'VN',
      crc: 'A3CF'
    }
  },

  /**
   * VietQR with purpose code and bill number
   */
  WITH_PURPOSE_AND_BILL: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405100005802VN62230707PAYBILL0908INV-202463048C15',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'dynamic' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      amount: '10000',
      currency: '704',
      countryCode: 'VN',
      purposeCode: 'PAYBILL',
      billNumber: 'INV-2024',
      crc: '8C15'
    }
  },

  /**
   * VietQR with UTF-8 Vietnamese message
   */
  WITH_UTF8_MESSAGE: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA53037045405100005802VN62260822Thanh toán hóa đơn630432F8',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'dynamic' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      amount: '10000',
      currency: '704',
      countryCode: 'VN',
      message: 'Thanh toán hóa đơn',
      crc: '32F8'
    }
  },

  /**
   * VietQR with merchant category code
   */
  WITH_MERCHANT_CATEGORY: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA5204581253037045802VN630477A7',
    expected: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      currency: '704',
      countryCode: 'VN',
      merchantCategory: '5812',
      crc: '77A7'
    }
  }
};

/**
 * Invalid VietQR string samples (malformed format, missing required fields)
 */
export const INVALID_VIETQR_SAMPLES = {
  /**
   * Empty string
   */
  EMPTY_STRING: {
    qrString: '',
    expectedError: 'empty'
  },

  /**
   * String exceeding maximum length
   */
  EXCEEDS_MAX_LENGTH: {
    qrString: 'A'.repeat(600),
    expectedError: 'maximum length'
  },

  /**
   * Malformed TLV structure - non-numeric ID
   */
  MALFORMED_TLV_ID: {
    qrString: 'XX0201',
    expectedError: 'INVALID_FORMAT'
  },

  /**
   * Malformed TLV structure - non-numeric length
   */
  MALFORMED_TLV_LENGTH: {
    qrString: '00XX01',
    expectedError: 'INVALID_FORMAT'
  },

  /**
   * TLV length mismatch
   */
  LENGTH_MISMATCH: {
    qrString: '001001',  // Declares length 10 but only provides 2 characters
    expectedError: 'PARSE_ERROR'
  },

  /**
   * Missing required fields
   */
  MISSING_REQUIRED_FIELDS: {
    qrString: '0002016304XXXX',  // Missing all merchant and payment fields
    expectedError: 'required'
  },

  /**
   * Missing required field (no bank code)
   */
  MISSING_BANK_CODE: {
    qrString: '00020101021153037045405500005802VN6304XXXX',
    expectedError: 'MISSING_REQUIRED_FIELD',
    expectedField: 'bankCode'
  },

  /**
   * Invalid CRC checksum
   */
  INVALID_CRC: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN63040000',
    expectedError: 'CHECKSUM_MISMATCH',
    expectedField: 'crc'
  },

  /**
   * Invalid currency (not VND/704)
   */
  INVALID_CURRENCY: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53038405802VN6304XXXX',
    expectedError: 'INVALID_CURRENCY',
    expectedField: 'currency'
  },

  /**
   * Invalid country code (not VN)
   */
  INVALID_COUNTRY: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802US6304XXXX',
    expectedError: 'INVALID_COUNTRY',
    expectedField: 'countryCode'
  },

  /**
   * Field length exceeds maximum (message > 500 chars)
   */
  FIELD_TOO_LONG: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA530370454055000058VN6253' + '08'.repeat(251) + 'A'.repeat(501) + '6304XXXX',
    expectedError: 'LENGTH_EXCEEDED',
    expectedField: 'message'
  },

  /**
   * Invalid EMV QR format (wrong payload format indicator)
   */
  INVALID_FORMAT: {
    qrString: '00029901021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN6304XXXX',
    expectedError: 'INVALID_FORMAT',
    expectedField: 'payloadFormatIndicator'
  },

  /**
   * Account number with non-numeric characters
   */
  INVALID_ACCOUNT_FORMAT: {
    qrString: '00020101021138600010A00000072701270006970422011215ABC45678902080208QRIBFTTA53037045802VN6304XXXX',
    expectedError: 'INVALID_FORMAT',
    expectedField: 'accountNumber'
  }
};

/**
 * Corrupted/truncated VietQR string samples
 */
export const CORRUPTED_VIETQR_SAMPLES = {
  /**
   * Truncated mid-field (incomplete TLV structure)
   */
  TRUNCATED_MID_FIELD: {
    qrString: '00020101021138600010A00000072701270006970422011215012345',
    expectedPartialData: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const
    },
    isCorrupted: true
  },

  /**
   * Truncated value field
   */
  TRUNCATED_VALUE: {
    qrString: '00020101021138600010A00000072701270006970422011215',
    expectedPartialData: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const
    },
    isCorrupted: true
  },

  /**
   * Truncated at required field
   */
  TRUNCATED_AT_REQUIRED: {
    qrString: '0002010102113860001',
    expectedPartialData: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const
    },
    isCorrupted: true
  },

  /**
   * Missing CRC field entirely
   */
  MISSING_CRC: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN',
    expectedPartialData: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020',
      currency: '704',
      countryCode: 'VN'
    },
    isCorrupted: true
  },

  /**
   * Truncated after required fields (but has some valid data)
   */
  TRUNCATED_AFTER_BANK: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA5303',
    expectedPartialData: {
      payloadFormatIndicator: '01',
      initiationMethod: 'static' as const,
      bankCode: '970422',
      accountNumber: '0123456789020'
    },
    isCorrupted: true
  }
};

/**
 * Edge case VietQR samples
 */
export const EDGE_CASE_SAMPLES = {
  /**
   * Maximum length message (500 characters)
   */
  MAX_LENGTH_MESSAGE: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN62510850' + 'A'.repeat(500) + '6304XXXX',
    expectedMessage: 'A'.repeat(500)
  },

  /**
   * Special characters in message (UTF-8)
   */
  UTF8_MESSAGE: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA53037045802VN62250821Thanh toán hóa đơn6304XXXX',
    expectedMessage: 'Thanh toán hóa đơn'
  },

  /**
   * Zero amount (should be rejected for dynamic QR)
   */
  ZERO_AMOUNT_DYNAMIC: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA530370454010005802VN6304XXXX',
    expectedError: 'INVALID_AMOUNT',
    expectedField: 'amount'
  },

  /**
   * Very large amount (near maximum)
   */
  LARGE_AMOUNT: {
    qrString: '00020101021238570010A00000072701390006970422011301234567890200208QRIBFTTA5303704541399999999990005802VN6304XXXX',
    expectedAmount: '999999999900'
  },

  /**
   * Merchant category code included
   */
  WITH_MERCHANT_CATEGORY: {
    qrString: '00020101021138570010A00000072701390006970422011301234567890200208QRIBFTTA520458125303704545055000058VN6304XXXX',
    expectedMerchantCategory: '5812'  // Restaurant
  }
};

/**
 * Helper function to generate a complete VietQR data object for testing
 */
export function createMockVietQRData(overrides?: Partial<VietQRData>): VietQRData {
  return {
    payloadFormatIndicator: '01',
    initiationMethod: 'dynamic',
    bankCode: '970422',
    accountNumber: '0123456789',
    amount: '50000',
    currency: '704',
    countryCode: 'VN',
    message: 'Test payment',
    crc: 'ABCD',  // Valid hex format (actual checksum not verified when qrString is empty)
    ...overrides
  };
}
