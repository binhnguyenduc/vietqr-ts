/**
 * VietQR Decoding and Validation Type Definitions
 *
 * This file contains TypeScript interface definitions for VietQR data parsing,
 * validation, and decoding operations based on NAPAS IBFT v1.5.2 specification.
 *
 * @module vietqr/decode
 * @version 1.0.0
 */

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Represents complete parsed payment information from a VietQR code
 *
 * @remarks
 * All fields follow NAPAS IBFT v1.5.2 specification constraints.
 * Optional fields are undefined when not present in the QR data.
 */
export interface VietQRData {
  // Payment Information
  /** Bank identifier - BIN (6 digits) or CITAD code (8 characters) */
  bankCode: string;

  /** Bank account or card number (max 19 digits) */
  accountNumber: string;

  /** Transaction amount in VND (optional for static QR, required for dynamic) */
  amount?: string;

  /** ISO 4217 currency code - must be "704" (VND) */
  currency: string;

  // Additional Payment Data
  /** Payment description/memo (max 500 characters, UTF-8) */
  message?: string;

  /** Transaction purpose code (max 25 characters) */
  purposeCode?: string;

  /** Bill or invoice reference number (max 25 characters) */
  billNumber?: string;

  // QR Metadata
  /** QR code type: static ('11') or dynamic ('12') */
  initiationMethod: 'static' | 'dynamic';

  /** Merchant category code (4 digits) */
  merchantCategory?: string;

  /** ISO 3166-1 alpha-2 country code - must be "VN" */
  countryCode: string;

  // Technical Fields
  /** EMV QR format version - must be "01" */
  payloadFormatIndicator: string;

  /** CRC-16-CCITT checksum (4 hexadecimal characters) */
  crc: string;
}

/**
 * Result of validating VietQR data against NAPAS IBFT v1.5.2 specification
 *
 * @remarks
 * - isValid is true only when errors array is empty
 * - isCorrupted indicates data truncation or checksum mismatch
 * - Can have both isValid=false AND isCorrupted=true
 */
export interface ValidationResult {
  /** Overall validation status (true if all checks pass) */
  isValid: boolean;

  /** Data corruption flag (truncated or checksum mismatch) */
  isCorrupted: boolean;

  /** Array of validation errors (empty if valid) */
  errors: ValidationError[];

  /** Non-critical issues (e.g., deprecated fields, unusual patterns) */
  warnings?: ValidationWarning[];
}

/**
 * Specific validation failure with detailed context
 *
 * @remarks
 * actualValue field is sanitized to prevent sensitive data exposure:
 * - Account numbers: "[REDACTED]"
 * - Amounts: Shown (not sensitive per NAPAS)
 * - Messages: Truncated if >100 chars
 */
export interface ValidationError {
  /** Name of field that failed validation */
  field: string;

  /** Machine-readable error code */
  code: ValidationErrorCode;

  /** Human-readable error description */
  message: string;

  /** Expected format or constraint */
  expectedFormat?: string;

  /** Actual value received (sanitized for security) */
  actualValue?: string;
}

/**
 * Non-critical validation issue
 *
 * @remarks
 * Warnings inform developers of deprecated fields, unusual patterns,
 * or data quality issues that don't prevent processing.
 */
export interface ValidationWarning {
  /** Name of field with warning */
  field: string;

  /** Machine-readable warning code */
  code: ValidationWarningCode;

  /** Human-readable warning description */
  message: string;
}

/**
 * Error during QR string parsing or image decoding
 *
 * @remarks
 * Provides actionable error information when decode/parse operations fail.
 * Position field helps pinpoint exact location of parsing errors.
 */
export interface DecodingError {
  /** Category of decoding error */
  type: DecodingErrorType;

  /** Human-readable error description */
  message: string;

  /** Field where parsing error occurred */
  field?: string;

  /** Character position in string where error occurred */
  position?: number;
}

/**
 * Generic result wrapper for parse/decode operations
 *
 * @typeParam T - Type of successful result data (VietQRData or ValidationResult)
 *
 * @remarks
 * Invariants:
 * - If success = true: data is defined, error is undefined
 * - If success = false: error is defined, data is undefined
 */
export interface ParseResult<T> {
  /** Operation success status */
  success: boolean;

  /** Result data (present if success = true) */
  data?: T;

  /** Error details (present if success = false) */
  error?: DecodingError;
}

// ============================================================================
// Enumerations
// ============================================================================

/**
 * Machine-readable validation error codes
 */
export enum ValidationErrorCode {
  /** Required field not present */
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  /** Field value doesn't match expected format */
  INVALID_FORMAT = 'INVALID_FORMAT',

  /** Field value exceeds maximum length */
  LENGTH_EXCEEDED = 'LENGTH_EXCEEDED',

  /** Field value below minimum length */
  LENGTH_TOO_SHORT = 'LENGTH_TOO_SHORT',

  /** Field contains illegal characters */
  INVALID_CHARACTER = 'INVALID_CHARACTER',

  /** CRC verification failed */
  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH',

  /** Currency code is not VND (704) */
  INVALID_CURRENCY = 'INVALID_CURRENCY',

  /** Country code is not VN */
  INVALID_COUNTRY = 'INVALID_COUNTRY',

  /** Amount is negative or zero */
  INVALID_AMOUNT = 'INVALID_AMOUNT',

  /** Unrecognized EMV QR field ID */
  UNKNOWN_FIELD = 'UNKNOWN_FIELD'
}

/**
 * Machine-readable validation warning codes
 */
export enum ValidationWarningCode {
  /** Data appears truncated but usable */
  PARTIAL_DATA = 'PARTIAL_DATA',

  /** Field is deprecated in newer spec versions */
  DEPRECATED_FIELD = 'DEPRECATED_FIELD',

  /** Data pattern is valid but unusual */
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',

  /** Recommended optional field is missing */
  MISSING_OPTIONAL_FIELD = 'MISSING_OPTIONAL_FIELD'
}

/**
 * Categories of decoding errors
 */
export enum DecodingErrorType {
  /** Failed to parse EMV QR TLV structure */
  PARSE_ERROR = 'PARSE_ERROR',

  /** QR string doesn't match EMV QR format */
  INVALID_FORMAT = 'INVALID_FORMAT',

  /** Failed to decode QR code from image */
  IMAGE_DECODE_ERROR = 'IMAGE_DECODE_ERROR',

  /** Image size exceeds 2MB limit */
  SIZE_LIMIT_EXCEEDED = 'SIZE_LIMIT_EXCEEDED',

  /** Image format not supported (only PNG/JPEG) */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',

  /** Image contains multiple QR codes (ambiguous) */
  MULTIPLE_QR_CODES = 'MULTIPLE_QR_CODES',

  /** No QR code detected in image */
  NO_QR_CODE_FOUND = 'NO_QR_CODE_FOUND'
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if ParseResult is successful
 *
 * @param result - ParseResult to check
 * @returns true if result.success is true and data is defined
 */
export function isSuccessResult<T>(result: ParseResult<T>): result is { success: true; data: T; error: undefined } {
  return result.success === true && result.data !== undefined;
}

/**
 * Type guard to check if ParseResult is an error
 *
 * @param result - ParseResult to check
 * @returns true if result.success is false and error is defined
 */
export function isErrorResult<T>(result: ParseResult<T>): result is { success: false; data: undefined; error: DecodingError } {
  return result.success === false && result.error !== undefined;
}

/**
 * Type guard to check if VietQRData represents a dynamic QR code
 *
 * @param data - VietQRData to check
 * @returns true if initiationMethod is 'dynamic'
 */
export function isDynamicQR(data: VietQRData): boolean {
  return data.initiationMethod === 'dynamic';
}

/**
 * Type guard to check if VietQRData represents a static QR code
 *
 * @param data - VietQRData to check
 * @returns true if initiationMethod is 'static'
 */
export function isStaticQR(data: VietQRData): boolean {
  return data.initiationMethod === 'static';
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum image file size in bytes (2MB)
 */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Maximum QR string length (typical QR codes are <4KB)
 */
export const MAX_QR_STRING_LENGTH = 4096;

/**
 * Field length constraints per NAPAS IBFT v1.5.2
 */
export const FIELD_CONSTRAINTS = {
  BANK_CODE_BIN_LENGTH: 6,
  BANK_CODE_CITAD_LENGTH: 8,
  ACCOUNT_NUMBER_MAX: 19,
  AMOUNT_MAX: 13,
  CURRENCY_LENGTH: 3,
  MESSAGE_MAX: 500,
  PURPOSE_CODE_MAX: 25,
  BILL_NUMBER_MAX: 25,
  COUNTRY_CODE_LENGTH: 2,
  MERCHANT_CATEGORY_LENGTH: 4,
  CRC_LENGTH: 4
} as const;

/**
 * Required constant values per NAPAS IBFT v1.5.2
 */
export const REQUIRED_VALUES = {
  CURRENCY_VND: '704',
  COUNTRY_CODE_VN: 'VN',
  PAYLOAD_FORMAT_INDICATOR: '01',
  INITIATION_STATIC: '11',
  INITIATION_DYNAMIC: '12'
} as const;
