import React from "react";
import { AbsoluteFill } from "remotion";
import { EddyCorps } from "./Eddy";

/** Eddy aux coordonnees EXACTES de l'image de reference, pour comparer. */
export const EddyTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <svg width="960" height="720" viewBox="0 0 960 720">
      <EddyCorps vent={0} />
    </svg>
  </AbsoluteFill>
);
