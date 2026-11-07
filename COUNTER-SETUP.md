# A real, shared counter and review wall — setup

Your site is static (GitHub Pages), so there is nowhere for a shared number or
a shared review to live. This gives you one: a small Cloudflare Worker with a
key-value store. Free, no credit card, about 5 minutes.

When it is running:

- every page load from every visitor anywhere adds 1 to the same view total
- every like adds 1 to the same total
- every review is stored once and shown to everyone

Exactly like YouTube, except you own it.

---

## 1. Install wrangler

You need Node.js installed. Then:

```
npm install -g wrangler
```

## 2. Log in to Cloudflare

```
wrangler login
```

A browser window opens. Make a free account if you do not have one, and approve.

## 3. Create the storage

```
wrangler kv namespace create COUNTER
```

It prints something like:

```
[[kv_namespaces]]
binding = "COUNTER"
id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
```

Copy that **id**.

## 4. Fill in wrangler.toml

Open `wrangler.toml` (next to this file) and paste your id where it says
`PASTE_YOUR_KV_ID_HERE`.

## 5. Deploy

```
wrangler deploy
```

It prints a URL like:

```
https://shrestha-counter.your-name.workers.dev
```

That URL is your backend. Open it in a browser — you should see a number.

## 6. Point the site at it

Open `ui.js` and find these two lines:

```js
const COUNTER_URL = '';
const REVIEW_URL = '';
```

Put your worker URL in both:

```js
const COUNTER_URL = 'https://shrestha-counter.your-name.workers.dev';
const REVIEW_URL  = 'https://shrestha-counter.your-name.workers.dev';
```

Save, commit, push. That is it.

---

## What each one does

**Views** — the page calls `?key=views&hit=1` on every load. Every visit
counts, including repeat visits from the same person.

**Likes** — the page calls `?key=likes&hit=1` when someone taps the heart.
Likes only ever go up on the server; un-liking clears the heart on that device
but does not lower the shared total.

**Reviews** — `POST ?review=1` with `{name, stars, text}` stores one review and
returns the whole list. `GET ?reviews=1` reads the list. The newest 100 are
kept, HTML is stripped out of anything people type, and stars are clamped
between 1 and 5.

Until you set `REVIEW_URL`, reviews are saved on each visitor's own device and
the form says "kept on this device" underneath. Once it is set, that changes to
"shared with everyone".

## Checking it works

1. Open the site on your phone. Note the view number.
2. Open it on your laptop, or in a private window. It should be one higher.
3. Leave a review on one device, then refresh the other. It should be there.

## If something goes wrong

- **Number stuck at 0** — the URL in `ui.js` is wrong, or you have not
  redeployed the site after changing it.
- **CORS error in the console** — make sure you deployed this exact file; the
  `Access-Control-Allow-Origin` header is what lets the browser read it.
- **Reviews show for me but not for others** — `REVIEW_URL` is still empty, so
  they are local. Set it and redeploy.

## Why not a free public counter?

There are services that do this with no setup. They work, until they shut down —
several popular ones have. A worker you own cannot be switched off by anyone
else, and the free tier is 100,000 requests a day, which you will never reach.
