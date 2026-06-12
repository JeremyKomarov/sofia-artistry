import { SITE, FOOTER_LINKS } from '@/constants/site';
import styles from './Footer.module.scss';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              {SITE.name}
              <span>Makeup Artist</span>
            </div>
            <address className={styles.nap}>
              Available throughout {SITE.serviceArea}<br />
              <a href={SITE.phoneHref}>{SITE.phone}</a><br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a><br />
              {SITE.hours}
            </address>
            <div className={styles.social} aria-label="Social media">
              <a href={SITE.instagram} rel="noopener" target="_blank" aria-label="Instagram">IG</a>
              <a href={SITE.tiktok} rel="noopener" target="_blank" aria-label="TikTok">TK</a>
              <a href={SITE.pinterest} rel="noopener" target="_blank" aria-label="Pinterest">PT</a>
            </div>
          </div>

          <div className={styles.col}>
            <h4>Services</h4>
            <ul className={styles.links}>
              {FOOTER_LINKS.services.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Studio</h4>
            <ul className={styles.links}>
              {FOOTER_LINKS.studio.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Book</h4>
            <ul className={styles.links}>
              {FOOTER_LINKS.book.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...(l.external ? { rel: 'noopener', target: '_blank' } : {})}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; {year} {SITE.name}. All rights reserved.</span>
          <div className={styles.legal}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
