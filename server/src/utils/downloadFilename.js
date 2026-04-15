/**
 * Limpia un fragmento para usar en nombres de archivo (Windows/macOS).
 */
export function sanitizeFilenameSegment(value) {
  return (
    String(value ?? '')
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Transportista'
  );
}

/**
 * Nombre sugerido: ARG - ADD RATES {SERVICE_ID} - {NOMBRE TRANSPORTISTA}.xml
 */
export function buildArgAddRatesFilename(serviceId, carrierName) {
  const sid = String(serviceId ?? '').trim();
  const name = sanitizeFilenameSegment(carrierName);
  return `ARG - ADD RATES ${sid} - ${name}.xml`;
}
