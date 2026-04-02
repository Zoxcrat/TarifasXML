/**
 * Lista separada por coma, punto y coma o salto de línea (p. ej. rutas o charge IDs).
 */
export function parseList(value) {
  if (value === undefined || value === null) return [];
  const s = String(value).trim();
  if (!s) return [];
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}
