'use client';

import { useState } from 'react';
import { FAQ_ITEMS } from '@/constants/site';
import styles from './Faq.module.scss';

export default function Faq() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className={`bg-cream ${styles.section}`} aria-labelledby="faq-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <span className="section-header__eyebrow">Questions</span>
          <h2 id="faq-title">Everything you need <em>to know.</em></h2>
        </div>

        <div className={`${styles.list} reveal`}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
              <button
                className={styles.trigger}
                onClick={() => toggle(i)}
                aria-expanded={open === i}
              >
                {item.q}
                <span className={styles.chevron} aria-hidden="true">▼</span>
              </button>
              <div className={styles.answer} aria-hidden={open !== i}>
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
