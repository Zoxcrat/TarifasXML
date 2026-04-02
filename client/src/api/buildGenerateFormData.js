import { isoDateToTms } from '../utils/dateFormat'

/**
 * Arma el FormData para POST /generate según perfil TMS y vigencias.
 */
export function buildGenerateFormData({
  file,
  serviceProfile,
  tmsColumns,
  effectiveIso,
  expirationIso,
}) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('tariffId', serviceProfile.tariffId)
  fd.append('serviceId', serviceProfile.serviceId)
  fd.append('routes', serviceProfile.routes.join(','))
  fd.append('chargeIds', serviceProfile.chargeIds.join(','))
  fd.append('effectiveDate', isoDateToTms(effectiveIso))
  fd.append('expirationDate', isoDateToTms(expirationIso))

  fd.append('currency', tmsColumns.currency)
  fd.append('baseCharge', tmsColumns.baseCharge)
  fd.append('minimumCharge', tmsColumns.minimumCharge)
  fd.append('maximumCharge', tmsColumns.maximumCharge)
  fd.append('rateRangeCode', tmsColumns.rateRangeCode)
  fd.append('rangeBaseCharge', tmsColumns.rangeBaseCharge)

  return fd
}
