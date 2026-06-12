'use client';

import { useDraft } from '@/contexts/ContentContext';
import { PROCESS_STEPS } from '@/constants/site';
import styles from './Process.module.scss';

export default function Process() {
  const steps = useDraft('PROCESS_STEPS', PROCESS_STEPS);
  return (
    <section id="process" className={`bg-white ${styles.section}`} aria-labelledby="process-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <span className="section-header__eyebrow">How it works</span>
          <h2 id="process-title">Three steps to <em>your best look.</em></h2>
          <p>Simple, personal, and completely focused on you.</p>
        </div>

        <div className={styles.grid}>
          {steps.map((step, i) => (
            <div key={step.num} className={`${styles.step} reveal`} style={{ transitionDelay: `${i * 130}ms` }}>
              <div className={styles.num} aria-hidden="true">{step.num}</div>
              <div className={styles.numLabel}>{step.label}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.ctaWrap} reveal`}>
          <a href="#lead-form" className="btn btn-primary">Book Your Session</a>
        </div>
      </div>
    </section>
  );
}
