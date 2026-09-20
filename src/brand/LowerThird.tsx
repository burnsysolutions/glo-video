import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";

type Props = {
  label: string;
  value: string;
  /** Label size in px. The site's eyebrow is 11px; raise it for 1080-wide output. */
  labelSize?: number;
  valueSize?: number;
  /** Distance from the left and bottom edges, px. */
  inset?: number;
};

/**
 * Hairline-bordered flat band. Label in commit-bright, uppercase,
 * letter-spaced; value in body colour. Slides in from the left.
 */
export const LowerThird: React.FC<Props> = ({
  label,
  value,
  labelSize = 11,
  valueSize = 28,
  inset = 72,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 90 } });
  const x = interpolate(enter, [0, 1], [-60, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: inset,
        bottom: inset,
        backgroundColor: colors.ground,
        border: `1px solid ${colors.hairline}`,
        padding: "14px 20px",
        fontFamily,
        opacity: enter,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          color: colors.commitBright,
          fontSize: labelSize,
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: colors.body, fontSize: valueSize, fontWeight: 300 }}>
        {value}
      </div>
    </div>
  );
};
