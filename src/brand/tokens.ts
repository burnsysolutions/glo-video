/**
 * Brand tokens, copied from staff-and-client-link/src/styles.css.
 * Every value here exists in that file; nothing is invented. Line numbers
 * refer to that file at the time of copying. The marketing (.glo-mk) scope is
 * used because it is what the public site renders.
 */

export const colors = {
  /** --doc: #ffffff  (.glo-mk, line 1332) — the marketing document surface. */
  ground: "#ffffff",
  /** --commit: #002149  (:root line 170, .glo-mk line 1344) — saturated commit blue. */
  commit: "#002149",
  /** --commit-bright: #9dbbe4  (.glo-mk, line 1351) — display commit colour. */
  commitBright: "#9dbbe4",
  /** --ink: #223754  (.glo-mk, line 1337) — marketing body text on white. */
  body: "#223754",
  /** --hairline: #e3e8ea  (.glo-mk, line 1359). */
  hairline: "#e3e8ea",
  /** .glo-mk .marketing-eyebrow color  (line 1476). */
  eyebrow: "#c60a4f",
  /** --ink-2: #4f5f78  (.glo-mk, line 1338) — secondary marketing text. */
  ink2: "#4f5f78",
  /** --ink-3: #667182  (.glo-mk, line 1339) — tertiary marketing text. */
  ink3: "#667182",
  /** --hair-d: #d3dadf  (.glo-mk, line 1336) — the darker hairline. */
  hairD: "#d3dadf",
  /**
   * --midnight: #0b0f1a  (:root, line 176) — the marketing dark. The 2026
   * brochure's cover wash samples at #0c0f19, i.e. this value; the .glo-mk
   * scope's own --midnight (#09090f, line 1341) is not what the PDF uses.
   */
  midnight: "#0b0f1a",
  /**
   * --action-tint: rgb(var(--accent-rgb) / 0.1)  (.glo-mk, line 1364), the
   * background @utility row-selected applies (line 494). Commit at 10%.
   */
  rowTint: "rgba(0, 33, 73, 0.1)",
} as const;

/**
 * Sampled from public/images/avolon/compliance-marketing.png, the Avolon CRM
 * screenshots: the sidebar and its active item. Not in styles.css.
 */
export const avolon = {
  /** Sidebar ground, sampled at (300, 1400). */
  sidebar: "#223753",
  /** The highlighted menu item, sampled at (300, 1625). */
  sidebarActive: "#2f486a",
} as const;

/** .glo-mk .marketing-eyebrow (lines 1475-1481), as a style object. */
export const eyebrowRule = {
  color: colors.eyebrow,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} as const;

/**
 * Poppins weights the site loads (src/routes/__root.tsx line 180:
 * family=Poppins:wght@200;300;400;500;600). The videos fetch only 200/300/400
 * — see fonts.ts.
 */
export const poppinsWeightsOnSite = [200, 300, 400, 500, 600] as const;
export const poppinsWeights = [200, 300, 400, 600, 700] as const;

/**
 * The back cover of "Glo Business Solutions Final_1.pdf" (page 12), sampled
 * from the page. Used only by the EndCard.
 */
export const cover = {
  bg: "#0c0f19",
  text: "#ffffff",
  body: "#c4cad3",
  muted: "#7e8697",
  hairline: "#1c1f28",
  eyebrow: "#8fc6cd",
} as const;

/**
 * Depth for a device frame or panel above the ground. Four layers, all from
 * --ink (#223754) at low alpha, never black: a wide soft cast, a tighter
 * darker contact, an inset highlight along the top edge and an inset shade
 * along the bottom.
 */
export const depthShadow = [
  "0 40px 80px rgba(34, 55, 84, 0.14)",
  "0 8px 20px rgba(34, 55, 84, 0.10)",
  "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
  "inset 0 -1px 0 rgba(34, 55, 84, 0.10)",
].join(", ");
