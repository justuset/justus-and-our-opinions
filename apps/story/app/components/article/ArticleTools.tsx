// ArticleTools: the listen button and share row under the lead photo (Figma header.essay-header, Frame 2). On the
// reference this row is the platform's; here it's a layout replica and the buttons do nothing. Measured: 1px rule,
// 21px to 32/34px controls, pills 6px apart. Icons are drawn here, not copied.
import styles from './ArticleTools.module.css';

export function ArticleTools({ listenTime, commentCount = 0 }: { listenTime?: string; commentCount?: number }) {
  return (
    <div className={styles.tools} role="toolbar" aria-label="Listen, share, save and comments">
      {listenTime && (
        <button type="button" className={styles.listen}>
          <svg className={styles.play} viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 10.5v11l9-5.5z" fill="currentColor" />
          </svg>
          Listen · {listenTime} min
        </button>
      )}
      <ul className={styles.share}>
        <li>
          <button type="button" className={styles.pill}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 8h14v3H3zM4.5 11v7h11v-7M10 8v10M10 8C8 4 5 4 6 6.5S10 8 10 8zM10 8c2-4 5-4 4-1.5S10 8 10 8z" />
            </svg>
            Share full article
          </button>
        </li>
        <li>
          <button type="button" className={`${styles.pill} ${styles.icon}`} aria-label="More sharing options">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12 4l5 5-5 5M17 9h-6c-4 0-7 2-8 7" />
            </svg>
          </button>
        </li>
        <li>
          <button type="button" className={`${styles.pill} ${styles.icon}`} aria-label="Save article for reading later">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 3h10v14l-5-4-5 4z" />
            </svg>
          </button>
        </li>
        <li>
          <button type="button" className={styles.pill} aria-label={`Read ${commentCount} comments`}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 4h14v10H8l-4 3v-3H3z" />
            </svg>
            {commentCount}
          </button>
        </li>
      </ul>
    </div>
  );
}
