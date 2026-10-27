import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { charte } from "./charte";
import { Eddy } from "./Eddy";
import { police } from "./polices";

/**
 * TROIS DIRECTIONS ARTISTIQUES, sur la meme scene : « Moi, c'est Eddy. »
 * Ce ne sont pas des videos : des images de style, pour choisir avant de
 * construire.
 */

/** Grain de film : la texture qui evite l'aplat numerique. */
const Grain: React.FC<{ id: string; opacite?: number; mode?: React.CSSProperties["mixBlendMode"] }> = ({
  id,
  opacite = 0.3,
  mode = "overlay",
}) => (
  <svg
    width="100%"
    height="100%"
    style={{ position: "absolute", inset: 0, mixBlendMode: mode, opacity: opacite, pointerEvents: "none" }}
  >
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

/* ------------------------------------------------------------------ */
/* A — AFFICHE BRIQUE : typographie geante, motif, grain               */
/* ------------------------------------------------------------------ */
export const StyleA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: charte.brique, overflow: "hidden" }}>
    <Img
      src={staticFile("paterne.webp")}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.17 }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 35%, rgba(30,8,0,0.78) 100%)",
      }}
    />

    <div
      style={{
        position: "absolute",
        top: 120,
        left: 90,
        right: 90,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: police.texte,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: "0.28em",
        color: charte.creme,
        opacity: 0.85,
      }}
    >
      <span>NTMS 2026</span>
      <span>20 ANS</span>
    </div>

    <div style={{ position: "absolute", top: 330, left: 80, transform: "rotate(-3deg)", transformOrigin: "left" }}>
      <div
        style={{
          fontFamily: police.texte,
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: "-0.01em",
          color: charte.creme,
        }}
      >
        Moi, c’est
      </div>
      <div
        style={{
          fontFamily: police.titre,
          fontWeight: 800,
          fontSize: 330,
          lineHeight: 0.85,
          letterSpacing: "-0.045em",
          color: charte.creme,
          marginLeft: -14,
        }}
      >
        Eddy<span style={{ color: charte.orange }}>.</span>
      </div>
      <svg width="760" height="60" viewBox="0 0 760 60" style={{ marginTop: 6 }}>
        <path
          d="M6 38 C 140 8, 280 52, 420 26 S 650 10, 754 30"
          fill="none"
          stroke={charte.orange}
          strokeWidth="18"
          strokeLinecap="round"
        />
      </svg>
    </div>

    <div style={{ position: "absolute", right: 90, bottom: 130 }}>
      <Eddy hauteur={880} vent={0.15} />
    </div>

    <div
      style={{
        position: "absolute",
        left: 70,
        top: 820,
        background: charte.creme,
        color: charte.brique,
        fontFamily: police.texte,
        fontWeight: 900,
        fontSize: 54,
        padding: "26px 40px",
        borderRadius: 999,
        transform: "rotate(-4deg)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      }}
    >
      Hey AIESEC, what’s up&nbsp;!
    </div>

    <Grain id="grainA" opacite={0.32} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* B — CARNET D'ARCHIVES : papier, encre, frise, stickers              */
/* ------------------------------------------------------------------ */
const ENCRE = "#3A1B0C";

const Ruban: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: 190,
      height: 54,
      background: "rgba(255, 214, 90, 0.72)",
      boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
      ...style,
    }}
  />
);

export const StyleB: React.FC = () => {
  const annees = [
    { an: "2005", note: "AIESEC arrive au Bénin", y: 700, fort: false },
    { an: "2015", note: "Eddy entre\nen scène", y: 1020, fort: true },
    { an: "2026", note: "20 ans", y: 1500, fort: false },
  ];
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(110% 80% at 30% 20%, #F6E8CC 0%, #EBD8B3 70%, #DCC49A 100%)",
        overflow: "hidden",
      }}
    >
      {/* lignes de cahier */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(58,27,12,0.07) 0 2px, transparent 2px 64px)",
        }}
      />
      {/* marge rouge */}
      <div style={{ position: "absolute", left: 250, top: 0, bottom: 0, width: 4, background: "rgba(200,60,40,0.4)" }} />

      {/* la frise */}
      <div style={{ position: "absolute", left: 150, top: 330, bottom: 150, width: 6, background: ENCRE, borderRadius: 3 }} />
      {annees.map((a) => (
        <div key={a.an} style={{ position: "absolute", left: 120, top: a.y - 20 }}>
          <div
            style={{
              width: a.fort ? 66 : 46,
              height: a.fort ? 66 : 46,
              marginLeft: a.fort ? -10 : 0,
              borderRadius: "50%",
              background: a.fort ? charte.orange : ENCRE,
              border: `7px solid ${charte.creme}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 170,
              top: a.fort ? -38 : -22,
              whiteSpace: "nowrap",
              fontFamily: police.titre,
              fontWeight: 800,
              fontSize: a.fort ? 118 : 76,
              letterSpacing: "-0.03em",
              color: a.fort ? charte.brique : ENCRE,
              opacity: a.fort ? 1 : 0.55,
            }}
          >
            {a.an}
          </div>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: a.fort ? 100 : 50,
              whiteSpace: "pre",
              lineHeight: 1.15,
              fontFamily: police.texte,
              fontWeight: 700,
              fontSize: 38,
              letterSpacing: "0.04em",
              color: ENCRE,
              opacity: a.fort ? 0.9 : 0.5,
            }}
          >
            {a.note}
          </div>
        </div>
      ))}

      {/* titre */}
      <div style={{ position: "absolute", top: 120, left: 300, right: 60 }}>
        <div style={{ fontFamily: police.texte, fontWeight: 900, fontSize: 64, color: ENCRE, opacity: 0.8 }}>
          Moi, c’est
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              position: "absolute",
              left: -14,
              right: -14,
              bottom: 18,
              height: 120,
              background: "rgba(255,122,0,0.55)",
              transform: "skewX(-8deg) rotate(-1.5deg)",
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: police.titre,
              fontWeight: 800,
              fontSize: 250,
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              color: ENCRE,
            }}
          >
            Eddy.
          </div>
        </div>
      </div>

      {/* Eddy en sticker, scotche */}
      <div style={{ position: "absolute", right: 70, top: 950, transform: "rotate(5deg)" }}>
        <Eddy
          hauteur={760}
          vent={0.25}
          ombre={false}
          style={{
            filter:
              "drop-shadow(10px 0 0 #fff) drop-shadow(-10px 0 0 #fff) drop-shadow(0 10px 0 #fff) drop-shadow(0 -10px 0 #fff) drop-shadow(0 26px 22px rgba(60,30,10,0.35))",
          }}
        />
        <Ruban style={{ top: 10, left: 30, transform: "rotate(-12deg)" }} />
        <Ruban style={{ top: 30, right: 20, transform: "rotate(14deg)" }} />
      </div>

      {/* tampon */}
      <div
        style={{
          position: "absolute",
          left: 330,
          bottom: 70,
          width: 230,
          height: 230,
          borderRadius: "50%",
          border: `9px solid ${charte.brique}`,
          color: charte.brique,
          display: "grid",
          placeItems: "center",
          transform: "rotate(-14deg)",
          opacity: 0.8,
          fontFamily: police.titre,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 0.95,
        }}
      >
        <div>
          <div style={{ fontSize: 118, letterSpacing: "-0.04em" }}>20</div>
          <div style={{ fontSize: 40, letterSpacing: "0.16em" }}>ANS</div>
        </div>
      </div>

      <Grain id="grainB" opacite={0.5} mode="multiply" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* C — PROJECTEUR : scene, rideaux, poussiere, lumiere                 */
/* ------------------------------------------------------------------ */
export const StyleC: React.FC = () => {
  const poussiere = Array.from({ length: 70 }, (_, i) => ({
    x: 280 + random(`x${i}`) * 520,
    y: 120 + random(`y${i}`) * 1500,
    r: 2 + random(`r${i}`) * 5,
    o: 0.15 + random(`o${i}`) * 0.5,
  }));
  const rideau = (cote: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    [cote]: 0,
    width: 190,
    background:
      "repeating-linear-gradient(90deg, #5C1D09 0 26px, #79280E 26px 56px, #8E3314 56px 78px)",
    boxShadow: cote === "left" ? "30px 0 60px rgba(0,0,0,0.6)" : "-30px 0 60px rgba(0,0,0,0.6)",
  });
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #00101a 0%, #001724 55%, #052b3e 100%)",
        overflow: "hidden",
      }}
    >
      {/* le faisceau */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -40,
          height: 1750,
          clipPath: "polygon(44% 0, 56% 0, 96% 100%, 4% 100%)",
          background:
            "linear-gradient(180deg, rgba(255,235,209,0.62) 0%, rgba(255,235,209,0.2) 55%, rgba(255,235,209,0.05) 100%)",
          mixBlendMode: "screen",
          filter: "blur(10px)",
        }}
      />
      <div style={rideau("left")} />
      <div style={rideau("right")} />

      {/* sol de scene */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          bottom: 130,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(255,235,209,0.65), rgba(255,235,209,0) 100%)",
        }}
      />

      {/* titre */}
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: police.texte,
            fontWeight: 900,
            fontSize: 70,
            letterSpacing: "0.06em",
            color: charte.creme,
          }}
        >
          Moi, c’est
        </div>
        <div
          style={{
            fontFamily: police.titre,
            fontWeight: 800,
            fontSize: 228,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            color: charte.orange,
            textShadow: "0 0 90px rgba(255,122,0,0.55)",
          }}
        >
          Eddy
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 230, display: "flex", justifyContent: "center" }}>
        <Eddy hauteur={900} vent={0.4} />
      </div>

      {poussiere.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.r,
            height: p.r,
            borderRadius: "50%",
            background: charte.creme,
            opacity: p.o,
            filter: "blur(1px)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: police.texte,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: "0.34em",
          color: charte.creme,
          opacity: 0.7,
        }}
      >
        NTMS 2026 · 20 ANS
      </div>
      <Grain id="grainC" opacite={0.28} />
    </AbsoluteFill>
  );
};
