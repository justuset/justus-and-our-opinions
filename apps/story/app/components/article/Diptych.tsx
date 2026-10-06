// Diptych: two photos side by side from 740px, stacked on phones. Reference props: className, size, mobileColumns.
// Like the reference, each half is a whole MediaFigure with its own caption; the doc's one credit sits under the
// right-hand photo (the converter puts it there). mobileColumns 2 keeps the pair side by side on phones too.
import { MediaFigure } from './MediaFigure';
import type { DiptychBlock } from '~/article/types';
import styles from './Diptych.module.css';

type Props = DiptychBlock & { mobileColumns?: 1 | 2; className?: string };

export function Diptych({ imageLeft, imageRight, mobileColumns = 1, className = '' }: Props) {
  return (
    <div className={`${styles.diptych} ${className}`} data-mobile-columns={mobileColumns}>
      <MediaFigure media={imageLeft} size="HALF" />
      <MediaFigure media={imageRight} size="HALF" />
    </div>
  );
}
