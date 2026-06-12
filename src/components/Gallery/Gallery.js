'use client';

import { useRef, useState } from 'react';
import { useDraft } from '@/contexts/ContentContext';
import { GALLERY_ITEMS } from '@/constants/site';
import styles from './Gallery.module.scss';

export default function Gallery() {
  const galleryItems = useDraft('GALLERY_ITEMS', GALLERY_ITEMS);
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const gridRef = useRef(null);

  function animateIn(items) {
    items.forEach((item, i) => {
      item.style.transition = 'none';
      item.style.opacity = '0';
      item.style.transform = 'translateY(28px) scale(0.94)';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          item.style.transition = `opacity 540ms cubic-bezier(0.22,1,0.36,1) ${i * 110}ms, transform 540ms cubic-bezier(0.22,1,0.36,1) ${i * 110}ms`;
          item.style.opacity = '1';
          item.style.transform = 'none';
        }),
      );
    });
  }

  function animateOut(items, onDone) {
    const reversed = [...items].reverse();
    reversed.forEach((item, i) => {
      item.style.transition = `opacity 360ms cubic-bezier(0.4,0,1,1) ${i * 75}ms, transform 360ms cubic-bezier(0.4,0,1,1) ${i * 75}ms`;
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px) scale(0.94)';
    });
    setTimeout(onDone, (items.length - 1) * 75 + 360);
  }

  function getExtraVisible() {
    if (!gridRef.current) return [];
    return [...gridRef.current.querySelectorAll('[data-extra]')].filter(
      (el) => getComputedStyle(el).display !== 'none',
    );
  }

  function toggle() {
    if (animating) return;
    if (!expanded) {
      setExpanded(true);
      requestAnimationFrame(() => animateIn(getExtraVisible()));
    } else {
      setAnimating(true);
      animateOut(getExtraVisible(), () => {
        setExpanded(false);
        setAnimating(false);
        getExtraVisible().forEach((el) => {
          el.style.transition = '';
          el.style.opacity = '';
          el.style.transform = '';
        });
      });
    }
  }

  return (
    <section id="gallery" className={`bg-cream-2 ${styles.section}`} aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <span className="section-header__eyebrow">Recent Work</span>
          <h2 id="gallery-title">The work <em>speaks for itself.</em></h2>
          <p>A selection of recent looks across bridal, glam, and editorial projects. Full portfolio on Instagram.</p>
        </div>

        <div ref={gridRef} className={styles.grid}>
          {galleryItems.map((item, i) => (
            <div
              key={i}
              data-extra={item.hidden || item.mobileOnly ? true : undefined}
              className={[
                styles.item,
                item.hidden ? styles.hidden : '',
                item.mobileOnly ? styles.mobileOnly : '',
                expanded && (item.hidden || item.mobileOnly) ? styles.visible : '',
              ].join(' ')}
            >
              <div className={styles.label}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.toggleWrap}>
          <button onClick={toggle} className="btn btn-ghost" disabled={animating}>
            {expanded ? 'Show Less' : 'View More Work'}
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24" aria-hidden="true"
              style={{ transition: 'transform 250ms', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
