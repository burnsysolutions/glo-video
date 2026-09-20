import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  file: string;
  srcWidth: number;
  srcHeight: number;
  /** Rows of the source to keep (px), for a shot taller than the others. */
  crop?: { y: number; height: number };
  /** Top edge in the frame, px at 1080×1920 scale already applied by the caller. */
  top: number;
  /** Push in toward this point of the shot, as fractions of its width and height. */
  toward?: { x: number; y: number };
  /** Scale at the end of the sequence (1.08 to 1.15). */
  pushTo?: number;
  /** Scale at the start; above 1 the box itself is taller than the full-width fit. */
  scale?: number;
  /** Which point of the shot sits at the box centre when scaled above 1. */
  focus?: { x: number; y: number };
  /**
   * A hard crop: the source region (px) that fills the frame width at the end
   * of the sequence, and the wider region it starts from. Rows become readable
   * because 1400–1800 source px map onto 1080. The rest of the page falls
   * outside the frame.
   */
  regionTo?: Rect;
  regionFrom?: Rect;
};

export type Rect = { x: number; y: number; w: number; h: number };

/** `to` widened by `factor` about its centre, kept inside the source. */
export const widen = (to: Rect, factor: number, srcWidth: number, srcHeight: number): Rect => {
  const w = Math.min(srcWidth, to.w * factor);
  const h = w * (to.h / to.w);
  const x = Math.max(0, Math.min(srcWidth - w, to.x + to.w / 2 - w / 2));
  const y = Math.max(0, Math.min(srcHeight - h, to.y + to.h / 2 - h / 2));
  return { x, y, w, h };
};

/**
 * A landscape app screenshot spanning the full frame width, its own ground
 * above and below, pushed in slowly toward the region that matters. Never
 * letterboxed, never bordered.
 */
export const Screenshot: React.FC<Props> = ({
  file,
  srcWidth,
  srcHeight,
  crop,
  top,
  toward = { x: 0.5, y: 0.5 },
  pushTo = 1.1,
  scale = 1,
  focus = { x: 0.5, y: 0.5 },
  regionTo,
  regionFrom,
}) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  if (regionTo) {
    const from = regionFrom ?? regionTo;
    const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
    const e = 1 - Math.pow(1 - t, 2);
    const r = {
      x: from.x + (regionTo.x - from.x) * e,
      y: from.y + (regionTo.y - from.y) * e,
      w: from.w + (regionTo.w - from.w) * e,
      h: from.h + (regionTo.h - from.h) * e,
    };
    const k = width / r.w;
    const boxH = Math.round(width * (regionTo.h / regionTo.w));
    return (
      <div style={{ position: "absolute", left: 0, top, width, height: boxH, overflow: "hidden" }}>
        <Img
          src={staticFile(file)}
          style={{ position: "absolute", left: -r.x * k, top: -r.y * k, width: srcWidth * k, height: srcHeight * k }}
        />
      </div>
    );
  }
  const fit = (width / srcWidth) * scale;
  const cropY = crop?.y ?? 0;
  const cropH = crop?.height ?? srcHeight;
  const boxH = Math.round(cropH * fit);
  const drawW = Math.round(srcWidth * fit);
  const left = scale > 1 ? Math.min(0, Math.max(width - drawW, width / 2 - focus.x * drawW)) : 0;
  const push = interpolate(frame, [0, durationInFrames], [1, pushTo], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: 0, top, width, height: boxH, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: `${toward.x * 100}% ${toward.y * 100}%` }}>
        <Img
          src={staticFile(file)}
          style={{ position: "absolute", left, top: -Math.round(cropY * fit), width: drawW, height: Math.round(srcHeight * fit) }}
        />
      </div>
    </div>
  );
};

/** Height the screenshot box will take at the frame width, for laying text around it. */
export const screenshotHeight = (width: number, srcWidth: number, srcHeight: number, cropHeight?: number) =>
  Math.round((cropHeight ?? srcHeight) * (width / srcWidth));
