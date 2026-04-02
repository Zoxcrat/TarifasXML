export function ServiceSelect({
  carrier,
  value,
  onChange,
}) {
  return (
    <label className="field">
      <span className="label">Servicio</span>
      <select
        value={value}
        onChange={onChange}
        required
        disabled={!carrier}
        className="select-input"
      >
        <option value="">
          {carrier ? 'Seleccioná…' : 'Primero elegí transportista'}
        </option>
        {carrier?.services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  )
}
