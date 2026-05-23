import express from 'express';
import { promises as fs } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { validateCameraConfigDetailed } from './src/lib/cameraConfig.js';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 5173);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAMERA_CONFIG_PATH = path.join(__dirname, 'public', 'config', 'cameras.json');

const app = express();
const httpServer = createHttpServer(app);
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

function validateConfigOrSend(response, config) {
  const validation = validateCameraConfigDetailed(config);
  if (!validation.valid) {
    response.status(400).json({
      error: 'Camera config failed validation.',
      errors: validation.errors,
      warnings: validation.warnings,
    });
    return false;
  }

  return true;
}

app.get('/api/config/cameras', async (_request, response) => {
  try {
    const rawConfig = await fs.readFile(CAMERA_CONFIG_PATH, 'utf8');
    const config = JSON.parse(rawConfig);
    if (!validateConfigOrSend(response, config)) return;
    response.json(config);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to read camera config.',
    });
  }
});

app.post('/api/config/cameras', async (request, response) => {
  const config = request.body;
  if (!validateConfigOrSend(response, config)) return;

  try {
    await fs.writeFile(CAMERA_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
    response.json({
      ok: true,
      path: 'public/config/cameras.json',
    });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to write camera config.',
    });
  }
});

const vite = await createViteServer({
  appType: 'spa',
  server: {
    hmr: {
      server: httpServer,
    },
    host: HOST,
    middlewareMode: true,
  },
});

app.use(vite.middlewares);

httpServer.listen(PORT, HOST, () => {
  console.log(`Soft Traces local editor: http://${HOST}:${PORT}${vite.config.base}`);
  console.log('Local API is bound to 127.0.0.1 only. Do not expose this server publicly.');
});
