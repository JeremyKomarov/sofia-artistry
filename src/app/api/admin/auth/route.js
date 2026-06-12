'use strict';

import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

function safeCompare(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!password || !safeCompare(password, expected)) {
    return Response.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set('admin_session', expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { maxAge: 0, path: '/' });
  return Response.json({ ok: true });
}
