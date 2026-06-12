'use strict';

import { Resend } from 'resend';

const TO_EMAIL = process.env.LEAD_TO_EMAIL || 'hello@sofiaartistry.com';

const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const last = rateMap.get(ip) || 0;
  if (now - last < 60_000) return true;
  rateMap.set(ip, now);
  return false;
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json();
  const { name, phone, email, service, date, message, _honey } = body;

  if (_honey) return Response.json({ ok: true }); // honeypot

  if (!name?.trim() || !phone?.trim()) {
    return Response.json({ ok: false, error: 'Name and phone are required' }, { status: 400 });
  }
  if (!/^[\d\s()+-]{7,}$/.test(phone.trim())) {
    return Response.json({ ok: false, error: 'Invalid phone number' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Sofia Artistry <leads@sofiaartistry.com>',
    to: TO_EMAIL,
    replyTo: email || undefined,
    subject: `New inquiry: ${name.trim()} — ${phone.trim()}`,
    text: [
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      email ? `Email: ${email.trim()}` : '',
      service ? `Service: ${service}` : '',
      date ? `Date: ${date}` : '',
      message ? `\nMessage:\n${message.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  return Response.json({ ok: true });
}
