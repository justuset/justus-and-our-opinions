// Italic: the reference's component for an ItalicFormat inside a paragraph. A plain <em>.
import type { ReactNode } from 'react';

export function Italic({ children }: { children: ReactNode }) {
  return <em>{children}</em>;
}
