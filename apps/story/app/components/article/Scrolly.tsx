// Scrolly: the photo scroller. Photos sit in a sticky, screen-tall stage; text cards scroll over them, and each card
// that enters the screen reveals its photo. A class component, like the reference's (WithTheme(Scrolly)).
//
// Kept from the reference:
//   - the markup and ids: #scrolly-instance-{n}, img.scrolly-image-{n}#scrolly-image-{n}-{id}, and p#scrolly-credit-{id}
//     inside the sticky stage after the photos (it sits over the photo, 20px from the bottom), then the cards with
//     the class scrolly-text-{id};
//   - ONE IntersectionObserver with default options (the viewport, threshold 0): a card counts as "active" while any
//     part of it is on screen;
//   - the step index read from the card's id ("scrolly-{n}-{id}".split('-')[1]);
//   - the cumulative reveal: every photo up to the last active card is visible, later ones are hidden. Photos are
//     stacked in order, so the newest is on top and the one under it stays visible while it fades in (no flash).
//   - card text = the photo's caption. (The reference also swaps the credit line per photo; the doc has one
//     credit per scroller, so it stays put.)
// Changed, from the QA pass on the reference:
//   - real alt text (the reference prints alt="photo" on every image);
//   - card ids carry the scroller id, so two scrollers never share "scrolly-0";
//   - the credit is rendered by React from state, not written with innerHTML, and isn't empty on first paint;
//   - srcset/sizes instead of a `mobile` state from matchMedia (the browser picks the file);
//   - no JS = a readable stack of photos, then the cards as paragraphs. Only componentDidMount turns on the overlay.
import { Component, createRef } from 'react';
import { photo, SIZES } from '~/article/media';
import type { ScrollyBlock } from '~/article/types';
import { toInlines } from '~/article/inline';
import { Inlines } from './ParagraphBlock';
import styles from './Scrolly.module.css';

type Props = ScrollyBlock & { instance: number };
interface State {
  /** True once JS has run and the observer is watching. Drives data-enhanced. */
  enhanced: boolean;
  /** The last card on screen. -1 = none yet, which shows photo 0 (the reference forces .scrolly-image-0 visible). */
  lastActive: number;
}

export class Scrolly extends Component<Props, State> {
  state: State = { enhanced: false, lastActive: -1 };

  private root = createRef<HTMLDivElement>();
  private observer: IntersectionObserver | null = null;
  /** Which cards are on screen right now, by index. Not state: changing it alone shouldn't re-render. */
  private onScreen: boolean[] = [];

  componentDidMount() {
    const root = this.root.current;
    // Old browsers keep the no-JS layout (the reference's IE11 branch did the same).
    if (!root || !('IntersectionObserver' in window)) return;

    const cards = [...root.querySelectorAll<HTMLElement>(`.scrolly-text-${this.props.id}`)];
    this.onScreen = cards.map(() => false);
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) this.onScreen[Number(e.target.id.split('-')[1])] = e.isIntersecting;
      const last = this.onScreen.lastIndexOf(true);
      // Between cards (none on screen) keep the last photo instead of jumping back to the first.
      if (last !== -1 && last !== this.state.lastActive) this.setState({ lastActive: last });
    });
    cards.forEach((card) => this.observer!.observe(card));
    this.setState({ enhanced: true });
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  render() {
    const { id, media, credit, style, instance } = this.props;
    const { enhanced, lastActive } = this.state;
    const shown = Math.max(lastActive, 0);

    return (
      <div
        id={`scrolly-instance-${instance}`}
        ref={this.root}
        className={styles.scrolly}
        data-enhanced={enhanced || undefined}
        data-active={shown}
        data-testid="scrolly"
      >
        <div className={styles.stage}>
          {media.map((m, n) => (
            <img
              key={m.name}
              {...photo(m.name, m.width)}
              sizes={SIZES.screen}
              id={`scrolly-image-${n}-${id}`}
              className={`${styles.img} scrolly-image-${n}`}
              data-visible={n <= shown || undefined}
              alt={m.altText}
              width={m.width}
              height={m.height}
              loading="lazy" // far down the page; also stops React 19 from preloading it in <head>
              decoding="async"
            />
          ))}
          {credit && (
            <p id={`scrolly-credit-${id}`} className={styles.credit}>
              <span className="visually-hidden">Credit: </span>
              {credit}
            </p>
          )}
        </div>
        {media.map((m, n) => (
          <p
            key={m.name}
            id={`scrolly-${n}-${id}`}
            className={`${styles.card} scrolly-text-${id}`}
            data-style={style}
            data-step={n}
          >
            <Inlines content={toInlines(m.caption)} />
          </p>
        ))}
      </div>
    );
  }
}
