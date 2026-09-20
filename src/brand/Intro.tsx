import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";

export const INTRO_SECONDS = 3;

type Props = {
  /** One line of Poppins 200 under the mark. */
  line?: string;
};

/** Ground colour, the colour mark fades and settles in the centre, one line below. */
export const Intro: React.FC<Props> = ({ line = "Glo Business Solutions" }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const settle = spring({ frame, fps, config: { damping: 200, stiffness: 60 } });
  const markScale = interpolate(settle, [0, 1], [1.06, 1]);
  const markOpacity = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [fps * 0.5, fps * 1.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineY = interpolate(lineOpacity, [0, 1], [8, 0]);

  const markWidth = Math.round(width * 0.22);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ground,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <Img
        src={staticFile("brand/glo-mark-colour.png")}
        style={{
          width: markWidth,
          opacity: markOpacity,
          transform: `scale(${markScale})`,
        }}
      />
      <div
        style={{
          marginTop: Math.round(width * 0.045),
          fontWeight: 200,
          fontSize: Math.round(width * 0.036),
          letterSpacing: "-0.01em",
          color: colors.body,
          opacity: lineOpacity,
          transform: `translateY(${lineY}px)`,
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  );
};
