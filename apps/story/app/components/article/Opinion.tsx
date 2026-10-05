// Opinion: the kicker above the headline ("Guest Essay"). On the reference it sits inside BrandBar; this page type
// has nothing else in the bar, so the label is the whole thing.
export function Opinion({ label, className }: { label: string; className?: string }) {
  return <p className={className}>{label}</p>;
}
