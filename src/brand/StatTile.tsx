import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise } from "./motion";

type Props = {
  /** Small letter-spaced label above the number, e.g. "QUEUED". */
  label?: string;
  /** Number to count up to, or a string shown as is. */
  value: number | string;
  /** Decimal places when counting. */
  decimals?: number;
  caption: string;
  from?: number;
  tone?: "ink" | "white";
  size?: number;
  width?: number;
  labelSize?: number;
  /** Reserve this many label lines so numbers in a row share a baseline. */
  labelLines?: number;
};

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** The PDF's "11 hrs / £63,000 / 34%" tile: big Poppins 600 number, small caption. Counts up with a spring. */
export const StatTile: React.FC<Props> = ({ label, value, decimals = 0, caption, from = 0, tone = "ink", size = 84, width, labelSize = 18, labelLines }) => {
  const s = useS();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = useRise(from);
  const t = frame < from ? 0 : spring({ frame: frame - from, fps, config: { damping: 200, stiffness: 40 } });
  const shown = typeof value === "number" ? format(value * t, decimals) : value;
  const ink = tone === "white" ? "#ffffff" : colors.body;
  const soft = tone === "white" ? "rgba(255,255,255,0.75)" : colors.ink2;
  return (
    <div style={{ fontFamily, width, ...rise }}>
      {label ? (
        <div
          style={{
            fontSize: Math.round(labelSize * s),
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: soft,
            marginBottom: Math.round(6 * s),
            lineHeight: 1.25,
            minHeight: labelLines ? Math.round(labelSize * 1.25 * labelLines * s) : undefined,
            display: labelLines ? "flex" : undefined,
            alignItems: labelLines ? "flex-end" : undefined,
          }}
        >
          {label}
        </div>
      ) : null}
      <div style={{ fontSize: Math.round(size * s), fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: ink, fontVariantNumeric: "tabular-nums" }}>
        {shown}
      </div>
      {caption ? (
        <div style={{ marginTop: Math.round(10 * s), fontSize: Math.round(22 * s), fontWeight: 300, lineHeight: 1.35, color: soft }}>
          {caption}
        </div>
      ) : null}
    </div>
  );
};
