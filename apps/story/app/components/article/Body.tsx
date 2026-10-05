// Body: the article body renderer. It walks the blocks in order and draws each one with the component registered for
// its __typename, inside its own error boundary (the reference wraps blocks the same way: withErrorBoundary).
//
// Adding a kind of block = one component + one line in `blocks`. The data names block types; it never imports
// components. An unknown type shows a warning in dev and nothing in production.
import type { ComponentType } from 'react';
import type { Block } from '~/article/types';
import { Diptych } from './Diptych';
import { MediaFigure } from './MediaFigure';
import { ParagraphBlock } from './ParagraphBlock';
import { RelatedLinks } from './RelatedLinks';
import { ResponsiveAd } from './ResponsiveAd';
import { Scrolly } from './Scrolly';
import { withErrorBoundary } from './withErrorBoundary';

// Each entry adapts the block's data to its component's props, then gets an error boundary.
const blocks = {
  ParagraphBlock: withErrorBoundary(ParagraphBlock),
  ImageBlock: withErrorBoundary(
    ({ media, size }: Extract<Block, { __typename: 'ImageBlock' }>) => <MediaFigure media={media} size={size} />,
    'ImageBlock',
  ),
  DiptychBlock: withErrorBoundary(Diptych),
  UnstructuredBlock: withErrorBoundary(Scrolly),
  Dropzone: withErrorBoundary(({ index }: { index: number }) => <ResponsiveAd id={`ad-${index}`} />, 'Dropzone'),
  RelatedLinksBlock: withErrorBoundary(RelatedLinks),
} satisfies Partial<Record<Block['__typename'], ComponentType<never>>>;

export function Body({ blocks: body }: { blocks: Block[] }) {
  let scrollies = 0;
  return (
    <section className="article-body" data-testid="article-body">
      {body.map((block, i) => {
        const key = `${block.__typename}-${i}`;
        switch (block.__typename) {
          case 'ParagraphBlock':
            return <blocks.ParagraphBlock key={key} {...block} />;
          case 'ImageBlock':
            return <blocks.ImageBlock key={key} {...block} />;
          case 'DiptychBlock':
            return <blocks.DiptychBlock key={key} {...block} />;
          case 'UnstructuredBlock':
            return <blocks.UnstructuredBlock key={key} {...block} instance={scrollies++} />;
          case 'Dropzone':
            return <blocks.Dropzone key={key} {...block} />;
          case 'RelatedLinksBlock':
            return <blocks.RelatedLinksBlock key={key} {...block} />;
          default:
            return import.meta.env.DEV ? (
              <p key={key} role="alert">
                Missing component for block type “{(block as { __typename: string }).__typename}”
              </p>
            ) : null;
        }
      })}
    </section>
  );
}
