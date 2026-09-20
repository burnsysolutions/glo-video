import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";
import { EASE } from "./motion";

/*
 * Drawn device frames: phone, tablet, laptop. No images — the body is a
 * near-black rounded panel with a 1px lighter edge, a soft shadow, and a
 * screen inset that shows a screenshot or any React child. Every device is
 * tilted in perspective and the tilt drifts a few degrees over the sequence.
 */

export { EASE };

const BODY = colors.midnight;
const EDGE = "rgba(255,255,255,0.14)";
const SHADOW = "0 40px 80px rgba(34,55,84,0.18)";

export type Tilt = {
  rotateY: number;
  rotateX: number;
  /** Degrees rotateY eases by over the sequence, so the device is never static. */
  driftY?: number;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type ScreenImage = {
  file: string;
  srcWidth: number;
  srcHeight: number;
  /** Cover the screen, keeping this point centred (fractions). */
  focus?: { x: number; y: number };
  /** Fit the width and anchor to the top (page-like), rather than cover. */
  fitWidth?: boolean;
  /** Push in to this scale over the sequence, about `origin` (fractions of the screen). */
  pushTo?: number;
  origin?: { x: number; y: number };
  /** Or a hard crop: the source region that fills the screen at the end, starting from `from`. */
  regionTo?: Rect;
  regionFrom?: Rect;
};

type Props = {
  variant: "phone" | "tablet" | "laptop";
  /** Outer width of the device body, px. */
  width: number;
  /** Tablet only. */
  landscape?: boolean;
  tilt: Tilt;
  image?: ScreenImage;
  children?: React.ReactNode;
  /** Local frame the device is measured from for drift and push, default 0. */
  style?: React.CSSProperties;
};

const SPEC = {
  phone: { bezel: 18, radius: 44, aspect: 0.462 },
  tablet: { bezel: 22, radius: 28, aspect: 0.72 },
  laptop: { bezel: 14, radius: 18, aspect: 1.6 },
} as const;

/** The screen's size for a device of `width`. */
export const screenSize = (variant: Props["variant"], width: number, landscape = false) => {
  const sp = SPEC[variant];
  const screenW = width - sp.bezel * 2;
  const screenH =
    variant === "phone" ? screenW / sp.aspect : variant === "laptop" ? screenW / sp.aspect : landscape ? screenW * sp.aspect : screenW / sp.aspect;
  return { screenW: Math.round(screenW), screenH: Math.round(screenH) };
};

/** Total footprint (body plus the laptop base) for layout. */
export const deviceSize = (variant: Props["variant"], width: number, landscape = false) => {
  const sp = SPEC[variant];
  const { screenH } = screenSize(variant, width, landscape);
  const bodyH = screenH + sp.bezel * 2;
  const baseH = variant === "laptop" ? Math.round(width * 0.05) : 0;
  return { width: variant === "laptop" ? Math.round(width * 1.1) : width, height: bodyH + baseH, bodyH, baseH };
};

export const Screen: React.FC<{ image?: ScreenImage; children?: React.ReactNode; w: number; h: number }> = ({ image, children, w, h }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  if (!image) return <>{children}</>;
  if (image.regionTo) {
    const from = image.regionFrom ?? image.regionTo;
    const r = {
      x: from.x + (image.regionTo.x - from.x) * t,
      y: from.y + (image.regionTo.y - from.y) * t,
      w: from.w + (image.regionTo.w - from.w) * t,
      h: from.h + (image.regionTo.h - from.h) * t,
    };
    const k = w / r.w;
    return (
      <Img
        src={staticFile(image.file)}
        style={{ position: "absolute", left: -r.x * k, top: -r.y * k, width: image.srcWidth * k, height: image.srcHeight * k }}
      />
    );
  }
  const push = 1 + ((image.pushTo ?? 1) - 1) * t;
  const origin = image.origin ?? { x: 0.5, y: 0.5 };
  const focus = image.focus ?? { x: 0.5, y: 0.5 };
  const scale = image.fitWidth ? w / image.srcWidth : Math.max(w / image.srcWidth, h / image.srcHeight);
  const drawW = image.srcWidth * scale;
  const drawH = image.srcHeight * scale;
  const left = image.fitWidth ? 0 : Math.min(0, Math.max(w - drawW, w / 2 - focus.x * drawW));
  const top = image.fitWidth ? 0 : Math.min(0, Math.max(h - drawH, h / 2 - focus.y * drawH));
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: `${origin.x * 100}% ${origin.y * 100}%` }}>
      <Img src={staticFile(image.file)} style={{ position: "absolute", left, top, width: drawW, height: drawH }} />
    </div>
  );
};

export const Device: React.FC<Props> = ({ variant, width, landscape = false, tilt, image, children, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sp = SPEC[variant];
  const { screenW, screenH } = screenSize(variant, width, landscape);
  const size = deviceSize(variant, width, landscape);
  const drift = interpolate(frame, [0, durationInFrames], [0, tilt.driftY ?? 4], { extrapolateRight: "clamp", easing: EASE });
  const rotateY = tilt.rotateY + drift;
  const innerRadius = Math.max(4, sp.radius - sp.bezel);

  const body = (
    <div
      style={{
        position: "relative",
        width,
        height: size.bodyH,
        backgroundColor: BODY,
        borderRadius: variant === "laptop" ? `${sp.radius}px ${sp.radius}px 6px 6px` : sp.radius,
        boxShadow: `${SHADOW}, inset 0 0 0 1px ${EDGE}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sp.bezel,
          top: sp.bezel,
          width: screenW,
          height: screenH,
          borderRadius: innerRadius,
          overflow: "hidden",
          backgroundColor: colors.ground,
        }}
      >
        <Screen image={image} w={screenW} h={screenH}>
          {children}
        </Screen>
      </div>
      {variant === "phone" ? (
        <>
          {/* Dynamic island */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: sp.bezel + Math.round(width * 0.03),
              width: Math.round(width * 0.28),
              height: Math.round(width * 0.075),
              marginLeft: -Math.round(width * 0.14),
              borderRadius: 999,
              backgroundColor: BODY,
            }}
          />
          {/* Side buttons */}
          <div style={{ position: "absolute", right: -3, top: Math.round(size.bodyH * 0.22), width: 3, height: Math.round(width * 0.16), backgroundColor: BODY, borderRadius: 2 }} />
          <div style={{ position: "absolute", left: -3, top: Math.round(size.bodyH * 0.17), width: 3, height: Math.round(width * 0.06), backgroundColor: BODY, borderRadius: 2 }} />
          <div style={{ position: "absolute", left: -3, top: Math.round(size.bodyH * 0.25), width: 3, height: Math.round(width * 0.1), backgroundColor: BODY, borderRadius: 2 }} />
          <div style={{ position: "absolute", left: -3, top: Math.round(size.bodyH * 0.37), width: 3, height: Math.round(width * 0.1), backgroundColor: BODY, borderRadius: 2 }} />
        </>
      ) : null}
      {variant === "tablet" ? (
        <div style={{ position: "absolute", right: -3, top: Math.round(size.bodyH * 0.1), width: 3, height: Math.round(width * 0.05), backgroundColor: BODY, borderRadius: 2 }} />
      ) : null}
    </div>
  );

  return (
    <div style={{ perspective: 2000, perspectiveOrigin: "50% 50%", width: size.width, height: size.height, ...style }}>
      <div
        style={{
          width: size.width,
          height: size.height,
          transform: `rotateY(${rotateY}deg) rotateX(${tilt.rotateX}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ marginLeft: Math.round((size.width - width) / 2) }}>{body}</div>
        {variant === "laptop" ? (
          <div
            style={{
              width: size.width,
              height: size.baseH,
              marginTop: -2,
              backgroundColor: BODY,
              clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)",
              boxShadow: `inset 0 1px 0 ${EDGE}`,
              borderRadius: "0 0 10px 10px",
            }}
          >
            {/* Trackpad notch on the base edge */}
            <div style={{ position: "absolute", left: "50%", top: 0, width: Math.round(width * 0.16), height: 4, marginLeft: -Math.round(width * 0.08), backgroundColor: EDGE, borderRadius: "0 0 4px 4px" }} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
