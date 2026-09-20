import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";

type Props = {
  title: string;
  body: string;
  width?: number;
  /** Distance from the top and right edges, px. */
  inset?: number;
};

/**
 * Flat card: ground colour, hairline border, radius 4 (the site's --radius-sm).
 * Pops in with a spring. No shadow, no icon, no gradient.
 */
export const Notification: React.FC<Props> = ({
  title,
  body,
  width = 420,
  inset = 72,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const scale = interpolate(pop, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: inset,
        right: inset,
        width,
        backgroundColor: colors.ground,
        border: `1px solid ${colors.hairline}`,
        borderRadius: 4,
        padding: "16px 20px",
        fontFamily,
        color: colors.body,
        opacity: pop,
        transform: `scale(${scale})`,
        transformOrigin: "top right",
      }}
    >
      <div style={{ fontWeight: 400, fontSize: 22, marginBottom: 6 }}>{title}</div>
      <div style={{ fontWeight: 300, fontSize: 18, lineHeight: 1.4 }}>{body}</div>
    </div>
  );
};
