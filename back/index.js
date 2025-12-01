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

const LIME_BASE = 'https://data.lime.bike/api/partners/v2/gbfs/paris';

app.get('/lime/index', async (req, res) => {
  const cached = getCache('index');
  if (cached) return res.json(cached);

  try {
    const r = await fetch(`${LIME_BASE}/gbfs.json`);
    const data = await r.json();
    setCache('index', data, 30);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'failed to fetch lime index' });
  }
});

app.get('/lime/free_bike_status', async (req, res) => {
  // allow query param ?raw=1 to return the raw upstream response
  const raw = !!req.query.raw;
  const cached = getCache('free_bike_status');
  if (cached && !raw) return res.json(cached);

  try {
    const r = await fetch(`${LIME_BASE}/free_bike_status`);
    const data = await r.json();

    setCache('free_bike_status', data, 30);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'failed to fetch free_bike_status' });
  }
});

app.listen(PORT, () =>
  console.log(`Lime proxy running on http://localhost:${PORT}`)
);
