import React from "react";
import { AbsoluteFill } from "remotion";
import chemins from "./eddyChemins.json";
import { couleursEddy } from "./Eddy";
import { charte } from "./charte";
import { police } from "./polices";

/**
 * EDDY DE FACE, STYLE « PICTOGRAMME DES VALEURS » (proposition, a faire valider par le comite).
 *
 * Meme langage que les six images des valeurs (`public/valeurs/`) : silhouette pleine,
 * details DECOUPES en negatif (fente entre la tete et le maillot, yeux, sourcils, bouche).
 * Le calque d'origine ne montre Eddy que de dos : la tete de face = un visage rond + ses
 * VRAIES meches (decoupees dans `eddyChemins.json`, qui partent au vent sur le cote).
 * Le maillot et les jambes restent le calque d'origine.
 */
const c = chemins as unknown as {
  noir: { d: string; boite: number[] }[];
  chemise: { d: string }[]; vert: { d: string }[]; rouge: { d: string }[];
};
const pieces = [...c.noir].sort((a, b) => b.boite[3] * b.boite[2] - a.boite[3] * a.boite[2]);
const TETE_DOS = pieces[0].d;
const JAMBES = pieces.slice(1).map((p) => p.d);
const VISAGE = { x: 475, y: 222, r: 86 };
const COU = { x: 475, y: 318 };
const ROND = `M${VISAGE.x - VISAGE.r} ${VISAGE.y} a${VISAGE.r} ${VISAGE.r} 0 1 0 ${2 * VISAGE.r} 0 a${VISAGE.r} ${VISAGE.r} 0 1 0 ${-2 * VISAGE.r} 0 Z`;
/** zone des meches : en haut a gauche, hors du rond du visage */
const ZONE_MECHES = `M0 0 L540 0 L540 150 L432 236 L300 206 Z ${ROND}`;

/** La tete de face (rond + meches), avec les attributs de dessin donnes. */
const TeteFace: React.FC<{ id: string } & React.SVGProps<SVGPathElement>> = ({ id, ...attr }) => (
  <g>
    <defs><clipPath id={`zm-${id}`}><path d={ZONE_MECHES} clipRule="evenodd" /></clipPath></defs>
    <path d={TETE_DOS} clipPath={`url(#zm-${id})`} {...attr} />
    <path d={ROND} {...attr} />
  </g>
);

/* ───────── expressions (tout en decoupes) ───────── */
type Oeil = "point" | "grand" | "joie" | "ferme" | "plisse" | "clin";
type Bouche = "sourire" | "rire" | "o" | "taquin" | "doux" | "plat";
export type ExprPicto = { nom: string; oeil: Oeil; bouche: Bouche; sourcil?: [number, number]; froncer?: number; penche?: number; larme?: boolean };
export const EXPR_PICTO: ExprPicto[] = [
  { nom: "Joyeux", oeil: "point", bouche: "sourire" },
  { nom: "Éclat de rire", oeil: "joie", bouche: "rire", sourcil: [-4, -4], penche: -5 },
  { nom: "Taquin", oeil: "clin", bouche: "taquin", sourcil: [2, -9], penche: 4 },
  { nom: "Surpris", oeil: "grand", bouche: "o", sourcil: [-11, -11] },
  { nom: "Chut… mystère", oeil: "plisse", bouche: "plat", sourcil: [2, -6], penche: -3 },
  { nom: "Fier", oeil: "ferme", bouche: "sourire", sourcil: [-5, -5], penche: -6 },
  { nom: "Ému", oeil: "point", bouche: "doux", sourcil: [-2, -2], froncer: -7, penche: 5, larme: true },
];
const YEUX = [447, 503];
const Y_OEIL = 228;
const LARME = "M507 240 q-8 15 0 20 q8 -5 0 -20 Z";

/** Les traits du visage, dans une couleur donnee (noir = decoupe dans un masque). */
const Traits: React.FC<{ e: ExprPicto; coul: string; ep?: number }> = ({ e, coul, ep = 6 }) => {
  const t = { stroke: coul, strokeWidth: ep, strokeLinecap: "round" as const, fill: "none" };
  const plein = { fill: coul };
  const y = Y_OEIL;
  const oeil = (k: Oeil, x: number, i: number): React.ReactNode => {
    if (k === "clin") return oeil(i === 0 ? "joie" : "point", x, i);
    if (k === "point") return <ellipse key={i} cx={x} cy={y} rx={7} ry={9} {...plein} />;
    if (k === "grand") return <ellipse key={i} cx={x} cy={y - 1} rx={9.5} ry={12.5} {...plein} />;
    if (k === "plisse") return <ellipse key={i} cx={x} cy={y + 1} rx={8.5} ry={4} {...plein} />;
    if (k === "joie") return <path key={i} d={`M${x - 10} ${y + 4} Q${x} ${y - 11} ${x + 10} ${y + 4}`} {...t} />;
    return <path key={i} d={`M${x - 10} ${y - 2} Q${x} ${y + 9} ${x + 10} ${y - 2}`} {...t} />;
  };
  const [sg, sd] = e.sourcil ?? [0, 0];
  const fr = e.froncer ?? 0;
  const bouche = {
    sourire: <path d="M452 262 Q475 284 498 262" {...t} />,
    rire: <path d="M448 258 Q475 300 502 258 Z" {...plein} />,
    o: <ellipse cx={475} cy={270} rx={8} ry={10} {...plein} />,
    taquin: <path d="M455 268 Q480 277 501 257" {...t} />,
    doux: <path d="M462 266 Q475 275 488 266" {...t} />,
    plat: <path d="M463 270 L487 270" {...t} />,
  }[e.bouche];
  return (
    <g>
      {e.sourcil || e.froncer ? (
        <>
          <path d={`M${YEUX[0] - 11} ${206 + sg} L${YEUX[0] + 11} ${206 + sg + fr}`} {...t} />
          <path d={`M${YEUX[1] - 11} ${206 + sd + fr} L${YEUX[1] + 11} ${206 + sd}`} {...t} />
        </>
      ) : null}
      {YEUX.map((x, i) => oeil(e.oeil, x, i))}
      {bouche}
    </g>
  );
};

/* ───────── rendus ───────── */
export type Rendu = "benin" | "valeur" | "sticker" | "ligne" | "charte";
type Teintes = { tete: string; jambes: string; maillot: string; vert?: string; rouge?: string };
const BENIN: Teintes = { tete: couleursEddy.noir, jambes: couleursEddy.noir, maillot: couleursEddy.jaune, vert: couleursEddy.vert, rouge: couleursEddy.rouge };
const teintes = (r: Rendu, couleur: string): Teintes =>
  r === "valeur" ? { tete: couleur, jambes: couleur, maillot: couleur }
  : r === "charte" ? { tete: charte.brique, jambes: charte.sarcelle, maillot: charte.creme, vert: charte.orange, rouge: charte.sarcelle }
  : BENIN;

export const EddyPicto: React.FC<{ e: ExprPicto; rendu: Rendu; id: string; couleur?: string }> = ({ e, rendu, id, couleur = "#F7941D" }) => {
  const rot = `rotate(${e.penche ?? 0} ${COU.x} ${COU.y})`;
  if (rendu === "ligne") {
    const l = { fill: "none", stroke: charte.creme, strokeWidth: 3.5, strokeLinejoin: "round" as const };
    return (
      <g>
        {JAMBES.map((d, i) => <path key={i} d={d} {...l} />)}
        <path d={c.chemise[0].d} {...l} />
        <g transform={rot}>
          <TeteFace id={`l-${id}`} {...l} />
          <Traits e={e} coul={charte.orange} ep={4.5} />
          {e.larme ? <path d={LARME} fill="#7fd0ff" /> : null}
        </g>
      </g>
    );
  }
  const T = teintes(rendu, couleur);
  const sticker = rendu === "sticker" || rendu === "charte";
  const mTete = `mt-${id}`, mCorps = `mc-${id}`;
  return (
    <g>
      <defs>
        {/* le visage est DECOUPE dans la tete */}
        <mask id={mTete} maskUnits="userSpaceOnUse" x={0} y={0} width={960} height={720}>
          <rect x={0} y={0} width={960} height={720} fill="#fff" />
          <Traits e={e} coul="#000" />
        </mask>
        {/* fente entre la tete et le maillot, comme sur les valeurs */}
        <mask id={mCorps} maskUnits="userSpaceOnUse" x={0} y={0} width={960} height={720}>
          <rect x={0} y={0} width={960} height={720} fill="#fff" />
          <g transform={rot}><TeteFace id={`f-${id}`} fill="#000" stroke="#000" strokeWidth={14} strokeLinejoin="round" /></g>
        </mask>
      </defs>
      {sticker ? (
        <g fill={charte.creme} stroke={charte.creme} strokeWidth={10} strokeLinejoin="round">
          {JAMBES.map((d, i) => <path key={i} d={d} />)}
          <path d={c.chemise[0].d} />
          <g transform={rot}><TeteFace id={`s-${id}`} /></g>
        </g>
      ) : null}
      <g mask={`url(#${mCorps})`}>
        {JAMBES.map((d, i) => <path key={i} d={d} fill={T.jambes} />)}
        <path d={c.chemise[0].d} fill={T.maillot} />
        {T.vert ? <path d={c.vert[0].d} fill={T.vert} /> : null}
        {T.rouge ? <path d={c.rouge[0].d} fill={T.rouge} /> : null}
      </g>
      <g transform={rot}>
        <g mask={`url(#${mTete})`}><TeteFace id={`t-${id}`} fill={T.tete} /></g>
        {e.larme ? <path d={LARME} fill="#7fd0ff" /> : null}
      </g>
    </g>
  );
};

/* ───────── planche ───────── */
const PIED = "286 86 368 554";
const BUSTE = "300 92 300 262";

const Carte: React.FC<{ clair: boolean; largeur: number; hauteur: number; vb: string; children: React.ReactNode }> = ({ clair, largeur, hauteur, vb, children }) => (
  <div style={{ width: largeur, height: hauteur, borderRadius: 30, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    background: clair ? "#fffaf2" : "radial-gradient(circle at 50% 42%, #2a160c, #0b0603 78%)", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
    <svg width="88%" height="88%" viewBox={vb}>{children}</svg>
  </div>
);

const VALEURS = ["#F7941D", "#1B8BD0", "#8DC63F", "#E2127A"];
const RENDUS: { r: Rendu; titre: string; texte: string; clair: boolean }[] = [
  { r: "benin", titre: "Pictogramme Bénin", texte: "le style des valeurs, maillot aux couleurs du Bénin", clair: true },
  { r: "valeur", titre: "Couleur de la valeur", texte: "une seule couleur, celle de la valeur dont il parle", clair: true },
  { r: "sticker", titre: "Sticker", texte: "liseré crème : se détache sur le décor sombre de la série", clair: false },
  { r: "ligne", titre: "Ligne", texte: "simple contour, comme le reflet du miroir : pour les souvenirs", clair: false },
  { r: "charte", titre: "Charte NTMS", texte: "brique, crème, orange et sarcelle du NTMS 2026", clair: false },
];

export const PlancheEddyPicto: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #0d2a3a, ${charte.nuit} 60%)`, padding: "50px 80px", display: "flex", flexDirection: "column", gap: 26 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
      <div style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 68, color: charte.creme, letterSpacing: "-0.02em" }}>Eddy de face, style « pictogramme des valeurs »</div>
      <div style={{ fontFamily: police.texte, fontWeight: 900, fontSize: 24, color: charte.orange, letterSpacing: "0.1em", textTransform: "uppercase" }}>5 rendus · 7 expressions · à choisir</div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {RENDUS.map((x, i) => (
        <div key={x.r} style={{ width: 460, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Carte clair={x.clair} largeur={460} hauteur={540} vb={PIED}>
            <EddyPicto e={EXPR_PICTO[0]} rendu={x.r} id={`r-${x.r}`} />
          </Carte>
          {x.r === "valeur" ? (
            <div style={{ display: "flex", gap: 8, position: "absolute", marginTop: 470 }}>
              {VALEURS.map((v, k) => (
                <svg key={k} width={44} height={66} viewBox={PIED}><EddyPicto e={EXPR_PICTO[0]} rendu="valeur" couleur={v} id={`v-${k}`} /></svg>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: police.texte, fontWeight: 900, fontSize: 28, color: charte.orange }}>{String.fromCharCode(65 + i)}</span>
            <span style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 42, color: charte.creme }}>{x.titre}</span>
          </div>
          <div style={{ fontFamily: police.texte, fontSize: 24, lineHeight: 1.35, color: "rgba(255,235,209,0.8)", textAlign: "center", marginTop: 4, height: 66 }}>{x.texte}</div>
        </div>
      ))}
    </div>
    <div style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 40, color: charte.creme, marginTop: 6 }}>
      Les expressions <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 26, color: "rgba(255,235,209,0.6)" }}>(rendu C · yeux, sourcils et bouche découpés)</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {EXPR_PICTO.map((e, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Carte clair={false} largeur={318} hauteur={290} vb={BUSTE}>
            <EddyPicto e={e} rendu="sticker" id={`x-${i}`} />
          </Carte>
          <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 26, color: charte.creme }}>{e.nom}</span>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
