// Credit: the photographer line under a photo. The reference renders it with dangerouslySetInnerHTML; credits here
// are plain text, so React prints them as text. The hidden "Credit:" tells screen readers what the line is.
import styles from './Credit.module.css';

export function Credit({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <span className={styles.credit}>
      <span className="visually-hidden">Credit: </span>
      {children}
    </span>
  );
}
