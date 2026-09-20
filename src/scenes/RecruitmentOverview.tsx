import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import {
  CheckLine,
  Chip,
  Eyebrow,
  FullBleed,
  GUTTER,
  HairlineRule,
  InPractice,
  Notification,
  NumberedRow,
  Outro,
  Screenshot,
  SectionTitle,
  widen,
  StatTile,
  Wash,
  colors,
  fontFamily,
  screenshotHeight,
  useMeasuredHeight,
  useRise,
  useS,
  useSec,
  useSpringIn,
} from "../brand";
import type { Rect } from "../brand";
import { FPS } from "../fps";

/*
 * Recruitment overview, v2. Seventy seconds. Every line of copy is from
 * "Glo Business Solutions Final_1.pdf", the Avolon screenshots, or the
 * previous scene; every colour is a token. Timings are the brief's, in
 * seconds from the start of the video.
 */

export const OVERVIEW_SECONDS = 70;
export const OVERVIEW_FRAMES = OVERVIEW_SECONDS * FPS;

/**
 * The worker clip: 1080×1920, 5.035s at 30fps, played once at normal speed
 * (the scene is 5s). The render fails loudly if the file is missing.
 */
const WORKER_MESSAGE_CLIP = { file: "stock/worker-message.mp4", srcWidth: 1080, srcHeight: 1920 };

/** The ground of the PDF's two-phones image, sampled at its top-left. */
const PHONES_GROUND = "#f6f9fa";

const MEDIA = {
  headset: { file: "stock/call-centre.mp4", srcWidth: 2160, srcHeight: 3840 },
  phones: { file: "images/pdf/self-serve-phones.jpg", srcWidth: 972, srcHeight: 1208 },
  cv: { file: "images/cv-formatter.jpg", srcWidth: 1080, srcHeight: 1920 },
  calls: { file: "images/pdf/calls-dashboard.jpg", srcWidth: 1400, srcHeight: 1073 },
  avolon: { file: "images/pdf/avolon-laptop-phone.jpg", srcWidth: 1300, srcHeight: 863 },
  chris: "images/pdf/chris-tunnicliffe.jpg",
  shot: (name: string) => ({ file: `images/avolon/${name}-marketing.png`, srcWidth: 4000, srcHeight: 2674 }),
  prospects: { file: "images/avolon/prospects-marketing.png", srcWidth: 4000, srcHeight: 3320 },
} as const;

/** A scene from `start` to `end` seconds of the video. */
const Scene: React.FC<{ start: number; end: number; children: React.ReactNode }> = ({ start, end, children }) => (
  <Sequence from={Math.round(start * FPS)} durationInFrames={Math.round((end - start) * FPS)} layout="none">
    {children}
  </Sequence>
);

/** The text column: gutter each side. */
const Column: React.FC<{
  top?: number;
  bottom?: number;
  children: React.ReactNode;
  align?: "left" | "center";
  measure?: React.RefObject<HTMLDivElement | null>;
}> = ({ top, bottom, children, align = "left", measure }) => (
  <div
    ref={measure}
    style={{
      position: "absolute",
      left: GUTTER,
      right: GUTTER,
      top,
      bottom,
      fontFamily,
      textAlign: align,
      ...(align === "center" ? { display: "flex", flexDirection: "column", alignItems: "center" } : {}),
    }}
  >
    {children}
  </div>
);

/* ---------- 0. Title ---------- */

/** A wash exactly behind a bottom-anchored text block. */
const bandBelow = (height: number, bottom: number, textH: number, pad: number) => ({
  top: height - bottom - textH - pad,
  height: textH + pad * 2,
});

const Title: React.FC = () => {
  const s = useS();
  const f = useSec();
  const { height } = useVideoConfig();
  const sub = useRise(f(0.7));
  const text = useMeasuredHeight();
  const bottom = Math.round(120 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <FullBleed {...MEDIA.headset} zoomTo={1.04} playbackRate={0.9} />
      <Wash tone="dark" opacity={0.55} band={bandBelow(height, bottom, text.height, Math.round(60 * s))} />
      <Column bottom={bottom} measure={text.ref}>
        <SectionTitle eyebrow="For recruitment agencies" tone="white" from={f(0.3)} size={104}>
          Automations
        </SectionTitle>
        <div style={{ marginTop: Math.round(22 * s), fontSize: Math.round(36 * s), fontWeight: 300, color: "#ffffff", lineHeight: 1.4, ...sub }}>
          Five tools that keep a desk moving without a resourcer.
        </div>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 1. Automated availability ---------- */

const AvailabilityMessage: React.FC = () => {
  const s = useS();
  const f = useSec();
  const { height } = useVideoConfig();
  const text = useMeasuredHeight();
  const bottom = Math.round(110 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <FullBleed {...WORKER_MESSAGE_CLIP} zoomTo={1.04} />
      <Wash tone="dark" opacity={0.55} band={bandBelow(height, bottom, text.height, Math.round(60 * s))} />
      <Column bottom={bottom} measure={text.ref}>
        <SectionTitle eyebrow="01 — Automated availability" tone="white" from={f(0.5)} size={96}>
          Your database keeps itself current.
        </SectionTitle>
      </Column>
    </AbsoluteFill>
  );
};

const AvailabilityPhones: React.FC = () => {
  const s = useS();
  const f = useSec();
  const every = f(0.6);
  const { height } = useVideoConfig();
  const top = Math.round(90 * s);
  return (
    // The mock's own ground (sampled from the PDF image) carries the text; the phones sit below it, full width.
    <AbsoluteFill style={{ backgroundColor: PHONES_GROUND }}>
      <FullBleed {...MEDIA.phones} zoomTo={1.05} focus={{ x: 0.5, y: 0 }} offsetY={Math.round(height * 0.24)} origin={{ x: 0.5, y: 0.8 }} />
      <Column top={top}>
        <Eyebrow>01 — Automated availability</Eyebrow>
        <div style={{ marginTop: Math.round(24 * s) }}>
          <CheckLine lead="A message goes out" from={every * 0} size={32}>
            by text, WhatsApp or email, automatically.
          </CheckLine>
          <CheckLine lead="Confirms availability" from={every * 1} size={32}>
            without anybody making a call.
          </CheckLine>
          <CheckLine lead="Every answer written straight back to the CRM." from={every * 2} size={32} />
          <CheckLine lead="No app, no password." from={every * 3} size={32}>
            It loads on one bar of signal.
          </CheckLine>
        </div>
        <div style={{ marginTop: Math.round(36 * s) }}>
          <StatTile value="10 seconds" caption="to answer, from the message" from={f(4)} size={80} />
        </div>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 2. CV formatter ---------- */

const CvFormatter: React.FC = () => {
  const s = useS();
  const f = useSec();
  const text = useMeasuredHeight();
  const step = f(0.15);
  const cols = 3;
  const gap = Math.round(28 * s);
  const { width } = useVideoConfig();
  const colW = Math.floor((width - GUTTER * 2 - gap * (cols - 1)) / cols);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <FullBleed {...MEDIA.cv} scale={1.15} zoomTo={1.04} focus={{ x: 0.56, y: 0.4 }} origin={{ x: 0.5, y: 0.7 }} />
      <Wash tone="light" opacity={0.6} band={{ top: Math.round(10 * s), height: text.height + Math.round(170 * s) }} />
      <Column top={Math.round(80 * s)} measure={text.ref}>
        <SectionTitle eyebrow="02 — CV formatter" from={f(0.2)} size={96}>
          Client-ready CVs in seconds.
        </SectionTitle>
        <div style={{ display: "flex", gap, marginTop: Math.round(36 * s) }}>
          <NumberedRow number="1" title="Upload" tags="Word · PDF" from={f(0.8)} layout="column" width={colW} />
          <NumberedRow number="2" title="Formatted" tags="Your branding" from={f(0.8) + step} layout="column" width={colW} />
          <NumberedRow number="3" title="Download" tags="Word · No retyping" from={f(0.8) + step * 2} layout="column" width={colW} />
        </div>
        <div style={{ marginTop: Math.round(30 * s) }}>
          <CheckLine lead="Confidential mode" from={f(1.6)} size={32}>
            redacts the employer with one click.
          </CheckLine>
          <CheckLine lead="Your branding on every CV," from={f(2.2)} size={32}>
            every time.
          </CheckLine>
        </div>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 3. AI caller ---------- */

const CALL_TILES = [
  { label: "Queued", value: 78, caption: "next run 17:30" },
  { label: "Connected today", value: 31, caption: "42% answer rate" },
  { label: "Confirmed available", value: 19, caption: "added to 4 shortlists" },
  { label: "Opted out", value: 2, caption: "suppressed permanently" },
] as const;

const CALL_ROWS = [
  { worker: "D. Whitlock", why: "Stale record, strong match", status: "available" },
  { worker: "M. Achebe", why: "Shortlist 4102, 6 miles", status: "available" },
  { worker: "R. Sandhu", why: "Stale record", status: "free from 15 Sep" },
] as const;

/** One row of the PDF's Calls table: worker, channel chip, why, status chip. Slides in from the left. */
const CallRow: React.FC<{ row: (typeof CALL_ROWS)[number]; from: number }> = ({ row, from }) => {
  const s = useS();
  const pop = useSpringIn(from, 0);
  const slide = { ...pop, transform: `translateX(${(1 - Number(pop.opacity ?? 1)) * -40}px)` };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 0.7fr 1.6fr 1fr",
        alignItems: "center",
        gap: Math.round(16 * s),
        padding: `${Math.round(24 * s)}px 0`,
        borderTop: `1px solid ${colors.hairline}`,
        fontFamily,
        color: colors.body,
        fontSize: Math.round(30 * s),
        ...slide,
      }}
    >
      <div style={{ fontWeight: 600 }}>{row.worker}</div>
      <div>
        <Chip size={16}>Voice</Chip>
      </div>
      <div style={{ fontWeight: 300, color: colors.ink2 }}>{row.why}</div>
      <div>
        <Chip size={16}>{row.status}</Chip>
      </div>
    </div>
  );
};

/** 3a to 3c on the light ground: title, four counting tiles, three rows, then the CRM push. */
const CallsBoard: React.FC = () => {
  const s = useS();
  const f = useSec();
  const { width } = useVideoConfig();
  const sub = useRise(f(0.5));
  const tilesAt = f(3); // 24s
  const rowsAt = f(7); // 28s
  const gap = Math.round(32 * s);
  const tileW = Math.floor((width - GUTTER * 2 - gap) / 2);
  const header = useRise(rowsAt - 6);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <Column top={Math.round(100 * s)}>
        <SectionTitle eyebrow="03 — AI caller" from={f(0.2)} size={100}>
          A receptionist who never misses a call.
        </SectionTitle>
        <div style={{ marginTop: Math.round(26 * s), fontSize: Math.round(42 * s), fontWeight: 300, color: colors.ink2, lineHeight: 1.4, ...sub }}>
          1 – 1,000 calls a day, updates your CRM.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap, rowGap: Math.round(48 * s), marginTop: Math.round(90 * s) }}>
          {CALL_TILES.map((t, i) => (
            <StatTile key={t.label} label={t.label} value={t.value} caption={t.caption} from={tilesAt + f(0.3) * i} width={tileW} size={128} labelSize={20} />
          ))}
        </div>
        <div style={{ marginTop: Math.round(90 * s) }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.7fr 1.6fr 1fr",
              gap: Math.round(16 * s),
              paddingBottom: Math.round(14 * s),
              fontSize: Math.round(18 * s),
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: colors.ink3,
              ...header,
            }}
          >
            <div>Worker</div>
            <div>Channel</div>
            <div>Why</div>
            <div>Status</div>
          </div>
          {CALL_ROWS.map((r, i) => (
            <CallRow key={r.worker} row={r} from={rowsAt + f(0.5) * i} />
          ))}
          <HairlineRule />
        </div>
      </Column>
      <Sequence from={rowsAt + f(1.8)} layout="none">
        <Notification title="Pushed to CRM" body="3 records updated · 2 added to shortlist 4102" width={Math.round(560 * s)} inset={GUTTER} />
      </Sequence>
    </AbsoluteFill>
  );
};

const CallsDashboard: React.FC = () => {
  const s = useS();
  const f = useSec();
  const { height } = useVideoConfig();
  const topText = useMeasuredHeight();
  const bottomText = useMeasuredHeight();
  const top = Math.round(90 * s);
  const bottom = Math.round(100 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <FullBleed {...MEDIA.calls} zoomTo={1.05} focus={{ x: 0.42, y: 0.35 }} origin={{ x: 0.4, y: 0.4 }} />
      <Wash tone="light" opacity={0.6} band={{ top: top - Math.round(70 * s), height: topText.height + Math.round(170 * s) }} />
      <Wash tone="light" opacity={0.6} band={bandBelow(height, bottom, bottomText.height, Math.round(70 * s))} />
      <Column top={top} measure={topText.ref}>
        <Eyebrow>03 — AI caller</Eyebrow>
        <div style={{ marginTop: Math.round(24 * s) }}>
          <CheckLine lead="Sounds like a person." from={f(0.2)} size={34}>
            Your own voice cloned.
          </CheckLine>
          <CheckLine lead="Calls when people answer." from={f(0.8)} size={34}>
            Evenings and weekends, at no extra cost.
          </CheckLine>
        </div>
      </Column>
      <Column bottom={bottom} measure={bottomText.ref}>
        <InPractice label="Recruitment" from={f(0.5)} width={Math.round(860 * s)}>
          Rings eighty workers on a Friday evening so Monday's shortlist is confirmed first.
        </InPractice>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 4. Websites ---------- */

const Websites: React.FC = () => {
  const s = useS();
  const f = useSec();
  const every = f(0.6);
  const text = useMeasuredHeight();
  const top = Math.round(90 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      {/* The right of the mock: the site's hero photo above, the phone below; the laptop's own headline stays left, out of frame. */}
      <FullBleed {...MEDIA.avolon} zoomTo={1.05} focus={{ x: 0.82, y: 0.5 }} origin={{ x: 0.7, y: 0.6 }} />
      <Wash tone="dark" opacity={0.55} band={{ top: top - Math.round(70 * s), height: text.height + Math.round(170 * s) }} />
      <Column top={top} measure={text.ref}>
        <SectionTitle eyebrow="04 — Websites" tone="white" from={f(0.2)} size={92}>
          Built to be found. Built to bring the work in.
        </SectionTitle>
        <div style={{ marginTop: Math.round(30 * s) }}>
          <CheckLine lead="Found on Google, and by AI." tone="white" from={f(1)} size={32} />
          <CheckLine lead="Live job listings" tone="white" from={f(1) + every} size={32}>
            and candidate registration into your CRM.
          </CheckLine>
          <CheckLine lead="Fast on a phone, on a poor signal." tone="white" from={f(1) + every * 2} size={32} />
          <CheckLine lead="Owned outright." tone="white" from={f(1) + every * 3} size={32}>
            No licence, no monthly fee.
          </CheckLine>
        </div>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 5. Recruitment CRM ---------- */

const CHIPS = ["Pipeline", "Diary", "Record", "Reports", "Connect", "Approvals"];

const CrmIntro: React.FC = () => {
  const s = useS();
  const f = useSec();
  const sub = useRise(f(1.6));
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, justifyContent: "center" }}>
      <div style={{ position: "relative", marginLeft: GUTTER, marginRight: GUTTER, fontFamily }}>
        <SectionTitle eyebrow="05 — Recruitment CRM" from={f(0.2)} size={110}>
          And the system it all runs on.
        </SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, max-content)",
            gap: Math.round(24 * s),
            marginTop: Math.round(90 * s),
          }}
        >
          {CHIPS.map((c, i) => (
            <div key={c}>
              <Chip from={f(0.7) + f(0.15) * i} size={30} style={{ padding: `${Math.round(22 * s)}px ${Math.round(28 * s)}px` }}>
                {c}
              </Chip>
            </div>
          ))}
        </div>
        <div style={{ marginTop: Math.round(90 * s), fontSize: Math.round(44 * s), fontWeight: 300, color: colors.ink2, lineHeight: 1.4, ...sub }}>
          Two-way sync with Bullhorn. Nothing sends, books or pays until you have approved it.
        </div>
      </div>
    </AbsoluteFill>
  );
};


/**
 * A CRM screen: eyebrow, title and CheckLines at the top, then a hard crop of
 * the screenshot filling the frame from directly beneath the text to 96% of
 * its height. The crop's source width is fixed (1400–1800px, so rows read at
 * 1080 wide); its height follows the space left under the text. No tiles: the
 * screenshot carries its own figures.
 */
const CrmScreen: React.FC<{
  eyebrow: string;
  title: string;
  checks: { lead: string; body?: string }[];
  shot: { file: string; srcWidth: number; srcHeight: number };
  /** Left edge, top edge and width (source px) of the region the scene pushes into; it starts 1.3× wider. */
  region: { x: number; y: number; w: number };
}> = ({ eyebrow, title, checks, shot, region }) => {
  const s = useS();
  const f = useSec();
  const { width, height } = useVideoConfig();
  const text = useMeasuredHeight();
  const top = Math.round(60 * s);
  const shotTop = top + Math.round(text.height) + Math.round(24 * s);
  const shotH = Math.max(1, Math.round(height * 0.96) - shotTop);
  const regionH = Math.min(shot.srcHeight - region.y, (region.w * shotH) / width);
  const to: Rect = { x: region.x, y: region.y, w: region.w, h: regionH };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      {text.height > 0 ? (
        <Screenshot {...shot} top={shotTop} regionTo={to} regionFrom={widen(to, 1.3, shot.srcWidth, shot.srcHeight)} />
      ) : null}
      <Column top={top} measure={text.ref}>
        <SectionTitle eyebrow={eyebrow} from={f(0.1)} size={80}>
          {title}
        </SectionTitle>
        <div style={{ marginTop: Math.round(16 * s) }}>
          {checks.map((c, i) => (
            <CheckLine key={c.lead} lead={c.lead} from={f(0.5) + f(0.6) * i} size={30}>
              {c.body}
            </CheckLine>
          ))}
        </div>
      </Column>
    </AbsoluteFill>
  );
};

const Compliance: React.FC = () => (
  <CrmScreen
    eyebrow="AI auto compliance"
    title="Every card and ticket, before it lapses."
    checks={[
      { lead: "Reads the cards", body: "already on the record: CSCS, CPCS, NPORS, SSSTS." },
      { lead: "Who is expired on site now,", body: "then who lapses within 14, 30 and 60 days." },
      { lead: "Messages the worker", body: "for the renewal. It lands back in the CRM." },
    ]}
    shot={MEDIA.shot("compliance")}
    // The tiles, then the expired rows: Worker · Card · Number · Expires · State.
    region={{ x: 540, y: 290, w: 1780 }}
  />
);

const Timesheets: React.FC = () => (
  <CrmScreen
    eyebrow="Timesheets"
    title="Read from a photograph. Nothing paid until it is right."
    checks={[
      { lead: "Keyed in, or handed over", body: "as Word, Excel, PDF or a phone photo." },
      { lead: "Photographs read twice,", body: "disagreements flagged, never guessed." },
      { lead: "Nothing reaches payroll", body: "until Needs you is zero." },
    ]}
    shot={MEDIA.shot("timesheets")}
    // The tiles, then the client rows: Client · Site/PO · Supervisor.
    region={{ x: 540, y: 290, w: 1800 }}
  />
);

const Shortlist: React.FC = () => (
  <CrmScreen
    eyebrow="Shortlists"
    title="Ranked, with the working shown."
    checks={[
      { lead: "Every open vacancy", body: "gets a ranked list of who could fill it." },
      { lead: "Distance, hours worked, recent work, tickets,", body: "each weighted and shown." },
      { lead: "Top 25 emailed", body: "to consultants on a schedule." },
    ]}
    shot={MEDIA.shot("shortlist-detail")}
    // The top ranked row and its full score breakdown, at the narrow end of the width range so the table dominates.
    region={{ x: 760, y: 960, w: 1450 }}
  />
);

const QUICK_SHOTS = [
  { shot: MEDIA.shot("chase"), chip: "Chase board", line: "Which sites have not sent their sheet" },
  { shot: MEDIA.shot("runs"), chip: "Payroll runs", line: "Priced, checked, sent to the umbrella" },
  { shot: MEDIA.shot("shortlists"), chip: "Shortlists", line: "Every vacancy from Bullhorn, every half hour" },
  {
    shot: { ...MEDIA.prospects, crop: { y: 60, height: 2674 } },
    chip: "Prospect sites",
    line: "A worker becomes free near a site you want. You are told.",
  },
] as const;

/** Four screens, 0.75s each, hard cuts, one Chip and its line bottom-left. */
const QuickShot: React.FC<{ item: (typeof QUICK_SHOTS)[number] }> = ({ item }) => {
  const s = useS();
  const { width } = useVideoConfig();
  const shotH = screenshotHeight(width, item.shot.srcWidth, item.shot.srcHeight, "crop" in item.shot ? item.shot.crop.height : undefined);
  const line = useRise(2);
  // Scaled up on the page content (the sidebar left out) so the cut fills the frame.
  const scale = 1.9;
  const boxH = Math.round(shotH * scale);
  const top = Math.round(80 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <Screenshot {...item.shot} top={top} scale={scale} focus={{ x: 0.4, y: 0.5 }} pushTo={1.06} toward={{ x: 0.5, y: 0.3 }} />
      <Column top={top + boxH + Math.round(56 * s)}>
        <Chip from={0} size={26} style={{ padding: `${Math.round(16 * s)}px ${Math.round(22 * s)}px` }}>
          {item.chip}
        </Chip>
        <div style={{ marginTop: Math.round(24 * s), fontSize: Math.round(38 * s), fontWeight: 300, color: colors.body, lineHeight: 1.35, ...line }}>
          {item.line}
        </div>
      </Column>
    </AbsoluteFill>
  );
};

/* ---------- 6. A real client ---------- */

const QUOTE = [
  "“From the very first consultation, through design and implementation,",
  "to ironing out those last few inevitable snaggy bits,",
  "Scott has provided an absolutely first-class service throughout.”",
];

const RealClient: React.FC = () => {
  const s = useS();
  const f = useSec();
  const who = useRise(f(1.4));
  const photo = Math.round(150 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <FullBleed {...MEDIA.avolon} zoomTo={1.04} opacity={0.25} focus={{ x: 0.74, y: 0.5 }} />
      <Wash tone="light" opacity={0.6} />
      <Column top={Math.round(140 * s)}>
        <Eyebrow>A real client</Eyebrow>
        <div style={{ marginTop: Math.round(40 * s), fontSize: Math.round(54 * s), fontWeight: 300, lineHeight: 1.4, color: colors.body }}>
          {QUOTE.map((line, i) => (
            <QuoteLine key={line} from={f(0.3) + f(0.3) * i}>
              {line}
            </QuoteLine>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: Math.round(26 * s), marginTop: Math.round(48 * s), ...who }}>
          <Img src={staticFile(MEDIA.chris)} style={{ width: photo, height: photo, borderRadius: "50%", objectFit: "cover" }} />
          <Eyebrow size={26}>Chris Tunnicliffe · Director, Avolon Group</Eyebrow>
        </div>
      </Column>
      <Column bottom={Math.round(120 * s)}>
        <div style={{ display: "flex", gap: Math.round(18 * s), flexWrap: "wrap" }}>
          {["The website", "Then the system", "Then the AI"].map((c) => (
            <Chip key={c} from={f(2.2)} enter="spring" size={26} style={{ padding: `${Math.round(18 * s)}px ${Math.round(24 * s)}px` }}>
              {c}
            </Chip>
          ))}
        </div>
      </Column>
    </AbsoluteFill>
  );
};

const QuoteLine: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => {
  const rise = useRise(from);
  return <div style={rise}>{children}</div>;
};

/* ---------- 7. How it starts ---------- */

const STEPS = [
  {
    number: "01",
    title: "A free review",
    description: "Half an hour on your website and how enquiries reach you now. You get the findings either way, and there is nothing to sign.",
  },
  {
    number: "02",
    title: "A fixed price and a date",
    description: "Agreed before anything begins. Half to start and half on completion, or spread over six or twelve months.",
  },
  {
    number: "03",
    title: "Built once, handed over",
    description: "The site and the system belong to you. No licence, no charge per person, and nothing switches off if you stop working with us.",
  },
];

const HowItStarts: React.FC = () => {
  const s = useS();
  const f = useSec();
  const { width } = useVideoConfig();
  const gap = Math.round(32 * s);
  const colW = Math.floor((width - GUTTER * 2 - gap * 2) / 3);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, justifyContent: "center" }}>
      <div style={{ position: "relative", marginLeft: GUTTER, marginRight: GUTTER, fontFamily }}>
        <Eyebrow>How it starts</Eyebrow>
        <HairlineRule from={f(0.2)} style={{ marginTop: Math.round(28 * s) }} />
        <div style={{ display: "flex", gap, marginTop: Math.round(40 * s) }}>
          {STEPS.map((st) => (
            <NumberedRow key={st.number} {...st} from={f(0.3)} layout="column" enter="spring" width={colW} scale={1.5} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

export const RecruitmentOverview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily }}>
    <Scene start={0} end={3.5}>
      <Title />
    </Scene>
    <Scene start={3.5} end={8.5}>
      <AvailabilityMessage />
    </Scene>
    <Scene start={8.5} end={14}>
      <AvailabilityPhones />
    </Scene>
    <Scene start={14} end={21}>
      <CvFormatter />
    </Scene>
    <Scene start={21} end={31}>
      <CallsBoard />
    </Scene>
    <Scene start={31} end={33}>
      <CallsDashboard />
    </Scene>
    <Scene start={33} end={41}>
      <Websites />
    </Scene>
    <Scene start={41} end={44}>
      <CrmIntro />
    </Scene>
    <Scene start={44} end={49}>
      <Compliance />
    </Scene>
    <Scene start={49} end={53}>
      <Timesheets />
    </Scene>
    <Scene start={53} end={56}>
      <Shortlist />
    </Scene>
    {QUICK_SHOTS.map((item, i) => (
      <Scene key={item.chip} start={56 + 0.75 * i} end={56 + 0.75 * (i + 1)}>
        <QuickShot item={item} />
      </Scene>
    ))}
    <Scene start={59} end={64}>
      <RealClient />
    </Scene>
    <Scene start={64} end={67}>
      <HowItStarts />
    </Scene>
    <Scene start={67} end={70}>
      <Outro />
    </Scene>
  </AbsoluteFill>
);
