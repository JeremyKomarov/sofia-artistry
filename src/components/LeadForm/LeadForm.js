'use client';

import { useState } from 'react';
import { FORM_SERVICES } from '@/constants/site';
import styles from './LeadForm.module.scss';

function trackLead() {
  if (typeof window === 'undefined') return;
  if (window.gtag) window.gtag('event', 'generate_lead', { method: 'lead_form' });
  if (window.fbq) window.fbq('track', 'Lead');
}

export default function LeadForm() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const data = Object.fromEntries(new FormData(e.target));

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        trackLead();
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success} role="alert">
        <div className={styles.successIcon} aria-hidden="true">✓</div>
        <h3>We&rsquo;ll be in touch soon!</h3>
        <p>Sofia will respond within 24 hours — usually the same day.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input name="_honey" type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="f-name">Your name</label>
          <input id="f-name" name="name" type="text" autoComplete="name" placeholder="Jane Smith" required />
        </div>

        <div className={styles.field}>
          <label htmlFor="f-phone">Phone number</label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" placeholder="(310) 555-0100" required />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="f-email">Email address</label>
          <input id="f-email" name="email" type="email" autoComplete="email" placeholder="jane@email.com" />
        </div>

        <div className={styles.field}>
          <label htmlFor="f-service">Service needed</label>
          <select id="f-service" name="service">
            <option value="">Select a service...</option>
            {FORM_SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="f-date">Event date</label>
          <input id="f-date" name="date" type="date" />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="f-message">Tell me about your look</label>
          <textarea
            id="f-message"
            name="message"
            rows={3}
            placeholder="Share your vision, any inspo images, or questions you have..."
          />
        </div>

        <div className={styles.submit}>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Send My Inquiry'}
            {status !== 'submitting' && (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <p className={styles.privacy}>Your information is kept private and never shared.</p>
          {status === 'error' && (
            <p className={styles.errorMsg} role="alert">Something went wrong — please try again or call us directly.</p>
          )}
        </div>
      </div>
    </form>
  );
}
