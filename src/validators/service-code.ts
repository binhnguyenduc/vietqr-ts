import { ValidationError } from '../types/errors';
import type { ServiceCode } from '../types';
import { sanitizeForError } from './validation-utils';

/**
 * Valid NAPAS service codes per IBFT v1.5.2 specification
 */
const VALID_SERVICE_CODES: readonly ServiceCode[] = ['QRIBFTTA', 'QRIBFTTC'] as const;

/**
 * Validate NAPAS service code
 *
 * Per NAPAS IBFT v1.5.2 specification, only two service codes are valid:
 * - QRIBFTTA: QR IBFT to Account (for bank account transfers)
 * - QRIBFTTC: QR IBFT to Card (for card-based transfers)
 *
 * Service codes are case-sensitive and must match exactly.
 *
 * @param serviceCode - Service code to validate
 * @throws {ValidationError} If serviceCode is not a valid NAPAS service code
 *
 * @example
 * ```typescript
 * validateServiceCode('QRIBFTTA'); // Valid - account transfer
 * validateServiceCode('QRIBFTTC'); // Valid - card transfer
 * validateServiceCode('qribftta'); // Throws - lowercase not allowed
 * validateServiceCode('INVALID');  // Throws - not a valid service code
 * ```
 */
export function validateServiceCode(serviceCode: unknown): asserts serviceCode is ServiceCode {
  // Type check
  if (typeof serviceCode !== 'string') {
    throw new ValidationError(
      'serviceCode',
      serviceCode,
      'type',
      'Service code must be a string'
    );
  }

  // Required check
  if (serviceCode.length === 0) {
    throw new ValidationError(
      'serviceCode',
      serviceCode,
      'required',
      'Service code is required',
      'MISSING_REQUIRED_FIELD',
      '"QRIBFTTA" or "QRIBFTTC"'
    );
  }

  // Valid code check
  if (!VALID_SERVICE_CODES.includes(serviceCode as ServiceCode)) {
    throw new ValidationError(
      'serviceCode',
      serviceCode,
      'enum',
      `Invalid service code. Expected: "QRIBFTTA" or "QRIBFTTC", Received: "${sanitizeForError(serviceCode, 20)}"`,
      'INVALID_SERVICE_CODE',
      '"QRIBFTTA" or "QRIBFTTC"'
    );
  }
}
