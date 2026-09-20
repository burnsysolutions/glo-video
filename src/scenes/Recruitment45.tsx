import { AbsoluteFill, Img, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CheckLine, Chip, Counter, EASE, Eyebrow, GUTTER, Grain, ProgressRing, SectionTitle, Wash, colors, depthShadow, fontFamily, useDrift, useMeasuredHeight, useReveal, useRise, useS } from "../brand";
import { AICallerLoop } from "./AICallerLoop";
import { FPS } from "../fps";

/*
 * Recruitment overview, 35 seconds. The products are shown on the
 * photographed device mockups and recordings from the brochure, and the
 * real captures, never drawn and never pushed in; the intro and outro sit
 * on the marketing midnight. Four transitions only: band wipe, handoff,
 * screen change, scale cut. Every easing is cubic-bezier(0.22, 1, 0.36, 1).
 */

/*
 * Recruitment Automations, v4. 45 seconds. The products are shown on the
 * photographed device mockups, the recordings and the real captures; a
 * person opens the film and the caller scene. Motion is frame-based: the
 * house easing, a blur reveal on titles, logos and the end card, a plain
 * rise on body lines, a few pixels of parallax and never a zoom on a
 * screenshot. Grain sits over the whole composition.
 */
export const R45_FRAMES = 45 * FPS;

/** Scene boundaries, frames. */
const T = {
  intro: 0,
  s1: 90,
  s2: 270,
  s3: 375,
  s4: 600,
  s5: 705,
  integrations: 990,
  proof: 1080,
  outro: 1200,
  end: 1350,
} as const;

const WIPE = 12; // 400ms
const HANDOFF = 10; // 350ms
const eased = (t: number) => EASE(Math.min(1, Math.max(0, t)));

/* ---------- transition plumbing ---------- */

type SlotProps = {
  from: number;
  to: number;
  /** A band wipe reveals this scene at `from`. */
  wipeIn?: boolean;
  /** This scene is covered by a band wipe at `to`. */
  wipeOut?: boolean;
  /** Device handoff: slides in from the right at `from` / out to the left at `to`. */
  slideIn?: boolean;
  slideOut?: boolean;
  children: React.ReactNode;
};

/**
 * A scene between two boundaries. The sequence starts early or runs late by
 * half a transition so both scenes exist while a wipe or handoff plays.
 */
const Slot: React.FC<SlotProps> = ({ from, to, wipeIn, wipeOut, slideIn, slideOut, children }) => {
  const lead = wipeIn ? WIPE / 2 : slideIn ? HANDOFF / 2 : 0;
  const tail = wipeOut ? WIPE / 2 : slideOut ? HANDOFF / 2 : 0;
  const start = from - lead;
  return (
    <Sequence from={start} durationInFrames={to + tail - start} layout="none">
      <SlotInner start={start} from={from} to={to} wipeIn={wipeIn} slideIn={slideIn} slideOut={slideOut}>
        {children}
      </SlotInner>
    </Sequence>
  );
};

const SlotInner: React.FC<Omit<SlotProps, "wipeOut"> & { start: number }> = ({ start, from, to, wipeIn, slideIn, slideOut, children }) => {
  const frame = useCurrentFrame() + start;
  const { width } = useVideoConfig();
  let transform = "none";
  let clipPath: string | undefined;
  if (slideIn && frame < from + HANDOFF / 2) {
    const e = eased((frame - (from - HANDOFF / 2)) / HANDOFF);
    transform = `translateX(${Math.round(width * (1 - e))}px)`;
  }
  if (slideOut && frame > to - HANDOFF / 2) {
    const e = eased((frame - (to - HANDOFF / 2)) / HANDOFF);
    transform = `translateX(${-Math.round(width * e)}px)`;
  }
  if (wipeIn && frame < from + WIPE / 2) {
    const p = eased((frame - (from - WIPE / 2)) / WIPE);
    const trailing = p * (width + BAND_W) - BAND_W;
    clipPath = `inset(0 ${Math.max(0, width - trailing)}px 0 0)`;
  }
  return <AbsoluteFill style={{ transform, clipPath }}>{children}</AbsoluteFill>;
};

const BAND_W = 260;

/** The midnight band that sweeps across at a wipe boundary. Rendered above every scene. */
const Band: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  if (frame < at - WIPE / 2 || frame > at + WIPE / 2) return null;
  const p = eased((frame - (at - WIPE / 2)) / WIPE);
  const trailing = p * (width + BAND_W) - BAND_W;
  return <div style={{ position: "absolute", top: 0, bottom: 0, left: trailing, width: BAND_W, backgroundColor: colors.midnight }} />;
};

/* ---------- shared layout ---------- */

/** Eyebrow, a title on the full reveal, then checks on the plain rise, 4 frames apart. */
const TextBlock: React.FC<{
  eyebrow: string;
  title: string;
  checks?: { lead: string; body?: string }[];
  width?: number;
  titleSize?: number;
  checkSize?: number;
  tone?: "ink" | "white";
  /** Local frame the first check starts; the title reveals from 2. */
  checksFrom?: number;
}> = ({ eyebrow, title, checks = [], width, titleSize = 92, checkSize = 32, tone = "ink", checksFrom = 16 }) => {
  const s = useS();
  const reveal = useReveal(2);
  return (
    <div style={{ width, fontFamily }}>
      <Eyebrow from={0} tone={tone}>{eyebrow}</Eyebrow>
      <div
        style={{
          marginTop: Math.round(18 * s),
          fontSize: Math.round(titleSize * s),
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: tone === "white" ? "#ffffff" : colors.body,
          ...reveal,
        }}
      >
        {title}
      </div>
      {checks.length ? (
        <div style={{ marginTop: Math.round(22 * s) }}>
          {checks.map((c, i) => (
            <CheckLine key={c.lead} lead={c.lead} from={checksFrom + 4 * i} size={checkSize} tone={tone}>
              {c.body}
            </CheckLine>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- intro / outro ---------- */

/**
 * Frame 1 is a person: the agents in call-centre.mp4, cover-fit. A midnight
 * band only as heavy as the title needs, the colour mark small top-right.
 * Into 01 the frame closes to an 85% inset panel and 01 grows out of it.
 */
const Intro: React.FC = () => {
  const { width, height } = useVideoConfig();
  const s = useS();
  const title = useReveal(4);
  const sub = useRise(18);
  const gutter = Math.round(width * 0.08);
  const text = useMeasuredHeight();
  const bottom = Math.round(120 * s);
  const cover = Math.max(width / 2160, height / 3840);
  const drift = useDrift(0, -14);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight, color: "#ffffff", fontFamily }}>
      <OffthreadVideo
        src={staticFile("stock/call-centre.mp4")}
        muted
        playbackRate={0.9}
        style={{ position: "absolute", left: Math.round((width - 2160 * cover) / 2), top: Math.round((height - 3840 * cover) / 2) + drift.y, width: 2160 * cover, height: 3840 * cover }}
      />
      <Wash tone="dark" opacity={0.5} band={{ top: height - bottom - text.height - Math.round(70 * s), height: text.height + Math.round(170 * s) }} />
      <Img src={staticFile("brand/glo-mark-colour.png")} style={{ position: "absolute", top: gutter, right: gutter, width: Math.round(width * 0.075) }} />
      <div ref={text.ref} style={{ position: "absolute", left: gutter, right: gutter, bottom }}>
        <div style={{ fontWeight: 200, fontSize: Math.round(96 * s), lineHeight: 1.02, letterSpacing: "-0.02em", ...title }}>Recruitment Automations</div>
        <div style={{ marginTop: Math.round(22 * s), fontWeight: 300, fontSize: Math.round(32 * s), lineHeight: 1.4, ...sub }}>
          Five tools that keep a desk moving without a resourcer.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const s = useS();
  const gutter = Math.round(width * 0.08);
  const fade = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const endReveal = useReveal(6);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight, color: "#ffffff", fontFamily }}>
      <Img src={staticFile("brand/glo-mark-colour.png")} style={{ position: "absolute", top: gutter, left: gutter, width: Math.round(width * 0.09), opacity: fade(0, 12) }} />
      <div style={{ position: "absolute", left: gutter, right: gutter, bottom: gutter }}>
        <div style={{ fontWeight: 200, fontSize: Math.round(96 * s), lineHeight: 1.0, letterSpacing: "-0.025em", ...endReveal }}>
          Built once. Yours to keep.
        </div>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)", marginTop: Math.round(44 * s), marginBottom: Math.round(32 * s), transformOrigin: "left", transform: `scaleX(${fade(18, 40)})` }} />
        <div style={{ fontWeight: 300, fontSize: Math.round(34 * s), opacity: fade(28, 44) }}>globusinesssolution.com</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the real material ----------
 *
 * Every product scene shows the photographed device mockups and the
 * captures as they are: no drawn devices, no push-in. A recording is
 * drawn at its own proportions (9:16, the top third left clear for the
 * text) and the scene's ground is the recording's own background, so
 * there is no edge between the two in either format. A still is drawn
 * at the frame's width under the text. The only motion on a still is a
 * short rise on entry; the recordings carry their own.
 */

const RECORDING_GROUND = "#f1f3f3";
const PDF_GROUND = "#f7f8fa";

type Real = { file: string; srcWidth: number; srcHeight: number };

/**
 * A 9:16 recording, as tall as the frame, centred, drifting a few pixels
 * (the text above it drifts the other way, so the two layers separate).
 * `bleed` scales it past the frame width and anchors one side off the edge.
 */
const TallRecording: React.FC<Real & { bleed?: number; anchor?: "left" | "right"; contentTop?: number; textBottom?: number }> = ({
  file,
  srcWidth,
  srcHeight,
  bleed = 1,
  anchor = "right",
  contentTop = 0.36,
  textBottom = 0,
}) => {
  const { width, height } = useVideoConfig();
  const drift = useDrift(0, 10);
  // A bleed is sized from the frame WIDTH so it runs off in both formats, and placed so the
  // device (which starts `contentTop` of the way down the recording) sits just under the text.
  const drawW = bleed > 1 ? Math.round(width * bleed) : Math.round((height * srcWidth) / srcHeight);
  const drawH = Math.round((drawW * srcHeight) / srcWidth);
  const left = bleed > 1 ? (anchor === "right" ? width - drawW + Math.round(width * 0.03) : Math.round(-width * 0.03)) : Math.round((width - drawW) / 2);
  const top = bleed > 1 ? Math.round(textBottom - contentTop * drawH) : Math.round((height - drawH) / 2);
  return (
    <div style={{ position: "absolute", left, top: top + drift.y, width: drawW, height: drawH }}>
      <OffthreadVideo src={staticFile(file)} muted style={{ width: drawW, height: drawH, display: "block" }} />
    </div>
  );
};

/** A photographed still, full frame width, its top at `top`, rising in over 12 frames and then drifting a few pixels. */
const WideStill: React.FC<Real & { top: number; from?: number }> = ({ file, srcWidth, srcHeight, top, from = 6 }) => {
  const { width } = useVideoConfig();
  const rise = useRise(from, 12, 14);
  const drift = useDrift(0, 8, from + 12);
  const drawH = Math.round((width * srcHeight) / srcWidth);
  return (
    <div style={{ position: "absolute", left: 0, top: top + drift.y, width, height: drawH, ...rise }}>
      <Img src={staticFile(file)} style={{ width, height: drawH, display: "block" }} />
    </div>
  );
};

/** A recording scene: text top left over the clear third, the recording behind it; the two drift apart. */
const RecordingScene: React.FC<{ ground: string; media: Real & { bleed?: number; anchor?: "left" | "right" }; text: React.ReactNode }> = ({ ground, media, text }) => {
  const s = useS();
  const drift = useDrift(0, -6);
  const measured = useMeasuredHeight();
  const textTop = Math.round(80 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: ground }}>
      <TallRecording {...media} textBottom={textTop + Math.round(measured.height) + Math.round(24 * s)} />
      <div ref={measured.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, top: textTop + drift.y }}>{text}</div>
    </AbsoluteFill>
  );
};

/** A still scene: text top left, the photograph directly beneath it. */
const StillScene: React.FC<{ ground: string; media: Real; text: React.ReactNode; gap?: number }> = ({ ground, media, text, gap = 40 }) => {
  const s = useS();
  const measured = useMeasuredHeight();
  const top = Math.round(80 * s) + Math.round(measured.height) + Math.round(gap * s);
  return (
    <AbsoluteFill style={{ backgroundColor: ground }}>
      <div ref={measured.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, top: Math.round(80 * s) }}>{text}</div>
      <WideStill {...media} top={top} />
    </AbsoluteFill>
  );
};

/* ---------- 01 availability: the two phones from the brochure, text above ---------- */

const Availability: React.FC = () => {
  const s = useS();
  const { width, height } = useVideoConfig();
  const measured = useMeasuredHeight();
  const textTop = Math.round(80 * s);
  const top = textTop + Math.round(measured.height) + Math.round(36 * s);
  // The image is 972×1208; fit it to the room under the text, full width if it fits, and let the bottom run off if not.
  const drawW = width;
  const drawH = Math.round((width * 1208) / 972);
  const drift = useDrift(0, 8, 20);
  const rise = useRise(8, 12, 14);
  void height;
  return (
    <AbsoluteFill style={{ backgroundColor: PDF_GROUND }}>
      <div ref={measured.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, top: textTop }}>
        <TextBlock
          eyebrow="01 — Automated availability"
          title="Your database keeps itself current."
          titleSize={84}
          checkSize={30}
          checks={[
            { lead: "A message goes out", body: "by text, WhatsApp or email." },
            { lead: "Single-use links that expire,", body: "and the answer lands in your system, not an inbox." },
            { lead: "Opt-outs honoured immediately,", body: "and applied everywhere at once." },
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: 0, top: top + drift.y, width: drawW, height: drawH, ...rise }}>
        <Img src={staticFile("images/pdf/self-serve-phones.jpg")} style={{ width: drawW, height: drawH, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 02 cv formatter ---------- */

const CvFormatter: React.FC = () => (
  <RecordingScene
    ground={RECORDING_GROUND}
    media={{ file: "recordings/cv-formatter.mp4", srcWidth: 2160, srcHeight: 3840 }}
    text={
      <TextBlock
        eyebrow="02 — CV formatter"
        title="Client-ready CVs in seconds."
        titleSize={84}
        checkSize={30}
        checks={[
          { lead: "Confidential mode", body: "redacts the employer with one click." },
          { lead: "Your branding on every CV,", body: "every time." },
          // UNVERIFIED — Scott to confirm the wording of these two.
          { lead: "AI enhancer", body: "tightens the writing without inventing experience." },
          { lead: "Works alongside the CRM you already run." },
        ]}
      />
    }
  />
);

/* ---------- 03 ai outbound caller: the agents, then the caller working its queue ---------- */

const CALLER_CUT = 42; // 1.4s on the people, then the board
/**
 * The window of AICallerLoop shown: it starts at loop frame 60 (rows already
 * in, first call beginning) so rows land and the counts move while the checks
 * read. The loop is rendered as a component, at native resolution.
 */
const LOOP_OFFSET = 60;

const CallCentre: React.FC = () => {
  const { width, height } = useVideoConfig();
  const s = useS();
  const text = useMeasuredHeight();
  const bottom = Math.round(120 * s);
  const cover = Math.max(width / 2160, height / 3840);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      <OffthreadVideo
        src={staticFile("stock/call-centre.mp4")}
        muted
        playbackRate={0.9}
        style={{ position: "absolute", left: Math.round((width - 2160 * cover) / 2), top: Math.round((height - 3840 * cover) / 2), width: 2160 * cover, height: 3840 * cover }}
      />
      <Wash tone="dark" opacity={0.5} band={{ top: height - bottom - text.height - Math.round(70 * s), height: text.height + Math.round(170 * s) }} />
      <div ref={text.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, bottom, fontFamily }}>
        <TextBlock eyebrow="03 — AI outbound caller" title="It rings your database, so nobody has to." titleSize={84} tone="white" />
      </div>
    </AbsoluteFill>
  );
};

/** The caller board in a panel under the text: the loop component, offset into its working window, a queue figure counting above it. */
const CallerBoard: React.FC = () => {
  const s = useS();
  const { width, height } = useVideoConfig();
  const measured = useMeasuredHeight();
  const textTop = Math.round(70 * s);
  const top = textTop + Math.round(measured.height) + Math.round(28 * s);
  const panelH = Math.round(height * 0.96) - top;
  // The loop is laid out for 1080×1920; scale it to the panel width (sidebar included) and let the panel crop the rows.
  const loopScale = (width - GUTTER * 2) / 1080;
  const drift = useDrift(0, 6, 10);
  const rise = useRise(4, 12, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <div ref={measured.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, top: textTop }}>
        <TextBlock
          eyebrow="03 — AI outbound caller"
          title="It rings your database, so nobody has to."
          titleSize={84}
          checkSize={30}
          checks={[
            { lead: "Rings from a queue you control,", body: "inside a calling window you set." },
            { lead: "States it is automated,", body: "offers a person, and records the outcome." },
            { lead: "Honours opt-outs the second they are given,", body: "permanently." },
            { lead: "No answer triggers a text", body: "with a link they can update themselves." },
          ]}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: Math.round(14 * s), marginTop: Math.round(18 * s), fontFamily, color: colors.body }}>
          <span style={{ fontSize: Math.round(64 * s), fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
            <Counter value={78} from={20} />
          </span>
          <span style={{ fontSize: Math.round(18 * s), fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.ink3 }}>in the queue tonight</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: GUTTER, right: GUTTER, top: top + drift.y, height: panelH, borderRadius: 8, overflow: "hidden", backgroundColor: colors.ground, boxShadow: depthShadow, ...rise }}>
        <div style={{ position: "absolute", left: 0, top: -Math.round(1920 * 0.06 * loopScale), width: 1080, height: 1920, transform: `scale(${loopScale})`, transformOrigin: "0 0" }}>
          <Sequence from={-LOOP_OFFSET} durationInFrames={LOOP_OFFSET + 400} layout="none">
            <AICallerLoop />
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AiCaller: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ground }}>
    <Sequence from={0} durationInFrames={CALLER_CUT} layout="none">
      <CallCentre />
    </Sequence>
    <Sequence from={CALLER_CUT} layout="none">
      <CallerBoard />
    </Sequence>
  </AbsoluteFill>
);

/* ---------- 04 websites ---------- */

/** The laptop runs off the right edge in both formats: the recording is scaled 12% past the frame width and anchored right. */
const Websites: React.FC = () => (
  <RecordingScene
    ground="#ffffff"
    media={{ file: "recordings/avolon-website.mp4", srcWidth: 2160, srcHeight: 3840, bleed: 1.12, anchor: "right" }}
    text={
      <TextBlock
        eyebrow="04 — Websites"
        title="Built to be found. Built to bring the work in."
        checks={[
          { lead: "Found on Google, and by AI." },
          { lead: "Live job listings", body: "and candidate registration into your CRM." },
        ]}
      />
    }
  />
);

/* ---------- 05 recruitment crm: three real captures, one after another ---------- */

const CRM_SCREENS = ["shortlist-detail", "compliance", "timesheets"] as const;
const CRM_EACH = 95;

/** What runs without a person, verbatim, each landing as its capture arrives. */
const CRM_POINTS = [
  { lead: "Scores every candidate against the vacancy", body: "on distance, tickets, history and how recently you spoke." },
  { lead: "Excludes anyone who fails a hard requirement,", body: "rather than ranking them lower." },
  { lead: "Warns you before a ticket or right-to-work document expires." },
  { lead: "Turns approved timesheets into invoices,", body: "split by purchase order where needed." },
];
/** The part of each 4000×2674 capture that is shown: sidebar, header, tiles and the first rows, at a size that reads on a phone. A fixed crop, never a push. */
const CRM_CROP = { w: 2600, h: 1900 };

const Crm: React.FC = () => {
  const s = useS();
  const { width } = useVideoConfig();
  const measured = useMeasuredHeight();
  const top = Math.round(80 * s) + Math.round(measured.height) + Math.round(36 * s);
  const drawH = Math.round((width * CRM_CROP.h) / CRM_CROP.w);
  const drift = useDrift(0, 8, 10);
  const textDrift = useDrift(0, -4, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <div ref={measured.ref} style={{ position: "absolute", left: GUTTER, right: GUTTER, top: Math.round(80 * s) + textDrift.y }}>
        <TextBlock eyebrow="05 — Recruitment CRM" title="And the system it all runs on." titleSize={84} />
        <div style={{ marginTop: Math.round(18 * s) }}>
          {CRM_POINTS.map((c, i) => (
            <CheckLine key={c.lead} lead={c.lead} from={20 + 60 * i} size={30}>
              {c.body}
            </CheckLine>
          ))}
        </div>
        {/* The shortlist capture's own figures: 83 considered, 25 ranked. */}
        <div style={{ display: "flex", alignItems: "center", gap: Math.round(28 * s), marginTop: Math.round(18 * s), fontFamily, color: colors.body }}>
          <ProgressRing fraction={25 / 83} size={Math.round(96 * s)} from={24}>
            <span style={{ fontSize: Math.round(26 * s), fontWeight: 600, letterSpacing: "-0.02em" }}>25</span>
          </ProgressRing>
          <div>
            <div style={{ fontSize: Math.round(48 * s), fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
              <Counter value={83} from={20} />
            </div>
            <div style={{ marginTop: Math.round(6 * s), fontSize: Math.round(18 * s), fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.ink3 }}>candidates scored · 25 ranked</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: top + drift.y, width, height: drawH, overflow: "hidden", boxShadow: depthShadow }}>
        {CRM_SCREENS.map((name, i) => (
          <Sequence key={name} from={CRM_EACH * i} durationInFrames={CRM_EACH + 8} layout="none">
            <CrmCapture name={name} slide={i > 0} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** One capture, edge to edge; the second and third slide in from the right over the one before. */
const CrmCapture: React.FC<{ name: string; slide: boolean }> = ({ name, slide }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const e = slide ? eased(frame / HANDOFF) : 1;
  const drawH = Math.round((width * CRM_CROP.h) / CRM_CROP.w);
  const imgW = Math.round((width * 4000) / CRM_CROP.w);
  const imgH = Math.round((imgW * 2674) / 4000);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height: drawH, overflow: "hidden", transform: `translateX(${Math.round(width * (1 - e))}px)`, boxShadow: `0 0 0 1px ${colors.hairline}` }}>
      <Img src={staticFile(`images/avolon/${name}-marketing.png`)} style={{ width: imgW, height: imgH, display: "block" }} />
    </div>
  );
};

/* ---------- integrations, proof ---------- */

/**
 * The systems the platform can connect to, as their own logo files in
 * public/logos/ (fetched from each company's brand, press or own site; no
 * logo is drawn by hand). A company whose file could not be fetched is left
 * out. One group, a calm grid: each mark arrives on the reveal 3 frames
 * apart, then the grid drifts a few pixels. Heights are set to a similar
 * optical weight, not an equal box. Pushes to 1.15 into the scale cut.
 */
const LOGOS: { slug: string; name: string; weight: number }[] = [
  { slug: "bullhorn", name: "Bullhorn", weight: 1.3 },
  { slug: "vincere", name: "Vincere", weight: 1.0 },
  { slug: "jobadder", name: "JobAdder", weight: 0.55 },
  { slug: "mercury", name: "Mercury", weight: 1.0 },
  { slug: "firefish", name: "Firefish", weight: 1.45 },
  { slug: "eploy", name: "Eploy", weight: 1.1 },
  { slug: "xero", name: "Xero", weight: 0.72 },
  { slug: "quickbooks", name: "QuickBooks", weight: 0.95 },
  { slug: "sage", name: "Sage", weight: 1.15 },
];

const logoFile = (slug: string): string | null => {
  const names = new Set(getStaticFiles().map((f) => f.name));
  for (const ext of ["svg", "png"]) {
    const name = `logos/${slug}.${ext}`;
    if (names.has(name)) return name;
  }
  return null;
};

const Logo: React.FC<{ file: string; name: string; height: number; from: number }> = ({ file, name, height, from }) => {
  const reveal = useReveal(from);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: Math.round(height * 1.6), ...reveal }}>
      <Img src={staticFile(file)} alt={name} style={{ height, width: "auto", maxWidth: "100%", display: "block" }} />
    </div>
  );
};

const Integrations: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useS();
  const push = 1 + 0.15 * eased((frame - 80) / 10);
  const title = useReveal(2);
  const sub = useRise(8);
  const drift = useDrift(4, -6, 30);
  const base = Math.round(56 * s);
  const shown = LOGOS.map((l) => ({ ...l, file: logoFile(l.slug) })).filter((l): l is (typeof LOGOS)[number] & { file: string } => l.file !== null);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily, color: colors.body, justifyContent: "center", transform: `scale(${push})` }}>
      <div style={{ marginLeft: GUTTER, marginRight: GUTTER }}>
        <Eyebrow>Integrations</Eyebrow>
        <div style={{ marginTop: Math.round(40 * s), fontWeight: 300, fontSize: Math.round(84 * s), lineHeight: 1.1, letterSpacing: "-0.015em", ...title }}>
          Built on open APIs.
        </div>
        <div style={{ marginTop: Math.round(64 * s) }}>
          <Eyebrow size={20} style={{ opacity: 0.7, ...sub }}>Available to connect</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: Math.round(40 * s), rowGap: Math.round(24 * s), marginTop: Math.round(28 * s), transform: `translate(${drift.x}px, ${drift.y}px)` }}>
            {shown.map((l, i) => (
              <Logo key={l.slug} file={l.file} name={l.name} height={Math.round(base * l.weight)} from={12 + 3 * i} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Proof: React.FC = () => {
  const s = useS();
  const quote = useReveal(4);
  const who = useRise(20);
  const photo = Math.round(220 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily, color: colors.body, justifyContent: "center" }}>
      <div style={{ marginLeft: GUTTER, marginRight: GUTTER }}>
        <Eyebrow>A real client</Eyebrow>
        <div style={{ marginTop: Math.round(48 * s), fontWeight: 300, fontSize: Math.round(100 * s), lineHeight: 1.2, letterSpacing: "-0.015em", ...quote }}>
          “Scott has provided an absolutely first-class service throughout.”
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: Math.round(32 * s), marginTop: Math.round(72 * s), ...who }}>
          <Img src={staticFile("images/pdf/chris-tunnicliffe.jpg")} style={{ width: photo, height: photo, borderRadius: "50%", objectFit: "cover" }} />
          <Eyebrow size={26} style={{ maxWidth: Math.round(560 * s), lineHeight: 1.5 }}>Chris Tunnicliffe · Director, Avolon Group</Eyebrow>
        </div>
        <div style={{ display: "flex", gap: Math.round(20 * s), flexWrap: "wrap", marginTop: Math.round(96 * s) }}>
          {["The website", "Then the system", "Then the AI"].map((c, i) => (
            <Chip key={c} from={30 + 4 * i} enter="spring" size={30} style={{ padding: `${Math.round(24 * s)}px ${Math.round(30 * s)}px` }}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

const EXPAND = 16;

/**
 * The full-bleed expand, used once: 01 starts as a panel inset to 85% with a
 * rounded edge over the closing intro, and grows to the full frame with the
 * radius going to 0.
 */
const Expand: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = eased((frame - at) / EXPAND);
  const inset = (1 - p) * 0.075;
  return (
    <AbsoluteFill
      style={{
        left: Math.round(width * inset),
        top: Math.round(height * inset),
        width: Math.round(width * (1 - inset * 2)),
        height: Math.round(height * (1 - inset * 2)),
        borderRadius: Math.round(24 * (1 - p)),
        overflow: "hidden",
        boxShadow: p < 1 ? depthShadow : "none",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Recruitment45: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily }}>
    <Sequence from={T.intro} durationInFrames={T.s1 + EXPAND - T.intro} layout="none">
      <Intro />
    </Sequence>
    <Sequence from={T.s1 - 2} durationInFrames={T.s2 - T.s1 + 2 + HANDOFF / 2} layout="none">
      <Expand at={2}>
        <SlotInner start={T.s1 - 2} from={T.s1} to={T.s2} slideOut>
          <Availability />
        </SlotInner>
      </Expand>
    </Sequence>
    <Slot from={T.s2} to={T.s3} slideIn slideOut>
      <CvFormatter />
    </Slot>
    <Slot from={T.s3} to={T.s4} slideIn slideOut>
      <AiCaller />
    </Slot>
    <Slot from={T.s4} to={T.s5} slideIn slideOut>
      <Websites />
    </Slot>
    <Slot from={T.s5} to={T.integrations} slideIn slideOut>
      <Crm />
    </Slot>
    <Slot from={T.integrations} to={T.proof} slideIn>
      <Integrations />
    </Slot>
    <Slot from={T.proof} to={T.outro} wipeOut>
      <Proof />
    </Slot>
    <Slot from={T.outro} to={T.end} wipeIn>
      <Outro />
    </Slot>
    <Band at={T.outro} />
    <Grain />
  </AbsoluteFill>
);
