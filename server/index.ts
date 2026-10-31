import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeSchema } from './db/connection';
import { seedDatabase } from './db/seed';

import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { plansRouter } from './routes/plans.routes';
import { quotationsRouter } from './routes/quotations.routes';
import { subscriptionsRouter } from './routes/subscriptions.routes';
import { invoicesRouter } from './routes/invoices.routes';
import { discountsRouter } from './routes/discounts.routes';
import { paymentsRouter } from './routes/payments.routes';
import { financeRouter } from './routes/finance.routes';

// Ensure database schema and seed data are initialized
initializeSchema();
seedDatabase(false);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Brightloop Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'SQLite (node:sqlite) Connected',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/finance', financeRouter);

// 404 handler for unknown API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Serve production static frontend if built in dist/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 Brightloop Enterprise Backend API Server Live        ║
║   ➜ Listening on:  http://localhost:${PORT}/api             ║
║   ➜ Health Check:  http://localhost:${PORT}/api/health      ║
║   ➜ Database:      SQLite (node:sqlite engine)            ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful process termination
process.on('SIGINT', () => {
  console.log('\nClosing Brightloop API server...');
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
});
