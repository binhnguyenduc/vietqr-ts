import { encodeField } from '../utils/encoding';
import { NAPAS_GUID } from '../utils/constants';
import type { ServiceCode } from '../types';

/**
 * Build Consumer Account Information field (ID 38)
 *
 * Per NAPAS IBFT v1.5.2 specification, this field contains:
 * - Sub-field 00: NAPAS GUID (A000000727)
 * - Sub-field 01: Payment provider information
 *   - Sub-sub-field 00: Bank BIN (6 digits)
 *   - Sub-sub-field 01: Account number or card number (max 19 chars)
 * - Sub-field 02: Service code (QRIBFTTA or QRIBFTTC)
 *
 * Structure: ID 38 → {00: GUID, 01: {00: BIN, 01: Account}, 02: ServiceCode}
 *
 * @param bankBin - 6-digit bank identification number
 * @param accountNumber - Account number or card number (max 19 characters)
 * @param serviceCode - Service code (QRIBFTTA for account, QRIBFTTC for card)
 * @returns Encoded consumer account information field (ID 38)
 *
 * @example
 * ```typescript
 * const field = buildConsumerAccountInfo('970403', '01234567', 'QRIBFTTA');
 * console.log(field);
 * // "38570010A00000072701270006970403011200110123456780208QRIBFTTA"
 * //  ^^   ID 38
 * //    ^^  Length 57
 * //      0010A000000727 - Sub-field 00 (GUID)
 * //                    0127... - Sub-field 01 (Bank info)
 * //                            0208QRIBFTTA - Sub-field 02 (Service code)
 * ```
 */
export function buildConsumerAccountInfo(
  bankBin: string,
  accountNumber: string,
  serviceCode: ServiceCode
): string {
  // Sub-field 00: NAPAS GUID
  const guidField = encodeField('00', NAPAS_GUID);

  // Sub-field 01: Payment provider information
  // Contains nested sub-fields for bank BIN and account number
  const binSubField = encodeField('00', bankBin);
  const accountSubField = encodeField('01', accountNumber);
  const paymentProviderValue = binSubField + accountSubField;
  const paymentProviderField = encodeField('01', paymentProviderValue);

  // Sub-field 02: Service code
  const serviceCodeField = encodeField('02', serviceCode);

  // Combine all sub-fields
  const consumerAccountValue = guidField + paymentProviderField + serviceCodeField;

  // Return ID 38 with encoded sub-fields
  return encodeField('38', consumerAccountValue);
}
