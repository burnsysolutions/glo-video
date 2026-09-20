import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** The house easing, cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** A 12-frame rise-and-fade starting at `from` (frames, local to the sequence). */
export const useRise = (from: number, length = 12, distance = 18): React.CSSProperties => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + length], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity: t, transform: `translateY(${(1 - t) * distance}px)` };
};

/** A spring entrance starting at `from`, for elements that pop rather than rise. */
export const useSpringIn = (from: number, distance = 24): React.CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - from, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
  const clamped = frame < from ? 0 : t;
  return { opacity: clamped, transform: `translateY(${(1 - clamped) * distance}px)` };
};

/** Seconds to frames at the composition's rate. */
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

/**
 * The full reveal: blur 20px, scale 0.94 and 60px low resolving to sharp,
 * 1 and 0 over 20 frames on EASE. For titles, logos and the end card only;
 * body lines get useRise.
 */
export const useReveal = (from: number, length = 20): React.CSSProperties => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return {
    opacity: t,
    filter: `blur(${(1 - t) * 20}px)`,
    transform: `translateY(${(1 - t) * 60}px) scale(${0.94 + 0.06 * t})`,
  };
};

/** A few pixels of drift over the sequence, for parallax layers. Rate in px over the whole sequence. */
export const useDrift = (rateX: number, rateY: number, from = 0): { x: number; y: number } => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [from, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { x: rateX * t, y: rateY * t };
};
