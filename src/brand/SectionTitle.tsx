import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise } from "./motion";
import { Eyebrow } from "./Eyebrow";

type Props = {
  eyebrow?: string;
  children: React.ReactNode;
  /** Local frame the title starts its 12-frame rise-and-fade. */
  from?: number;
  tone?: "ink" | "white";
  size?: number;
  maxWidth?: number;
};

/** Eyebrow above a Poppins 600 88px title, entering with a 12-frame rise-and-fade. */
export const SectionTitle: React.FC<Props> = ({ eyebrow, children, from = 0, tone = "ink", size = 88, maxWidth }) => {
  const s = useS();
  const rise = useRise(from);
  return (
    <div style={{ fontFamily, maxWidth }}>
      {eyebrow ? <Eyebrow from={Math.max(0, from - 4)} tone={tone}>{eyebrow}</Eyebrow> : null}
      <div
        style={{
          marginTop: eyebrow ? Math.round(18 * s) : 0,
          fontSize: Math.round(size * s),
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: tone === "white" ? "#ffffff" : colors.body,
          ...rise,
        }}
      >
        {children}
      </div>
    </div>
  );
};
