'use client';

import { useDraft } from '@/contexts/ContentContext';
import { SERVICES } from '@/constants/site';
import styles from './Services.module.scss';

export default function Services() {
  const services = useDraft('SERVICES', SERVICES);
  return (
    <section id="services" className={`bg-cream ${styles.section}`} aria-labelledby="services-title">
      <div className="container">
        <div className={`section-header section-header--center reveal`}>
          <span className="section-header__eyebrow">What I offer</span>
          <h2 id="services-title">Every look, <em>tailored to you.</em></h2>
          <p>
            From your wedding morning to the editorial shoot floor — Sofia brings
            professional-grade artistry directly to you, wherever you need it.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((svc, i) => (
            <div key={svc.title} className={`${styles.card} reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.photo} style={{ background: svc.photoGradient }}>
                <span className={styles.photoLabel}>{svc.photoLabel}</span>
              </div>
              <div className={styles.body}>
                <span className={styles.tag}>{svc.tag}</span>
                <h3>{svc.title}</h3>
                <p>{svc.description}</p>
              </div>
              <div className={styles.footer}>
                <div className={styles.price}>
                  {svc.price} <span>/ {svc.duration}</span>
                </div>
                <a href="#lead-form" className="btn-link">{svc.ctaText}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
