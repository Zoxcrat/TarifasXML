import * as XLSX from 'xlsx';
import { RANGE_COLUMN_NAMES } from '../constants.js';

function normalizeHeader(value) {
  if (value === null || value === undefined) return '';
  let s = String(value).trim().replace(/^\uFEFF/, '');
  s = s.replace(/\s+/g, ' ').toLowerCase();
  return s;
}

function isRangeColumn(normalizedHeader) {
  if (!normalizedHeader) return false;
  const compact = normalizedHeader.replace(/\s/g, '');
  if (
    RANGE_COLUMN_NAMES.some(
      (name) =>
        normalizedHeader === name || compact === name.replace(/\s/g, '')
    )
  ) {
    return true;
  }
  const hasKm =
    normalizedHeader.includes('km') ||
    normalizedHeader.includes('kms') ||
    normalizedHeader.includes('kilom');
  if (
    hasKm &&
    (normalizedHeader.includes('rango') || normalizedHeader.includes('distancia'))
  ) {
    return true;
  }
  if (normalizedHeader === 'km' || normalizedHeader === 'kms') return true;
  return false;
}

function cellToString(cell) {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'string') return cell.trim().replace(/^\uFEFF/, '');
  if (typeof cell === 'number') return String(cell);
  return String(cell).trim();
}

function unwrapCellValue(cell) {
  if (cell === null || cell === undefined) return cell;
  if (typeof cell !== 'object' || Array.isArray(cell)) return cell;
  if ('w' in cell && cell.w != null && String(cell.w).trim() !== '') {
    return cell.w;
  }
  if ('v' in cell && cell.v != null && cell.v !== '') return cell.v;
  return cell;
}

function findHeaderRowIndex(rows, maxScan = 35) {
  for (let r = 0; r < Math.min(rows.length, maxScan); r++) {
    const row = rows[r];
    if (!row || !row.length) continue;
    const normalized = row.map((c) => normalizeHeader(unwrapCellValue(c)));
    let rangeIdx = -1;
    for (let i = 0; i < normalized.length; i++) {
      if (isRangeColumn(normalized[i])) {
        rangeIdx = i;
        break;
      }
    }
    if (rangeIdx === -1) continue;
    let equipCount = 0;
    for (let i = 0; i < normalized.length; i++) {
      if (i === rangeIdx) continue;
      if (normalized[i] && normalized[i].length > 0) equipCount++;
    }
    if (equipCount >= 1) return r;
  }
  return -1;
}

/**
 * @param {unknown[][]} rows
 * @param {boolean} raw
 */
function parseSheetRows(rows, raw) {
  if (!rows.length) {
    throw new Error('La hoja está vacía.');
  }

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    throw new Error(
      'No se encontró una fila con "Rangos KM" (o similar) y al menos un tipo de equipo (TR1, TR2CH, …) en las primeras filas. Si hay un título arriba, no importa: debe existir esa fila de encabezados.'
    );
  }

  const headerRow = rows[headerRowIndex].map((c) =>
    cellToString(unwrapCellValue(c))
  );
  const normalizedHeaders = headerRow.map((h) => normalizeHeader(h));

  let rangeColIndex = -1;
  for (let i = 0; i < normalizedHeaders.length; i++) {
    if (isRangeColumn(normalizedHeaders[i])) {
      rangeColIndex = i;
      break;
    }
  }

  if (rangeColIndex === -1) {
    throw new Error(
      'No se encontró la columna de rangos. Verificá el nombre (p. ej. "Rangos KM").'
    );
  }

  const equipmentColumns = [];
  for (let i = 0; i < headerRow.length; i++) {
    if (i === rangeColIndex) continue;
    const name = headerRow[i];
    if (!name) continue;
    equipmentColumns.push(String(name).trim());
  }

  if (equipmentColumns.length === 0) {
    throw new Error(
      'No hay columnas de tipo de equipo además de la columna de rangos.'
    );
  }

  const rangeRows = [];
  let lastRangeLabel = '';

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const rawRange = cellToString(unwrapCellValue(row[rangeColIndex]));
    let rangeLabel = rawRange;
    if (!rangeLabel && lastRangeLabel) {
      rangeLabel = lastRangeLabel;
    }
    if (!rangeLabel) continue;
    if (rawRange) {
      lastRangeLabel = rawRange;
    }

    const rangeTo = parseRangeUpperBound(rangeLabel);
    if (rangeTo === null) {
      throw new Error(
        `Fila ${r + 1}: rango inválido "${rangeLabel}". Usá formato "1-50" o "51-100".`
      );
    }

    const pricesByEquipment = {};
    let anyPrice = false;

    for (let i = 0; i < headerRow.length; i++) {
      if (i === rangeColIndex) continue;
      const equipName = headerRow[i];
      if (!equipName || !String(equipName).trim()) continue;

      const raw = unwrapCellValue(row[i]);
      const price = parsePrice(raw);
      if (price !== null) {
        pricesByEquipment[String(equipName).trim()] = price;
        anyPrice = true;
      }
    }

    if (anyPrice) {
      rangeRows.push({ rangeLabel, rangeTo, pricesByEquipment });
    }
  }

  return {
    equipmentColumns,
    rangeRows,
    headerRowIndex,
    headerRow,
    raw,
  };
}

/**
 * Lee el buffer del Excel y devuelve filas de tarifa por equipo.
 * Intenta primero valores crudos; si no hay precios, repite con celdas formateadas (útil con moneda).
 */
export function parseTariffExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo Excel no contiene hojas.');
  }

  const sheet = workbook.Sheets[sheetName];

  const tryRaw = (raw) => {
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw,
    });
    return parseSheetRows(rows, raw);
  };

  let result;
  try {
    result = tryRaw(true);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }

  if (result.rangeRows.length > 0) {
    return {
      equipmentColumns: result.equipmentColumns,
      rangeRows: result.rangeRows,
    };
  }

  try {
    result = tryRaw(false);
  } catch {
    /* mismo error abajo */
  }

  if (result.rangeRows.length > 0) {
    return {
      equipmentColumns: result.equipmentColumns,
      rangeRows: result.rangeRows,
    };
  }

  const preview = result.headerRow.join(' | ');
  throw new Error(
    `No hay filas de datos con precios. Encabezados detectados (fila ${result.headerRowIndex + 1}): ${preview}. ` +
      `Revisá que los importes sean números o texto tipo "$ 420,161.00" y que la columna de rangos no esté vacía en todas las filas (si usás celdas combinadas en "Rangos KM", ya se rellenan automáticamente).`
  );
}

/**
 * Toma el límite superior del rango ("1-50" → 50). Acepta guión normal, Unicode −, "1 a 50".
 */
export function parseRangeUpperBound(label) {
  if (label === null || label === undefined) return null;
  if (typeof label === 'number' && Number.isFinite(label)) {
    return Math.round(label);
  }
  let s = String(label).trim().replace(/^\uFEFF/, '');
  s = s.replace(/\u2212/g, '-');

  const m = s.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
  if (m) return Number(m[2]);

  const ma = s.match(/^(\d+)\s+a\s+(\d+)$/i);
  if (ma) return Number(ma[2]);

  const single = s.match(/^(\d+)$/);
  if (single) return Number(single[1]);

  return null;
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;

  let s = String(value).trim();
  if (s === '' || s === '-') return null;

  s = s.replace(/[\$\u00A3\u20AC\u00A2]/g, '');
  s = s.replace(/\b(ARS|USD|U\$S|US\$|UYU|MXN|CLP)\b/gi, '');
  s = s.trim();
  s = s.replace(/[\u00A0\u202F]/g, ' ').replace(/\s/g, '');

  if (s === '') return null;

  s = s.replace(/,/g, '');

  const n = parseFloat(s);
  if (Number.isFinite(n)) return n;
  return null;
}

/**
 * Importes tipo AR: miles con punto y decimales con coma ("19.990,51", "1.005.636,64").
 */
export function parseMoneyAR(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;

  let s = String(value).trim();
  if (s === '' || s === '-') return null;

  s = s.replace(/[\$\u00A3\u20AC\u00A2]/g, '');
  s = s.replace(/\b(ARS|USD|U\$S|US\$|UYU|MXN|CLP)\b/gi, '');
  s = s.replace(/[\u00A0\u202F]/g, ' ').trim();
  if (s === '') return null;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma !== -1 && lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * @returns {{ rangeLo: number, rangeHi: number, rangeLabel: string } | null}
 */
export function parseRangeBounds(label) {
  if (label === null || label === undefined) return null;
  if (typeof label === 'number' && Number.isFinite(label)) {
    const n = Math.round(label);
    return { rangeLo: n, rangeHi: n, rangeLabel: String(label) };
  }
  let s = String(label).trim().replace(/^\uFEFF/, '');
  s = s.replace(/\u2212/g, '-');

  const m = s.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
  if (m) {
    return {
      rangeLo: Number(m[1]),
      rangeHi: Number(m[2]),
      rangeLabel: s,
    };
  }
  const ma = s.match(/^(\d+)\s+a\s+(\d+)$/i);
  if (ma) {
    return {
      rangeLo: Number(ma[1]),
      rangeHi: Number(ma[2]),
      rangeLabel: s,
    };
  }
  const single = s.match(/^(\d+)$/);
  if (single) {
    const n = Number(single[1]);
    return { rangeLo: n, rangeHi: n, rangeLabel: s };
  }
  return null;
}

function compactHeader(normalized) {
  return normalized.replace(/\s/g, '');
}

function isPricePerTnColumn(normalized) {
  const c = compactHeader(normalized);
  return (
    c.includes('$/tn') ||
    c.includes('us$/tn') ||
    normalized.includes('$/tn') ||
    (normalized.includes('tn') && normalized.includes('$'))
  );
}

function isTr1MinimumColumn(normalized) {
  return normalized === 'tr1' || normalized === 'tr 1';
}

/**
 * @param {unknown[][]} rows
 */
function findCosechaHeaderRow(rows, maxScan = 35) {
  for (let r = 0; r < Math.min(rows.length, maxScan); r++) {
    const row = rows[r];
    if (!row || !row.length) continue;
    const normalized = row.map((c) => normalizeHeader(unwrapCellValue(c)));

    let rangeIdx = -1;
    let priceIdx = -1;
    let tr1Idx = -1;

    for (let i = 0; i < normalized.length; i++) {
      if (isRangeColumn(normalized[i])) rangeIdx = i;
      if (isPricePerTnColumn(normalized[i])) priceIdx = i;
      if (isTr1MinimumColumn(normalized[i])) tr1Idx = i;
    }

    if (rangeIdx >= 0 && priceIdx >= 0 && tr1Idx >= 0) {
      return { headerRowIndex: r, rangeIdx, priceIdx, tr1Idx };
    }
  }
  return null;
}

/**
 * Excel Cosecha: Rangos KM, $/TN (rate per unit), TR1 (minimum charge).
 * @param {unknown[][]} rows
 */
function parseCosechaSheetRows(rows) {
  if (!rows.length) {
    throw new Error('La hoja está vacía.');
  }

  const found = findCosechaHeaderRow(rows);
  if (!found) {
    throw new Error(
      'No se encontró la fila de encabezados Cosecha (Rangos KM, $/TN, TR1) en las primeras filas.'
    );
  }

  const { headerRowIndex, rangeIdx, priceIdx, tr1Idx } = found;
  let lastRangeLabel = '';

  const rangeRows = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const rawRange = cellToString(unwrapCellValue(row[rangeIdx]));
    let rangeLabel = rawRange;
    if (!rangeLabel && lastRangeLabel) {
      rangeLabel = lastRangeLabel;
    }
    if (!rangeLabel) continue;
    if (rawRange) {
      lastRangeLabel = rawRange;
    }

    const bounds = parseRangeBounds(rangeLabel);
    if (!bounds) {
      throw new Error(
        `Fila ${r + 1}: rango inválido "${rangeLabel}". Usá formato "1-50" o "51-100".`
      );
    }

    const rawPrice = unwrapCellValue(row[priceIdx]);
    const rawTr1 = unwrapCellValue(row[tr1Idx]);
    const dollarPerTn = parseMoneyAR(rawPrice);
    const tr1Minimum = parseMoneyAR(rawTr1);

    if (dollarPerTn === null || tr1Minimum === null) {
      continue;
    }

    rangeRows.push({
      rangeLabel: bounds.rangeLabel,
      rangeLo: bounds.rangeLo,
      rangeHi: bounds.rangeHi,
      dollarPerTn,
      tr1Minimum,
    });
  }

  if (rangeRows.length === 0) {
    throw new Error(
      'No hay filas de datos con importes $/TN y TR1 válidos (formato argentino: 19.990,51).'
    );
  }

  return { rangeRows, headerRowIndex };
}

/**
 * Lee Excel TL_F2P (Cosecha): columnas Rangos KM, $/TN, TR1.
 */
export function parseCosechaTariffExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo Excel no contiene hojas.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  try {
    return parseCosechaSheetRows(rows);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}
