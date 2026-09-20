import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, avolon, colors, fontFamily, useS } from "../brand";
import {
  CallMark, HOLD_PULSE, LOOP_FRAMES, MARK_W, OUT_END, PILL_FILL, RESET_START, RESET_VALUES_END, ROWS, SIDEBAR,
  between, call, chipAt, ease, push, tilesAt,
} from "./AICallerLoop";

/*
 * AICallerLoopWide — the same loop as AICallerLoop, laid out as the real
 * app screen for the marketing site's 16:10 slot: the navy sidebar on the
 * left, a page header, four tiles, the table. Every frame number, tile
 * value and row state comes from AICallerLoop's exports, so the two
 * outputs stay in step; only the geometry is this file's.
 *
 * Proportions are the Avolon marketing screenshots' (2000 CSS px wide,
 * captured at 2×) scaled to 1920: sidebar 260, content gutter 92, tile
 * cards with an uppercase 11px label over a 24px figure, a bordered table
 * with a plain 14px header row. 1920×1200 at 30fps, 540 frames.
 */

export const WIDE_FRAMES = LOOP_FRAMES;
export const WIDE_WIDTH = 1920;
export const WIDE_HEIGHT = 1200;

const SIDEBAR_W = 260;
const GUTTER = 92;
const TOPBAR_H = 48;
const HEADER_TOP = 96;
const BOTTOM = 56;
const TILE_H = 92;
const TILE_GAP = 16;
const TABLE_GAP = 24;
const TABLE_HEADER_H = 42;
/**
 * The rest of the queue, below the eight the loop works through. Static, in the
 * app's own "queued" state, so the table reads as a real list of 78 rather than
 * eight rows floating in a half-empty frame. Names fictional, as the others are.
 */
const TAIL = [
  { name: "K. Mbeki", channel: "Voice", why: "Stale record" },
  { name: "P. Grabowski", channel: "Voice", why: "Shortlist 4102, 14 miles" },
  { name: "D. Nowak", channel: "Voice", why: "Renewal due" },
  { name: "H. Ahmed", channel: "SMS", why: "Stale record" },
  { name: "C. Mensah", channel: "Voice", why: "Shortlist 4102, 11 miles" },
  { name: "E. Varga", channel: "Voice", why: "Stale record" },
  { name: "N. O'Rourke", channel: "Voice", why: "Renewal due" },
  { name: "B. Sowande", channel: "Voice", why: "Stale record" },
] as const;
const GRID = `${MARK_W}px max-content max-content 1fr max-content`;

export const AICallerLoopWide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = useS();
  const contentLeft = SIDEBAR_W + GUTTER;
  const contentW = width - SIDEBAR_W - GUTTER * 2;

  // Intro and outro of the panels, so frame 540 is the empty ground of frame 0.
  const out = ease(between(frame, RESET_VALUES_END, OUT_END));
  const tilesIn = (k: number) => ease(between(frame, 8 + 4 * k, 20 + 4 * k)) * (1 - out);
  const rowIn = (i: number) => ease(between(frame, 20 + 4 * i, 32 + 4 * i)) * (1 - out);
  const sidebarIn = ease(between(frame, 20, 40)) * (1 - out);
  const headerIn = tilesIn(0);

  const tiles = tilesAt(frame);
  const chip = chipAt(frame);
  const valuesBack = ease(between(frame, RESET_START, RESET_VALUES_END));

  // Vertical layout: header, tiles, then the table takes what is left above the bottom margin.
  const titleH = 30;
  const contextH = 22;
  const tilesTop = HEADER_TOP + titleH + contextH + 28;
  const tableTop = tilesTop + TILE_H + TABLE_GAP;
  // Capped at the marketing screenshots' row rhythm so the table does not stretch to fill the frame.
  const rowH = Math.min(44, Math.floor((height - BOTTOM - tableTop - TABLE_HEADER_H) / ROWS.length));
  const rowY = (i: number) => tableTop + TABLE_HEADER_H + rowH * i + rowH / 2;
  const tileW = Math.floor((contentW - TILE_GAP * 3) / 4);

  // Sidebar geometry, shared with the push lines.
  const itemH = 26;
  const groupH = 40;
  const sideTop = 72;
  const callsIndex = SIDEBAR.work.indexOf("Calls");
  const callsY = sideTop + groupH + itemH * callsIndex + itemH / 2;
  // The call mark's dot, where each push line starts.
  const markX = contentLeft + Math.round(48 * s) / 2 - Math.round(6 * s);

  const tileDefs = [
    { label: "Queued", value: tiles.queued },
    { label: "Connected", value: tiles.connected },
    { label: "Confirmed available", value: tiles.confirmed },
    { label: "Opted out", value: tiles.opted },
  ];

  const hair = `1px solid ${colors.hairline}`;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, fontFamily, color: colors.body }}>
      {/* Top bar, matching the marketing screenshots' week pill, search and sign out. */}
      <div style={{ position: "absolute", left: 0, top: 0, width, height: TOPBAR_H, backgroundColor: avolon.sidebar, display: "flex", alignItems: "center", opacity: sidebarIn }}>
        <div style={{ width: SIDEBAR_W, flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: GUTTER - 28 }}>
          <div style={{ fontSize: 12, color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 6, padding: "4px 10px" }}>w/e 6 Sep 2026</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "3px 9px" }}>4 lines in use</div>
        </div>
        <div style={{ marginLeft: "auto", marginRight: GUTTER, display: "flex", gap: 22, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
          <span>Search</span>
          <span>Sign out</span>
        </div>
      </div>

      {/* Page header */}
      <div style={{ position: "absolute", left: contentLeft, top: HEADER_TOP, width: contentW, opacity: headerIn, transform: `translateY(${(1 - headerIn) * 12}px)` }}>
        <div style={{ fontSize: 25, fontWeight: 600, lineHeight: `${titleH}px`, letterSpacing: "-0.01em" }}>Calls</div>
        <div style={{ fontSize: 14, fontWeight: 300, lineHeight: `${contextH}px`, color: colors.ink2 }}>
          Calling window 17:30 to 20:00 · 4 lines in use
        </div>
      </div>

      {/* Tiles */}
      <div style={{ position: "absolute", left: contentLeft, top: tilesTop, width: contentW, display: "flex", gap: TILE_GAP }}>
        {tileDefs.map((t, k) => (
          <div
            key={t.label}
            style={{
              width: tileW,
              height: TILE_H,
              boxSizing: "border-box",
              padding: "18px 20px",
              border: hair,
              borderRadius: 12,
              opacity: tilesIn(k),
              transform: `translateY(${(1 - tilesIn(k)) * 16}px)`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.ink3, lineHeight: 1.3 }}>
              {t.label}
            </div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {t.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table: a bordered card; one grid, so WORKER, CHANNEL and STATUS take their widest cell and WHY the rest. */}
      <div
        style={{
          position: "absolute",
          left: contentLeft,
          top: tableTop,
          width: contentW,
          height: TABLE_HEADER_H + rowH * (ROWS.length + TAIL.length),
          boxSizing: "border-box",
          border: hair,
          borderRadius: 12,
          overflow: "hidden",
          opacity: rowIn(0),
        }}
      >
        {/* Row grounds and separators run the full width, as the app's do. */}
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
                top: TABLE_HEADER_H + rowH * i,
                height: rowH,
                boxSizing: "border-box",
                borderTop: hair,
                backgroundColor: `rgba(0, 33, 73, ${0.1 * tint})`,
                opacity: rowIn(i),
              }}
            />
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: GRID, columnGap: 16, alignItems: "center", position: "relative", padding: "0 20px" }}>
          {["", "Worker", "Channel", "Why", "Status"].map((h, k) => (
            <div
              key={k}
              style={{
                height: TABLE_HEADER_H,
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 400,
                color: colors.ink3,
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
              opacity: rowIn(i),
              transform: `translateX(${(1 - rowIn(i)) * -40}px)`,
            };
            return [
              <div key={`${i}-mark`} style={cell}>
                <CallMark live={Math.max(live, pulse)} rings={Math.max(live, pulse)} bars={bars} row={i} frame={frame} />
              </div>,
              <div key={`${i}-name`} style={{ ...cell, fontSize: 16, fontWeight: 600 }}>
                {r.name}
              </div>,
              <div key={`${i}-channel`} style={cell}>
                <Chip size={11 / s} style={{ padding: "4px 8px", letterSpacing: "0.06em" }}>
                  {r.channel}
                </Chip>
              </div>,
              <div key={`${i}-why`} style={{ ...cell, fontSize: 15, fontWeight: 300, color: colors.ink2 }}>
                {r.why}
              </div>,
              <div key={`${i}-status`} style={cell}>
                <div style={{ display: "inline-block", opacity: pill, transform: `scale(${0.85 + 0.15 * pill})`, transformOrigin: "left center" }}>
                  <Chip size={13 / s} pill fill={PILL_FILL[r.result]} style={{ padding: "6px 12px", lineHeight: 1, whiteSpace: "nowrap" }}>
                    {r.result}
                  </Chip>
                </div>
              </div>,
            ];
          })}
          {TAIL.map((r, j) => {
            const cell: React.CSSProperties = {
              height: rowH,
              display: "flex",
              alignItems: "center",
              borderBottom: j === TAIL.length - 1 ? "none" : hair,
              opacity: rowIn(ROWS.length - 1) * 0.72,
            };
            return [
              <div key={`t${j}-mark`} style={cell} />,
              <div key={`t${j}-name`} style={{ ...cell, fontSize: 16, fontWeight: 600 }}>
                {r.name}
              </div>,
              <div key={`t${j}-channel`} style={cell}>
                <Chip size={11 / s} style={{ padding: "4px 8px", letterSpacing: "0.06em" }}>
                  {r.channel}
                </Chip>
              </div>,
              <div key={`t${j}-why`} style={{ ...cell, fontSize: 15, fontWeight: 300, color: colors.ink2 }}>
                {r.why}
              </div>,
              <div key={`t${j}-status`} style={cell}>
                <Chip size={13 / s} pill style={{ padding: "6px 12px", lineHeight: 1, whiteSpace: "nowrap" }}>
                  queued
                </Chip>
              </div>,
            ];
          })}
        </div>
      </div>

      {/* Push lines: the call mark to the sidebar's Calls item. */}
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {ROWS.map((r, i) => {
          const p = push(i);
          const draw = ease(between(frame, p.start, p.arrive));
          const retract = ease(between(frame, p.arrive, p.gone));
          if (draw <= 0 || retract >= 1) return null;
          const x1 = markX;
          const y1 = rowY(i);
          const x2 = SIDEBAR_W - 12;
          const y2 = callsY;
          const sx = x1 + (x2 - x1) * retract;
          const sy = y1 + (y2 - y1) * retract;
          const ex = x1 + (x2 - x1) * draw;
          const ey = y1 + (y2 - y1) * draw;
          return <line key={r.name} x1={sx} y1={sy} x2={ex} y2={ey} stroke={colors.commit} strokeWidth={1} opacity={0.7} />;
        })}
      </svg>

      {/* Sidebar: the CRM, on the left as in the app. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: SIDEBAR_W,
          backgroundColor: avolon.sidebar,
          color: "#ffffff",
          transform: `translateX(${(1 - sidebarIn) * -SIDEBAR_W}px)`,
          paddingTop: sideTop,
          boxSizing: "border-box",
          fontSize: 14,
        }}
      >
        {(["work", "insight"] as const).map((group) => (
          <div key={group}>
            <div
              style={{
                height: groupH,
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                fontSize: 11,
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
                    margin: "0 12px",
                    padding: "0 12px",
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
                        fontSize: 11,
                        border: "1px solid rgba(255,255,255,0.4)",
                        borderRadius: 999,
                        padding: "1px 8px",
                        minWidth: 12,
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
        <div style={{ position: "absolute", bottom: 28, left: 24, fontSize: 14 }}>Settings</div>
      </div>
    </AbsoluteFill>
  );
};
