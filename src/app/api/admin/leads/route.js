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
  const site = await db.collection('websites').findOne({ slug: PROJECT }, { projection: { _id: 1 } });
  const query = site
    ? { $or: [{ websiteId: site._id }, { project: PROJECT }] }
    : { project: PROJECT };
  const leads = await db.collection('leads')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  return Response.json({ ok: true, leads });
}
