'use client';

import { useDraft } from '@/contexts/ContentContext';
import { FINAL_CTA } from '@/constants/site';
import LeadForm from '@/components/LeadForm/LeadForm';
import styles from './FinalCta.module.scss';

export default function FinalCta() {
  const cta = useDraft('FINAL_CTA', FINAL_CTA);
  return (
    <section id="lead-form" className={styles.section} aria-labelledby="cta-title">
      <div className="container">
        <div className={styles.inner}>
          <div className={`${styles.copy} reveal`}>
            <span className={styles.eyebrow}>{cta.eyebrow}</span>
            <h2 id="cta-title">
              {cta.headline} <em>{cta.headlineEm}</em>
            </h2>
            <p>{cta.body}</p>

            <ul className={styles.trust} aria-label="Booking assurances">
              {cta.trustPoints.map((point, i) => (
                <li key={i}>
                  <span className={styles.dot} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.formWrap} reveal`} style={{ transitionDelay: '80ms' }}>
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
