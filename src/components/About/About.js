'use client';

import { useDraft } from '@/contexts/ContentContext';
import { ABOUT } from '@/constants/site';
import styles from './About.module.scss';

export default function About() {
  const about = useDraft('ABOUT', ABOUT);
  return (
    <section id="about" className={`bg-cream-2 ${styles.section}`} aria-labelledby="about-title">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.photoWrap}>
            <div className={`${styles.photo} reveal`} role="img" aria-label={about.photoAlt}>
              <span className={styles.photoPlaceholder}>[Photo of Sofia — 3:4 portrait]</span>
            </div>
            <div className={styles.credential}>
              <div className={styles.credentialIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className={styles.credentialText}>
                <strong>{about.credential.title}</strong>
                <span>{about.credential.subtitle}</span>
              </div>
            </div>
          </div>

          <div className={`${styles.content} reveal`} style={{ transitionDelay: '100ms' }}>
            <span className="section-header__eyebrow">{about.eyebrow}</span>
            <h2 id="about-title">
              {about.headline} <em>{about.headlineEm}</em>
            </h2>

            {about.bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <ul className={styles.list} aria-label="Credentials">
              {about.credentials.map((item, i) => (
                <li key={i}>
                  <span className={styles.check} aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a href="#lead-form" className={`btn btn-primary ${styles.cta}`}>{about.cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
