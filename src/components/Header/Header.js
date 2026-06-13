'use client';

import { useState, useEffect } from 'react';
import { useDraft } from '@/contexts/ContentContext';
import { SITE, NAV_LINKS, SECTIONS } from '@/constants/site';
import styles from './Header.module.scss';

export default function Header() {
  const site = useDraft('SITE', SITE);
  const sections = useDraft('SECTIONS', SECTIONS);
  const links = NAV_LINKS.filter((link) => sections[link.href.slice(1)] !== false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} aria-label="Main navigation">
      <div className={styles.inner}>
        <a href="#" className={styles.logo} onClick={close}>
          {site.name}
          <span>{site.tagline}</span>
        </a>

        <ul className={`${styles.links} ${open ? styles.linksOpen : ''}`} role="list">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={close}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <a href={site.phoneHref} className={styles.phone}>{site.phone}</a>
          <a href="#lead-form" className="btn btn-primary" onClick={close}>Book Now</a>
        </div>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
