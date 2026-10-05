// MediaFigure: a photo with its caption and credit. The reference uses it for the lead photo, every ImageBlock and
// each half of a Diptych. Props named after the reference: media, size, isFullBleed, className.
import { Credit } from './Credit';
import { ResponsiveImage } from './ResponsiveImage';
import type { Image } from '~/article/types';
import styles from './MediaFigure.module.css';

interface Props {
  media: Image;
  size?: 'LARGE' | 'MEDIUM';
  /** The lead photo loads first: no lazy loading, high fetch priority. */
  isLead?: boolean;
  className?: string;
}

export function MediaFigure({ media, size = 'LARGE', isLead = false, className = '' }: Props) {
  const large = size === 'LARGE';
  return (
    <figure className={`${styles.figure} ${large ? styles.large : styles.medium} ${className}`} data-size={size}>
      <ResponsiveImage
        media={media}
        slot={large ? 'large' : 'medium'}
        className={styles.img}
        loading={isLead ? 'eager' : 'lazy'}
        fetchPriority={isLead ? 'high' : undefined}
      />
      {(media.caption || media.credit) && (
        <figcaption className={styles.caption}>
          {media.caption}
          <Credit>{media.credit}</Credit>
        </figcaption>
      )}
    </figure>
  );
}
