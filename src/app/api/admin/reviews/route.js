'use strict';

import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/admin-auth';

async function isAuthed() {
  const store = await cookies();
  const session = store.get('admin_session');
  return verifySessionToken(session?.value);
}

export async function GET() {
  if (!await isAuthed()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey  = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId || !apiKey) {
    return Response.json(
      { error: 'Missing GOOGLE_PLACE_ID or GOOGLE_PLACES_API_KEY in environment' },
      { status: 500 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${apiKey}`;
  const res  = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (data.status !== 'OK') {
    return Response.json({ error: `Google API: ${data.status}` }, { status: 502 });
  }

  const reviews = (data.result?.reviews ?? []).map((r) => ({
    stars:   r.rating,
    body:    String(r.text ?? '').slice(0, 2000),
    name:    String(r.author_name ?? '').slice(0, 200),
    role:    String(r.relative_time_description ?? '').slice(0, 100),
    initial: r.author_name?.[0]?.toUpperCase() ?? '?',
  }));

  return Response.json(reviews);
}
