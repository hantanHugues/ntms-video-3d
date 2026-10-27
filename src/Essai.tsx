import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { charte } from "./charte";

/** Une courte scene d'essai : prouve que le rendu fonctionne de bout en bout. */
export const Essai: React.FC = () => {
  const image = useCurrentFrame();
  const apparition = interpolate(image, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const monte = interpolate(image, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: charte.brique,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          opacity: apparition,
          transform: `translateY(${monte}px)`,
          color: charte.creme,
          fontSize: 120,
          fontWeight: 900,
          textAlign: "center",
        }}
      >
        NTMS <span style={{ color: charte.orange }}>2026</span>
      </div>
    </AbsoluteFill>
  );
};
