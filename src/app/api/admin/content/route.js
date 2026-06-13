'use strict';

import { cookies } from 'next/headers';
import localContent from '@/data/content.json';
import { verifySessionToken, csrfOk } from '@/lib/admin-auth';

const GH_API = 'https://api.github.com';

const ALLOWED_KEYS = new Set([
  'SITE', 'HERO', 'TRUST_ITEMS', 'SERVICES', 'GALLERY_ITEMS',
  'REVIEWS', 'ABOUT', 'PROCESS_STEPS', 'FAQ_ITEMS', 'FINAL_CTA',
  'FOOTER', 'SECTIONS',
]);

const URL_KEYS = new Set([
  'href', 'instagram', 'tiktok', 'pinterest', 'facebook',
  'youtube', 'phoneHref', 'src', 'photoSrc',
]);

const BAD_URL = /^(javascript|data|vbscript):/i;
const MAX_STR  = 5000;
const MAX_ITEMS = 100;

function sanitizeUrl(v) {
  const s = String(v ?? '').trim().slice(0, MAX_STR);
  return BAD_URL.test(s) ? '' : s;
}

function sanitizeStr(v) {
  return String(v ?? '').trim().slice(0, MAX_STR);
}

function sanitizeValue(v, key) {
  if (v === null || typeof v === 'boolean') return v;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    return URL_KEYS.has(key) ? sanitizeUrl(v) : sanitizeStr(v);
  }
  if (Array.isArray(v)) {
    return v.slice(0, MAX_ITEMS).map((item) => sanitizeValue(item, key));
  }
  if (typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v).map(([k, val]) => [k, sanitizeValue(val, k)])
    );
  }
  return null;
}

function sanitizeContent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const out = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED_KEYS.has(key)) out[key] = sanitizeValue(body[key], key);
  }
  return out;
}

function ghConfigured() {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  return !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function contentUrl() {
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_CONTENT_PATH, GITHUB_BRANCH = 'main' } = process.env;
  return `${GH_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}?ref=${GITHUB_BRANCH}`;
}

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!verifySessionToken(session?.value)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  if (!ghConfigured()) {
    return Response.json(localContent, { headers: { 'Cache-Control': 'no-store' } });
  }

  const res = await fetch(contentUrl(), { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json();
    return Response.json({ ok: false, error: err.message }, { status: res.status });
  }
  const { content } = await res.json();
  const decoded = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  return Response.json(decoded, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  if (!csrfOk(request)) {
    return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  if (!ghConfigured()) {
    return Response.json(
      { ok: false, error: 'GitHub not configured — add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to env vars to save.' },
      { status: 503 },
    );
  }

  const raw = await request.json().catch(() => null);
  const newContent = sanitizeContent(raw);
  if (!newContent) {
    return Response.json({ ok: false, error: 'Invalid content' }, { status: 400 });
  }

  const shaRes = await fetch(contentUrl(), { headers: ghHeaders(), cache: 'no-store' });
  if (!shaRes.ok) {
    return Response.json({ ok: false, error: 'Could not fetch current file from GitHub' }, { status: 500 });
  }
  const { sha } = await shaRes.json();

  const encoded = Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64');
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_CONTENT_PATH, GITHUB_BRANCH = 'main' } = process.env;

  const putRes = await fetch(
    `${GH_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}`,
    {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify({
        message: 'chore: update content via admin panel',
        content: encoded,
        sha,
        branch: GITHUB_BRANCH,
      }),
    },
  );

  if (!putRes.ok) {
    const err = await putRes.json();
    return Response.json({ ok: false, error: err.message }, { status: putRes.status });
  }
  return Response.json({ ok: true });
}
