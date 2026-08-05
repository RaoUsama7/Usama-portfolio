import { PropsWithChildren, useEffect, useRef, useState } from "react";

type Props = PropsWithChildren<{
  /** How far ahead of the viewport (px) to start loading. */
  margin?: number;
  /** Keeps the page height stable before the real content mounts. */
  placeholderClassName?: string;
}>;

/**
 * Mounts its children only once the placeholder approaches the viewport.
 *
 * Wrapping a `lazy()` import in `<Suspense>` alone still downloads and mounts
 * the chunk immediately, because the element is rendered on first paint. This
 * defers both the chunk and any work its module does until the section is
 * actually about to be seen.
 *
 * Uses rect math rather than IntersectionObserver on purpose: this page's block
 * containers all compute to width 0 (sections take their width from inner
 * elements), and a zero-area target never intersects, so an observer would
 * never fire here.
 */
const LazySection = ({
  children,
  margin = 400,
  placeholderClassName,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const check = () => {
      const { top } = node.getBoundingClientRect();
      if (top - margin <= window.innerHeight) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    // Already in range on mount (deep link, restored scroll position).
    if (check()) return;

    const onScroll = () => {
      if (check()) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [margin]);

  if (isVisible) return <>{children}</>;
  return <div ref={ref} className={placeholderClassName} />;
};

export default LazySection;
