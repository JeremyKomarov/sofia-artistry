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

    const els = document.querySelectorAll('.reveal');
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        // Already visible on load — reveal immediately
        reveal(el);
      } else {
        obs.observe(el);
      }
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
