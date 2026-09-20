import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise, useSpringIn } from "./motion";

type Props = {
  number: string;
  title: string;
  /** Small letter-spaced channel tags, e.g. "WEB · EMAIL". */
  tags?: string;
  description?: string;
  from?: number;
  /** "row" is the PDF's page-3 list; "column" stacks the numeral over the title for side-by-side use. */
  layout?: "row" | "column";
  enter?: "rise" | "spring";
  width?: number;
  /** Multiplies every size, for a page that carries nothing else. */
  scale?: number;
};

/** The PDF's numbered row: large light-grey numeral, bold title, channel tags, description. */
export const NumberedRow: React.FC<Props> = ({ number, title, tags, description, from = 0, layout = "row", enter = "rise", width, scale = 1 }) => {
  const s = useS() * scale;
  const rise = useRise(from);
  const pop = useSpringIn(from);
  const motion = enter === "spring" ? pop : rise;
  const numeral = (
    <div style={{ fontSize: Math.round(72 * s), fontWeight: 300, lineHeight: 1, color: colors.hairD, letterSpacing: "-0.02em" }}>
      {number}
    </div>
  );
  const body = (
    <div>
      <div style={{ fontSize: Math.round(34 * s), fontWeight: 600, lineHeight: 1.2, color: colors.body }}>{title}</div>
      {tags ? (
        <div
          style={{
            marginTop: Math.round(8 * s),
            fontSize: Math.round(16 * s),
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: colors.eyebrow,
          }}
        >
          {tags}
        </div>
      ) : null}
      {description ? (
        <div style={{ marginTop: Math.round(12 * s), fontSize: Math.round(24 * s), fontWeight: 300, lineHeight: 1.45, color: colors.ink2 }}>
          {description}
        </div>
      ) : null}
    </div>
  );
  if (layout === "column") {
    return (
      <div style={{ fontFamily, width, ...motion }}>
        {numeral}
        <div style={{ marginTop: Math.round(16 * s) }}>{body}</div>
      </div>
    );
  }
  return (
    <div style={{ fontFamily, width, display: "flex", gap: Math.round(28 * s), alignItems: "flex-start", ...motion }}>
      <div style={{ width: Math.round(96 * s), flexShrink: 0 }}>{numeral}</div>
      {body}
    </div>
  );
};
