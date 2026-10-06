// Turns a doc string with a little HTML ("a <em>word</em> and a <a href="/x">link</a>") into the platform's shape:
// TextInline pieces, each with a list of formats. React then draws <em>, <strong> and <a> as elements, so no string is
// ever passed to dangerouslySetInnerHTML.
//
// Same allow-list as projects/birdkit-kit/inline-html.js, so the React and Svelte templates read doc strings the same way:
//   - <em>, <strong> and <a href="…"> (https?://, /path or #anchor only) are formats;
//   - any other "<…>" stays as literal text;
//   - if the allowed tags are mis-nested or left open, the whole string is one plain inline.
import type { Format, TextInline } from './types';

const SAFE_HREF = /^(https?:\/\/|\/|#)[^"<>\s]*$/;
const OPEN = /^<(em|strong)>$|^<a href="([^"]*)">$/;
const CLOSE = /^<\/(em|strong|a)>$/;

const FORMAT_OF = {
  em: { __typename: 'ItalicFormat' },
  strong: { __typename: 'BoldFormat' },
} as const satisfies Record<string, Format>;

const plain = (text: string): TextInline[] => (text ? [{ __typename: 'TextInline', text, formats: [] }] : []);

export function toInlines(value = ''): TextInline[] {
  const parts = String(value).split(/(<[^<>]*>)/);
  const open: { tag: 'em' | 'strong' | 'a'; format: Format }[] = [];
  const out: TextInline[] = [];

  for (const part of parts) {
    if (!part) continue;
    const opening = part.match(OPEN);
    const closing = part.match(CLOSE);
    if (opening && (opening[1] || SAFE_HREF.test(opening[2]))) {
      const tag = (opening[1] ?? 'a') as 'em' | 'strong' | 'a';
      const format: Format = tag === 'a' ? { __typename: 'LinkFormat', url: opening[2] } : FORMAT_OF[tag];
      open.push({ tag, format });
    } else if (closing) {
      if (open.pop()?.tag !== closing[1]) return plain(value); // mis-nested
    } else {
      out.push({ __typename: 'TextInline', text: part, formats: open.map((o) => o.format) });
    }
  }
  return open.length ? plain(value) : out; // left open
}
