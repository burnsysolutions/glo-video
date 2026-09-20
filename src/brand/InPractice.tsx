import { colors } from "./tokens";
import { fontFamily } from "./fonts";
import { useS } from "./layout";
import { useRise } from "./motion";

type Props = {
  /** The column label, e.g. "RECRUITMENT". */
  label: string;
  children: React.ReactNode;
  from?: number;
  width?: number;
};

/** The PDF's "In practice" column: eyebrow label and two lines beneath. */
export const InPractice: React.FC<Props> = ({ label, children, from = 0, width }) => {
  const s = useS();
  const rise = useRise(from);
  return (
    <div style={{ fontFamily, width, ...rise }}>
      <div style={{ fontSize: Math.round(18 * s), fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.eyebrow }}>
        {label}
      </div>
      <div style={{ marginTop: Math.round(10 * s), fontSize: Math.round(24 * s), fontWeight: 300, lineHeight: 1.45, color: colors.ink2 }}>
        {children}
      </div>
    </div>
  );
};
