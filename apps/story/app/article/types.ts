// The article's data, shaped like the platform's GraphQL payload (window.__preloadedData on the reference page).
// Every block carries a `__typename`; the body renderer picks a component by it. Field names follow the reference
// where we saw them (headline, summary, label, timestampBlock, media, altText, credit, displayStyle, related).
// Demo content: the values come from projects/photo-essay/content/doc.json, converted by fromBirdkitDoc().

/** One piece of a paragraph. The platform never ships HTML strings in body text: it ships text plus formats. */
export interface TextInline {
  __typename: 'TextInline';
  text: string;
  formats: Format[];
}
export type Format =
  { __typename: 'ItalicFormat' } | { __typename: 'BoldFormat' } | { __typename: 'LinkFormat'; url: string };

/** A photo. `name` is a rendition base path ("images/calf"); width and height are the original's. */
export interface Image {
  __typename: 'Image';
  name: string;
  width: number;
  height: number;
  altText: string;
  caption?: string;
  credit?: string;
}

export interface HeaderBasicBlock {
  __typename: 'HeaderBasicBlock';
  section?: string; // the accent line above the kicker, "Opinion"
  label: string; // the kicker, "Guest Essay"
  headline: string;
  seoHeadline: string; // <title>, not drawn
  summary: string; // meta description, not drawn on this page type
  timestampBlock: { timestamp: string; text: string };
  media?: Image;
  /** Under the lead photo (Figma header.essay-header, Frame 2). On the reference these are platform pieces. */
  listenTime?: string;
  commentCount?: number;
  byline?: { author: string; bio?: TextInline[] };
  promo?: { text: string; cta: string; url: string };
}

export interface ParagraphBlock {
  __typename: 'ParagraphBlock';
  content: TextInline[];
}

export interface ImageBlock {
  __typename: 'ImageBlock';
  size: 'LARGE' | 'MEDIUM';
  media: Image;
}

export interface DiptychBlock {
  __typename: 'DiptychBlock';
  imageLeft: Image;
  imageRight: Image;
  credit?: string;
}

/** The photo scroller arrives as an UnstructuredBlock. The card text is each photo's caption. */
export interface ScrollyBlock {
  __typename: 'UnstructuredBlock';
  dataType: 'ExperimentalBlock_Scrolly';
  id: string;
  style: 'white' | 'black';
  media: Image[];
  credit?: string;
}

/** Where the platform may put an ad. The story never decides what fills it. */
export interface Dropzone {
  __typename: 'Dropzone';
  index: number;
}

export interface RelatedLinksBlock {
  __typename: 'RelatedLinksBlock';
  displayStyle: 'STANDARD';
  title: string;
  related: { url: string; headline: string; summary: string; label?: string }[];
}

export type Block =
  HeaderBasicBlock | ParagraphBlock | ImageBlock | DiptychBlock | ScrollyBlock | Dropzone | RelatedLinksBlock;

export interface Article {
  slug: string;
  theme: 'diatour' | 'opinion';
  header: HeaderBasicBlock;
  body: Block[];
}
