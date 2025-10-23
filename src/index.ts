/**
 * VietQR - TypeScript library for generating EMVCo-compliant VietQR data strings
 *
 * This library provides utilities for generating QR code data strings that comply with
 * the NAPAS IBFT v1.5.2 specification for Vietnamese payment systems.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { generateVietQR } from 'vietqr-ts';
 *
 * // Generate static account QR
 * const result = generateVietQR({
 *   bankBin: '970403',
 *   accountNumber: '01234567',
 *   serviceCode: 'QRIBFTTA'
 * });
 *
 * console.log(result.rawData); // EMVCo-compliant QR data string
 * ```
 */

// Export main functions
export { generateVietQR } from './generators/vietqr';
export { generateQRImage } from './generators/qr-image';

// Export validation functions (Feature 004 - Input Validation)
export { validateVietQRConfig } from './validators';
export {
  validateBankBin,
  validateAccountNumberForGeneration,
  validateCardNumber,
  validateServiceCode,
  validateAmountForGeneration,
  validateBillNumberForGeneration,
  validatePurpose,
  validateReferenceLabel,
  validateMessageForGeneration,
  validateCountryCodeForGeneration,
  validateCurrencyCodeForGeneration,
  validateMerchantCategoryCodeForGeneration,
  ValidationContext,
  trimWhitespace,
  sanitizeForError
} from './validators';

// Export decoding functions
export { parse, parseWithOptions, type ParseOptions } from './parsers';
export { validate, validateWithOptions, type ValidationOptions, type CustomFieldLimits } from './validators';
export { decode, decodeAndValidate, isValidImageSize, detectImageFormat } from './decoders';
export type { ImageFormat } from './decoders';

// Export types
export type { ServiceCode, InitiationMethod } from './types';
export type { VietQRConfig } from './types/config';
export type { VietQRData, QRField } from './types/data';
export type {
  QRImageFormat,
  ErrorCorrectionLevel,
  QRColorOptions,
  QRImageConfig,
  QRImageResult,
} from './types/qr-image';
export {
  ValidationError,
  AggregateValidationError,
  QRGenerationError,
  ImageEncodingError,
} from './types/errors';

// Export utilities
export { calculateCRC, verifyCRC } from './utils/crc';
export { encodeField, encodeFieldWithDetails } from './utils/encoding';
export {
  NAPAS_GUID,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
  DEFAULT_MCC,
} from './utils/constants';

// Export decoding types
export type {
  VietQRData as ParsedVietQRData,
  ValidationResult,
  ValidationError as VietQRValidationError,
  ValidationWarning,
  DecodingError,
  ParseResult
} from './types/decode';
export {
  ValidationErrorCode,
  ValidationWarningCode,
  DecodingErrorType,
  isSuccessResult,
  isErrorResult,
  isDynamicQR,
  isStaticQR,
  MAX_IMAGE_SIZE,
  MAX_QR_STRING_LENGTH,
  FIELD_CONSTRAINTS,
  REQUIRED_VALUES
} from './types/decode';
