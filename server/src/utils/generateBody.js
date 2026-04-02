import { parseList } from './parseList.js';

const TMS_OVERRIDE_KEYS = [
  'currency',
  'rateRangeCode',
  'baseCharge',
  'minimumCharge',
  'maximumCharge',
  'rangeBaseCharge',
  'effectiveDate',
  'expirationDate',
];

/**
 * Extrae overrides TMS desde el body multipart (strings no vacíos).
 */
export function collectTmsOverrides(body) {
  const o = {};
  for (const key of TMS_OVERRIDE_KEYS) {
    const v = body[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      o[key] = String(v).trim();
    }
  }
  return o;
}

/**
 * Valida campos obligatorios del POST /generate. Devuelve mensaje de error o null.
 * Exige rutas y charge IDs explícitos (o los alias rateCode / chargeId) para no
 * aplicar por error los defaults del servidor (ALLARG_AR_SIASA, solo EQ_LDISTC1).
 */
export function validateGenerateBody(body) {
  if (!body.tariffId?.trim() || !body.serviceId?.trim()) {
    return 'Tariff ID y Service ID son obligatorios.';
  }
  if (!body.effectiveDate?.trim() || !body.expirationDate?.trim()) {
    return 'La fecha de vigencia desde y hasta son obligatorias.';
  }

  let routes = parseList(body.routes);
  let chargeIds = parseList(body.chargeIds);
  if (routes.length === 0 && body.rateCode?.trim()) {
    routes = [body.rateCode.trim()];
  }
  if (chargeIds.length === 0 && body.chargeId?.trim()) {
    chargeIds = [body.chargeId.trim()];
  }
  if (routes.length === 0) {
    return (
      'Falta al menos una ruta (campo routes o rateCode). ' +
      'Si usás la app web, probá recargar con Ctrl+F5 o volvé a generar con el último código.'
    );
  }
  if (chargeIds.length === 0) {
    return (
      'Falta al menos un Charge ID (campo chargeIds o chargeId). ' +
      'Si usás la app web, actualizá el cliente o recargá forzando caché.'
    );
  }
  return null;
}

/**
 * Construye el input para generar XML (tras validar con validateGenerateBody).
 */
export function parseGenerateBody(body) {
  let routes = parseList(body.routes);
  let chargeIds = parseList(body.chargeIds);

  if (routes.length === 0 && body.rateCode?.trim()) {
    routes = [body.rateCode.trim()];
  }
  if (chargeIds.length === 0 && body.chargeId?.trim()) {
    chargeIds = [body.chargeId.trim()];
  }

  const overrides = collectTmsOverrides(body);
  overrides.effectiveDate = body.effectiveDate.trim();
  overrides.expirationDate = body.expirationDate.trim();

  return {
    tariffId: body.tariffId.trim(),
    serviceId: body.serviceId.trim(),
    routes,
    chargeIds,
    overrides,
  };
}
