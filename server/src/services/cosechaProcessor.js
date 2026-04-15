import { TMS_DEFAULTS } from '../constants.js';
import { COSECHA_RANGE_TO } from '../data/cosechaRateCodeKm.js';

/**
 * @typedef {Object} CosechaRangeRow
 * @property {string} rangeLabel
 * @property {number} rangeLo
 * @property {number} rangeHi
 * @property {number} dollarPerTn
 * @property {number} tr1Minimum
 */

/**
 * @param {CosechaRangeRow[]} rangeRows
 * @param {number} km
 */
export function findRangeRowForDistance(rangeRows, km) {
  for (const row of rangeRows) {
    if (km >= row.rangeLo && km <= row.rangeHi) return row;
  }
  throw new Error(
    `Distancia ${km} km no cae en ningún rango del Excel (1–3000 km).`
  );
}

const COSECHA_EQUIPMENT = ['TR1', 'TR1WF'];

/**
 * @param {{
 *   rangeRows: CosechaRangeRow[],
 * }} parsed
 * @param {{
 *   tariffId: string,
 *   serviceId: string,
 *   routes: string[],
 *   chargeIds: string[],
 *   overrides?: Partial<typeof TMS_DEFAULTS>,
 * }} params
 * @param {Record<string, number>} rateCodeKm
 */
export function buildCosechaPayload(parsed, params, rateCodeKm) {
  const overrides = params.overrides ?? {};
  const defaults = { ...TMS_DEFAULTS, ...overrides };

  const routeList = params.routes?.length ? [...params.routes] : [];
  const chargeList = params.chargeIds?.length ? [...params.chargeIds] : [];

  if (routeList.length === 0) {
    throw new Error('Falta al menos un RateCode (ruta).');
  }
  if (chargeList.length === 0) {
    throw new Error('Falta al menos un Charge ID.');
  }
  if (!parsed.rangeRows?.length) {
    throw new Error('No hay filas de rangos km en el Excel.');
  }

  const blocks = [];

  for (const rateCode of routeList) {
    const km = rateCodeKm[rateCode];
    if (km === undefined) {
      throw new Error(
        `No hay distancia a planta definida para el RateCode "${rateCode}".`
      );
    }
    const bucket = findRangeRowForDistance(parsed.rangeRows, km);

    for (const equipmentType of COSECHA_EQUIPMENT) {
      for (const chargeId of chargeList) {
        blocks.push({
          equipmentType,
          rateCode,
          chargeId,
          minimumCharge: String(bucket.tr1Minimum),
          bands: [
            {
              rangeTo: COSECHA_RANGE_TO,
              ratePerUnit: bucket.dollarPerTn,
            },
          ],
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
