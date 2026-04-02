export function ProfileSummary({ serviceProfile, tmsColumns }) {
  if (!serviceProfile) return null

  return (
    <div className="profile-summary" aria-live="polite">
      <p>
        <strong>Tariff ID</strong> {serviceProfile.tariffId} ·{' '}
        <strong>Service ID</strong> {serviceProfile.serviceId}
      </p>
      <p className="profile-summary-detail">
        <strong>Rutas</strong> ({serviceProfile.routes.length}):{' '}
        {serviceProfile.routes.join(', ')}
      </p>
      <p className="profile-summary-detail">
        <strong>Charge ID</strong>: {serviceProfile.chargeIds.join(', ')}
      </p>
      <p className="profile-summary-detail">
        <strong>Moneda</strong> {tmsColumns.currency} ·{' '}
        <strong>Base / Mín / Máx</strong> {tmsColumns.baseCharge} /{' '}
        {tmsColumns.minimumCharge} / {tmsColumns.maximumCharge} ·{' '}
        <strong>RateRangeCode</strong> {tmsColumns.rateRangeCode} ·{' '}
        <strong>Range base charge</strong> {tmsColumns.rangeBaseCharge}
      </p>
      <p className="profile-summary-hint">
        En el XML, la columna <strong>RateCode</strong> es la ruta (ej. AR_SIASA_ALLARG).
        <strong> RateRangeCode</strong> (ej. AR50) es otro dato: código de tramo por km, no la
        ruta.
      </p>
    </div>
  )
}
