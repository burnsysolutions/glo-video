import { colors } from "./tokens";

type Props = {
  /** "dark" is the PDF cover's midnight wash for text on a photo; "light" is ground for text on a screenshot. */
  tone: "dark" | "light";
  /** 0.55–0.70 for dark, 0.70–0.85 for light. */
  opacity: number;
  /** Which part of the frame the wash covers, as fractions. Omit for the whole frame. */
  region?: { top?: number; bottom?: number };
  /** Or an exact band in px: only where the text is, feathered top and bottom. */
  band?: { top: number; height: number };
  /** Soften the wash's inner edge over this many px so it does not read as a bar. */
  feather?: number;
};

/** A flat wash so text can sit on media. Flat inside; only the open edge is feathered. */
export const Wash: React.FC<Props> = ({ tone, opacity, region, band, feather = 140 }) => {
  const colour = tone === "dark" ? colors.midnight : colors.ground;
  const rgb = tone === "dark" ? "11,15,26" : "255,255,255";
  if (band) {
    const solid = `rgba(${rgb},${opacity})`;
    const clear = `rgba(${rgb},0)`;
    const f = Math.min(feather, band.height / 4, 48);
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: band.top,
          height: band.height,
          background: `linear-gradient(to bottom, ${clear} 0, ${solid} ${f}px, ${solid} calc(100% - ${f}px), ${clear} 100%)`,
        }}
      />
    );
  }
  if (!region) {
    return <div style={{ position: "absolute", inset: 0, backgroundColor: colour, opacity }} />;
  }
  const fromTop = region.top !== undefined;
  const fraction = fromTop ? region.top! : region.bottom!;
  const solid = `rgba(${rgb},${opacity})`;
  const clear = `rgba(${rgb},0)`;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(fromTop ? { top: 0 } : { bottom: 0 }),
        height: `${fraction * 100}%`,
        background: fromTop
          ? `linear-gradient(to bottom, ${solid} calc(100% - ${feather}px), ${clear} 100%)`
          : `linear-gradient(to top, ${solid} calc(100% - ${feather}px), ${clear} 100%)`,
      }}
    />
  );
};
