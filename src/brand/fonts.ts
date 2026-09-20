import { loadFont } from "@remotion/google-fonts/Poppins";

/**
 * Poppins is the site's body face (staff-and-client-link/src/styles.css
 * --font-sans). The site loads 200/300/400/500/600. The videos use the three
 * light weights for sections, and 600/700 for the end card, which matches the
 * back cover of the 2026 brochure.
 */
const poppins = loadFont("normal", {
  weights: ["200", "300", "400", "600", "700"],
  subsets: ["latin"],
});

export const fontFamily = poppins.fontFamily;
export const waitUntilPoppinsLoaded = poppins.waitUntilDone;
