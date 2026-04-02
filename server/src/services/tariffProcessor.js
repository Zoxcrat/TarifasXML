import { TMS_DEFAULTS } from '../constants.js';

/**
 * @typedef {Object} TariffBlock
 * @property {string} equipmentType
 * @property {{ rangeTo: number, ratePerUnit: number }[]} bands
 * @property {string} rateCode
 * @property {string} chargeId
 */

/**
 * @param {{
 *   equipmentColumns: string[],
 *   rangeRows: { rangeTo: number, pricesByEquipment: Record<string, number> }[]
 * }} parsed
 * @param {{
 *   tariffId: string,
 *   serviceId: string,
 *   routes: string[],
 *   chargeIds: string[],
 *   overrides?: Partial<typeof TMS_DEFAULTS>
 * }} params
 */
export function buildTariffPayload(parsed, params) {
  const overrides = params.overrides ?? {};
  const defaults = { ...TMS_DEFAULTS, ...overrides };

  /** Rutas y charges vienen siempre del request (validateGenerateBody + parseGenerateBody). */
  const routeList = params.routes?.length ? [...params.routes] : [];
  const chargeList = params.chargeIds?.length ? [...params.chargeIds] : [];

  if (routeList.length === 0) {
    throw new Error('Falta al menos un RateCode (ruta).');
  }
  if (chargeList.length === 0) {
    throw new Error('Falta al menos un Charge ID.');
  }

  const equipmentBlocks = [];

  for (const equipmentType of parsed.equipmentColumns) {
    const bands = [];
    for (const row of parsed.rangeRows) {
      const rate = row.pricesByEquipment[equipmentType];
      if (rate === undefined || rate === null) continue;
      bands.push({ rangeTo: row.rangeTo, ratePerUnit: rate });
    }

    if (bands.length > 0) {
      bands.sort((a, b) => a.rangeTo - b.rangeTo);
      equipmentBlocks.push({ equipmentType, bands });
    }
  }

  if (equipmentBlocks.length === 0) {
    throw new Error(
      'Ninguna columna de equipo tiene precios numéricos en las filas de rango.'
    );
  }

  /** Una entrada por combinación ruta × charge × equipo (mismas bandas de precio). */
  const blocks = [];
  for (const rateCode of routeList) {
    for (const chargeId of chargeList) {
      for (const eb of equipmentBlocks) {
        blocks.push({
          equipmentType: eb.equipmentType,
          bands: eb.bands,
          rateCode,
          chargeId,
        });
      }
    }
  }

  return {
    tariffId: params.tariffId,
    serviceId: params.serviceId,
    currency: defaults.currency,
    baseCharge: defaults.baseCharge,
    minimumCharge: defaults.minimumCharge,
    maximumCharge: defaults.maximumCharge,
    effectiveDate: defaults.effectiveDate,
    expirationDate: defaults.expirationDate,
    rateRangeCode: defaults.rateRangeCode,
    rangeBaseCharge: defaults.rangeBaseCharge,
    blocks,
  };
}
