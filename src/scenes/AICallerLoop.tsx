import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, StatTile, avolon, colors, fontFamily, useS } from "../brand";
import { FPS } from "../fps";

/*
 * AICallerLoop — wordless. An AI caller works a queue of eight workers,
 * gets a result for each, and pushes the results into the CRM. The only
 * text is what the screen shows: names, numbers, short status labels.
 * 18 seconds at 30fps; frame 540 equals frame 0 so it loops.
 *
 * Names and "why" lines are the PDF's Calls table (page 7). Sidebar items
 * are the Avolon screenshots'. Colours are tokens; the sidebar navy and its
 * active item were sampled from the screenshots (tokens.ts, `avolon`).
 */

export const LOOP_FRAMES = 18 * FPS;

type Result = "available" | "not available" | "no answer" | "link sent" | "renewal due" | "opted out";

export const ROWS: { name: string; channel: "Voice" | "SMS"; why: string; result: Result }[] = [
  { name: "D. Whitlock", channel: "Voice", why: "Stale record, strong match", result: "available" },
  { name: "M. Achebe", channel: "Voice", why: "Shortlist 4102, 6 miles", result: "available" },
  { name: "R. Sandhu", channel: "Voice", why: "Stale record", result: "renewal due" },
  { name: "T. Okonkwo", channel: "SMS", why: "No answer, link sent", result: "no answer" },
  { name: "J. Petrauskas", channel: "Voice", why: "Shortlist 4102, 9 miles", result: "available" },
  { name: "A. Bello", channel: "Voice", why: "Renewal due", result: "opted out" },
  { name: "S. Kowalczyk", channel: "Voice", why: "Stale record", result: "link sent" },
  // The PDF table shows seven rows; the eighth name is the brief's, its "why" reuses the table's wording.
  { name: "L. Fernandes", channel: "Voice", why: "Stale record", result: "available" },
];

export const SIDEBAR = {
  work: ["Inbox", "Chase board", "Timesheets", "Rates to resolve", "Payroll runs", "Invoices", "Parallel run", "Workers", "Availability sweep", "Calls", "Do not contact", "Contact settings", "Clients & sites"],
  insight: ["Dashboard", "Margin", "Reliability", "Shortlists", "Prospect sites", "Compliance", "Registrations", "Scheduled jobs"],
};

/* ---------- timeline ---------- */

export const CALL_LENGTH = 36;
export const QUEUE_START = 60;
export const PUSH_START = 360;
export const HOLD_PULSE = 470;
export const RESET_START = 510;
export const RESET_VALUES_END = 528;
export const OUT_END = 536; // frames 536–539 are the empty ground, so frame 540 (= frame 0) matches

/** Frames that matter for row i's call. The rings lead the slot by 12 so calls overlap. */
export const call = (i: number) => {
  const slot = QUEUE_START + CALL_LENGTH * i;
  return {
    ringsIn: slot - 12,
    barsStart: slot - 6,
    barsEnd: slot + 18,
    pillAt: slot + 24,
    tickStart: slot + 24,
    tickEnd: slot + 30,
  };
};

/** The push of row i: its hairline draws to the sidebar, arrives, retracts. */
export const push = (i: number) => {
  const start = PUSH_START + 4 * i;
  return { start, arrive: start + 14, gone: start + 26 };
};

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const between = (frame: number, a: number, b: number) => clamp01((frame - a) / (b - a));

/* ---------- state at a frame ---------- */

const INITIAL = { queued: 78, connected: 0, confirmed: 0, opted: 0 };

/** Tile values at a frame, with 6-frame rolls, the push decrementing QUEUED, and the reset easing back. */
export const tilesAt = (frame: number) => {
  let { queued, connected, confirmed, opted } = INITIAL;
  ROWS.forEach((r, i) => {
    const c = call(i);
    const roll = between(frame, c.tickStart, c.tickEnd);
    if (r.result !== "no answer") connected += roll;
    if (r.result === "available") confirmed += roll;
    if (r.result === "opted out") opted += roll;
    const p = push(i);
    queued -= between(frame, p.arrive, p.arrive + 6);
  });
  const back = ease(between(frame, RESET_START, RESET_VALUES_END));
  const to = (v: number, start: number) => Math.round(v + (start - v) * back);
  return {
    queued: to(queued, INITIAL.queued),
    connected: to(connected, INITIAL.connected),
    confirmed: to(confirmed, INITIAL.confirmed),
    opted: to(opted, INITIAL.opted),
  };
};

/** How many pushes have arrived, eased back to 0 in the reset. */
export const chipAt = (frame: number) => {
  let n = 0;
  ROWS.forEach((_, i) => {
    if (frame >= push(i).arrive) n += 1;
  });
  const back = ease(between(frame, RESET_START, RESET_VALUES_END));
  return Math.round(n * (1 - back));
};

/* ---------- pieces ---------- */

/** The call-in-progress mark: a dot in commit, two rings expanding and fading, six level bars. */
export const CallMark: React.FC<{ live: number; rings: number; bars: number; row: number; frame: number; pulseOnly?: boolean }> = ({
  live,
  rings,
  bars,
  row,
  frame,
}) => {
  const s = useS();
  const size = Math.round(48 * s);
  const ring = (phase: number, key: string) => {
    const t = ((frame + phase) % 18) / 18;
    const r = interpolate(t, [0, 1], [6, 22]) * s;
    return <circle key={key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.hairD} strokeWidth={1} opacity={(1 - t) * rings} />;
  };
  // Seeded noise for the level meter: the same on every render.
  const level = (bar: number) => {
    const step = Math.floor(frame / 3);
    const a = random(`bar-${row}-${bar}-${step}`);
    const b = random(`bar-${row}-${bar}-${step + 1}`);
    const t = (frame % 3) / 3;
    return 0.2 + 0.8 * (a + (b - a) * t);
  };
  const barH = Math.round(30 * s);
  return (
    <div style={{ display: "flex", alignItems: "center", width: MARK_W, marginLeft: -Math.round(6 * s), flexShrink: 0 }}>
      <svg width={size} height={size} style={{ opacity: live }}>
        {ring(0, "a")}
        {ring(9, "b")}
        <circle cx={size / 2} cy={size / 2} r={5 * s} fill={colors.commit} />
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: Math.round(3 * s), height: barH, opacity: live, marginLeft: -Math.round(6 * s) }}>
        {[0, 1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            style={{
              width: 2,
              height: Math.max(3, Math.round(barH * (bars > 0 ? level(bar) * bars + 0.15 * (1 - bars) : 0.15))),
              backgroundColor: colors.commit,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const PILL_FILL: Partial<Record<Result, string>> = { available: colors.commitBright };

/* ---------- the loop ---------- */

const SIDEBAR_W = 260;
const GUTTER = 52;
/** The call mark's column; the other columns size to their widest cell, WHY takes the rest. */
export const MARK_W = 44;
const GRID = `${MARK_W}px max-content max-content 1fr max-content`;

export const AICallerLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = useS();
  const gutter = GUTTER;
  const contentW = width - SIDEBAR_W - gutter * 2;

  // Intro and outro of the panels, so frame 540 is the empty ground of frame 0.
  const out = ease(between(frame, RESET_VALUES_END, OUT_END));
  const tilesIn = (k: number) => ease(between(frame, 8 + 4 * k, 20 + 4 * k)) * (1 - out);
  const rowIn = (i: number) => ease(between(frame, 20 + 4 * i, 32 + 4 * i)) * (1 - out);
  const sidebarIn = ease(between(frame, 20, 40)) * (1 - out);

  const tiles = tilesAt(frame);
  const chip = chipAt(frame);
  const valuesBack = ease(between(frame, RESET_START, RESET_VALUES_END));

  // Where each status pill ends, measured, so the push lines start at the pill.
  const pillRefs = useRef(ROWS.map(() => null as HTMLDivElement | null)).current.map(() => useRef<HTMLDivElement>(null));
  const [pillRight, setPillRight] = useState<number[]>(ROWS.map(() => 0));
  useLayoutEffect(() => {
    const next = pillRefs.map((r) => (r.current ? r.current.getBoundingClientRect().right : 0));
    if (next.some((v, i) => Math.abs(v - pillRight[i]) > 0.5)) setPillRight(next);
  });

  // Vertical layout: the block runs from 8% to 92% of the frame; the rows take what the tiles leave.
  const top = Math.round(height * 0.08);
  const avail = Math.round(height * 0.84);
  const tileH = Math.round(168 * s);
  const tileGap = Math.round(64 * s);
  const headerH = Math.round(56 * s);
  const rowH = Math.floor((avail - tileH - tileGap - headerH) / ROWS.length);
  const tableTop = top + tileH + tileGap;
  const rowY = (i: number) => tableTop + headerH + rowH * i + rowH / 2;
  const gap = Math.round(20 * s);
  const tileW = Math.floor((contentW - gap * 3) / 4);

  // Sidebar geometry, shared with the push lines.
  const sideX = width - SIDEBAR_W;
  const itemH = Math.round(56 * s);
  const groupH = Math.round(44 * s);
  const sideTop = top;
  const callsIndex = SIDEBAR.work.indexOf("Calls");
  const callsY = sideTop + groupH + itemH * callsIndex + itemH / 2;
  const pillX = gutter + contentW; // fallback before the pills are measured

  const tileDefs = [
    { label: "Queued", value: tiles.queued },
    { label: "Connected", value: tiles.connected },
    { label: "Confirmed available", value: tiles.confirmed },
    { label: "Opted out", value: tiles.opted },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily, color: colors.body }}>
      {/* Tiles */}
      <div style={{ position: "absolute", left: gutter, top, width: contentW, display: "flex", gap }}>
        {tileDefs.map((t, k) => (
          <div key={t.label} style={{ width: tileW, opacity: tilesIn(k), transform: `translateY(${(1 - tilesIn(k)) * 16}px)` }}>
            <StatTile label={t.label} labelSize={22} labelLines={2} value={String(t.value)} caption="" size={96} />
          </div>
        ))}
      </div>

      {/* Table: one grid, so WORKER, CHANNEL and STATUS take their widest cell and WHY the rest. */}
      <div style={{ position: "absolute", left: gutter, top: tableTop, width: contentW }}>
        {ROWS.map((_, i) => {
          const c = call(i);
          const tint = between(frame, c.ringsIn, c.ringsIn + 6) * (1 - between(frame, c.pillAt + 6, c.pillAt + 12));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: headerH + rowH * i,
                height: rowH,
                backgroundColor: `rgba(0, 33, 73, ${0.1 * tint})`,
              }}
            />
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: GRID, columnGap: Math.round(12 * s), alignItems: "center", position: "relative" }}>
          {["", "Worker", "Channel", "Why", "Status"].map((h, k) => (
            <div
              key={k}
              style={{
                height: headerH,
                display: "flex",
                alignItems: "center",
                fontSize: Math.round(14 * s),
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: colors.ink3,
                borderBottom: `1px solid ${colors.hairline}`,
                opacity: rowIn(0),
              }}
            >
              {h}
            </div>
          ))}
          {ROWS.map((r, i) => {
            const c = call(i);
            const live = between(frame, c.ringsIn, c.ringsIn + 4) * (1 - between(frame, c.barsEnd, c.pillAt));
            const bars = between(frame, c.barsStart, c.barsStart + 3) * (1 - between(frame, c.barsEnd - 3, c.barsEnd));
            const pulse = i === 0 ? between(frame, HOLD_PULSE, HOLD_PULSE + 4) * (1 - between(frame, HOLD_PULSE + 14, HOLD_PULSE + 20)) : 0;
            const pop = frame < c.pillAt ? 0 : spring({ frame: frame - c.pillAt, fps, config: { damping: 14, stiffness: 180, mass: 0.8 } });
            const pill = pop * (1 - valuesBack);
            const cell: React.CSSProperties = {
              height: rowH,
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${colors.hairline}`,
              opacity: rowIn(i),
              transform: `translateX(${(1 - rowIn(i)) * -60}px)`,
            };
            return [
              <div key={`${i}-mark`} style={cell}>
                <CallMark live={Math.max(live, pulse)} rings={Math.max(live, pulse)} bars={bars} row={i} frame={frame} />
              </div>,
              <div key={`${i}-name`} style={{ ...cell, fontSize: Math.round(32 * s), fontWeight: 600, letterSpacing: "-0.01em" }}>
                {r.name}
              </div>,
              <div key={`${i}-channel`} style={cell}>
                <Chip size={12} style={{ padding: `${Math.round(5 * s)}px ${Math.round(8 * s)}px` }}>
                  {r.channel}
                </Chip>
              </div>,
              <div key={`${i}-why`} style={{ ...cell, fontSize: Math.round(24 * s), fontWeight: 300, color: colors.ink2, lineHeight: 1.25 }}>
                {r.why}
              </div>,
              <div key={`${i}-status`} style={cell}>
                <div
                  ref={pillRefs[i]}
                  style={{ display: "inline-block", opacity: pill, transform: `scale(${0.85 + 0.15 * pill})`, transformOrigin: "left center" }}
                >
                  <Chip size={26} pill fill={PILL_FILL[r.result]} style={{ padding: `${Math.round(18 * s)}px ${Math.round(14 * s)}px`, lineHeight: 1, whiteSpace: "nowrap" }}>
                    {r.result}
                  </Chip>
                </div>
              </div>,
            ];
          })}
        </div>
      </div>

      {/* Push lines: status pill to the sidebar's Calls item. */}
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {ROWS.map((r, i) => {
          const p = push(i);
          const draw = ease(between(frame, p.start, p.arrive));
          const retract = ease(between(frame, p.arrive, p.gone));
          if (draw <= 0 || retract >= 1) return null;
          const x1 = pillRight[i] || pillX;
          const y1 = rowY(i);
          const x2 = sideX + Math.round(14 * s);
          const y2 = callsY;
          const sx = x1 + (x2 - x1) * retract;
          const sy = y1 + (y2 - y1) * retract;
          const ex = x1 + (x2 - x1) * draw;
          const ey = y1 + (y2 - y1) * draw;
          return <line key={r.name} x1={sx} y1={sy} x2={ex} y2={ey} stroke={colors.commit} strokeWidth={1} opacity={0.7} />;
        })}
      </svg>

      {/* Sidebar: the CRM. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: sideX,
          width: SIDEBAR_W,
          backgroundColor: avolon.sidebar,
          color: "#ffffff",
          transform: `translateX(${(1 - sidebarIn) * SIDEBAR_W}px)`,
          paddingTop: sideTop,
          boxSizing: "border-box",
          fontSize: Math.round(22 * s),
        }}
      >
        {(["work", "insight"] as const).map((group) => (
          <div key={group}>
            <div
              style={{
                height: groupH,
                display: "flex",
                alignItems: "center",
                padding: `0 ${Math.round(28 * s)}px`,
                fontSize: Math.round(14 * s),
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.6,
              }}
            >
              {group}
            </div>
            {SIDEBAR[group].map((item) => {
              const active = item === "Calls";
              const flash = active
                ? Math.max(0, ...ROWS.map((_, i) => between(frame, push(i).arrive, push(i).arrive + 2) * (1 - between(frame, push(i).arrive + 2, push(i).arrive + 10))))
                : 0;
              return (
                <div
                  key={item}
                  style={{
                    height: itemH,
                    margin: `0 ${Math.round(16 * s)}px`,
                    padding: `0 ${Math.round(12 * s)}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 6,
                    backgroundColor: active ? avolon.sidebarActive : "transparent",
                    position: "relative",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, borderRadius: 6, backgroundColor: colors.commitBright, opacity: 0.3 * flash }} />
                  <span>{item}</span>
                  {active ? (
                    <span
                      style={{
                        fontSize: Math.round(18 * s),
                        border: "1px solid rgba(255,255,255,0.4)",
                        borderRadius: 999,
                        padding: `${Math.round(3 * s)}px ${Math.round(12 * s)}px`,
                        minWidth: Math.round(20 * s),
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {chip}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ position: "absolute", bottom: top, left: Math.round(28 * s), fontSize: Math.round(22 * s) }}>Settings</div>
      </div>
    </AbsoluteFill>
  );
};
