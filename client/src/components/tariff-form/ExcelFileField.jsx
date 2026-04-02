import { EXCEL_ACCEPT } from './constants'

export function ExcelFileField({ onFileChange }) {
  return (
    <label className="field">
      <span className="label">Archivo Excel</span>
      <input
        type="file"
        accept={EXCEL_ACCEPT}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <span className="file-hint">
        El nombre del archivo no importa; debe ser un Excel válido.
      </span>
    </label>
  )
}
