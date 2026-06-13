'use client';

import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    const reveal = (el) => {
      el.classList.add('in-view');
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    );

    const attach = (el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        // Already in viewport — reveal immediately
        reveal(el);
      } else {
        obs.observe(el);
      }
    };

    document.querySelectorAll('.reveal').forEach(attach);

    // Watch for sections (re)mounted later, e.g. toggled visible in admin
    const mo = new MutationObserver(() => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(attach);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
