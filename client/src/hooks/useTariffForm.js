import { useCallback, useMemo, useState } from 'react'
import { CARRIERS, resolveTmsColumns } from '../data/carrierProfiles'
import { buildGenerateFormData } from '../api/buildGenerateFormData'
import { postGenerateXml } from '../api/tmsApi'
import { downloadBlob } from '../utils/downloadBlob'

function validateForm({
  file,
  carrierId,
  serviceProfile,
  effectiveIso,
  expirationIso,
}) {
  if (!file) return 'Seleccioná un archivo Excel.'
  if (!carrierId || !serviceProfile) {
    return 'Elegí transportista y tipo de servicio.'
  }
  if (!effectiveIso || !expirationIso) {
    return 'Completá vigencia desde y hasta.'
  }
  if (new Date(effectiveIso) > new Date(expirationIso)) {
    return 'La fecha "desde" no puede ser posterior a la fecha "hasta".'
  }
  return null
}

export function useTariffForm() {
  const [file, setFile] = useState(null)
  const [carrierId, setCarrierId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [effectiveIso, setEffectiveIso] = useState('')
  const [expirationIso, setExpirationIso] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const carrier = useMemo(
    () => CARRIERS.find((c) => c.id === carrierId) ?? null,
    [carrierId]
  )

  const serviceProfile = useMemo(() => {
    if (!carrier) return null
    return carrier.services.find((s) => s.id === serviceId) ?? null
  }, [carrier, serviceId])

  const tmsColumns = useMemo(
    () => resolveTmsColumns(serviceProfile),
    [serviceProfile]
  )

  const onCarrierChange = useCallback((e) => {
    const next = e.target.value
    setCarrierId(next)
    setServiceId('')
    const c = CARRIERS.find((x) => x.id === next)
    if (c?.services.length === 1) {
      setServiceId(c.services[0].id)
    }
  }, [])

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError(null)

      const msg = validateForm({
        file,
        carrierId,
        serviceProfile,
        effectiveIso,
        expirationIso,
      })
      if (msg) {
        setError(msg)
        return
      }

      const fd = buildGenerateFormData({
        file,
        serviceProfile,
        tmsColumns,
        effectiveIso,
        expirationIso,
      })

      setLoading(true)
      try {
        const { blob, filename } = await postGenerateXml(fd)
        downloadBlob(blob, filename)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al generar.')
      } finally {
        setLoading(false)
      }
    },
    [
      file,
      carrierId,
      serviceProfile,
      effectiveIso,
      expirationIso,
      tmsColumns,
    ]
  )

  return {
    file,
    setFile,
    carrierId,
    carrier,
    onCarrierChange,
    serviceId,
    setServiceId,
    serviceProfile,
    tmsColumns,
    effectiveIso,
    setEffectiveIso,
    expirationIso,
    setExpirationIso,
    loading,
    error,
    onSubmit,
  }
}
