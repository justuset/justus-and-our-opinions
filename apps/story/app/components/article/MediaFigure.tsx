// MediaFigure: a photo with its caption and credit. The reference uses it for the lead photo, every ImageBlock and
// each half of a Diptych (one whole figure per half). Props named after the reference: media, size, className.
//
// Markup follows the reference: div[data-testid=imageblock-wrapper] > figure > img + figcaption
// [data-testid=photoviewer-children-caption]. Two deliberate differences: the figure keeps its native role (the
// reference overrides it with role="group" aria-label="media"), and there's no hidden "Image" label before the photo
// (a screen reader already announces an image with its alt text).
import { Credit } from './Credit';
import { ResponsiveImage } from './ResponsiveImage';
import type { Image } from '~/article/types';
import styles from './MediaFigure.module.css';

interface Props {
  media: Image;
  size?: 'LARGE' | 'MEDIUM' | 'HALF';
  /** The lead photo loads first: no lazy loading, high fetch priority. */
  isLead?: boolean;
  className?: string;
}

const SLOT = { LARGE: 'large', MEDIUM: 'medium', HALF: 'half' } as const;

export function MediaFigure({ media, size = 'LARGE', isLead = false, className = '' }: Props) {
  return (
    <div data-testid="imageblock-wrapper" className={`${styles.wrapper} ${styles[size]} ${className}`}>
      <figure className={styles.figure} data-size={size}>
        <ResponsiveImage
          media={media}
          slot={SLOT[size]}
          className={styles.img}
          loading={isLead ? 'eager' : 'lazy'}
          fetchPriority={isLead ? 'high' : undefined}
        />
        {(media.caption || media.credit) && (
          <figcaption className={styles.caption} data-testid="photoviewer-children-caption">
            {media.caption}
            <Credit>{media.credit}</Credit>
          </figcaption>
        )}
      </figure>
    </div>
  );
}
