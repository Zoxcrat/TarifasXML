import express from 'express';
import cors from 'cors';
import generateRoutes from './routes/generateRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

app.use(
  cors({
    origin: true,
    exposedHeaders: ['Content-Disposition'],
  })
);

app.use(express.json());

app.use(healthRoutes);
app.use(generateRoutes);

/**
 * Middleware de errores (p. ej. multer fileFilter).
 */
app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : 'Error del servidor.';
  res.status(400).json({ error: message });
});

export default app;
