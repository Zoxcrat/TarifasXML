/**
 * Valores por defecto para campos TMS que no vienen en el Excel de tarifas.
 * El cliente envía estos valores desde `client/src/data/carrierProfiles.js`
 * (`DEFAULT_TMS_COLUMNS` + `tmsColumns` por servicio). Mantener alineados si
 * cambiás defaults en un solo lugar y replicás en el otro.
 */
export const TMS_DEFAULTS = {
  /** RateCode en el XML (equivalente a Route ID en negocio). */
  rateCode: 'ALLARG_AR_SIASA',
  /** Charge ID del ejemplo Blue Yonder / TMS. */
  chargeId: 'EQ_LDISTC1',
  currency: 'ARS',
  baseCharge: '0',
  minimumCharge: '0',
  maximumCharge: '9999999999999.99',
  /** Código de tramo usado en el ejemplo (AR + km del primer tramo típico). */
  rateRangeCode: 'AR50',
  rangeBaseCharge: '0',
  /** Formato MM/DD/YYYY como en el XML de ejemplo. */
  effectiveDate: '01/01/2026',
  expirationDate: '12/31/2026',
};

/** Nombre esperado de la columna de rangos (comparación case-insensitive). */
export const RANGE_COLUMN_NAMES = ['rangos km', 'rangoskm', 'rango km'];
