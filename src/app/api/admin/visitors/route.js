'use strict';
import { cookies } from 'next/headers';
import { verifySessionToken, hasProjectAccess } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongo';

const PROJECT = process.env.NEXT_PUBLIC_PROJECT_SLUG;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const user = verifySessionToken(token);
  if (!user || !hasProjectAccess(user, PROJECT)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const db = await getDb();
  const visitors = await db.collection('visitors')
    .find({ project: PROJECT })
    .sort({ enteredAt: -1 })
    .limit(200)
    .toArray();
  return Response.json({ ok: true, visitors });
}
