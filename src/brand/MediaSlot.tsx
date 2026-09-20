import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";

/** A region of the source, as fractions of its width and height. */
export type Crop = { x: number; y: number; w: number; h: number };

type Props = {
  /** Path under public/, e.g. "recordings/crm.mp4". */
  file: string;
  /** Pixel size of the source, so the crop can be placed exactly. */
  srcWidth: number;
  srcHeight: number;
  /** Which part of the source fills the panel (cover). Default: all of it. */
  crop?: Crop;
  /** Colour behind the media; match the mockup's own ground so no seam shows. */
  background?: string;
  width: number;
  height: number;
  /** Stills drift in very slowly so they read as footage, not a slide. */
  drift?: boolean;
  playbackRate?: number;
  /** Fade the media in over this many frames (used for cuts inside a section). */
  fadeIn?: number;
  fadeOut?: number;
  /** Frames the media is shown for; needed for fadeOut. */
  durationInFrames?: number;
};

const VIDEO = /\.(mp4|mov|webm|m4v)$/i;
const FULL: Crop = { x: 0, y: 0, w: 1, h: 1 };

/**
 * Hairline-framed panel holding a screen recording or a still, cropped to the
 * region that matters. The media is laid out by hand rather than object-fit
 * so the crop is exact and the same on both output sizes.
 */
export const MediaSlot: React.FC<Props> = ({
  file,
  srcWidth,
  srcHeight,
  crop = FULL,
  background = colors.ground,
  width,
  height,
  drift = true,
  playbackRate = 1,
  fadeIn = 0,
  fadeOut = 0,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: sectionFrames } = useVideoConfig();
  const total = durationInFrames ?? sectionFrames;

  const cropW = srcWidth * crop.w;
  const cropH = srcHeight * crop.h;
  const scale = Math.max(width / cropW, height / cropH);
  const drawW = srcWidth * scale;
  const drawH = srcHeight * scale;
  const left = width / 2 - (crop.x + crop.w / 2) * drawW;
  const top = height / 2 - (crop.y + crop.h / 2) * drawH;

  const zoom = drift ? interpolate(frame, [0, total], [1, 1.04]) : 1;
  const opacity =
    Math.min(
      fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" }) : 1,
      fadeOut > 0
        ? interpolate(frame, [total - fadeOut, total], [1, 0], { extrapolateLeft: "clamp" })
        : 1,
    );

  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    left,
    top,
    width: drawW,
    height: drawH,
  };

  return (
    <div
      style={{
        width,
        height,
        border: `1px solid ${colors.hairline}`,
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: background,
        position: "relative",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
      >
        {VIDEO.test(file) ? (
          <OffthreadVideo
            src={staticFile(file)}
            muted
            playbackRate={playbackRate}
            style={mediaStyle}
          />
        ) : (
          <Img src={staticFile(file)} style={mediaStyle} />
        )}
      </div>
    </div>
  );
};
