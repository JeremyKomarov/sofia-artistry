'use client';

import { useDraft } from '@/contexts/ContentContext';
import { SITE } from '@/constants/site';
import styles from './StickyCta.module.scss';

export default function StickyCta() {
  const site = useDraft('SITE', SITE);
  return (
    <div className={styles.bar} aria-label="Quick booking">
      <a href={site.phoneHref} className={`btn btn-ghost ${styles.btn}`}>
        <span className={styles.label}>Call {site.name}</span>
      </a>
      <a href="#lead-form" className={`btn btn-primary ${styles.btn}`}>Book Now</a>
    </div>
  );
}
