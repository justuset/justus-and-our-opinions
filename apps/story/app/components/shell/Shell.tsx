// The mock platform shell around the article, ported from projects/birdkit-kit/shell/. The reference page's
// components: Masthead (NYTLogo inside; here the "Our Opinions" wordmark), share tools, recirculation, the bottom
// AdSlot and the site footer. The story never styles the shell, and the shell never styles the story.
import type { ReactNode } from 'react';
import { ResponsiveAd } from '../article/ResponsiveAd';
import styles from './Shell.module.css';

export function Masthead({ name = 'Our Opinions', inverse = false }: { name?: string; inverse?: boolean }) {
  return (
    <div className={styles.mastheadContainer} data-testid="masthead-container">
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

export function ShareTools({ comments = 0 }: { comments?: number }) {
  return (
    <div className={styles.shareTools} data-testid="share-tools" role="toolbar" aria-label="Share, save and comments">
      <div className={styles.commentRow}>
        <button type="button" className={styles.commentButton}>
          Read {comments} comments
        </button>
      </div>
      <ul className={styles.shareList}>
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

/** Masthead on top, the story in <main>, then the platform's standalone footer. */
export function Shell({ children, inverse }: { children: ReactNode; inverse: boolean }) {
  return (
    <div id="app">
      <Masthead inverse={inverse} />
      <main id="site-content">{children}</main>
      <div id="standalone-footer">
        <ShareTools />
        <Recirc />
        <ResponsiveAd id="bottom" />
        <SiteFooter />
      </div>
    </div>
  );
}
