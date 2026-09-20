import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise, useSpringIn } from "./motion";

type Props = {
  children: React.ReactNode;
  from?: number;
  enter?: "rise" | "spring";
  size?: number;
  /** A status pill: rounded ends, the label as written, optional flat fill. */
  pill?: boolean;
  fill?: string;
  style?: React.CSSProperties;
};

/** An eyebrow-style label in a hairline box, like the channel chips in the PDF's Calls table. */
export const Chip: React.FC<Props> = ({ children, from = 0, enter = "rise", size = 20, pill = false, fill, style }) => {
  const s = useS();
  const rise = useRise(from);
  const pop = useSpringIn(from, 12);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily,
        fontSize: Math.round(size * s),
        fontWeight: pill ? 400 : 600,
        letterSpacing: pill ? "0" : "0.12em",
        textTransform: pill ? "none" : "uppercase",
        color: colors.body,
        border: `1px solid ${colors.hairD}`,
        borderRadius: pill ? 999 : 4,
        padding: pill ? `${Math.round(6 * s)}px ${Math.round(14 * s)}px` : `${Math.round(12 * s)}px ${Math.round(18 * s)}px`,
        backgroundColor: fill ?? colors.ground,
        lineHeight: 1.3,
        ...(enter === "spring" ? pop : rise),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
