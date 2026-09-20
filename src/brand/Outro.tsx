import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";

export const OUTRO_SECONDS = 4;

type Props = {
  headline?: string;
  url?: string;
};

/**
 * Ground colour, mark small top-left, headline in Poppins 200, hairline rule,
 * URL in Poppins 300.
 */
export const Outro: React.FC<Props> = ({
  headline = "Built once. Yours to keep.",
  url = "globusinesssolution.com",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const fade = (from: number, to: number) =>
    interpolate(frame, [from * fps, to * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const gutter = Math.round(width * 0.08);

  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.ground, color: colors.body, fontFamily }}
    >
      <Img
        src={staticFile("brand/glo-mark-navy.svg")}
        style={{
          position: "absolute",
          top: gutter,
          left: gutter,
          width: Math.round(width * 0.07),
          opacity: fade(0, 0.4),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: gutter,
          right: gutter,
          bottom: gutter,
        }}
      >
        <div
          style={{
            fontWeight: 200,
            fontSize: Math.round(width * 0.074),
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
            opacity: fade(0.2, 0.8),
          }}
        >
          {headline}
        </div>
        <div
          style={{
            height: 1,
            backgroundColor: colors.hairline,
            marginTop: Math.round(width * 0.04),
            marginBottom: Math.round(width * 0.03),
            transformOrigin: "left",
            transform: `scaleX(${fade(0.6, 1.3)})`,
          }}
        />
        <div
          style={{
            fontWeight: 300,
            fontSize: Math.round(width * 0.026),
            opacity: fade(0.9, 1.4),
          }}
        >
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
