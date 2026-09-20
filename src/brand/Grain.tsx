import { useCurrentFrame } from "remotion";

/**
 * Full-frame film grain: SVG fractalNoise at 5% with overlay blending, above
 * everything. The seed follows the frame but only changes every second frame,
 * so it moves without fizzing.
 */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={`grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
    </svg>
  );
};
