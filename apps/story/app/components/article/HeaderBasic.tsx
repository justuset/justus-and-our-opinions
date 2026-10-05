// HeaderBasic: kicker, headline, date and the lead photo, centered. The reference's props include headline, label,
// timestampBlock and media; seoHeadline and summary go to <title> and the meta description (routes/photo-essay.tsx).
import { HangingPunctuation } from './HangingPunctuation';
import { MediaFigure } from './MediaFigure';
import { Opinion } from './Opinion';
import { Timestamp } from './Timestamp';
import type { HeaderBasicBlock } from '~/article/types';
import styles from './HeaderBasic.module.css';

export function HeaderBasic({ label, headline, timestampBlock, media }: HeaderBasicBlock) {
  return (
    <header className={styles.header}>
      <Opinion className={styles.kicker} label={label} />
      <h1 className={styles.headline} data-testid="headline">
        <HangingPunctuation text={headline} textAlign="center" />
      </h1>
      <Timestamp className={styles.date} {...timestampBlock} />
      {media && <MediaFigure media={media} size="LARGE" isLead className={styles.lead} />}
    </header>
  );
}
