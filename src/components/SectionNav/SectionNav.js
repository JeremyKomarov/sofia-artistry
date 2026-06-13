'use client';

import { useState, useEffect } from 'react';
import { useDraft } from '@/contexts/ContentContext';
import { SECTION_NAV, SECTIONS } from '@/constants/site';
import styles from './SectionNav.module.scss';

export default function SectionNav() {
  const sections = useDraft('SECTIONS', SECTIONS);
  const items = SECTION_NAV.filter(({ section, key }) => sections[key ?? section] !== false);
  const visibleKey = items.map(({ section }) => section).join();

  const [active, setActive] = useState('hero');
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    visibleKey.split(',').forEach((section) => {
      const el = document.getElementById(section);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [visibleKey]);

  return (
    <nav
      className={`${styles.nav} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Page sections"
    >
      {/* Open — visible only when collapsed */}
      <button
        className={styles.toggle}
        onClick={() => setCollapsed(false)}
        aria-label="Open section navigator"
      >
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <line x1="1" y1="1.5" x2="13" y2="1.5" />
          <line x1="1" y1="5.5" x2="13" y2="5.5" />
          <line x1="1" y1="9.5" x2="13" y2="9.5" />
        </svg>
      </button>

      {/* Close — top of expanded nav */}
      <button
        className={styles.close}
        onClick={() => setCollapsed(true)}
        aria-label="Close section navigator"
      >
        <svg width="6" height="6" viewBox="0 0 8 8" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
          <line x1="1" y1="1" x2="7" y2="7" />
          <line x1="7" y1="1" x2="1" y2="7" />
        </svg>
      </button>

      {/* Nav dots */}
      <div className={styles.dots}>
        {items.map(({ href, label, section }) => (
          <a
            key={section}
            href={href}
            className={`${styles.dot} ${active === section ? styles.dotActive : ''}`}
            aria-label={label}
          >
            <span className={styles.label}>{label}</span>
            <span className={styles.pip} />
          </a>
        ))}
      </div>
    </nav>
  );
}
