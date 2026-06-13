'use strict';
import { getDb } from '@/lib/mongo';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROJECT = process.env.NEXT_PUBLIC_PROJECT_SLUG || 'sofia-artistry';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !UUID_RE.test(body.sessionId)) {
    return new Response(null, { status: 204 });
  }

  const db = await getDb();

  if (body.event === 'enter') {
    await db.collection('visitors').insertOne({
      project: PROJECT,
      sessionId: body.sessionId,
      enteredAt: new Date(),
      referrer: body.referrer || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      device: body.device || null,
    });
  } else if (body.event === 'exit') {
    await db.collection('visitors').updateOne(
      { sessionId: body.sessionId },
      {
        $set: {
          exitedAt: new Date(),
          duration: typeof body.duration === 'number' ? body.duration : null,
          exitSection: body.exitSection || null,
          clicks: Array.isArray(body.clicks) ? body.clicks.slice(0, 50) : [],
        },
      }
    );
  }

  return new Response(null, { status: 204 });
}
