import { encodeField } from '../utils/encoding';

/**
 * Build Additional Data field (ID 62) for dynamic QR codes
 *
 * Per NAPAS IBFT v1.5.2 specification:
 * - Field 62 contains nested subfields for bill number and purpose
 * - Subfield 01: Bill number (max 25 chars, alphanumeric)
 * - Subfield 08: Purpose/description (max 25 chars, any characters)
 *
 * Format: "62" + Length + (Subfield 01 + Subfield 08)
 *
 * @param billNumber - Bill/invoice number (optional)
 * @param purpose - Transaction purpose/description (optional)
 * @returns Complete Field 62 in EMVCo ID/Length/Value format
 *
 * @example
 * ```typescript
 * // NAPAS reference example
 * buildAdditionalData('NPS6869', 'thanh toan don hang');
 * // Returns: "62340107NPS68690819thanh toan don hang"
 * // Breakdown:
 * //   62 = Field ID
 * //   34 = Total length of subfields
 * //   0107NPS6869 = Subfield 01 (bill number)
 * //   0819thanh toan don hang = Subfield 08 (purpose)
 * ```
 */
export function buildAdditionalData(billNumber?: string, purpose?: string): string {
  // Build subfields
  let subfields = '';

  // Subfield 01: Bill number
  if (billNumber && billNumber.trim().length > 0) {
    subfields += encodeField('01', billNumber.trim());
  }

  // Subfield 08: Purpose/description
  if (purpose && purpose.trim().length > 0) {
    subfields += encodeField('08', purpose.trim());
  }

  // If no subfields, return empty string
  if (subfields.length === 0) {
    return '';
  }

  // Build Field 62 with total length of all subfields
  return encodeField('62', subfields);
}
