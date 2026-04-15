/**
 * Transportistas y combinaciones TMS (Tariff / Service / Charge / Routes).
 * Ampliar este archivo cuando agreguen transportistas o servicios.
 */

import { ROUTES_COSECHA } from './cosechaRoutes.js'

const ROUTES_TL_RC = [
  'AR_ALLARG-ALLROJAS_RC',
  'AR_ALLROJAS-ALLARG_RC',
  'AR_1226-ALLARG_RC',
  'AR_6773-ALLARG_RC',
]

/** Valores TMS por defecto para TL_F2P (Cosecha); el mínimo efectivo sale del Excel por RateCode. */
const TMS_COSECHA = {
  currency: 'ARS',
  baseCharge: '0',
  minimumCharge: '0',
  maximumCharge: '9999999999999.99',
  rateRangeCode: 'UNPU',
  rangeBaseCharge: '0',
}

/**
 * Columnas del XML que no vienen del Excel (moneda, Base/Min/Max charge,
 * RateRangeCode, Range Base Charge). Valores por defecto para todos los servicios.
 *
 * Para un transportista/servicio puntual, agregá `tmsColumns` en ese servicio
 * con solo las claves que quieras cambiar (se fusionan con este default).
 *
 * Ejemplo:
 *   tmsColumns: { rateRangeCode: 'AR100', currency: 'USD' }
 */
export const DEFAULT_TMS_COLUMNS = {
  currency: 'ARS',
  baseCharge: '0',
  minimumCharge: '0',
  maximumCharge: '9999999999999.99',
  rateRangeCode: 'AR50',
  rangeBaseCharge: '0',
}

/**
 * @typedef {typeof DEFAULT_TMS_COLUMNS} TmsColumns
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   tariffId: string,
 *   serviceId: string,
 *   chargeIds: string[],
 *   routes: string[],
 *   tmsColumns?: Partial<TmsColumns>,
 * }} ServiceProfile */

/**
 * @typedef {{ id: string, name: string, services: ServiceProfile[] }} CarrierProfile
 */

export function resolveTmsColumns(serviceProfile) {
  return {
    ...DEFAULT_TMS_COLUMNS,
    ...(serviceProfile?.tmsColumns ?? {}),
  }
}

/** @type {CarrierProfile[]} */
export const CARRIERS = [
  {
    id: 'ch-robinson',
    name: 'CH Robinson',
    services: [
      {
        id: 'semillas',
        name: 'Distribución Semillas',
        tariffId: '17556',
        serviceId: 'TL_RC',
        chargeIds: ['EQ_TDISTS'],
        routes: [...ROUTES_TL_RC],
      },
      {
        id: 'agroquimicos',
        name: 'Distribución Agroquímicos',
        tariffId: '32465',
        serviceId: 'TL_CP',
        chargeIds: ['EQ_LDISTC1', 'EQ_LDISTC2'],
        routes: ['AR_SIASA_ALLARG'],
      },
      {
        id: 'cosecha',
        name: 'Cosecha',
        tariffId: '17556',
        serviceId: 'TL_F2P',
        chargeIds: ['EQ_WGT'],
        routes: [...ROUTES_COSECHA],
        tmsColumns: { ...TMS_COSECHA },
      },
    ],
  },
  {
    id: 'id-logistics',
    name: 'ID Logistics',
    services: [
      {
        id: 'semillas',
        name: 'Distribución Semillas',
        tariffId: '17557',
        serviceId: 'TL_RC',
        chargeIds: ['EQ_TDISTS'],
        routes: [...ROUTES_TL_RC],
      },
      {
        id: 'cosecha',
        name: 'Cosecha',
        tariffId: '17557',
        serviceId: 'TL_F2P',
        chargeIds: ['EQ_WGT'],
        routes: [...ROUTES_COSECHA],
        tmsColumns: { ...TMS_COSECHA },
      },
    ],
  },
  {
    id: 'avancargo',
    name: 'Avancargo',
    services: [
      {
        id: 'cosecha',
        name: 'Cosecha',
        tariffId: '45061',
        serviceId: 'TL_F2P',
        chargeIds: ['EQ_WGT'],
        routes: [...ROUTES_COSECHA],
        tmsColumns: { ...TMS_COSECHA },
      },
    ],
  },
  {
    id: 'zarcam',
    name: 'Zarcam',
    services: [
      {
        id: 'agroquimicos',
        name: 'Distribución Agroquímicos',
        tariffId: '32464',
        serviceId: 'TL_CP',
        chargeIds: ['EQ_LDISTC1', 'EQ_LDISTC2'],
        routes: ['AR_SIASA_ALLARG'],
      },
    ],
  },
  {
    id: 'novis',
    name: 'Novis',
    services: [
      {
        id: 'agroquimicos',
        name: 'Distribución Agroquímicos',
        tariffId: '47608',
        serviceId: 'TL_CP',
        chargeIds: ['EQ_LDISTC1', 'EQ_LDISTC2'],
        routes: ['AR_SIASA_ALLARG'],
      },
      {
        id: 'cosecha',
        name: 'Cosecha',
        tariffId: '47608',
        serviceId: 'TL_F2P',
        chargeIds: ['EQ_WGT'],
        routes: [...ROUTES_COSECHA],
        tmsColumns: { ...TMS_COSECHA },
      },
    ],
  },
]
