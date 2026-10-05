// ResponsiveAd › AdSlot: an ad placeholder where the platform put a Dropzone. Reference AdSlot props include id,
// position, lazyLoad and a11yHidden. The story never styles or fills it; a dashed 300 × 250 box stands in.
// Each slot has its own id and its own skip link target, so two slots never share an id.
import styles from './ResponsiveAd.module.css';

interface AdSlotProps {
  id: string;
  position?: 'mid' | 'bottom';
}

export function AdSlot({ id, position = 'mid' }: AdSlotProps) {
  return (
    <div id={`${id}-wrapper`} className={styles.wrapper} data-position={position} data-testid="ad-slot">
      <p className={styles.label}>Advertisement</p>
      <a className={styles.skip} href={`#after-${id}`}>
        Skip advertisement
      </a>
      <div className={styles.box} aria-hidden="true">
        300 × 250
      </div>
      <div id={`after-${id}`} />
    </div>
  );
}

export function ResponsiveAd({ id }: { id: string }) {
  return <AdSlot id={id} position={id === 'bottom' ? 'bottom' : 'mid'} />;
}
