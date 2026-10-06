// Body: the article body renderer, shaped like the reference's section[name=articleBody]:
//   - a run of paragraphs renders as ONE companion column: div.StoryBodyCompanionColumn[data-testid=companionColumn-N]
//     with the <p>s inside (companion columns have their own counter, 0, 1, 2…);
//   - every other block gets a wrapper div[data-testid=<__typename>-<position>], where position counts every rendered
//     unit, companion columns included (the reference's ImageBlock-5, Dropzone-7, UnstructuredBlock-12…);
//   - each unit sits inside its own error boundary (the reference wraps blocks with withErrorBoundary).
// One difference: the reference leaves an empty <aside aria-label="companion column"> in every companion column.
// An empty landmark is noise for screen readers, so it's left out until something goes in it.
//
// Adding a kind of block = one component + one case below. An unknown type shows a warning in dev, nothing in prod.
import type { ReactNode } from 'react';
import type { Block, ParagraphBlock as Paragraph } from '~/article/types';
import { Diptych } from './Diptych';
import { MediaFigure } from './MediaFigure';
import { ParagraphBlock } from './ParagraphBlock';
import { RelatedLinks } from './RelatedLinks';
import { ResponsiveAd } from './ResponsiveAd';
import { Scrolly } from './Scrolly';
import { ErrorBoundary } from './withErrorBoundary';
import styles from './Body.module.css';

type Unit = { kind: 'column'; paragraphs: Paragraph[] } | { kind: 'block'; block: Exclude<Block, Paragraph> };

/** Consecutive paragraphs of the same variant become one companion column. */
export function toUnits(blocks: Block[]): Unit[] {
  const units: Unit[] = [];
  for (const b of blocks) {
    if (b.__typename !== 'ParagraphBlock') {
      units.push({ kind: 'block', block: b });
      continue;
    }
    const last = units.at(-1);
    if (last?.kind === 'column' && last.paragraphs[0].variant === b.variant) last.paragraphs.push(b);
    else units.push({ kind: 'column', paragraphs: [b] });
  }
  return units;
}

function renderBlock(block: Exclude<Block, Paragraph>, scrolly: number): ReactNode {
  switch (block.__typename) {
    case 'ImageBlock':
      return <MediaFigure media={block.media} size={block.size} />;
    case 'DiptychBlock':
      return <Diptych {...block} />;
    case 'UnstructuredBlock':
      return <Scrolly {...block} instance={scrolly} />;
    case 'Dropzone':
      return <ResponsiveAd id={`ad-${block.index}`} />;
    case 'RelatedLinksBlock':
      return <RelatedLinks {...block} />;
    default:
      return import.meta.env.DEV ? (
        <p role="alert">Missing component for block type “{(block as { __typename: string }).__typename}”</p>
      ) : null;
  }
}

export function Body({ blocks }: { blocks: Block[] }) {
  let columns = 0;
  let scrollies = 0;
  return (
    // `name` isn't in React's types for <section>; spreading it keeps the reference's selector, section[name=articleBody]
    <section className={`meteredContent ${styles.body}`} {...{ name: 'articleBody' }}>
      {toUnits(blocks).map((unit, position) => {
        if (unit.kind === 'column') {
          const n = columns++;
          return (
            <div key={`c${n}`} className="StoryBodyCompanionColumn" data-testid={`companionColumn-${n}`}>
              <ErrorBoundary name={`companionColumn-${n}`}>
                <div>
                  {unit.paragraphs.map((p, i) => (
                    <ParagraphBlock key={i} {...p} />
                  ))}
                </div>
              </ErrorBoundary>
            </div>
          );
        }
        const id = `${unit.block.__typename}-${position}`;
        const scrolly = unit.block.__typename === 'UnstructuredBlock' ? ++scrollies : 0;
        return (
          <div key={id} data-testid={id}>
            <ErrorBoundary name={id}>{renderBlock(unit.block, scrolly)}</ErrorBoundary>
          </div>
        );
      })}
    </section>
  );
}
