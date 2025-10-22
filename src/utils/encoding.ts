import type { QRField } from '../types/data';

/**
 * Encode EMVCo field using ID/Length/Value format
 *
 * @param id - 2-digit field identifier
 * @param value - Field value
 * @returns Encoded field string (empty if value is empty)
 *
 * @example
 * ```typescript
 * const encoded = encodeField('00', '01');
 * console.log(encoded); // "000201"
 * ```
 *
 * @internal
 */
export function encodeField(id: string, value: string): string {
  if (!value) {
    return '';
  }

  const length = value.length.toString().padStart(2, '0');
  const encoded = `${id}${length}${value}`;

  return encoded;
}

/**
 * Encode EMVCo field and return detailed field object
 *
 * @param id - 2-digit field identifier
 * @param value - Field value
 * @returns QRField object with id, length, value, and encoded string
 *
 * @internal
 */
export function encodeFieldWithDetails(id: string, value: string): QRField | null {
  if (!value) {
    return null;
  }

  const length = value.length.toString().padStart(2, '0');
  const encoded = `${id}${length}${value}`;

  return {
    id,
    length,
    value,
    encoded,
  };
}
