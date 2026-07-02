import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  value: number;
  /** ms-style duration in seconds */
  duration?: number;
  /** formatter — receives the live tweening value */
  format?: (n: number) => string;
  /** when true, no animation on first mount (snap to value) */
  snapFirst?: boolean;
  className?: string;
};

/**
 * Enterprise-grade animated counter. Smoothly tweens any numeric value
 * (revenue, latency, confidence, percentages) using framer-motion's
 * spring-based animate(). Uses a single MotionValue per instance so
 * re-renders stay cheap and animations run at 60fps off the React tree.
 */
export function CountUp({
  value,
  duration = 0.9,
  format = (n) => Math.round(n).toLocaleString(),
  snapFirst = false,
  className,
}: Props) {
  const mv = useMotionValue(snapFirst ? value : 0);
  const display = useTransform(mv, (latest) => format(latest));
  const first = useRef(true);

  useEffect(() => {
    if (first.current && snapFirst) {
      first.current = false;
      mv.set(value);
      return;
    }
    first.current = false;
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, duration, mv, snapFirst]);

  return <motion.span className={className}>{display}</motion.span>;
}
