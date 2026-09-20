import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise } from "./motion";

type Props = {
  /** The bold lead-in, e.g. "A message goes out". */
  lead: string;
  /** The rest of the line. */
  children?: React.ReactNode;
  from?: number;
  tone?: "ink" | "white";
  size?: number;
};

/** The PDF's "What it does for you" line: tick in commit-bright, bold lead-in, body text. */
export const CheckLine: React.FC<Props> = ({ lead, children, from = 0, tone = "ink", size = 30 }) => {
  const s = useS();
  const rise = useRise(from);
  const px = Math.round(size * s);
  const colour = tone === "white" ? "#ffffff" : colors.body;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: Math.round(16 * s),
        fontFamily,
        fontSize: px,
        lineHeight: 1.35,
        color: colour,
        padding: `${Math.round(9 * s)}px 0`,
        ...rise,
      }}
    >
      <svg
        width={Math.round(px * 0.9)}
        height={Math.round(px * 0.9)}
        viewBox="0 0 24 24"
        style={{ flexShrink: 0, marginTop: Math.round(px * 0.22) }}
      >
        <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={colors.commitBright} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <span style={{ fontWeight: 600 }}>{lead}</span>
        {children ? <span style={{ fontWeight: 300 }}> {children}</span> : null}
      </div>
    </div>
  );
};
