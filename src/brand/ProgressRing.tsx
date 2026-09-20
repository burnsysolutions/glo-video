import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "./tokens";
import { EASE } from "./motion";

type Props = {
  /** 0–1. */
  fraction: number;
  size: number;
  stroke?: number;
  from?: number;
  length?: number;
  children?: React.ReactNode;
};

/** An SVG ring that draws itself to `fraction` via strokeDashoffset, hairline track beneath, content centred. */
export const ProgressRing: React.FC<Props> = ({ fraction, size, stroke = 6, from = 0, length = 30, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.hairline} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.commit}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction * t)}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};
