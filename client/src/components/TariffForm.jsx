import { useTariffForm } from '../hooks/useTariffForm'
import { CarrierSelect } from './tariff-form/CarrierSelect'
import { ExcelFileField } from './tariff-form/ExcelFileField'
import { ProfileSummary } from './tariff-form/ProfileSummary'
import { ServiceSelect } from './tariff-form/ServiceSelect'
import { VigenciaFields } from './tariff-form/VigenciaFields'

export function TariffForm() {
  const {
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
  } = useTariffForm()

  return (
    <form className="tariff-form" onSubmit={onSubmit}>
      <ExcelFileField onFileChange={setFile} />

      <CarrierSelect value={carrierId} onChange={onCarrierChange} />

      <ServiceSelect
        carrier={carrier}
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
      />

      <ProfileSummary
        serviceProfile={serviceProfile}
        tmsColumns={tmsColumns}
      />

      <VigenciaFields
        effectiveIso={effectiveIso}
        expirationIso={expirationIso}
        onEffectiveChange={(e) => setEffectiveIso(e.target.value)}
        onExpirationChange={(e) => setExpirationIso(e.target.value)}
      />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="submit" disabled={loading}>
        {loading ? 'Generando…' : 'Generar XML'}
      </button>
    </form>
  )
}
