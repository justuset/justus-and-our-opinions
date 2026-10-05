// Opinion: the kicker above the headline. On the reference it sits inside BrandBar; this page type has nothing else in
// the bar, so it's the section ("Opinion", in the accent color) over the label ("Guest Essay"), one per line.
import styles from './HeaderBasic.module.css';

export function Opinion({ section, label, className }: { section?: string; label: string; className?: string }) {
  return (
    <p className={className}>
      {section && <span className={styles.section}>{section}</span>}
      <span>{label}</span>
    </p>
  );
}
