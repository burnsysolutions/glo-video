import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { matrix3d, type Point } from "./homography";
import candidatePhone from "../../public/plates/candidate-phone.track.json";
import elevenPhone from "../../public/plates/eleven-phone.track.json";
import klingPhone from "../../public/plates/kling-phone.track.json";

/*
 * Screen replacement on a tracked stock plate. The plate is a video of a
 * person holding a device; scripts/ingest_plate.py tracked its screen and
 * wrote the four corners per frame. Children are laid out in the device's
 * own pixel space and mapped onto the screen with a homography, so they
 * sit on the glass and follow the hand.
 */

type Track = {
  width: number;
  height: number;
  fps: number;
  plate: string;
  screen_px: [number, number];
  /** How far the top edge is extended upward, as a share of screen height (the tracker stops at the notch). */
  top_extend?: number;
  /** A punch-hole camera instead of a notch: centre and radius as fractions of screen width (y of height). */
  hole?: { x: number; y: number; r: number };
  frames: { frame: number; corners: number[][] }[];
};

const TRACKS: Record<string, Track> = {
  "candidate-phone": candidatePhone as unknown as Track,
  "eleven-phone": elevenPhone as unknown as Track,
  "kling-phone": klingPhone as unknown as Track,
};

type Props = {
  track: keyof typeof TRACKS;
  children?: React.ReactNode;
  /** Extra scale on top of cover fit, and which point of the plate stays centred. */
  zoom?: number;
  focus?: { x: number; y: number };
  playbackRate?: number;
};

/**
 * The tracker stops at the bottom of the notch; the glass carries on above
 * it either side. Extend the top edge upward by this share of screen height
 * along the side edges, then draw the notch back over the UI.
 */
const TOP_EXTEND = 0.04;
const NOTCH = { width: 0.59, height: 0.043, radius: 0.02 };

const cornersAt = (track: Track, frame: number): Point[] => {
  const frames = track.frames;
  let best = frames[0];
  for (const f of frames) {
    if (Math.abs(f.frame - frame) < Math.abs(best.frame - frame)) best = f;
    if (f.frame >= frame) break;
  }
  return best.corners.map((c) => [c[0], c[1]] as Point);
};

export const ScreenPlate: React.FC<Props> = ({ track, children, zoom = 1, focus = { x: 0.5, y: 0.5 }, playbackRate = 1 }) => {
  const t = TRACKS[track];
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const [screenW, screenH] = t.screen_px;

  // Cover fit, with an optional push and focus, shared by the video and the corners.
  const scale = Math.max(width / t.width, height / t.height) * zoom;
  const drawW = t.width * scale;
  const drawH = t.height * scale;
  const left = Math.min(0, Math.max(width - drawW, width / 2 - focus.x * drawW));
  const top = Math.min(0, Math.max(height - drawH, height / 2 - focus.y * drawH));

  // The track is indexed at the plate's own frame rate.
  const plateFrame = Math.round((frame * playbackRate * t.fps) / fps);
  const [tl, tr, br, bl] = cornersAt(t, plateFrame);
  // Move the top corners up along their own side edges by the track's top_extend of the screen height.
  const topExtend = t.top_extend ?? TOP_EXTEND;
  const extend = (topC: Point, bottomC: Point): Point => {
    const dx = topC[0] - bottomC[0];
    const dy = topC[1] - bottomC[1];
    return [topC[0] + dx * topExtend, topC[1] + dy * topExtend];
  };
  const quad: Point[] = [extend(tl, bl), extend(tr, br), br, bl].map(([x, y]) => [left + x * scale, top + y * scale] as Point);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(t.plate)}
        muted
        playbackRate={playbackRate}
        style={{ position: "absolute", left, top, width: drawW, height: drawH }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: screenW,
          height: screenH,
          overflow: "hidden",
          borderRadius: Math.round(screenW * 0.065),
          transformOrigin: "0 0",
          transform: matrix3d(screenW, screenH, quad),
          backgroundColor: "#ffffff",
        }}
      >
        {children}
        {t.hole ? (
          <div
            style={{
              position: "absolute",
              left: Math.round(screenW * (t.hole.x - t.hole.r)),
              top: Math.round(screenH * t.hole.y - screenW * t.hole.r),
              width: Math.round(screenW * t.hole.r * 2),
              height: Math.round(screenW * t.hole.r * 2),
              borderRadius: "50%",
              backgroundColor: "#000000",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: Math.round(screenW * NOTCH.width),
              height: Math.round(screenH * NOTCH.height),
              marginLeft: -Math.round((screenW * NOTCH.width) / 2),
              borderRadius: `0 0 ${Math.round(screenW * NOTCH.radius)}px ${Math.round(screenW * NOTCH.radius)}px`,
              backgroundColor: "#000000",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

/** The device pixel space children of a ScreenPlate are laid out in. */
export const screenPx = (track: keyof typeof TRACKS) => TRACKS[track].screen_px;
