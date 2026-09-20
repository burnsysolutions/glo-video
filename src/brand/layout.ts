import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, useVideoConfig } from "remotion";
import { waitUntilPoppinsLoaded } from "./fonts";

/**
 * Every size in the brand components is specified for the 1080×1920 frame.
 * The 1080×1350 output keeps the width and scales heights and type down.
 */
export const useS = () => useVideoConfig().height / 1920;

/** Side gutter, the same on both outputs. */
export const GUTTER = 72;

/**
 * The rendered height of a block, so a wash can cover exactly the band the
 * text occupies. Both outputs are 1080 wide and type scales with width, so
 * wrapping is the same in each.
 */
export const useMeasuredHeight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  // The first measurement can happen in the fallback face; measure again once Poppins is in.
  useEffect(() => {
    const handle = delayRender("measure after fonts");
    waitUntilPoppinsLoaded().then(() => {
      setFontsReady(true);
      continueRender(handle);
    });
  }, []);
  useLayoutEffect(() => {
    if (ref.current) {
      const h = ref.current.getBoundingClientRect().height;
      if (Math.abs(h - height) > 0.5) setHeight(h);
    }
  });
  void fontsReady;
  return { ref, height };
};
