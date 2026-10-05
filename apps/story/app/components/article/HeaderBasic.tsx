// HeaderBasic: kicker, a short rule, headline, date and the lead photo, centered; then the tools row, byline and promo
// in the text column (Figma header.essay-header). Measured: 100px top, 16px under the kicker, a 72px rule 24px over the
// 57/60 headline (40/44 on phones), 16px to the date, 52px to the 945px lead photo, 12px to the tools row, 32px to the
// promo and 32px below. seoHeadline and summary go to <title> and the meta description (routes/photo-essay.tsx).
import { ArticleTools } from './ArticleTools';
import { Byline } from './Byline';
import { HangingPunctuation } from './HangingPunctuation';
import { MediaFigure } from './MediaFigure';
import { Opinion } from './Opinion';
import { Timestamp } from './Timestamp';
import type { HeaderBasicBlock } from '~/article/types';
import styles from './HeaderBasic.module.css';

export function HeaderBasic(props: HeaderBasicBlock) {
  const { section, label, headline, timestampBlock, media, listenTime, commentCount, byline, promo } = props;
  return (
    <header className={styles.header}>
      <Opinion className={styles.kicker} section={section} label={label} />
      <h1 className={styles.headline} data-testid="headline">
        <HangingPunctuation text={headline} textAlign="center" />
      </h1>
      <Timestamp className={styles.date} {...timestampBlock} />
      {media && <MediaFigure media={media} size="LARGE" isLead className={styles.lead} />}
      <div className={styles.meta}>
        <ArticleTools listenTime={listenTime} commentCount={commentCount} />
        {byline && <Byline {...byline} />}
        {promo && (
          <aside className={styles.promo}>
            <p>{promo.text}</p>
            <a href={promo.url}>
              {promo.cta}
              <svg viewBox="0 0 9 9" aria-hidden="true">
                <path d="M1 8l7-7M2.5 1H8v5.5" />
              </svg>
            </a>
          </aside>
        )}
      </div>
    </header>
  );
}
