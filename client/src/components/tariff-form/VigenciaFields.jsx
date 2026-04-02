export function VigenciaFields({
  effectiveIso,
  expirationIso,
  onEffectiveChange,
  onExpirationChange,
}) {
  return (
    <div className="field-row">
      <label className="field">
        <span className="label">Vigencia desde</span>
        <input
          type="date"
          value={effectiveIso}
          onChange={onEffectiveChange}
          required
          className="date-input"
        />
      </label>
      <label className="field">
        <span className="label">Vigencia hasta</span>
        <input
          type="date"
          value={expirationIso}
          onChange={onExpirationChange}
          required
          className="date-input"
        />
      </label>
    </div>
  )
}
