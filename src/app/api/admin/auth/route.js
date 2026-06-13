'use strict';

import { cookies } from 'next/headers';
import { safeCompare, createSessionToken, checkBrute } from '@/lib/admin-auth';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (checkBrute(ip)) {
    return Response.json({ ok: false, error: 'Too many attempts — try again later' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body;
  const expected = process.env.ADMIN_PASSWORD || '';

  if (!password || !safeCompare(password, expected)) {
    return Response.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
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
