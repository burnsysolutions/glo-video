import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "./tokens";

type Props = {
  /** Local frame the rule starts drawing from the left; omit for static. */
  from?: number;
  tone?: "light" | "dark";
  style?: React.CSSProperties;
};

/** The PDF's 1px rule between blocks. */
export const HairlineRule: React.FC<Props> = ({ from, tone = "light", style }) => {
  const frame = useCurrentFrame();
  const grow =
    from === undefined
      ? 1
      : interpolate(frame, [from, from + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        height: 1,
        backgroundColor: tone === "dark" ? "rgba(255,255,255,0.25)" : colors.hairline,
        transformOrigin: "left",
        transform: `scaleX(${grow})`,
        ...style,
      }}
    />
  );
};
