import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  /** Path under public/. Video by extension. */
  file: string;
  srcWidth: number;
  srcHeight: number;
  /** Extra scale on top of cover fit, so a detail fills the frame. */
  scale?: number;
  /** Ken Burns: the scale multiplier at the end of the sequence (1.03 to 1.06). */
  zoomTo?: number;
  /** Where the push-in heads, as fractions of the frame. */
  origin?: { x: number; y: number };
  /** Which point of the source sits at the frame centre, as fractions of the source. */
  focus?: { x: number; y: number };
  opacity?: number;
  playbackRate?: number;
  /** Move the drawn media down by this many px, so the page ground shows above it for text. */
  offsetY?: number;
};

const VIDEO = /\.(mp4|mov|webm|m4v)$/i;

/** Cover-fit media filling the whole frame, with a slow Ken Burns push. Never boxed. */
export const FullBleed: React.FC<Props> = ({
  file,
  srcWidth,
  srcHeight,
  scale = 1,
  zoomTo = 1.05,
  origin = { x: 0.5, y: 0.5 },
  focus = { x: 0.5, y: 0.5 },
  opacity = 1,
  playbackRate = 1,
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const cover = Math.max(width / srcWidth, height / srcHeight) * scale;
  const drawW = srcWidth * cover;
  const drawH = srcHeight * cover;
  // Keep the focus point centred, but never expose an edge.
  const left = Math.min(0, Math.max(width - drawW, width / 2 - focus.x * drawW));
  const top = Math.min(0, Math.max(height - drawH, height / 2 - focus.y * drawH)) + offsetY;
  const zoom = interpolate(frame, [0, durationInFrames], [1, zoomTo], { extrapolateRight: "clamp" });
  const style: React.CSSProperties = { position: "absolute", left, top, width: drawW, height: drawH };

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x * 100}% ${origin.y * 100}%` }}>
        {VIDEO.test(file) ? (
          <OffthreadVideo src={staticFile(file)} muted playbackRate={playbackRate} style={style} />
        ) : (
          <Img src={staticFile(file)} style={style} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
