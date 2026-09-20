import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "./motion";

type Props = {
  value: number;
  /** Local frame the count starts. */
  from?: number;
  length?: number;
  decimals?: number;
  style?: React.CSSProperties;
};

/** Counts from 0 to `value` over 30 frames on the house easing. Tabular figures so the width holds. */
export const Counter: React.FC<Props> = ({ value, from = 0, length = 30, decimals = 0, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const shown = (value * t).toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{shown}</span>;
};
