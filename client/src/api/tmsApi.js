/**
 * Base URL del API en producción (ej. https://tarifas.interno/api).
 * En desarrollo se deja vacío y Vite reenvía /generate al servidor local.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? ''

/**
 * Envía el Excel y parámetros; devuelve el XML como Blob o lanza con mensaje de error.
 *
 * @param {FormData} formData — debe incluir `file`, `tariffId`, `serviceId`
 */
export async function postGenerateXml(formData) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    body: formData,
  })

  const disposition = res.headers.get('Content-Disposition')
  let filename = 'tarifas_tms.xml'
  if (disposition) {
    const m = disposition.match(/filename="?([^";]+)"?/)
    if (m) filename = m[1]
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* cuerpo no JSON */
    }
    throw new Error(message)
  }

  const blob = await res.blob()
  return { blob, filename }
}
