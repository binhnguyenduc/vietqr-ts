import type { ServiceCode, InitiationMethod } from './index';

/**
 * Configuration for VietQR generation
 */
export interface VietQRConfig {
  /**
   * Bank Identification Number (6 digits)
   * @example "970403"
   */
  bankBin: string;

  /**
   * Account number for account transfer (max 19 alphanumeric)
   * Required when serviceCode is "QRIBFTTA"
   * Mutually exclusive with cardNumber
   * @example "01234567"
   */
  accountNumber?: string;

  /**
   * Card number for card transfer (max 19 alphanumeric)
   * Required when serviceCode is "QRIBFTTC"
   * Mutually exclusive with accountNumber
   * @example "1234567"
   */
  cardNumber?: string;

  /**
   * Service code identifying transfer type
   * - QRIBFTTA: Account transfer
   * - QRIBFTTC: Card transfer
   */
  serviceCode: ServiceCode;

  /**
   * Initiation method
   * - "11": Static QR (user enters amount)
   * - "12": Dynamic QR (amount pre-filled)
   */
  initiationMethod: InitiationMethod;

  /**
   * Transaction amount (max 13 characters, numeric with optional decimal)
   * Required when initiationMethod is "12"
   * @example "180000" or "180000.50"
   */
  amount?: string;

  /**
   * Transaction currency code (ISO 4217 numeric)
   * @default "704" (Vietnamese Dong)
   */
  currency?: string;

  /**
   * Country code (ISO 3166-1 alpha-2)
   * @default "VN"
   */
  country?: string;

  /**
   * Bill number or invoice number (max 25 characters)
   * @example "NPS6869"
   */
  billNumber?: string;

  /**
   * Reference label for merchant use (max 25 characters)
   * @example "ORDER123"
   */
  referenceLabel?: string;

  /**
   * Purpose or description of transaction (max 25 characters)
   * @example "thanh toan don hang"
   */
  purpose?: string;
}
