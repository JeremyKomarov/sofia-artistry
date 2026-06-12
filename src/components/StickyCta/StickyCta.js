import { SITE } from '@/constants/site';
import styles from './StickyCta.module.scss';

export default function StickyCta() {
  return (
    <div className={styles.bar} aria-label="Quick booking">
      <a href={SITE.phoneHref} className={`btn btn-ghost ${styles.btn}`}>Call Sofia</a>
      <a href="#lead-form" className={`btn btn-primary ${styles.btn}`}>Book Now</a>
    </div>
  );
}
