import React from "react";
import chemins from "./eddyChemins.json";

/**
 * EDDY, la mascotte de la vision AIESEC 2015, en vectoriel.
 *
 * FIDELE A L'ORIGINAL : les contours ne sont PAS dessines a la main. Ils
 * viennent du calque de l'image de reference (`scripts/tracer-eddy.mjs`
 * → `eddyChemins.json`) : la tete en goutte et ses quatre lames de
 * cheveux forment UNE seule piece, le maillot est vert a gauche, jaune a
 * droite avec un bloc rouge en bas a droite, les jambes sont deux pieces
 * noires. Couleurs mesurees sur l'image.
 *
 * Pour le refaire (autre pose, autre image) : relancer le script.
 *
 * `vent` (0 a 1, une boucle) fait onduler la meche ; `saut` (px) leve le
 * corps ; l'ombre reste au sol.
 */
const c = chemins as unknown as {
  couleurs: Record<"noir" | "vert" | "jaune" | "rouge", [number, number, number]>;
  noir: { d: string; boite: number[] }[];
  chemise: { d: string }[];
  vert: { d: string }[];
  jaune: { d: string }[];
  rouge: { d: string }[];
};

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;
export const couleursEddy = {
  noir: rgb(c.couleurs.noir),
  vert: rgb(c.couleurs.vert),
  jaune: rgb(c.couleurs.jaune),
  rouge: rgb(c.couleurs.rouge),
} as const;

// Les pieces noires : la plus grande est la tete, les deux autres sont les jambes.
const pieces = [...c.noir].sort((a, b) => b.boite[3] * b.boite[2] - a.boite[3] * a.boite[2]);
const tete = pieces[0];
const jambes = pieces.slice(1);

/** Le point ou la meche s'attache a la tete (coordonnees de l'image). */
const PIVOT = { x: 425, y: 215 };
/** Les lames de meche sont a gauche de cette ligne. */
const LIGNE_MECHE = 435;

/** Eddy dans les coordonnees de l'image de reference (960 x 720). */
export const EddyCorps: React.FC<{
  vent?: number;
  saut?: number;
  /** 0 = silhouette toute noire (mystere), 1 = maillot aux couleurs du Benin */
  couleur?: number;
  /** epaisseur du liseré blanc de « sticker » (0 = aucun) */
  contour?: number;
  idPrefixe?: string;
}> = ({ vent = 0, saut = 0, couleur = 1, contour = 0, idPrefixe = "eddy" }) => {
  const t = vent * Math.PI * 2;
  const rotation = Math.sin(t) * 2.2;
  const inclinaison = Math.sin(t + 0.8) * 2.6;
  const decalage = Math.sin(t + 1.6) * 3;
  const idBase = `${idPrefixe}-base`;
  const idMeche = `${idPrefixe}-meche`;

  return (
    <g transform={`translate(0 ${-saut})`}>
      <defs>
        <clipPath id={idBase}>
          <rect x={LIGNE_MECHE - 30} y={0} width={960} height={720} />
        </clipPath>
        <clipPath id={idMeche}>
          <rect x={0} y={0} width={LIGNE_MECHE} height={720} />
        </clipPath>
      </defs>

      {/* liseré blanc de sticker : toutes les pieces, epaissies */}
      {contour > 0 ? (
        <g fill="#fff" stroke="#fff" strokeWidth={contour} strokeLinejoin="round">
          {jambes.map((j, i) => (
            <path key={i} d={j.d} />
          ))}
          <path d={c.chemise[0].d} />
          <path d={tete.d} />
        </g>
      ) : null}

      {jambes.map((j, i) => (
        <path key={i} d={j.d} fill={couleursEddy.noir} />
      ))}

      {/* maillot : noir (silhouette), puis les couleurs se revelent */}
      <path d={c.chemise[0].d} fill={couleursEddy.noir} />
      <g opacity={couleur}>
        <path d={c.chemise[0].d} fill={couleursEddy.jaune} />
        <path d={c.vert[0].d} fill={couleursEddy.vert} />
        <path d={c.rouge[0].d} fill={couleursEddy.rouge} />
      </g>

      {/* tete : la partie fixe, puis la meche qui ondule */}
      <g clipPath={`url(#${idBase})`}>
        <path d={tete.d} fill={couleursEddy.noir} />
      </g>
      <g clipPath={`url(#${idMeche})`}>
        <g
          transform={`translate(${decalage} 0) rotate(${rotation} ${PIVOT.x} ${PIVOT.y}) translate(${PIVOT.x} ${PIVOT.y}) skewY(${inclinaison}) translate(${-PIVOT.x} ${-PIVOT.y})`}
        >
          <path d={tete.d} fill={couleursEddy.noir} />
        </g>
      </g>
    </g>
  );
};

/** Eddy decoupe, a la taille voulue (hauteur en px). */
const BOITE = { x: 296, y: 96, l: 348, h: 534 };

export const Eddy: React.FC<{
  hauteur?: number;
  vent?: number;
  saut?: number;
  couleur?: number;
  contour?: number;
  ombre?: boolean;
  style?: React.CSSProperties;
}> = ({ hauteur = 600, vent = 0, saut = 0, couleur = 1, contour = 0, ombre = true, style }) => (
  <svg
    width={(hauteur * BOITE.l) / BOITE.h}
    height={hauteur}
    viewBox={`${BOITE.x} ${BOITE.y} ${BOITE.l} ${BOITE.h}`}
    style={{ overflow: "visible", ...style }}
    aria-label="Eddy"
  >
    {ombre ? <ellipse cx="482" cy="624" rx="118" ry="10" fill="#000" opacity="0.28" /> : null}
    <EddyCorps vent={vent} saut={saut} couleur={couleur} contour={contour} />
  </svg>
);
