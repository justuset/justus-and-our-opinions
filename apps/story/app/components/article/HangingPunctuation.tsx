// HangingPunctuation: when a headline starts with a quotation mark, pull the mark into the margin so the letters
// line up with the text below. The reference takes text, textAlign and customOffset. Centered text has no edge to
// hang from, so it only hangs left- or start-aligned text.
const OPENERS = /^[“‘"'«]/;

interface Props {
  text: string;
  textAlign?: 'center' | 'start';
  /** How far the mark hangs, in em. */
  customOffset?: number;
}

export function HangingPunctuation({ text, textAlign = 'start', customOffset = 0.42 }: Props) {
  if (textAlign === 'center' || !OPENERS.test(text)) return <>{text}</>;
  return (
    <>
      <span style={{ marginInlineStart: `-${customOffset}em` }}>{text[0]}</span>
      {text.slice(1)}
    </>
  );
}
