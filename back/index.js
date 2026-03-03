import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 13001;

// ── Security ───────────────────────────────────────────────────────

// Helmet: secure HTTP headers
app.use(helmet());

// Disable X-Powered-By (also done by helmet, belt & suspenders)
app.disable('x-powered-by');

// CORS: restrict origins in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null; // null = allow all in dev

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, same-origin)
      if (!origin) return callback(null, true);
      if (!ALLOWED_ORIGINS) return callback(null, true); // dev: allow all
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET'],
    optionsSuccessStatus: 200,
  }),
);

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

const PORT_NUM = Number(PORT);

// Simple in-memory cache - { data, expiresAt }
const cache = new Map();

function setCache(key, data, ttlSeconds = 30) {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}
function getCache(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    cache.delete(key);
    return null;
  }
  return e.data;
}

// ── Provider configs ───────────────────────────────────────────────

const PROVIDERS = {
  lime: {
    base: 'https://data.lime.bike/api/partners/v2/gbfs/paris',
    gbfs: '/gbfs.json',
    freeBikes: '/free_bike_status',
  },
  voi: {
    base: 'https://api.voiapp.io/gbfs/fr/6bb6b5dc-1cda-4da7-9216-d3023a0bc54a/v2/352',
    gbfs: '/gbfs.json',
    freeBikes: '/free_bike_status.json',
  },
  dott: {
    base: 'https://gbfs.api.ridedott.com/public/v2/paris',
    gbfs: '/gbfs.json',
    freeBikes: '/free_bike_status.json',
  },
};

const VALID_PROVIDERS = new Set(Object.keys(PROVIDERS));

// ── Health check ───────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Generic routes per provider ────────────────────────────────────

for (const [name, cfg] of Object.entries(PROVIDERS)) {
  app.get(`/${name}/index`, async (_req, res) => {
    const cacheKey = `${name}_index`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    try {
      const r = await fetch(`${cfg.base}${cfg.gbfs}`);
      const data = await r.json();
      setCache(cacheKey, data, 30);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: `failed to fetch ${name} index` });
    }
  });

  app.get(`/${name}/free_bike_status`, async (req, res) => {
    const raw = !!req.query.raw;
    const cacheKey = `${name}_free_bike_status`;
    const cached = getCache(cacheKey);
    if (cached && !raw) return res.json(cached);

    try {
      const r = await fetch(`${cfg.base}${cfg.freeBikes}`);
      const data = await r.json();
      setCache(cacheKey, data, 30);
      res.json(data);
    } catch (err) {
      console.error(err);
      res
        .status(502)
        .json({ error: `failed to fetch ${name} free_bike_status` });
    }
  });
}

// ── 404 handler ────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ──────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: origin not allowed' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT_NUM, () =>
  console.log(`Bike-tracker proxy running on http://localhost:${PORT_NUM}`),
);
