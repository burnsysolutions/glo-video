import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cover } from "./tokens";
import { fontFamily } from "./fonts";

export const END_CARD_SECONDS = 5;

/**
 * Page 12 of the 2026 brochure as a closing card: near-black ground, colour
 * mark top-left, the one-line description under a hairline, "Built once.
 * Yours to keep." in bold white, then the contact block under a second
 * hairline.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const gutter = Math.round(width * 0.07);

  const fade = (from: number, to: number) =>
    interpolate(frame, [from * fps, to * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const small = {
    fontSize: Math.round(width * 0.013),
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: cover.bg, color: cover.body, fontFamily }}>
      <Img
        src={staticFile("brand/glo-mark-colour.png")}
        style={{ position: "absolute", top: gutter, left: gutter, width: Math.round(width * 0.06), opacity: fade(0, 0.4) }}
      />

      <div style={{ position: "absolute", left: gutter, right: gutter, top: Math.round(height * 0.19) }}>
        <div style={{ height: 1, backgroundColor: cover.hairline, transformOrigin: "left", transform: `scaleX(${fade(0.2, 0.9)})` }} />
        <div
          style={{
            marginTop: Math.round(width * 0.045),
            maxWidth: Math.round(width * 0.62),
            fontWeight: 300,
            fontSize: Math.round(width * 0.026),
            lineHeight: 1.5,
            opacity: fade(0.4, 0.9),
          }}
        >
          Websites, systems and automations for small businesses across Sussex and remotely across the UK.
        </div>
      </div>

      <div style={{ position: "absolute", left: gutter, right: gutter, bottom: gutter }}>
        <div
          style={{
            color: cover.text,
            fontWeight: 700,
            fontSize: Math.round(width * 0.082),
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            opacity: fade(0.7, 1.3),
            transform: `translateY(${(1 - fade(0.7, 1.3)) * 10}px)`,
          }}
        >
          Built once.
          <br />
          Yours to keep.
        </div>
        <div
          style={{
            height: 1,
            backgroundColor: cover.hairline,
            marginTop: Math.round(width * 0.05),
            marginBottom: Math.round(width * 0.03),
            transformOrigin: "left",
            transform: `scaleX(${fade(1.2, 1.9)})`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", opacity: fade(1.6, 2.1) }}>
          <div>
            <div style={{ ...small, color: cover.eyebrow }}>Scott Burns · Founder</div>
            <div style={{ marginTop: Math.round(width * 0.012), fontWeight: 300, fontSize: Math.round(width * 0.022), lineHeight: 1.6 }}>
              07885 768970
              <br />
              scott@globusinesssolution.com
              <br />
              globusinesssolution.com
            </div>
          </div>
          <div style={{ ...small, fontWeight: 400, color: cover.muted, textAlign: "right", lineHeight: 1.9 }}>
            Henfield, West Sussex
            <br />
            Working across Sussex
            <br />
            and remotely across the UK
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
