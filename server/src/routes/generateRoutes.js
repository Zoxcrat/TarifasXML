import { Router } from 'express';
import { uploadExcel } from '../middleware/uploadExcel.js';
import { generateTariffXml } from '../services/tariffXmlGenerator.js';
import {
  validateGenerateBody,
  parseGenerateBody,
} from '../utils/generateBody.js';

const router = Router();

router.post('/generate', uploadExcel.single('file'), (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        error: 'Falta el archivo Excel (campo "file").',
      });
    }

    const validationError = validateGenerateBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const input = parseGenerateBody(req.body);
    const { xml, filename } = generateTariffXml(req.file.buffer, input);

    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    return res.send(Buffer.from(xml, 'utf8'));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al generar el XML.';
    return res.status(400).json({ error: message });
  }
});

export default router;
