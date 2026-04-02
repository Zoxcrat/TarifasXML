import { parseTariffExcel } from './excelParser.js';
import { buildTariffPayload } from './tariffProcessor.js';
import { buildSpreadsheetXml } from './xmlBuilder.js';

/**
 * Excel + parámetros TMS → XML SpreadsheetML y nombre sugerido de archivo.
 */
export function generateTariffXml(buffer, input) {
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
