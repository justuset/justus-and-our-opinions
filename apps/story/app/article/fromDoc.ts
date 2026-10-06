// The photo essay's content (flat props in projects/photo-essay/content/doc.json) → the React platform's block shape
// (types.ts). The words stay in that doc and nowhere else. The doc is an ordered `body` of `text` paragraphs and
// `block`s, each block a `component` name plus flat props, like a CMS's simple content blocks.
//
//   doc block                          React block (__typename)          React component
//   text                               ParagraphBlock                    ParagraphBlock
//   block · Header                     HeaderBasicBlock                  HeaderBasic › ArticleTools, Byline
//   block · Photo                      ImageBlock                        MediaFigure
//   block · Diptych                    DiptychBlock                      Diptych
//   block · PhotoScrolly               UnstructuredBlock (Scrolly)       Scrolly
//   block · Bio                        ParagraphBlock (variant 'bio')    ParagraphBlock
//   (platform adds)                    Dropzone                          ResponsiveAd › AdSlot
//   (platform adds)                    RelatedLinksBlock                 RelatedLinks › RelatedLink
import { toInlines } from './inline';
import type { Article, Block, HeaderBasicBlock, Image } from './types';

type Props = Record<string, unknown>;
export interface StoryDoc {
  slug: string;
  theme?: string;
  body: { type: string; value: string | Props }[];
}

/** series({ url1, alt1, url2, alt2 }, ['url', 'alt']) → [{ url, alt }, { url, alt }]. */
export function series(props: Props, fields: string[]): Props[] {
  const items: Props[] = [];
  for (let n = 1; fields.some((f) => props[`${f}${n}`] !== undefined); n++) {
    items.push(Object.fromEntries(fields.map((f) => [f, props[`${f}${n}`]])));
  }
  return items;
}

const image = (p: Props, n = ''): Image => ({
  __typename: 'Image',
  name: String(p[`url${n}`]),
  width: Number(p[`width${n}`]),
  height: Number(p[`height${n}`]),
  altText: String(p[`alt${n}`] ?? ''),
  ...(p[`caption${n}`] ? { caption: String(p[`caption${n}`]) } : {}),
  ...(p.credit && n === '' ? { credit: String(p.credit) } : {}),
});

const bio = (text: string): Block => ({ __typename: 'ParagraphBlock', content: toInlines(text), variant: 'bio' });

/** Every block the converter can't map. Empty means the doc is fine. The loader fails the request on any. */
export function docProblems(doc: StoryDoc): string[] {
  const known = ['Header', 'Photo', 'Diptych', 'PhotoScrolly', 'Bio'];
  return doc.body.flatMap((b, i) => {
    if (b.type === 'text') return [];
    if (b.type !== 'block') return [`body[${i}]: unknown block type "${b.type}"`];
    const name = (b.value as Props)?.component;
    return known.includes(String(name)) ? [] : [`body[${i}]: missing component "${name}"`];
  });
}

export function fromDoc(doc: StoryDoc): Article {
  let header: HeaderBasicBlock | undefined;
  const body: Block[] = [];
  let scrollies = 0;

  for (const b of doc.body) {
    if (b.type === 'text') {
      body.push({ __typename: 'ParagraphBlock', content: toInlines(String(b.value)) });
      continue;
    }
    const p = b.value as Props;
    switch (p.component) {
      case 'Header':
        header = {
          __typename: 'HeaderBasicBlock',
          ...(p.section ? { section: String(p.section) } : {}),
          label: String(p.kicker),
          headline: String(p.headline),
          seoHeadline: String(p.seoTitle ?? p.headline),
          summary: String(p.dek ?? ''),
          timestampBlock: { timestamp: String(p.date), text: String(p.dateText) },
          media: p.url ? image(p) : undefined,
          ...(p.listenTime ? { listenTime: String(p.listenTime) } : {}),
          commentCount: Number(p.comments ?? 0),
          ...(p.author
            ? { byline: { author: String(p.author), bio: p.bio ? toInlines(String(p.bio)) : undefined } }
            : {}),
          ...(p.promoText
            ? { promo: { text: String(p.promoText), cta: String(p.promoCta), url: String(p.promoHref ?? '#') } }
            : {}),
        };
        break;
      case 'Photo':
        body.push({ __typename: 'ImageBlock', size: p.size === 'medium' ? 'MEDIUM' : 'LARGE', media: image(p) });
        break;
      case 'Diptych':
        body.push({
          __typename: 'DiptychBlock',
          imageLeft: image(p, '1'),
          // The reference gives each half its own figure and caption; the doc has one credit, so it goes under the right.
          imageRight: { ...image(p, '2'), ...(p.credit ? { credit: String(p.credit) } : {}) },
          ...(p.credit ? { credit: String(p.credit) } : {}),
        });
        break;
      case 'PhotoScrolly':
        body.push({
          __typename: 'UnstructuredBlock',
          dataType: 'ExperimentalBlock_Scrolly',
          id: `${doc.slug}-${scrollies++}`, // unique per scroller, so every id inside it is unique on the page
          style: 'white',
          // The reference stores each card's words as the photo's caption. We do the same.
          media: series(p, ['url', 'alt', 'width', 'height', 'card']).map((s) => ({
            __typename: 'Image',
            name: String(s.url),
            width: Number(s.width),
            height: Number(s.height),
            altText: String(s.alt ?? ''),
            caption: String(s.card ?? ''),
          })),
          ...(p.credit ? { credit: String(p.credit) } : {}),
        });
        break;
      case 'Bio':
        // The reference ends a guest essay with plain paragraphs in a sans face (not italic), not a special block.
        body.push(bio(String(p.text)));
        if (p.note) body.push(bio(String(p.note)));
        break;
    }
  }
  if (!header) throw new Error('doc has no Header block');

  return {
    slug: doc.slug,
    theme: doc.theme === 'opinion' ? 'opinion' : 'diatour',
    header,
    body: withPlatformBlocks(body),
  };
}

/**
 * The platform, not the story, adds ad Dropzones and the related-links box. On the reference (21 rendered units):
 * a Dropzone right after the first run of paragraphs, then one every 4 to 5 units (positions 1, 7, 13, 18), and the
 * related links just before the closing bio. The real rule likely measures text length; this approximates it with
 * a count of rendered units, where a run of paragraphs is one unit (it renders as one companion column).
 */
const ZONE_EVERY = 5;
function withPlatformBlocks(body: Block[]): Block[] {
  const out: Block[] = [];
  const isBio = (b: Block) => b.__typename === 'ParagraphBlock' && b.variant === 'bio';
  const isText = (b?: Block) => b?.__typename === 'ParagraphBlock' && !isBio(b);
  const bioStart = body.findIndex(isBio);
  let zones = 0;
  let since = -1; // units since the last Dropzone; -1 = no Dropzone yet
  body.forEach((b, i) => {
    if (i === bioStart) out.push(RELATED);
    out.push(b);
    const next = body[i + 1];
    const endsUnit = !(isText(b) && isText(next)); // a paragraph run is one unit until it ends
    if (!endsUnit || isBio(b)) return;
    if (since >= 0) since++;
    const firstRunEnded = since === -1 && isText(b);
    if ((firstRunEnded || since >= ZONE_EVERY) && next && !isBio(next)) {
      out.push({ __typename: 'Dropzone', index: zones++ });
      since = 0;
    }
  });
  if (bioStart === -1) out.push(RELATED);
  return out;
}

const RELATED: Block = {
  __typename: 'RelatedLinksBlock',
  displayStyle: 'STANDARD',
  title: 'More on local traditions (demo)',
  related: [
    {
      url: '#site-content',
      label: 'Guest Essay',
      headline: 'A Placeholder Headline About a County Fair',
      summary: 'Demo summary text for a related piece.',
    },
    {
      url: '#site-content',
      label: 'Opinion',
      headline: 'Another Related Headline Goes Here',
      summary: 'Demo summary text for a related piece.',
    },
  ],
};
