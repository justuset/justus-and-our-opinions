// ParagraphBlock: one paragraph of body text. The data is TextInline pieces with formats (types.ts), so each format
// becomes a real element. Nothing is parsed as HTML in the browser.
import type { ReactNode } from 'react';
import { Italic } from './Italic';
import type { Format, ParagraphBlock as Data } from '~/article/types';
import styles from './ParagraphBlock.module.css';

function wrap(node: ReactNode, format: Format, key: string): ReactNode {
  switch (format.__typename) {
    case 'ItalicFormat':
      return <Italic key={key}>{node}</Italic>;
    case 'BoldFormat':
      return <strong key={key}>{node}</strong>;
    case 'LinkFormat':
      return (
        <a key={key} href={format.url}>
          {node}
        </a>
      );
  }
}

/** The pieces of a paragraph, without the <p>. Scrolly cards use it too. */
export function Inlines({ content }: Pick<Data, 'content'>) {
  return content.map((inline, i) =>
    // innermost format last, so wrap from the end: [Italic, Link] → <em><a>text</a></em>
    inline.formats.reduceRight<ReactNode>((node, f, j) => wrap(node, f, `${i}-${j}`), inline.text),
  );
}

export function ParagraphBlock({ content, variant }: Data) {
  return (
    <p className={variant === 'bio' ? `${styles.p} ${styles.bio}` : styles.p}>
      <Inlines content={content} />
    </p>
  );
}
