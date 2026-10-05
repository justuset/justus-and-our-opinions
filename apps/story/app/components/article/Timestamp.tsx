// Timestamp › PubDate: the publish date. <time dateTime> gives machines the ISO date; people read the styled text.
export function Timestamp({ timestamp, text, className }: { timestamp: string; text: string; className?: string }) {
  return (
    <time className={className} dateTime={timestamp}>
      {text}
    </time>
  );
}
