import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useLayoutEffect, useRef, useState } from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { EndCard, END_CARD_SECONDS, colors, fontFamily } from "../brand";
import { matrix3d, type Point } from "../brand/homography";
import phoneTrack from "./phone-track.json";
import { FPS } from "../fps";

/*
 * Recruitment Automation Tools — the first sector video.
 *
 * Hook (call-centre footage) → four tools, each a full-page clip with the
 * words over its headroom → what our clients say → the brochure's back cover.
 * Copy is taken from the recruitment page and the 2026 brochure.
 */

const TRANSITION = 15;
const SECONDS = {
  hook: 5.5,
  availability: 7,
  cv: 7,
  caller: 7.5,
  websites: 9,
  clients: 7,
} as const;

const frames = (s: number) => Math.round(s * FPS);

export const RECRUITMENT_FRAMES =
  frames(SECONDS.hook) +
  frames(SECONDS.availability) +
  frames(SECONDS.cv) +
  frames(SECONDS.caller) +
  frames(SECONDS.websites) +
  frames(SECONDS.clients) +
  frames(END_CARD_SECONDS) -
  TRANSITION * 6;

/* ---------- shared pieces ---------- */

/** Fade-and-rise for one element, starting at `from` seconds within the section. */
const useReveal = (from: number, length = 0.5) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [from * fps, (from + length) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity: t, transform: `translateY(${(1 - t) * 10}px)` };
};

const Eyebrow: React.FC<{ children: React.ReactNode; from?: number }> = ({ children, from = 0 }) => {
  const { width } = useVideoConfig();
  const reveal = useReveal(from);
  return (
    <div
      style={{
        color: colors.eyebrow,
        fontSize: Math.round(width * 0.017),
        fontWeight: 400,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        ...reveal,
      }}
    >
      {children}
    </div>
  );
};

const Headline: React.FC<{ children: React.ReactNode; from?: number; size?: number }> = ({
  children,
  from = 0.15,
  size = 0.052,
}) => {
  const { width } = useVideoConfig();
  const reveal = useReveal(from, 0.6);
  return (
    <div
      style={{
        marginTop: Math.round(width * 0.014),
        fontWeight: 200,
        fontSize: Math.round(width * size),
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        color: colors.body,
        ...reveal,
      }}
    >
      {children}
    </div>
  );
};

/** Lines revealed one after another, a hairline between each. */
const Points: React.FC<{ items: readonly string[]; from?: number; every?: number; size?: number }> = ({
  items,
  from = 0.9,
  every = 0.55,
  size = 0.025,
}) => {
  const { width } = useVideoConfig();
  return (
    <div style={{ marginTop: Math.round(width * 0.025) }}>
      {items.map((text, i) => (
        <Point key={text} text={text} from={from + i * every} first={i === 0} size={size} />
      ))}
    </div>
  );
};

const Point: React.FC<{ text: string; from: number; first: boolean; size: number }> = ({ text, from, first, size }) => {
  const { width } = useVideoConfig();
  const reveal = useReveal(from, 0.45);
  return (
    <div
      style={{
        borderTop: first ? "none" : `1px solid ${colors.hairline}`,
        padding: `${Math.round(width * 0.011)}px 0`,
        fontWeight: 300,
        fontSize: Math.round(width * size),
        lineHeight: 1.3,
        color: colors.body,
        ...reveal,
      }}
    >
      {text}
    </div>
  );
};

/**
 * The rendered height of a block, so the clip can be placed under the text
 * rather than under a guess. Both outputs are 1080 wide and type scales with
 * width, so the wrapping is the same in each.
 */
const useMeasuredHeight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  });
  return { ref, height };
};

/** Number, eyebrow, headline, points. Sits over the clip's headroom. */
const TextBlock: React.FC<{
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  points: readonly string[];
  width: number;
  headlineSize?: number;
  pointSize?: number;
  align?: "left" | "right";
  measure?: React.RefObject<HTMLDivElement | null>;
}> = ({ number, eyebrow, headline, points, width, headlineSize, pointSize, align = "left", measure }) => {
  const { width: videoWidth } = useVideoConfig();
  const gutter = Math.round(videoWidth * 0.08);
  const numberReveal = useReveal(0);
  return (
    <div
      ref={measure}
      style={{
        position: "absolute",
        top: gutter,
        [align]: gutter,
        width,
        textAlign: align,
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: Math.round(videoWidth * 0.02),
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            color: colors.commitBright,
            fontSize: Math.round(videoWidth * 0.017),
            fontWeight: 400,
            letterSpacing: "0.12em",
            ...numberReveal,
          }}
        >
          {number}
        </div>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <Headline size={headlineSize}>{headline}</Headline>
      <Points items={points} size={pointSize} />
    </div>
  );
};

/** The clip plays for `play` frames, then holds its last frame. */
const Clip: React.FC<{
  file: string;
  play: number;
  playbackRate?: number;
  style: React.CSSProperties;
}> = ({ file, play, playbackRate = 1, style }) => (
  <>
    <Sequence from={0} durationInFrames={play} layout="none">
      <OffthreadVideo src={staticFile(file)} muted playbackRate={playbackRate} style={style} />
    </Sequence>
    <Sequence from={play} layout="none">
      <Freeze frame={play - 1}>
        <OffthreadVideo src={staticFile(file)} muted playbackRate={playbackRate} style={style} />
      </Freeze>
    </Sequence>
  </>
);

type Focus = { y0: number; y1: number };

/**
 * A mockup clip shown "full page": the page takes the clip's own background,
 * and the clip is scaled so the part that matters (`focus`, as fractions of
 * its height) sits below the text block. A clip that is narrower than the
 * page is centred, or left-aligned when its subject runs off its left edge.
 */
const clipPlacement = (
  src: { srcWidth: number; srcHeight: number },
  focus: Focus,
  textBottom: number,
  page: { width: number; height: number },
  align: "center" | "left",
) => {
  const gutter = Math.round(page.width * 0.08);
  const room = page.height - textBottom - gutter;
  const focusH = (focus.y1 - focus.y0) * src.srcHeight;
  const scale = Math.min(page.width / src.srcWidth, room / focusH);
  const drawW = src.srcWidth * scale;
  const drawH = src.srcHeight * scale;
  const focusTop = textBottom + (room - focusH * scale) / 2;
  const left = align === "left" ? 0 : (page.width - drawW) / 2;
  return { left, top: focusTop - focus.y0 * drawH, width: drawW, height: drawH };
};

const FullPageTool: React.FC<{
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  points: readonly string[];
  clip: { file: string; srcWidth: number; srcHeight: number; background: string; play: number; playbackRate?: number };
  focus: Focus;
  align?: "center" | "left";
}> = ({ number, eyebrow, headline, points, clip, focus, align = "center" }) => {
  const { width, height } = useVideoConfig();
  const gutter = Math.round(width * 0.08);
  const text = useMeasuredHeight();
  const textBottom = gutter + text.height + Math.round(width * 0.03);
  const place = clipPlacement(clip, focus, textBottom, { width, height }, align);

  return (
    <AbsoluteFill style={{ backgroundColor: clip.background }}>
      <Clip file={clip.file} play={clip.play} playbackRate={clip.playbackRate} style={{ position: "absolute", ...place }} />
      <TextBlock
        number={number}
        eyebrow={eyebrow}
        headline={headline}
        points={points}
        width={width - gutter * 2}
        measure={text.ref}
      />
    </AbsoluteFill>
  );
};

/* ---------- media ---------- */

const PORTRAIT = { srcWidth: 2160, srcHeight: 3840 } as const;

const MEDIA = {
  callCentre: { file: "stock/call-centre.mp4", ...PORTRAIT },
  availability: { file: "recordings/availability-phones.mp4", ...PORTRAIT, background: "#eff2f2", play: 148 },
  cvFormatter: { file: "recordings/cv-formatter.mp4", ...PORTRAIT, background: "#eff2f2", play: 148 },
  candidate: { file: "stock/candidate-phone.mp4", ...PORTRAIT, play: 150, playbackRate: 0.7 },
  website: { file: "recordings/avolon-website.mp4", ...PORTRAIT, background: "#fdfdfd", play: 300 },
  /** The close-up still: the screen is this region of the 1080×1920 image. */
  formStill: { file: "images/availability-form.jpg", x: 217, y: 216, w: 702, h: 1448 },
} as const;

/* ---------- sections ---------- */

/** Full-bleed placement of a portrait clip: fills the frame, centred. */
const coverPlacement = (page: { width: number; height: number }) => {
  const scale = Math.max(page.width / PORTRAIT.srcWidth, page.height / PORTRAIT.srcHeight);
  const drawW = PORTRAIT.srcWidth * scale;
  const drawH = PORTRAIT.srcHeight * scale;
  return { left: (page.width - drawW) / 2, top: (page.height - drawH) / 2, width: drawW, height: drawH, scale };
};

/** Call-centre footage, the colour mark top-left, a flat ground band carrying the line. */
const Hook: React.FC = () => {
  const { width, height } = useVideoConfig();
  const gutter = Math.round(width * 0.08);
  const place = coverPlacement({ width, height });
  const markReveal = useReveal(0.2, 0.5);
  const subline = useReveal(1.0, 0.6);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily }}>
      <OffthreadVideo
        src={staticFile(MEDIA.callCentre.file)}
        muted
        playbackRate={0.9}
        style={{ position: "absolute", left: place.left, top: place.top, width: place.width, height: place.height }}
      />
      <Img
        src={staticFile("brand/glo-mark-colour.png")}
        style={{ position: "absolute", top: gutter, left: gutter, width: Math.round(width * 0.09), ...markReveal }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${Math.round(width * 0.05)}px ${gutter}px ${gutter}px`,
          backgroundColor: colors.ground,
        }}
      >
        <Eyebrow from={0.3}>For recruitment agencies</Eyebrow>
        <Headline from={0.45} size={0.075}>
          AI Automations
        </Headline>
        <div
          style={{
            marginTop: Math.round(width * 0.02),
            fontWeight: 300,
            fontSize: Math.round(width * 0.028),
            color: colors.body,
            ...subline,
          }}
        >
          Four tools that keep a desk moving without a resourcer.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Availability: React.FC = () => (
  <FullPageTool
    number="01"
    eyebrow="Automated availability"
    headline="Your database keeps itself current."
    points={[
      "Availability, compliance and reviews confirmed by text and email",
      "Every answer written straight back to the CRM",
      "No resourcer, no out-of-date records",
    ]}
    clip={MEDIA.availability}
    focus={{ y0: 0.371, y1: 0.973 }}
  />
);

const CvFormatter: React.FC = () => (
  <FullPageTool
    number="02"
    eyebrow="CV formatter"
    headline="Client-ready CVs in seconds."
    points={[
      "Your branding on every CV, every time",
      "Confidential mode redacts the employer with one click",
      "Download as Word. No retyping",
    ]}
    clip={MEDIA.cvFormatter}
    focus={{ y0: 0.321, y1: 0.86 }}
  />
);

/** The tracked screen corners at a clip frame, in clip pixels. */
const screenCorners = (clipFrame: number): Point[] => {
  const keys = phoneTrack as { frame: number; corners: [number, number][] }[];
  const last = keys[keys.length - 1];
  if (clipFrame >= last.frame) return last.corners;
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].frame <= clipFrame) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = (clipFrame - a.frame) / (b.frame - a.frame);
  return a.corners.map((c, j): Point => [
    c[0] + (b.corners[j][0] - c[0]) * t,
    c[1] + (b.corners[j][1] - c[1]) * t,
  ]);
};

/** The availability form laid onto the candidate's phone screen, following his hand. */
const PhoneScreen: React.FC<{ place: ReturnType<typeof coverPlacement>; playbackRate: number; play: number }> = ({
  place,
  playbackRate,
  play,
}) => {
  const frame = useCurrentFrame();
  const clipFrame = Math.min(frame, play - 1) * playbackRate;
  const corners = screenCorners(clipFrame).map(
    ([x, y]) => [place.left + x * place.scale, place.top + y * place.scale] as Point,
  );
  const { w, h, x, y } = MEDIA.formStill;
  const still = MEDIA.formStill;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        overflow: "hidden",
        borderRadius: Math.round(w * 0.07),
        transformOrigin: "0 0",
        transform: matrix3d(w, h, corners),
      }}
    >
      <Img
        src={staticFile(still.file)}
        style={{ position: "absolute", left: -x, top: -y, width: 1080, height: 1920 }}
      />
      {/* A faint sheen so the flat image reads as glass. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.05) 100%)",
        }}
      />
    </div>
  );
};

const AiCaller: React.FC = () => {
  const { width, height } = useVideoConfig();
  const gutter = Math.round(width * 0.08);
  const place = coverPlacement({ width, height });
  const clip = MEDIA.candidate;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <Clip
        file={clip.file}
        play={clip.play}
        playbackRate={clip.playbackRate}
        style={{ position: "absolute", left: place.left, top: place.top, width: place.width, height: place.height }}
      />
      <PhoneScreen place={place} playbackRate={clip.playbackRate} play={clip.play} />
      <TextBlock
        number="03"
        eyebrow="AI caller"
        headline="1 – 1,000 calls a day, updates your CRM."
        points={[
          "Reference, document, compliance and availability calls",
          "The CRM updated the moment the call ends",
          "Your own voice, cloned",
        ]}
        width={Math.round((width - gutter * 2) * 0.47)}
        headlineSize={0.043}
        pointSize={0.022}
        align="right"
      />
    </AbsoluteFill>
  );
};

const Websites: React.FC = () => (
  <FullPageTool
    number="04"
    eyebrow="Websites"
    headline="Built to be found. Built to bring the work in."
    points={[
      "Live job listings and candidate registration into your CRM",
      "Employer enquiries routed to the right desk",
      "Owned outright. No licence, no monthly fee",
    ]}
    clip={MEDIA.website}
    focus={{ y0: 0.373, y1: 0.952 }}
    align="left"
  />
);

/** Chris Tunnicliffe's quote from the brochure, then what Avolon actually got. Centred. */
const Clients: React.FC = () => {
  const { width } = useVideoConfig();
  const gutter = Math.round(width * 0.08);
  const photo = Math.round(width * 0.1);
  const quote = useReveal(0.4, 0.7);
  const who = useReveal(1.1, 0.5);
  const got = [
    "A page for every vacancy, fed from Bullhorn each day",
    "Registrations land in the CRM as records, cards attached",
    "A request-staff form that lands, not an email that gets lost",
    "Timesheets read from email. Invoicing and pay runs handled",
    "An agent that rings candidates in the evening",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ground,
        fontFamily,
        color: colors.body,
        justifyContent: "center",
        padding: `0 ${gutter}px`,
      }}
    >
      <Eyebrow>What our clients say</Eyebrow>
      <div
        style={{
          marginTop: Math.round(width * 0.025),
          fontWeight: 200,
          fontSize: Math.round(width * 0.037),
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          ...quote,
        }}
      >
        “From the very first consultation, through design and implementation, to ironing out those last few
        inevitable snaggy bits, Scott has provided an absolutely first-class service throughout.”
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: Math.round(width * 0.022), marginTop: Math.round(width * 0.03), ...who }}>
        <Img
          src={staticFile("images/chris-tunnicliffe.webp")}
          style={{ width: photo, height: photo, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <div style={{ fontWeight: 400, fontSize: Math.round(width * 0.023) }}>Chris Tunnicliffe</div>
          <div style={{ fontWeight: 300, fontSize: Math.round(width * 0.019), color: colors.commitBright }}>
            Director, Avolon Group, Hove
          </div>
        </div>
      </div>
      <div style={{ marginTop: Math.round(width * 0.05) }}>
        <Eyebrow from={1.5}>What Avolon got</Eyebrow>
        <Points items={got} from={1.7} every={0.45} size={0.024} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

/** TransitionSeries inspects its children, so the transition must be a literal element. */
const timing = linearTiming({ durationInFrames: TRANSITION });

export const RecruitmentAutomation: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.hook)}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.availability)}>
        <Availability />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.cv)}>
        <CvFormatter />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.caller)}>
        <AiCaller />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.websites)}>
        <Websites />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(SECONDS.clients)}>
        <Clients />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={frames(END_CARD_SECONDS)}>
        <EndCard />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
