import { colors } from "./tokens";
import { fontFamily } from "./fonts";

type Props = {
  children: React.ReactNode;
  fontSize?: number;
  /** Distance from the bottom edge, px. */
  bottom?: number;
};

/** Bottom-centre text on a flat ground-colour band. Poppins 300, no outline, no glow. */
export const Caption: React.FC<Props> = ({ children, fontSize = 32, bottom = 96 }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: colors.ground,
          color: colors.body,
          fontFamily,
          fontWeight: 300,
          fontSize,
          lineHeight: 1.35,
          padding: "12px 24px",
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};
