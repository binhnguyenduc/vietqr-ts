/**
 * Service code identifying transfer destination type
 */
export type ServiceCode = 'QRIBFTTA' | 'QRIBFTTC';

/**
 * Point of initiation method
 * - "11": Static QR (user enters amount manually)
 * - "12": Dynamic QR (amount pre-filled in QR)
 */
export type InitiationMethod = '11' | '12';

export * from './config';
export * from './data';
export * from './errors';
export * from './qr-image';

// Export validation error codes for input validation (Feature 004)
export { type ValidationErrorCode } from '../validators/error-codes.js';
