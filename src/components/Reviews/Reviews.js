'use client';

import { useDraft } from '@/contexts/ContentContext';
import { REVIEWS } from '@/constants/site';
import styles from './Reviews.module.scss';

export default function Reviews() {
  const reviews = useDraft('REVIEWS', REVIEWS);
  return (
    <section id="reviews" className={`bg-white ${styles.section}`} aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <span className="section-header__eyebrow">Client Love</span>
          <h2 id="reviews-title">What my clients <em>say.</em></h2>
        </div>

        <div className={styles.grid}>
          {reviews.map((r, i) => (
            <div key={r.name} className={`${styles.card} reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.stars} aria-label={`${r.stars} out of 5 stars`}>{'★'.repeat(r.stars)}</div>
              <div className={styles.mark} aria-hidden="true">&ldquo;</div>
              <p className={styles.body}>{r.body}</p>
              <div className={styles.author}>
                <div className={styles.avatar} aria-hidden="true">{r.initial}</div>
                <div>
                  <div className={styles.name}>{r.name}</div>
                  <div className={styles.role}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
