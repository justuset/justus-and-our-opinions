// Byline: author and a one-line bio between two rules (Figma header.essay-header, Frame 2). Measured: 30px above the
// top rule, 102px rule to rule (min), 15/21 bold name, 14/20 bio. The bio arrives as TextInline pieces, drawn like
// a ParagraphBlock's content.
import { Inlines } from './ParagraphBlock';
import type { TextInline } from '~/article/types';
import styles from './Byline.module.css';

export function Byline({ author, bio }: { author: string; bio?: TextInline[] }) {
  return (
    <div className={styles.byline}>
      <p className={styles.author}>By {author}</p>
      {bio && (
        <p className={styles.bio}>
          <Inlines content={bio} />
        </p>
      )}
    </div>
  );
}
