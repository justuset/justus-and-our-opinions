// Inline HTML for text blocks (NYT sandbox alignment, chunk S1).
//
// The shipped NYT payload allows a little HTML inside a paragraph, such as a link or an italic word. Rendering a string
// as HTML with {@html} is how XSS happens, so instead of trusting the string, this ALLOW-LIST rebuilds it:
//   - <em>, <strong> and their closing tags pass through;
//   - <a href="…"> passes through only for https://, http://, /path or #anchor links, and </a> closes it;
//   - every other "<…>" is shown as text (escaped), and so is every & and >;
//   - if the allowed tags aren't properly nested and closed, the whole string is shown as plain text.
// Plain text comes out exactly as Svelte's own {value} would print it, so switching to this changes no HTML.
// No imports: it runs on the server, in the browser and in `node --test`.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const escape = (s) => s.replace(/[&<>]/g, (c) => ESCAPES[c]);

const SAFE_HREF = /^(https?:\/\/|\/|#)[^"<>\s]*$/;
const OPEN = /^<(em|strong)>$|^<a href="([^"]*)">$/;
const CLOSE = /^<\/(em|strong|a)>$/;

/** @param {string} value  @returns {string} HTML that is safe to pass to {@html} */
export function inlineHtml(value = '') {
  const parts = String(value).split(/(<[^<>]*>)/);
  const open = [];
  let html = '';
  for (const part of parts) {
    const opening = part.match(OPEN);
    const closing = part.match(CLOSE);
    if (opening && (opening[1] || SAFE_HREF.test(opening[2]))) {
      const tag = opening[1] ?? 'a';
      open.push(tag);
      html += tag === 'a' ? `<a href="${opening[2].replace(/&(?!amp;)/g, '&amp;')}">` : `<${tag}>`;
    } else if (closing) {
      if (open.pop() !== closing[1]) return escape(String(value)); // mis-nested: show it all as text
      html += part;
    } else {
      html += escape(part);
    }
  }
  return open.length ? escape(String(value)) : html; // unclosed tag: show it all as text
}
