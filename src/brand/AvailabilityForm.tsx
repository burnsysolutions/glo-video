import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "./tokens";
import { fontFamily } from "./fonts";

/*
 * The site's availability form, built from the brand tokens for a phone
 * screen: the question, four options, one filling in, then Send pressed.
 * Laid out in device pixels (1170 wide); `w` scales it.
 */

const OPTIONS = ["Available for work", "Working at the moment", "Not looking just now", "I will be available from a date"];

type Props = {
  w: number;
  h: number;
  /** Local frames: when the first option fills in and when Send is pressed. */
  tapAt?: number;
  sendAt?: number;
};

export const AvailabilityForm: React.FC<Props> = ({ w, h, tapAt = 60, sendAt = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = w / 390;
  const px = (n: number) => Math.round(n * u);
  const tap = frame < tapAt ? 0 : spring({ frame: frame - tapAt, fps, config: { damping: 14, stiffness: 240, mass: 0.6 } });
  const send = frame < sendAt ? 0 : spring({ frame: frame - sendAt, fps, config: { damping: 16, stiffness: 260, mass: 0.6 } });
  const pressed = 1 - 0.04 * send * (1 - send) * 4; // a short dip, then back
  return (
    <div style={{ position: "absolute", inset: 0, width: w, height: h, backgroundColor: colors.ground, fontFamily, color: colors.body, padding: `${px(96)}px ${px(22)}px ${px(22)}px`, boxSizing: "border-box" }}>
      <div style={{ height: px(40), border: `1px solid ${colors.hairD}`, borderRadius: px(10), display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(12), color: colors.ink3 }}>go.glo.co.uk</div>
      <div style={{ marginTop: px(28), fontSize: px(22), fontWeight: 600, textAlign: "center", letterSpacing: "-0.01em" }}>Are you available for work?</div>
      <div style={{ marginTop: px(22), fontSize: px(14), fontWeight: 600 }}>Where are you at the moment?</div>
      {OPTIONS.map((o, i) => {
        const on = i === 0 ? tap : 0;
        return (
          <div
            key={o}
            style={{
              marginTop: px(10),
              height: px(50),
              border: `1px solid ${on > 0.5 ? colors.commit : colors.hairD}`,
              borderRadius: px(8),
              display: "flex",
              alignItems: "center",
              gap: px(12),
              padding: `0 ${px(14)}px`,
              fontSize: px(14),
              backgroundColor: `rgba(0, 33, 73, ${0.1 * on})`,
            }}
          >
            <div
              style={{
                width: px(16),
                height: px(16),
                borderRadius: "50%",
                boxSizing: "border-box",
                border: `${Math.max(1, px(1.5))}px solid ${on > 0.5 ? colors.commit : colors.ink3}`,
                backgroundColor: on > 0.5 ? colors.commit : "transparent",
                boxShadow: on > 0.5 ? `inset 0 0 0 ${px(3)}px ${colors.ground}` : "none",
              }}
            />
            {o}
          </div>
        );
      })}
      <div style={{ marginTop: px(22), fontSize: px(14), fontWeight: 600, lineHeight: 1.4 }}>
        The date I am free from <span style={{ fontWeight: 400, color: colors.ink2, fontSize: px(12) }}>(tell us the date — needed for the last one, otherwise optional)</span>
      </div>
      <div style={{ marginTop: px(10), height: px(44), border: `1px solid ${colors.hairD}`, borderRadius: px(6), backgroundColor: "#f2f5f7" }} />
      <div
        style={{
          marginTop: px(18),
          height: px(50),
          borderRadius: px(8),
          backgroundColor: send > 0.5 ? colors.commit : colors.body,
          color: "#ffffff",
          fontSize: px(15),
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pressed})`,
        }}
      >
        Send
      </div>
    </div>
  );
};
