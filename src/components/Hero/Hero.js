'use client';

import { useDraft } from '@/contexts/ContentContext';
import { HERO } from '@/constants/site';
import styles from './Hero.module.scss';

export default function Hero() {
  const hero = useDraft('HERO', HERO);
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {hero.eyebrow}
        </div>

        <h1 id="hero-title" className={styles.title}>
          Where beauty<br />
          becomes <em>{hero.headlineEm}</em>
        </h1>

        <p className={styles.sub}>{hero.sub}</p>

        <div className={styles.ctas}>
          <a href="#lead-form" className="btn btn-primary">
            {hero.ctaPrimary}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#gallery" className="btn btn-ghost-rose">{hero.ctaSecondary}</a>
        </div>

        <div className={styles.proof} aria-label="Social proof">
          {hero.proof.map((item, i) => (
            <>
              {i > 0 && <span key={`div-${i}`} className={styles.divider} aria-hidden="true" />}
              <span key={i}><strong>{item.value}</strong> {item.label}</span>
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
