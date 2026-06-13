'use strict';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDb } from './mongo.js';

const _bruteMap = new Map();

export function checkBrute(ip) {
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const entry = _bruteMap.get(ip) || { count: 0, resetAt: now + WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW; }
  entry.count++;
  _bruteMap.set(ip, entry);
  return entry.count > 10;
}

export async function verifyCredentials(email, password) {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  await db.collection('users').updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

  let websiteSlug = null;
  if (user.role === 'company_admin' && user.websiteId) {
    const site = await db.collection('websites').findOne(
      { _id: new ObjectId(user.websiteId) },
      { projection: { slug: 1 } }
    );
    websiteSlug = site?.slug ?? null;
  }

  return { id: user._id.toString(), role: user.role, websiteSlug };
}

export function hasProjectAccess(userPayload, projectSlug) {
  if (userPayload.role === 'dreamrise_dev') return true;
  return userPayload.websiteSlug === projectSlug;
}

function _sign(payload) {
  return createHmac('sha256', process.env.ADMIN_SECRET || '')
    .update(payload).digest('base64url');
}

// Token format: ts|userId|role|websiteSlug|sig
// websiteSlug is empty string for dreamrise_dev
export function createSessionToken(user) {
  const ts = Date.now().toString(36);
  const slug = user.websiteSlug || '';
  const payload = `${ts}|${user.id}|${user.role}|${slug}`;
  return `${payload}|${_sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const lastPipe = token.lastIndexOf('|');
  if (lastPipe < 1) return null;
  const payload = token.slice(0, lastPipe);
  const sig = token.slice(lastPipe + 1);
  const expected = _sign(payload);
  const ha = createHash('sha256').update(sig).digest();
  const hb = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(ha, hb)) return null;
  const [ts, userId, role, websiteSlug] = payload.split('|');
  const ageMs = Date.now() - parseInt(ts, 36);
  if (ageMs < 0 || ageMs >= 86_400_000) return null;
  return { userId, role, websiteSlug: websiteSlug || null };
}

export function csrfOk(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('host');
  try { return new URL(origin).host === host; } catch { return false; }
}
