/**
 * Convierte valor de <input type="date"> (YYYY-MM-DD) al formato MM/DD/YYYY del TMS.
 */
export function isoDateToTms(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso.trim()
  const [, y, mo, d] = m
  return `${mo}/${d}/${y}`
}
