'use client';
import { useEffect, useRef } from 'react';

export default function SessionTracker() {
  const sessionId = useRef(null);
  const startTime = useRef(null);
  const currentSection = useRef('top');
  const clicks = useRef([]);
  const sent = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    if (new URLSearchParams(window.location.search).get('preview')) return;

    sessionId.current = crypto.randomUUID();
    startTime.current = Date.now();

    const params = new URLSearchParams(window.location.search);

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId.current,
        event: 'enter',
        referrer: document.referrer || null,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }),
    }).catch(() => {});

    // Track which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) currentSection.current = entry.target.id;
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));

    // Track meaningful clicks
    function onClick(e) {
      const el = e.target.closest('a, button, [role="button"]');
      if (!el) return;
      const text = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 50);
      if (!text) return;
      clicks.current.push({
        label: text,
        section: currentSection.current,
        ts: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
    document.addEventListener('click', onClick);

    // Send exit data — use sendBeacon so it fires reliably on tab close
    function sendExit() {
      if (sent.current) return;
      sent.current = true;
      navigator.sendBeacon(
        '/api/track',
        new Blob(
          [JSON.stringify({
            sessionId: sessionId.current,
            event: 'exit',
            duration: Math.round((Date.now() - startTime.current) / 1000),
            exitSection: currentSection.current,
            clicks: clicks.current,
          })],
          { type: 'application/json' }
        )
      );
    }

    document.addEventListener('visibilitychange', () => { if (document.hidden) sendExit(); });
    window.addEventListener('pagehide', sendExit);

    return () => {
      document.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }, []);

  return null;
}
