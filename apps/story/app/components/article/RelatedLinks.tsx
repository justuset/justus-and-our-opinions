// RelatedLinks › RelatedLink: the "more on this" box the platform drops into the body. Reference props:
// RelatedLinks(displayStyle, related), RelatedLink(headline, summary, url, label, …). Demo links only.
import type { RelatedLinksBlock } from '~/article/types';
import styles from './RelatedLinks.module.css';

type LinkProps = RelatedLinksBlock['related'][number];

export function RelatedLink({ url, headline, summary, label }: LinkProps) {
  return (
    <li className={styles.item}>
      <a className={styles.link} href={url}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.headline}>{headline}</span>
        <span className={styles.summary}>{summary}</span>
      </a>
    </li>
  );
}

export function RelatedLinks({ title, related, displayStyle }: RelatedLinksBlock) {
  const titleId = `related-${title.toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <aside
      className={styles.box}
      data-display-style={displayStyle}
      aria-labelledby={titleId}
      data-testid="related-links"
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <ul className={styles.list}>
        {related.map((r) => (
          <RelatedLink key={r.headline} {...r} />
        ))}
      </ul>
    </aside>
  );
}
