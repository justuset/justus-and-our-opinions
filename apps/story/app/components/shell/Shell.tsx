// The mock platform shell around the article, ported from projects/birdkit-kit/shell/ and re-checked against the
// reference React article (the photo essay), whose order is:
//   masthead (fixed) · main#site-content > article#story [header · section[name=articleBody] · ArticleBottom]
//   · nav#site-index · footer
// ArticleBottom (date, share tools, recirculation, bottom ad) sits INSIDE the article on the reference, unlike the
// Birdkit page, where it follows the story. The story never styles the shell, and the shell never styles the story.
import type { ReactNode } from 'react';
import { ResponsiveAd } from '../article/ResponsiveAd';
import styles from './Shell.module.css';

interface MastheadProps {
  name?: string;
  inverse?: boolean;
  /** Article pages: fixed to the top, 43px, on the shell background. Birdkit pages: floats and scrolls away. */
  fixed?: boolean;
}

export function Masthead({ name = 'Our Opinions', inverse = false, fixed = false }: MastheadProps) {
  return (
    <div
      className={`${styles.mastheadContainer} ${fixed ? styles.fixed : ''}`}
      data-testid="masthead-container"
      data-fixed={fixed || undefined}
    >
      <header className={styles.mastheadWrapper}>
        <section className={styles.mastheadSection} aria-label="Site masthead">
          <a className={styles.skipLink} href="#site-content">
            Skip to content
          </a>
          <a className={`${styles.wordmark} ${inverse ? styles.inverse : ''}`} href="/">
            {name}
          </a>
        </section>
      </header>
    </div>
  );
}

/** Share tools at the end of the article: the comment button, then the pills. */
function ShareTools({ comments = 0 }: { comments?: number }) {
  return (
    <div className={styles.shareTools} data-testid="share-tools" role="toolbar" aria-label="Share, save and comments">
      <div className={styles.commentRow}>
        <button type="button" className={styles.commentButton} data-testid="comment-button-bigBottom">
          Read {comments} comments
        </button>
      </div>
      <ul className={styles.shareList} data-testid="share-tools-list">
        <li>
          <button type="button" className={styles.pill}>
            Share full article
          </button>
        </li>
        <li>
          <button type="button" className={styles.pill} aria-label="More sharing options">
            Share
          </button>
        </li>
        <li>
          <button type="button" className={styles.pill} aria-label="Save article for reading later">
            Save
          </button>
        </li>
        <li>
          <button type="button" className={styles.pill} aria-label={`Read ${comments} comments`}>
            {comments}
          </button>
        </li>
      </ul>
    </div>
  );
}

export function Recirc() {
  const six = [0, 1, 2, 3, 4, 5];
  return (
    <section className={styles.recirc} data-testid="recirculation" aria-labelledby="recirc-title">
      <h2 id="recirc-title" className="visually-hidden">
        Related content (placeholder)
      </h2>
      <div className={styles.recircMain}>
        <div className={styles.rule}>
          <span className={styles.bar} />
        </div>
        <ul className={styles.cards}>
          {six.map((i) => (
            <li key={i}>
              <div className={styles.thumb} />
              <div className={styles.line} />
              <div className={`${styles.line} ${styles.short}`} />
            </li>
          ))}
        </ul>
      </div>
      <aside className={styles.recircRail} aria-label="More placeholders">
        <div className={styles.rule}>
          <span className={styles.bar} />
        </div>
        {six.map((i) => (
          <div key={i} className={`${styles.line} ${styles.railLine}`} />
        ))}
      </aside>
    </section>
  );
}

const LINKS = ['About', 'Contact Us', 'Accessibility', 'Privacy Policy', 'Terms of Service', 'Site Map', 'Help'];

export function SiteFooter({ name = 'Our Opinions' }: { name?: string }) {
  return (
    <footer className={styles.siteFooter}>
      <nav className={styles.footerNav} aria-label="Site information">
        <ul>
          <li>
            <a href="#site-content">© 2026 {name} · demo</a>
          </li>
        </ul>
        <ul>
          {LINKS.map((l) => (
            <li key={l}>
              <a href="#site-content">{l}</a>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

/** The end of the article, inside article#story: today's date, share tools, related content, the bottom ad. */
export function ArticleBottom({ date }: { date: string }) {
  return (
    <div>
      <div className={`bottom-of-article ${styles.bottomOfArticle}`}>
        <p className={styles.todaysDate}>
          <span data-testid="todays-date">{date}</span>
        </p>
        <ShareTools />
      </div>
      <Recirc />
      <ResponsiveAd id="bottom" />
    </div>
  );
}

/** nav#site-index: the platform's section index above the footer. Placeholder links. */
export function SiteIndex() {
  const sections = ['Opinion', 'Guest Essays', 'Letters', 'Columnists'];
  return (
    <nav id="site-index" className={styles.siteIndex} data-testid="site-index" aria-labelledby="site-index-label">
      <h2 id="site-index-label" className="visually-hidden">
        Site Index
      </h2>
      <ul>
        {sections.map((s) => (
          <li key={s}>
            <a href="#site-content">{s}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Masthead, the story in <main>, then the site index and footer. */
export function Shell({
  children,
  inverse,
  fixedMasthead = false,
}: {
  children: ReactNode;
  inverse: boolean;
  fixedMasthead?: boolean;
}) {
  return (
    <div id="app">
      <Masthead inverse={inverse} fixed={fixedMasthead} />
      <main id="site-content">{children}</main>
      <SiteIndex />
      <SiteFooter />
    </div>
  );
}
