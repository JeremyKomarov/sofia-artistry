'use strict';
import { cookies } from 'next/headers';
import { checkBrute, verifyCredentials, createSessionToken, hasProjectAccess } from '@/lib/admin-auth';

const PROJECT = process.env.NEXT_PUBLIC_PROJECT_SLUG;

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (checkBrute(ip)) {
    return Response.json({ ok: false, error: 'Too many attempts — try again later' }, { status: 429 });
  }
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }
  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (err) {
    console.error('Auth error:', err);
    return Response.json({ ok: false, error: 'Service unavailable — try again shortly' }, { status: 503 });
  }
  if (!user) {
    return Response.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }
  if (!hasProjectAccess(user, PROJECT)) {
    return Response.json({ ok: false, error: 'Access denied' }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.set('admin_session', createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });
  return Response.json({ ok: true, role: user.role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { maxAge: 0, path: '/' });
  return Response.json({ ok: true });
}
