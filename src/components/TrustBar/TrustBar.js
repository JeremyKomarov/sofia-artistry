import { TRUST_ITEMS } from '@/constants/site';
import styles from './TrustBar.module.scss';

const ICONS = [
  // star
  <path key="star" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  // person
  <path key="person" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  // calendar
  <><rect key="cal-rect" x="3" y="4" width="18" height="18" rx="2" /><path key="cal-path" d="M16 2v4M8 2v4M3 10h18" /></>,
  // map pin
  <><path key="pin" d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle key="pin-dot" cx="12" cy="10" r="3" /></>,
];

export default function TrustBar() {
  return (
    <div className={styles.trustBar} aria-label="Why clients trust Sofia">
      <div className={styles.inner}>
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className={`${styles.item} reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className={styles.icon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {ICONS[i]}
              </svg>
            </div>
            <div className={styles.text}>
              <span className={styles.value}>{item.value}</span>
              <span className={styles.label}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
