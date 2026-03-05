import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import catchesRouter  from './routes/catches.js';
import importRouter   from './routes/import.js';
import settingsRouter from './routes/settings.js';
import { UPLOAD_DIR } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve uploaded photos
app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api/catches',  catchesRouter);
app.use('/api/import',   importRouter);
app.use('/api/settings', settingsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bass Log server running on http://0.0.0.0:${PORT}`);
});
