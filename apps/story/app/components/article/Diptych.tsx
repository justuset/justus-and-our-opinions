// Diptych: two photos side by side from 740px, stacked on phones, one credit under both. Reference props:
// className, size, mobileColumns. mobileColumns 2 keeps the pair side by side on phones too.
import { Credit } from './Credit';
import { ResponsiveImage } from './ResponsiveImage';
import type { DiptychBlock } from '~/article/types';
import styles from './Diptych.module.css';

type Props = DiptychBlock & { mobileColumns?: 1 | 2; className?: string };

export function Diptych({ imageLeft, imageRight, credit, mobileColumns = 1, className = '' }: Props) {
  return (
    <figure className={`${styles.diptych} ${className}`} data-testid="diptych">
      <div className={styles.pair} data-mobile-columns={mobileColumns}>
        <ResponsiveImage media={imageLeft} slot="half" loading="lazy" className={styles.img} />
        <ResponsiveImage media={imageRight} slot="half" loading="lazy" className={styles.img} />
      </div>
      {credit && (
        <figcaption className={styles.caption}>
          <Credit>{credit}</Credit>
        </figcaption>
      )}
    </figure>
  );
}
