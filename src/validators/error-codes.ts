/**
 * Validation error codes for VietQR input validation
 *
 * These codes provide machine-readable error identification for programmatic handling.
 * Each code represents a specific validation failure condition per NAPAS IBFT v1.5.2.
 *
 * @example
 * ```typescript
 * if (error.code === 'INVALID_BANK_BIN_LENGTH') {
 *   console.error('Bank BIN must be exactly 6 digits');
 * }
 * ```
 */
export type ValidationErrorCode =
  /**
   * Required field is undefined, null, or empty after trimming whitespace
   * @category Required Fields
   * @see {@link validateBankBin}, {@link validateServiceCode}, {@link validateAccountNumber}
   */
  | 'MISSING_REQUIRED_FIELD'

  /**
   * Bank BIN (Bank Identification Number) format or length error (general)
   * @category Bank Validation
   * @napas NAPAS IBFT v1.5.2 - Bank BIN must be exactly 6 numeric digits
   */
  | 'INVALID_BANK_BIN'

  /**
   * Bank BIN contains non-numeric characters (only ASCII digits 0-9 allowed)
   * @category Bank Validation
   * @example Rejected: "970A03", "97０4０3" (Unicode digits), "970-403"
   */
  | 'INVALID_BANK_BIN_FORMAT'

  /**
   * Bank BIN is not exactly 6 digits (must be 6 characters, no more, no less)
   * @category Bank Validation
   * @example Rejected: "97040" (5 digits), "9704033" (7 digits)
   */
  | 'INVALID_BANK_BIN_LENGTH'

  /**
   * Account number validation error (general)
   * @category Account/Card Validation
   */
  | 'INVALID_ACCOUNT_NUMBER'

  /**
   * Account number exceeds maximum length of 19 characters
   * @category Account/Card Validation
   * @napas NAPAS IBFT v1.5.2 - Maximum 19 alphanumeric characters
   */
  | 'ACCOUNT_NUMBER_TOO_LONG'

  /**
   * Account number contains non-alphanumeric characters (only A-Z, a-z, 0-9 allowed)
   * @category Account/Card Validation
   * @example Rejected: "0123-4567", "账号123", "ACC 123"
   */
  | 'INVALID_ACCOUNT_CHARACTERS'

  /**
   * Card number validation error (general)
   * @category Account/Card Validation
   */
  | 'INVALID_CARD_NUMBER'

  /**
   * Card number exceeds maximum length of 19 characters
   * @category Account/Card Validation
   * @napas NAPAS IBFT v1.5.2 - Maximum 19 alphanumeric characters
   */
  | 'CARD_NUMBER_TOO_LONG'

  /**
   * Card number contains non-alphanumeric characters (only A-Z, a-z, 0-9 allowed)
   * @category Account/Card Validation
   * @example Rejected: "9704-0311-0123-4567", "卡号123"
   */
  | 'INVALID_CARD_CHARACTERS'

  /**
   * Service code must be either "QRIBFTTA" (account transfer) or "QRIBFTTC" (card transfer)
   * @category Service Code
   * @napas NAPAS IBFT v1.5.2 - Only two service codes supported
   */
  | 'INVALID_SERVICE_CODE'

  /**
   * Amount contains non-numeric characters or invalid decimal format
   * @category Amount Validation
   * @example Rejected: "180,000" (comma), "180.000.00" (multiple decimals), "abc"
   */
  | 'INVALID_AMOUNT_FORMAT'

  /**
   * Amount must be a positive number (> 0), zero and negative values not allowed
   * @category Amount Validation
   * @example Rejected: "0", "-100", "-0.01"
   */
  | 'INVALID_AMOUNT_VALUE'

  /**
   * Amount exceeds maximum length of 13 characters (including decimal point)
   * @category Amount Validation
   * @napas NAPAS IBFT v1.5.2 - Maximum 13 characters
   */
  | 'AMOUNT_TOO_LONG'

  /**
   * Dynamic QR codes (initiation method "12") require a valid positive amount
   * @category Amount Validation
   * @see {@link validateAmount}
   */
  | 'INVALID_DYNAMIC_AMOUNT'

  /**
   * Currency code must be "704" (Vietnamese Dong - VND)
   * @category Currency/Country
   * @napas NAPAS IBFT v1.5.2 - Only VND supported
   */
  | 'INVALID_CURRENCY_CODE'

  /**
   * Country code must be "VN" (Vietnam)
   * @category Currency/Country
   * @napas NAPAS IBFT v1.5.2 - Only Vietnam supported
   */
  | 'INVALID_COUNTRY_CODE'

  /**
   * Merchant category code validation error (general)
   * @category Merchant
   */
  | 'INVALID_MCC_CODE'

  /**
   * Merchant category code must be exactly 4 numeric digits
   * @category Merchant
   * @example Valid: "5411", "7011". Invalid: "541", "54110"
   */
  | 'INVALID_MCC_LENGTH'

  /**
   * Merchant category code must contain only numeric characters
   * @category Merchant
   * @example Rejected: "54A1", "零零零零" (Unicode), "54-11"
   */
  | 'INVALID_MCC_FORMAT'

  /**
   * Message exceeds maximum length of 500 characters
   * @category Additional Data
   * @napas NAPAS IBFT v1.5.2 - Field 08 maximum 500 characters
   */
  | 'MESSAGE_TOO_LONG'

  /**
   * Bill number exceeds maximum length of 25 characters
   * @category Additional Data
   * @napas NAPAS IBFT v1.5.2 - Field 01 maximum 25 characters
   */
  | 'BILL_NUMBER_TOO_LONG'

  /**
   * Bill number contains characters other than alphanumeric, hyphen, or underscore
   * @category Additional Data
   * @example Valid: "NPS-6869", "INV_123". Invalid: "INV@123", "BILL 001"
   */
  | 'INVALID_BILL_CHARACTERS'

  /**
   * Purpose exceeds maximum length of 25 characters
   * @category Additional Data
   * @napas NAPAS IBFT v1.5.2 - Field 08 maximum 25 characters
   */
  | 'PURPOSE_TOO_LONG'

  /**
   * Reference label exceeds maximum length of 25 characters
   * @category Additional Data
   * @napas NAPAS IBFT v1.5.2 - Field 05 maximum 25 characters
   */
  | 'REFERENCE_LABEL_TOO_LONG'

  /**
   * Reference label contains non-alphanumeric characters (only A-Z, a-z, 0-9 allowed)
   * @category Additional Data
   * @example Valid: "REF123". Invalid: "REF-123", "参考123"
   */
  | 'INVALID_REFERENCE_CHARACTERS'

  /**
   * Either accountNumber or cardNumber must be provided (but not both)
   * @category Cross-Field Validation
   * @see {@link validateVietQRConfig}
   */
  | 'MISSING_ACCOUNT_OR_CARD'

  /**
   * Cannot provide both accountNumber and cardNumber (mutually exclusive)
   * @category Cross-Field Validation
   * @see {@link validateVietQRConfig}
   */
  | 'BOTH_ACCOUNT_AND_CARD'

  /**
   * Service code "QRIBFTTA" (account transfer) requires accountNumber to be provided
   * @category Cross-Field Validation
   * @napas NAPAS IBFT v1.5.2 - Service code determines required fields
   */
  | 'ACCOUNT_REQUIRED_FOR_QRIBFTTA'

  /**
   * Service code "QRIBFTTC" (card transfer) requires cardNumber to be provided
   * @category Cross-Field Validation
   * @napas NAPAS IBFT v1.5.2 - Service code determines required fields
   */
  | 'CARD_REQUIRED_FOR_QRIBFTTC';

/**
 * Human-readable descriptions for each validation error code
 *
 * Used for documentation generation and error message construction.
 */
export const ERROR_CODE_DESCRIPTIONS: Record<ValidationErrorCode, string> = {
  MISSING_REQUIRED_FIELD: 'Required field is undefined, null, or empty',
  INVALID_BANK_BIN: 'Bank BIN format or length error',
  INVALID_BANK_BIN_FORMAT: 'Bank BIN contains non-numeric characters',
  INVALID_BANK_BIN_LENGTH: 'Bank BIN is not exactly 6 digits',
  INVALID_ACCOUNT_NUMBER: 'Account number validation error',
  ACCOUNT_NUMBER_TOO_LONG: 'Account number exceeds 19 characters',
  INVALID_ACCOUNT_CHARACTERS: 'Account number contains non-alphanumeric characters',
  INVALID_CARD_NUMBER: 'Card number validation error',
  CARD_NUMBER_TOO_LONG: 'Card number exceeds 19 characters',
  INVALID_CARD_CHARACTERS: 'Card number contains non-alphanumeric characters',
  INVALID_SERVICE_CODE: 'Service code must be QRIBFTTA or QRIBFTTC',
  INVALID_AMOUNT_FORMAT: 'Amount contains non-numeric characters',
  INVALID_AMOUNT_VALUE: 'Amount must be a positive number',
  AMOUNT_TOO_LONG: 'Amount exceeds 13 characters',
  INVALID_DYNAMIC_AMOUNT: 'Dynamic QR requires valid positive amount',
  INVALID_CURRENCY_CODE: 'Currency code must be 704 (VND)',
  INVALID_COUNTRY_CODE: 'Country code must be VN (Vietnam)',
  INVALID_MCC_CODE: 'Merchant category code validation error',
  INVALID_MCC_LENGTH: 'Merchant category code must be exactly 4 digits',
  INVALID_MCC_FORMAT: 'Merchant category code must be numeric',
  MESSAGE_TOO_LONG: 'Message exceeds 500 characters',
  BILL_NUMBER_TOO_LONG: 'Bill number exceeds 25 characters',
  INVALID_BILL_CHARACTERS: 'Bill number contains non-alphanumeric characters',
  PURPOSE_TOO_LONG: 'Purpose exceeds 25 characters',
  REFERENCE_LABEL_TOO_LONG: 'Reference label exceeds 25 characters',
  INVALID_REFERENCE_CHARACTERS: 'Reference label contains non-alphanumeric characters',
  MISSING_ACCOUNT_OR_CARD: 'Either accountNumber or cardNumber must be provided',
  BOTH_ACCOUNT_AND_CARD: 'Cannot provide both accountNumber and cardNumber',
  ACCOUNT_REQUIRED_FOR_QRIBFTTA: 'QRIBFTTA service code requires accountNumber',
  CARD_REQUIRED_FOR_QRIBFTTC: 'QRIBFTTC service code requires cardNumber',
};
