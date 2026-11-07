// Visit counter + reviews for shresthaxcoder.github.io
//
// A tiny Cloudflare Worker with a key-value store. It does two jobs:
//
//   1. Counts views and likes for every visitor, everywhere.
//   2. Stores reviews: a name, a star rating and an optional note.
//
// Deploy instructions are in COUNTER-SETUP.md next to this file.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store'
};

function json(value) {
  return new Response(JSON.stringify({ value: value }), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function clean(value, max) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    /* ---------- reviews ---------- */
    if (url.searchParams.get('reviews') === '1') {
      const raw = await env.COUNTER.get('reviews');
      let list = [];
      try { list = JSON.parse(raw || '[]'); } catch (e) { list = []; }
      if (!Array.isArray(list)) { list = []; }
      return json(list);
    }

    if (url.searchParams.get('review') === '1' && request.method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch (e) { body = {}; }

      const stars = Math.max(1, Math.min(5, parseInt(body.stars, 10) || 5));
      const review = {
        name: clean(body.name, 24) || 'Someone',
        stars: stars,
        text: clean(body.text, 240),
        ts: Date.now()
      };

      const raw = await env.COUNTER.get('reviews');
      let list = [];
      try { list = JSON.parse(raw || '[]'); } catch (e) { list = []; }
      if (!Array.isArray(list)) { list = []; }

      list.unshift(review);
      list = list.slice(0, 100);
      await env.COUNTER.put('reviews', JSON.stringify(list));
      return json(list);
    }

    /* ---------- counters ---------- */
    const raw = url.searchParams.get('key') || 'site';
    const key = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'site';
    const shouldHit = url.searchParams.get('hit') === '1';

    let count = parseInt((await env.COUNTER.get('n:' + key)) || '0', 10);
    if (!isFinite(count) || count < 0) {
      count = 0;
    }

    if (shouldHit) {
      count = count + 1;
      await env.COUNTER.put('n:' + key, String(count));
    }

    return json(count);
  }
};
