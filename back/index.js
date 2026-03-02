import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 13001;

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
};

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

app.listen(PORT, () =>
  console.log(`Bike-tracker proxy running on http://localhost:${PORT}`),
);
