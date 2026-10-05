// ResponsiveImage: one <img> with srcset, sizes, width and height. Shared by MediaFigure, Diptych and HeaderBasic.
// width/height reserve the box before the file arrives (no layout shift); the browser picks the file from srcset.
import type { ImgHTMLAttributes } from 'react';
import { photo, SIZES } from '~/article/media';
import type { Image } from '~/article/types';

type Props = { media: Image; slot: keyof typeof SIZES } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export function ResponsiveImage({ media, slot, ...rest }: Props) {
  return (
    <img
      {...photo(media.name, media.width)}
      sizes={SIZES[slot]}
      alt={media.altText}
      width={media.width}
      height={media.height}
      decoding="async"
      {...rest}
    />
  );
}
