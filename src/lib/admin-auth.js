'use strict';

import { createHash, createHmac, timingSafeEqual } from 'crypto';

// ── Brute-force guard (in-memory, per process) ────────────────────────
const _bruteMap = new Map();

export function checkBrute(ip) {
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000; // 15 min
  const entry = _bruteMap.get(ip) || { count: 0, resetAt: now + WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW; }
  entry.count++;
  _bruteMap.set(ip, entry);
  return entry.count > 10;
}

// ── Timing-safe string comparison ────────────────────────────────────
export function safeCompare(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

// ── Signed session token (stateless, survives serverless restarts) ────
// Format: <timestamp_base36>.<hmac_base64url>
function _sign(ts) {
  return createHmac('sha256', process.env.ADMIN_PASSWORD || '')
    .update(ts)
    .digest('base64url');
}

export function createSessionToken() {
  const ts = Date.now().toString(36);
  return `${ts}.${_sign(ts)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const ts  = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = _sign(ts);
  // Compare via double-hash to guarantee equal buffer lengths
  const ha = createHash('sha256').update(sig).digest();
  const hb = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(ha, hb)) return false;
  const ageMs = Date.now() - parseInt(ts, 36);
  return ageMs >= 0 && ageMs < 86_400_000; // valid for 24 h
}

// ── CSRF guard ────────────────────────────────────────────────────────
// Rejects requests where Origin header is present but doesn't match host.
export function csrfOk(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser / same-origin without explicit Origin
  const host = request.headers.get('host');
  try { return new URL(origin).host === host; } catch { return false; }
}
