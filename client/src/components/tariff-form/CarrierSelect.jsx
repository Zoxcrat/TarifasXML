import { CARRIERS } from '../../data/carrierProfiles'

export function CarrierSelect({ value, onChange }) {
  return (
    <label className="field">
      <span className="label">Transportista</span>
      <select
        value={value}
        onChange={onChange}
        required
        className="select-input"
      >
        <option value="">Seleccioná…</option>
        {CARRIERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
