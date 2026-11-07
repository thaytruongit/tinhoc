/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dạy học số — Modular Enterprise Server
 * Tác giả: Thầy Đỗ Mạnh Trường (manhtruongdo1984@gmail.com)
 */

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Database & Core Storage
import { healthCheckDb } from './src/lib/db.ts';
import { initFileStorageSystem } from './src/server/state/serverState.ts';

// Modular Express Routers
import authRoutes from './src/server/routes/authRoutes.ts';
import curriculumRoutes from './src/server/routes/curriculumRoutes.ts';
import classroomRoutes from './src/server/routes/classroomRoutes.ts';
import liveSessionRoutes from './src/server/routes/liveSessionRoutes.ts';
import slideRoutes from './src/server/routes/slideRoutes.ts';
import aiRoutes from './src/server/routes/aiRoutes.ts';
import cronRoutes from './src/server/routes/cronRoutes.ts';
import databaseAdminRoutes from './src/server/routes/databaseAdminRoutes.ts';
import syncRoutes from './src/server/routes/syncRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Core Middlewares & Security Headers
  app.use(express.json({ limit: '25mb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 2. Initialize Slide File Storage & Cache System
  initFileStorageSystem();

  // 3. Database Health Check on Startup
  console.log('[CloudPlay DB Startup]: Validating PostgreSQL / Supabase connection via pg pool...');
  try {
    const health = await healthCheckDb();
    if (health.ok) {
      console.log(`[CloudPlay DB Startup]: ✅ Database operational! Latency: ${health.database.latencyMs}ms, Tables Ready: ${health.tablesReady}`);
    } else {
      console.warn(`[CloudPlay DB Startup Warning]: ⚠️ Database unconfigured or unreachable:`, health.database.error || 'Connection string missing or invalid');
      console.warn('[CloudPlay DB Startup Notice]: Operating in resilient In-Memory + LocalStorage fallback mode.');
    }
  } catch (startupErr: any) {
    console.error('[CloudPlay DB Startup Error]: Failed to check pg pool:', startupErr.message);
  }

  // 4. Mount Modular API Routers
  app.use(authRoutes);
  app.use(curriculumRoutes);
  app.use(classroomRoutes);
  app.use(liveSessionRoutes);
  app.use(slideRoutes);
  app.use(aiRoutes);
  app.use(cronRoutes);
  app.use(databaseAdminRoutes);
  app.use(syncRoutes);

  // 5. Static Dist / Vite SPA Middleware
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Gracefully mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dạy học số Server running on http://localhost:${PORT}`);
  });
}

startServer();
