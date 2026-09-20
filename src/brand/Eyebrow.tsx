import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise } from "./motion";

type Props = {
  children: React.ReactNode;
  /** Local frame the eyebrow rises in at. */
  from?: number;
  tone?: "ink" | "white";
  size?: number;
  style?: React.CSSProperties;
};

/** The PDF's section label: "01 — AUTOMATED AVAILABILITY". Letter-spaced, eyebrow colour. */
export const Eyebrow: React.FC<Props> = ({ children, from = 0, tone = "ink", size = 26, style }) => {
  const s = useS();
  const rise = useRise(from);
  return (
    <div
      style={{
        fontFamily,
        fontSize: Math.round(size * s),
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: tone === "white" ? "#ffffff" : colors.eyebrow,
        ...rise,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
