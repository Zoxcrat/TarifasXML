import { COSECHA_RATE_CODE_KM } from '../data/cosechaRateCodeKm.js';
import { parseCosechaTariffExcel, parseTariffExcel } from './excelParser.js';
import { buildCosechaPayload } from './cosechaProcessor.js';
import { buildTariffPayload } from './tariffProcessor.js';
import { buildSpreadsheetXml } from './xmlBuilder.js';

const SERVICE_COSECHA = 'TL_F2P';

/**
 * Excel + parámetros TMS → XML SpreadsheetML y nombre sugerido de archivo.
 */
export function generateTariffXml(buffer, input) {
  if (input.serviceId === SERVICE_COSECHA) {
    const parsed = parseCosechaTariffExcel(buffer);
    const payload = buildCosechaPayload(parsed, {
      tariffId: input.tariffId,
      serviceId: input.serviceId,
      routes: input.routes,
      chargeIds: input.chargeIds,
      overrides: input.overrides,
    }, COSECHA_RATE_CODE_KM);
    const xml = buildSpreadsheetXml(payload);
    const filename = `tarifas_tms_${input.tariffId}_${Date.now()}.xml`;
    return { xml, filename };
  }

  const parsed = parseTariffExcel(buffer);
  const payload = buildTariffPayload(parsed, {
    tariffId: input.tariffId,
    serviceId: input.serviceId,
    routes: input.routes,
    chargeIds: input.chargeIds,
    overrides: input.overrides,
  });

  const xml = buildSpreadsheetXml(payload);
  const filename = `tarifas_tms_${input.tariffId}_${Date.now()}.xml`;

  return { xml, filename };
}
