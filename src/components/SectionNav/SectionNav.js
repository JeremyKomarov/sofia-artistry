'use client';

import { useState, useEffect, useRef } from 'react';
import { SECTION_NAV } from '@/constants/site';
import styles from './SectionNav.module.scss';

export default function SectionNav() {
  const [active, setActive] = useState('hero');
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    SECTION_NAV.forEach(({ section }) => {
      const el = document.getElementById(section);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // Collapse when clicking outside
  useEffect(() => {
    if (collapsed) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setCollapsed(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [collapsed]);

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Page sections"
    >
      <button
        className={styles.toggle}
        onClick={(e) => { e.stopPropagation(); setCollapsed(false); }}
        aria-label="Open section navigator"
      >
        &#9776;
      </button>
      <div className={styles.dots}>
        {SECTION_NAV.map(({ href, label, section }) => (
          <a
            key={section}
            href={href}
            className={`${styles.dot} ${active === section ? styles.dotActive : ''}`}
            onClick={() => setCollapsed(true)}
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
