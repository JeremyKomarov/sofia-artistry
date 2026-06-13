'use strict';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongo';

async function requireDev() {
  const store = await cookies();
  const token = store.get('admin_session')?.value;
  const user = verifySessionToken(token);
  if (!user || user.role !== 'dreamrise_dev') return null;
  return user;
}

export async function GET() {
  if (!await requireDev()) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const db = await getDb();

  const [websites, users] = await Promise.all([
    db.collection('websites').find({}).sort({ createdAt: -1 }).toArray(),
    db.collection('users').find({ role: 'company_admin' }, { projection: { email: 1, websiteId: 1 } }).toArray(),
  ]);

  // Build websiteId → admin email map
  const emailByWebsiteId = {};
  for (const u of users) {
    if (u.websiteId) emailByWebsiteId[u.websiteId.toString()] = u.email;
  }

  const result = websites.map((w) => ({
    ...w,
    adminEmail: emailByWebsiteId[w._id.toString()] ?? null,
  }));

  return Response.json({ ok: true, websites: result });
}
