'use client';

import { useDraft } from '@/contexts/ContentContext';
import { SITE, FOOTER } from '@/constants/site';
import { SOCIALS } from './socials';
import styles from './Footer.module.scss';

const BAD_HREF = /^(javascript|data|vbscript):/i;
function safeHref(href) {
  return (!href || BAD_HREF.test(String(href).trim())) ? '#' : href;
}

export default function Footer() {
  const site = useDraft('SITE', SITE);
  const footer = useDraft('FOOTER', FOOTER);
  const year = new Date().getFullYear();
  const socials = SOCIALS.filter(({ key }) => site[key]);

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              {site.name}
              <span>{footer.brandLine}</span>
            </div>
            <address className={styles.nap}>
              Available throughout {site.serviceArea}<br />
              <a href={safeHref(site.phoneHref)}>{site.phone}</a><br />
              <a href={safeHref(`mailto:${site.email}`)}>{site.email}</a><br />
              {site.hours}
            </address>
            {socials.length > 0 && (
              <div className={styles.social} aria-label="Social media">
                {socials.map(({ key, label, path }) => (
                  <a key={key} href={safeHref(site[key])} rel="noopener noreferrer" target="_blank" aria-label={label}>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {footer.cols.map((col) => (
            <div key={col.heading} className={styles.col}>
              <h4>{col.heading}</h4>
              <ul className={styles.links}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={safeHref(l.href)} {...(l.external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <span>&copy; {year} {site.name}. All rights reserved.</span>
          <div className={styles.legal}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
