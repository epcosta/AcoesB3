const cache = new Map(); // key: `${ticker}:${range}:${interval}` -> { data, expiresAt }
const TTL_MS = Number(process.env.CACHE_TTL_MS) || 5 * 60 * 1000; // 5 min
const TIMEOUT_MS = 8000;

async function fetchQuote(ticker, { range = 'ytd', interval = '1d' } = {}) {
  const key = `${ticker}:${range}:${interval}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const url = `https://brapi.dev/api/quote/${ticker}?range=${range}&interval=${interval}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`brapi respondeu ${res.status}`);

    const json = await res.json();
    const result = json?.results?.[0];
    if (!result || !Array.isArray(result.historicalDataPrice)) {
      throw new Error('formato inesperado da brapi.dev');
    }

    cache.set(key, { data: result, expiresAt: Date.now() + TTL_MS });
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchQuote };
