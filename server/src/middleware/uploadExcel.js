import multer from 'multer';

const storage = multer.memoryStorage();

/** MIME típicos de Excel (el nombre del archivo puede ser cualquiera). */
const EXCEL_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  /** .xlsx es un ZIP OOXML; a veces el SO reporta application/zip. */
  'application/zip',
  /** Descargas o nombres sin extensión suelen venir como octet-stream. */
  'application/octet-stream',
]);

/**
 * Acepta un único archivo en el campo "file" (multipart/form-data).
 * No se exige un nombre concreto ni extensión: la validez real la confirma el parser xlsx.
 */
export const uploadExcel = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype || '';
    if (EXCEL_MIMES.has(mime)) {
      cb(null, true);
      return;
    }
    /** Respaldo si el navegador manda un MIME raro pero el archivo sí es .xlsx / .xls */
    if (/\.xlsx?$/i.test(file.originalname || '')) {
      cb(null, true);
      return;
    }
    cb(
      new Error(
        'El archivo no se reconoce como Excel. Subí un .xlsx o .xls.'
      )
    );
  },
});
