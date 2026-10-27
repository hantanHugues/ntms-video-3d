import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Eddy } from "./Eddy";
import { charte } from "./charte";
import { police } from "./polices";
import calage from "./calage.json";

/**
 * V1 « Eddy » : motion typographique.
 * Regles : courbe de sortie douce, sorties ≈ moitie des entrees, un seul
 * accent par ecran, aucun hasard (tout est deterministe pour le rendu).
 */
const ENCRE = "#3A1B0C";
const FPS = 30;
/** Calendrier de la voix (voix/calage.json) : la video suit la voix, jamais l'inverse. */
const SEG = (sc: string, id: string) => ((calage.scenes as any)[sc].segments.find((x: any) => x.id === id)) as { debut: number; fin: number };
const CAL = calage.scenes as unknown as Record<string, { duree: number; T_VAL?: number; debuts?: number[] }>;
const s = (sec: number) => Math.round(sec * FPS);
const doux = Easing.bezier(0.16, 1, 0.3, 1);
const coupe = Easing.bezier(0.76, 0, 0.24, 1);
const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const prog = (f: number, a: number, d: number, e = doux) => interpolate(f, [a, a + d], [0, 1], { ...borne, easing: e });
/** pseudo-hasard deterministe */
const h = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ressort = (f: number, mou = false) =>
  spring({ frame: f, fps: FPS, config: mou ? { damping: 16, stiffness: 80, mass: 1 } : { damping: 12, stiffness: 170, mass: 0.7 } });
/** secousse d'ecran apres un impact a l'image t */
const secousse = (f: number, t: number, amp = 28) => {
  const d = f - t;
  if (d < 0 || d > 18) return { x: 0, y: 0 };
  const k = Math.exp(-d / 4) * amp;
  return { x: Math.sin(d * 2.3) * k, y: Math.cos(d * 3.1) * k * 0.6 };
};
/** saut de hauteur hmax a l'image t (arc) */
const bond = (f: number, t: number, hmax = 70, d = 18) => {
  const k = f - t;
  return k < 0 || k > d ? 0 : Math.sin((k / d) * Math.PI) * hmax;
};

/* ───────── fond et finitions ───────── */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.1 }}>
      <Img src={staticFile(`grain${(Math.floor(f / 2) % 3) + 1}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
/** Lignes de cahier : posees PAR-DESSUS la camera, donc immobiles (evite le moire du zoom). */
const Lignes: React.FC = () => (
  <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(58,27,12,0.07) 0 3px, transparent 3px 64px)", mixBlendMode: "multiply", pointerEvents: "none" }} />
);
const Papier: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(110% 80% at 30% 20%, #F6E8CC 0%, #EBD8B3 70%, #DCC49A 100%)" }} />
    <div style={{ position: "absolute", left: 70, top: 0, bottom: 0, width: 4, background: "rgba(200,60,40,0.4)" }} />
  </>
);

/** Camera : zoom lent (ou dezoom) + deriv + secousse. */
const Camera: React.FC<{ duree: number; de?: number; vers?: number; sec?: { x: number; y: number }; children: React.ReactNode }> = ({ duree, de = 1, vers = 1.08, sec = { x: 0, y: 0 }, children }) => {
  const f = useCurrentFrame();
  const t = f / duree;
  // +0.07 : marge de securite, la secousse et la derive ne doivent jamais montrer le bord du plan
  const sc = de + (vers - de) * t + 0.07;
  return (
    <AbsoluteFill style={{ transform: `translate(${sec.x}px, ${sec.y}px) scale(${sc})` }}>{children}</AbsoluteFill>
  );
};

/** Un bloc qui sort vite (zoom avant + flou) apres `duree`. */
const Bloc: React.FC<{ duree: number; sortie?: "haut" | "zoom"; children: React.ReactNode }> = ({ duree, sortie = "haut", children }) => {
  const f = useCurrentFrame();
  const q = prog(f, duree - 9, 9, Easing.in(Easing.cubic));
  return (
    <div style={{ opacity: 1 - q, filter: q > 0.001 ? `blur(${q * 14}px)` : undefined, transform: sortie === "zoom" ? `scale(${1 + q * 0.6})` : `translateY(${-q * 120}px)` }}>{children}</div>
  );
};

/* ───────── typographie cinetique ───────── */
type Mode = "chute" | "monte" | "zoom" | "saut" | "melee";
const Lettres: React.FC<{
  texte: string;
  debut?: number;
  taille: number;
  couleur?: string;
  mode?: Mode;
  pas?: number;
  fam?: string;
  poids?: number;
  tremble?: number;
  escalier?: number;
  marque?: number;
  teintes?: Record<number, string>;
}> = ({ texte, debut = 0, taille, couleur = ENCRE, mode = "chute", pas = 2, fam = police.titre, poids = 800, tremble = 0, escalier = 0, marque, teintes = {} }) => {
  const f = useCurrentFrame();
  let idx = 0;
  const mots = texte.split(" ");
  const m = marque === undefined ? 0 : prog(f, marque, 16);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {marque !== undefined ? (
        <div style={{ position: "absolute", left: -16, right: -16, bottom: taille * 0.06, height: taille * 0.46, background: "rgba(255,122,0,0.6)", transform: `skewX(-8deg) rotate(-1deg) scaleX(${m})`, transformOrigin: "left" }} />
      ) : null}
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: taille * 0.26 }}>
        {mots.map((mot, w) => (
          <span key={w} style={{ display: "inline-flex" }}>
            {mot.split("").map((c, k) => {
              const i = idx++;
              const p = ressort(f - debut - i * pas, mode === "melee");
              let st: React.CSSProperties = {};
              if (mode === "chute") st = { transform: `translateY(${(1 - p) * -240}px) rotate(${(h(i) - 0.5) * 70 * (1 - p)}deg)`, opacity: Math.min(1, p * 5) };
              if (mode === "monte") st = { transform: `translateY(${(1 - p) * taille * 1.15}px)` };
              if (mode === "zoom") st = { transform: `scale(${1 + (1 - p) * 2.4})`, opacity: Math.min(1, p * 4), filter: `blur(${Math.max(0, 1 - p) * 16}px)` };
              if (mode === "saut") st = { transform: `scale(${1 + (1 - p) * 0.5}, ${p})`, transformOrigin: "50% 100%", opacity: Math.min(1, p * 6) };
              if (mode === "melee") st = { transform: `translate(${(h(i) - 0.5) * 1100 * (1 - p)}px, ${(h(i + 50) - 0.5) * 1100 * (1 - p)}px) rotate(${(h(i + 9) - 0.5) * 420 * (1 - p)}deg)`, opacity: Math.min(1, p * 3) };
              const vib = tremble ? Math.sin((f + i * 3) / 3) * tremble : 0;
              const esc = -i * escalier * Math.min(1, p);
              const clip = mode === "monte";
              return (
                <span key={k} style={{ display: "inline-block", overflow: clip ? "hidden" : "visible", paddingBottom: clip ? taille * 0.14 : 0, marginBottom: clip ? -taille * 0.14 : 0, paddingRight: clip ? 2 : 0 }}>
                  <span style={{ display: "inline-block", fontFamily: fam, fontWeight: poids, fontSize: taille, lineHeight: 1.02, letterSpacing: "-0.03em", color: teintes[i] ?? couleur, ...st, translate: `0 ${vib + esc}px` }}>{c}</span>
                </span>
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Chiffres qui defilent comme un compteur de mecanique. */
const Roulette: React.FC<{ valeur: string; debut: number; taille: number; couleur?: string }> = ({ valeur, debut, taille, couleur = ENCRE }) => {
  const f = useCurrentFrame();
  const lh = taille * 1.0;
  return (
    <div style={{ display: "inline-flex" }}>
      {valeur.split("").map((c, i) => {
        const d = Number(c);
        if (Number.isNaN(d)) return <span key={i} style={{ fontFamily: police.titre, fontWeight: 800, fontSize: taille, lineHeight: 1, color: couleur, letterSpacing: "-0.04em" }}>{c}</span>;
        const p = prog(f, debut + i * 4, 34);
        const pos = p * (d + 10);
        return (
          <div key={i} style={{ height: lh, width: taille * 0.6, overflow: "hidden" }}>
            <div style={{ transform: `translateY(${-pos * lh}px)` }}>
              {Array.from({ length: 20 }, (_, n) => (
                <div key={n} style={{ height: lh, textAlign: "center", fontFamily: police.titre, fontWeight: 800, fontSize: taille, lineHeight: 1, color: couleur, letterSpacing: "-0.04em" }}>{n % 10}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Compteur: React.FC<{ vers: number; debut: number; taille: number; couleur?: string; suffixe?: string; prefixe?: string }> = ({ vers, debut, taille, couleur = ENCRE, suffixe = "", prefixe = "" }) => {
  const f = useCurrentFrame();
  const v = Math.round(vers * prog(f, debut, 40));
  return <span style={{ fontFamily: police.titre, fontWeight: 800, fontSize: taille, lineHeight: 1, color: couleur, letterSpacing: "-0.05em" }}>{prefixe}{v}{suffixe}</span>;
};

/* ───────── decors animes ───────── */
const Eclat: React.FC<{ x: number; y: number; t: number; couleur?: string; rayon?: number }> = ({ x, y, t, couleur = charte.orange, rayon = 260 }) => {
  const f = useCurrentFrame();
  const p = prog(f, t, 16);
  if (f < t) return null;
  return (
    <svg style={{ position: "absolute", left: x - 400, top: y - 400, width: 800, height: 800, overflow: "visible" }} viewBox="-400 -400 800 800">
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2 + 0.2;
        const r1 = 30 + p * rayon;
        const r2 = r1 + 90 * (1 - p) + 10;
        return <line key={k} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={couleur} strokeWidth={14 * (1 - p) + 2} strokeLinecap="round" opacity={1 - p * 0.8} />;
      })}
    </svg>
  );
};
const Etincelle: React.FC<{ x: number; y: number; t: number; taille?: number; couleur?: string }> = ({ x, y, t, taille = 60, couleur = charte.orange }) => {
  const f = useCurrentFrame();
  const p = ressort(f - t);
  return (
    <svg style={{ position: "absolute", left: x - taille, top: y - taille, width: taille * 2, height: taille * 2, transform: `scale(${p}) rotate(${(f - t) * 4}deg)` }} viewBox="-1 -1 2 2">
      <path d="M0 -1 Q0 0 1 0 Q0 0 0 1 Q0 0 -1 0 Q0 0 0 -1Z" fill={couleur} />
    </svg>
  );
};
const Ondule: React.FC<{ largeur: number; t: number; couleur?: string }> = ({ largeur, t, couleur = charte.orange }) => {
  const f = useCurrentFrame();
  const p = prog(f, t, 22);
  return (
    <svg width={largeur} height={40} viewBox={`0 0 ${largeur} 40`} style={{ overflow: "visible" }}>
      <path d={`M6 20 ${Array.from({ length: Math.floor(largeur / 60) }, (_, k) => `Q${6 + k * 60 + 15} ${k % 2 ? 36 : 4} ${6 + k * 60 + 30} 20 T${6 + (k + 1) * 60} 20`).join(" ")}`} fill="none" stroke={couleur} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
    </svg>
  );
};
const Confettis: React.FC<{ x: number; y: number; t: number; n?: number }> = ({ x, y, t, n = 44 }) => {
  const f = useCurrentFrame();
  const d = f - t;
  if (d < 0) return null;
  const palette = [charte.orange, charte.creme, charte.sarcelle, "#E8A33D", charte.brique];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (h(i) - 0.5) * 2.6;
        const v = 14 + h(i + 7) * 24;
        const px = x + Math.cos(a) * v * d;
        const py = y + Math.sin(a) * v * d + 0.9 * d * d * 0.5;
        const taille = 14 + h(i + 3) * 20;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: taille, height: taille * 0.55, background: palette[i % 5], transform: `rotate(${d * (6 + h(i) * 14)}deg)`, opacity: 1 - prog(d, 40, 30, Easing.linear) }} />;
      })}
    </>
  );
};

/** Photo d'archive : polaroid scotche, ton chaud, vignette, leger zoom. */
const Polaroid: React.FC<{ src: string; legende: string; sous?: string; debut?: number; rot?: number; largeur?: number }> = ({ src, legende, sous, debut = 0, rot = -3, largeur = 640 }) => {
  const f = useCurrentFrame();
  const p = ressort(f - debut, true);
  const h = (largeur * 445) / 594;
  const zoom = 1 + Math.max(0, f - debut) * 0.0007;
  return (
    <div style={{ position: "relative", padding: "26px 26px 0", background: "#fbf6ea", borderRadius: 6, boxShadow: "0 28px 44px rgba(60,30,10,0.35)", transform: `translateY(${(1 - p) * -900}px) rotate(${rot + (1 - p) * 14}deg)`, opacity: Math.min(1, p * 3) }}>
      <div style={{ width: largeur, height: h, overflow: "hidden", position: "relative" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "sepia(0.35) contrast(1.05) saturate(0.9)" }} />
        <AbsoluteFill style={{ boxShadow: "inset 0 0 90px rgba(40,20,5,0.45)" }} />
      </div>
      <div style={{ height: 124, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 36, color: ENCRE }}>{legende}</div>
        {sous ? <div style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 30, color: ENCRE, opacity: 0.7 }}>{sous}</div> : null}
      </div>
      <div style={{ position: "absolute", top: -16, left: 60, width: 150, height: 46, background: "rgba(255,235,209,0.9)", transform: `rotate(-12deg) scaleX(${prog(f, debut + 14, 8)})`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
      <div style={{ position: "absolute", top: -10, right: 50, width: 130, height: 46, background: "rgba(255,235,209,0.9)", transform: `rotate(10deg) scaleX(${prog(f, debut + 16, 8)})`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
    </div>
  );
};

/** colore les n derniers caracteres (hors espaces) d'un texte */
const fin = (txt: string, n: number, c: string) => {
  const L = txt.replace(/ /g, "").length;
  const o: Record<number, string> = {};
  for (let i = L - n; i < L; i++) o[i] = c;
  return o;
};

/** Eddy en sticker : silhouette (couleur 0) ou colore (1). */
const Sticker: React.FC<{ hauteur: number; couleur: number; vent: number; saut?: number; contour?: number }> = ({ hauteur, couleur, vent, saut = 0, contour = 9 }) => {
  const reception = saut > 0 ? 0 : 1;
  return (
    <div style={{ transformOrigin: "50% 100%", transform: `scale(${1 + reception * 0}, ${1 - saut * 0.0006})` }}>
      <Eddy hauteur={hauteur} vent={vent} saut={saut} couleur={couleur} contour={contour} ombre={false} style={{ filter: "drop-shadow(0 22px 20px rgba(60,30,10,0.35))" }} />
    </div>
  );
};

/* ───────── 1. MYSTERE ───────── */
const Mystere: React.FC = () => {
  const f = useCurrentFrame();
  const vent = (f % 75) / 75;
  const marche = prog(f, 0, s(2.4));
  const marchant = f < s(2.4);
  const pas = marchant ? Math.abs(Math.sin(f / 3.2)) * 26 : 0;
  const impact = s(3.4) + 12;
  const sec = secousse(f, impact, 22);
  const phare = (0.5 + 0.08 * Math.sin(f / 14)) * (1 - prog(f, s(7.7), 10) * 0.65);
  return (
    <Camera duree={s(9)} de={1.12} vers={1} sec={sec}>
      <AbsoluteFill style={{ background: charte.nuit }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 64%, rgba(21,103,109,${phare}) 0%, rgba(0,23,36,0) 70%)` }} />
      {Array.from({ length: 32 }, (_, i) => {
        const y = 1920 - ((f * (0.6 + h(i) * 1.4) + h(i + 3) * 1920) % 1920);
        return <div key={i} style={{ position: "absolute", left: h(i + 9) * 1080 + Math.sin(f / 30 + i) * 22, top: y, width: 3 + h(i + 5) * 6, height: 3 + h(i + 5) * 6, borderRadius: "50%", background: charte.creme, opacity: 0.15 + h(i + 2) * 0.35 }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center", transform: `translateX(${(1 - marche) * 900}px)` }}>
        <Eddy hauteur={760} vent={vent} saut={pas + bond(f, s(3.4) + 4, 90) * 0.9} couleur={0} ombre={false} />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 250, height: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Sequence from={s(0.9)} durationInFrames={s(2.4)} layout="none">
          <Bloc duree={s(2.4)}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Lettres texte="Hey" taille={110} couleur={charte.creme} mode="saut" pas={3} />
              <Lettres texte="AIESEC," taille={200} couleur={charte.orange} mode="chute" pas={2} debut={7} />
              <Lettres texte="what’s up !" taille={104} couleur={charte.creme} mode="saut" pas={2} debut={22} />
            </div>
          </Bloc>
        </Sequence>
        <Sequence from={s(3.4)} durationInFrames={s(2.6)} layout="none">
          <Bloc duree={s(2.6)} sortie="zoom">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              <Lettres texte="Moi, c’est" taille={92} couleur={charte.creme} mode="monte" pas={2} />
              <Lettres texte="Eddy." taille={300} couleur={charte.creme} mode="zoom" pas={0} debut={10} marque={26} />
            </div>
          </Bloc>
        </Sequence>
        <Sequence from={s(6.1)} durationInFrames={s(1.5)} layout="none">
          <Bloc duree={s(1.5)}>
            <Lettres texte="Qui je suis ?" taille={128} couleur={charte.orange} mode="chute" pas={2} tremble={5} />
          </Bloc>
        </Sequence>
        <Sequence from={s(7.7)} layout="none">
          <Lettres texte="Chut." taille={300} couleur={charte.creme} mode="zoom" pas={1} />
        </Sequence>
      </div>
    </Camera>
  );
};

/* ───────── 2. ETRE AIESECER ───────── */
const Aiesecer: React.FC = () => {
  const f = useCurrentFrame();
  const sec = secousse(f, s(3.5) + 8, 16);
  return (
    <Camera duree={s(9)} de={1.0} vers={1.1} sec={sec}>
      <Papier />
      <div style={{ position: "absolute", left: 60, right: 60, top: 200, height: 1250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Sequence from={s(0.3)} durationInFrames={s(3.0)} layout="none">
          <Bloc duree={s(3.0)}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Lettres texte="Être" taille={120} mode="monte" pas={3} />
              <Lettres texte="AIESECer," taille={190} couleur={charte.brique} mode="chute" pas={2} debut={8} />
              <Ondule largeur={720} t={s(1.2)} />
            </div>
          </Bloc>
        </Sequence>
        <Sequence from={s(3.4)} durationInFrames={s(2.6)} layout="none">
          <Bloc duree={s(2.6)} sortie="zoom">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              <Lettres texte="c’est des" taille={110} mode="monte" pas={2} />
              <Lettres texte="jeunes" taille={330} couleur={charte.orange} mode="saut" pas={3} debut={8} />
              <Etincelle x={140} y={230} t={s(0.9)} />
              <Etincelle x={900} y={150} t={s(1.1)} taille={44} couleur={charte.brique} />
              <Etincelle x={860} y={560} t={s(1.3)} taille={36} />
            </div>
          </Bloc>
        </Sequence>
        <Sequence from={s(6.0)} layout="none">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Lettres texte="qui dirigent" taille={150} mode="zoom" pas={1} />
            <Lettres texte="pour des jeunes." taille={118} couleur={ENCRE} mode="monte" pas={1} debut={14} marque={30} />
          </div>
        </Sequence>
      </div>
      <div style={{ position: "absolute", right: 30, bottom: 90, transform: "rotate(7deg)" }}>
        <Sticker hauteur={360} couleur={0} vent={(f % 75) / 75} saut={bond(f, s(3.6), 60) + bond(f, s(6.2), 60)} contour={8} />
      </div>
    </Camera>
  );
};

/* ───────── 3. HISTOIRE : 1948 ───────── */
const LIGNE_PAIX = "des jeunes croient en la paix.";
const Histoire: React.FC = () => (
  <Camera duree={s(8)} de={1.08} vers={1}>
    <Papier />
    <Sequence from={0} durationInFrames={s(2.6)} layout="none">
      <div style={{ position: "absolute", left: 60, right: 60, top: 160, height: 1500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Bloc duree={s(2.6)}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Lettres texte="Avant de te dire qui je suis," taille={70} fam={police.texte} poids={700} mode="monte" pas={1} />
            <Lettres texte="remontons à l’origine" taille={84} mode="chute" pas={1} debut={14} />
            <Lettres texte="d’AIESEC." taille={150} couleur={charte.brique} mode="zoom" pas={2} debut={s(1.0)} />
          </div>
        </Bloc>
      </div>
    </Sequence>
    <Sequence from={s(2.8)} layout="none">
      <div style={{ position: "absolute", left: 60, right: 60, top: 160, height: 1500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Bloc duree={s(5.2)} sortie="zoom">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <Lettres texte="1948. Elle naît :" taille={78} fam={police.texte} poids={700} mode="monte" pas={1} debut={4} />
            <Roulette valeur="1948" debut={s(0.5)} taille={320} couleur={charte.brique} />
            <Lettres texte="après la guerre," taille={70} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(2.0)} />
            <Lettres texte={LIGNE_PAIX} taille={70} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(2.5)} teintes={fin(LIGNE_PAIX, 5, charte.orange)} />
          </div>
        </Bloc>
      </div>
    </Sequence>
  </Camera>
);

const Colonne: React.FC<{ top?: number; height?: number; gap?: number; children: React.ReactNode }> = ({ top = 200, height = 1300, gap = 14, children }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);

const Anneaux: React.FC<{ x: number; y: number; t: number; couleur?: string }> = ({ x, y, t, couleur = "rgba(255,235,209,0.35)" }) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 14, 28].map((d, k) => {
        const p = prog(f, t + d, 60);
        return <div key={k} style={{ position: "absolute", left: x - 700 * p, top: y - 700 * p, width: 1400 * p, height: 1400 * p, borderRadius: "50%", border: `6px solid ${couleur}`, opacity: (1 - p) * (f >= t + d ? 1 : 0) }} />;
      })}
    </>
  );
};

/* ───────── 3b. LA VISION ───────── */
const Vision: React.FC = () => {
  const f = useCurrentFrame();
  const sec = secousse(f, s(3.6) + 14, 20);
  return (
    <Camera duree={s(17)} de={1.1} vers={1} sec={sec}>
      <AbsoluteFill style={{ background: charte.sarcelle }} />
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 55%, rgba(255,235,209,0.2) 0%, rgba(0,0,0,0) 70%)" }} />
      <Anneaux x={540} y={960} t={s(7.0)} />
      <Anneaux x={540} y={960} t={s(11.8)} />
      <Sequence from={0} durationInFrames={s(6.9)} layout="none">
        <Colonne gap={10}>
          <Bloc duree={s(6.9)} sortie="zoom">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Lettres texte="Cette conviction est devenue" taille={68} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} />
              <Lettres texte="la vision d’AIESEC :" taille={84} couleur={charte.creme} mode="monte" pas={1} debut={10} />
              <Lettres texte="la paix" taille={250} couleur={charte.creme} mode="zoom" pas={2} debut={s(3.6)} />
              <Lettres texte="et le plein accomplissement" taille={70} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(4.4)} />
              <Lettres texte="du potentiel humain." taille={100} couleur={charte.orange} mode="saut" pas={2} debut={s(5.3)} />
            </div>
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(7.0)} durationInFrames={s(4.7)} layout="none">
        <Colonne gap={10}>
          <Bloc duree={s(4.7)}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Lettres texte="Comment ?" taille={150} couleur={charte.orange} mode="chute" pas={2} />
              <Lettres texte="En faisant des jeunes" taille={84} couleur={charte.creme} mode="monte" pas={1} debut={s(0.8)} />
              <Lettres texte="des leaders" taille={190} couleur={charte.creme} mode="zoom" pas={2} debut={s(1.5)} />
              <Lettres texte="aux liens internationaux." taille={80} couleur={charte.orange} mode="monte" pas={1} debut={s(2.7)} />
            </div>
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(11.8)} layout="none">
        <Colonne gap={14}>
          <Lettres texte="Des leaders capables de bâtir" taille={64} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} />
          <Lettres texte="un monde plus proche de la paix" taille={104} couleur={charte.creme} mode="zoom" pas={1} debut={s(0.8)} />
          <Lettres texte="que celui d’aujourd’hui." taille={100} couleur={charte.orange} mode="monte" pas={1} debut={s(2.4)} />
        </Colonne>
      </Sequence>
    </Camera>
  );
};

/* ───────── 3c. LES VALEURS (les six personnages de la planche officielle) ───────── */
const VALEURS = [
  { en: "Striving for Excellence", fr: "Viser la meilleure qualité en tout ce qu’on fait, et s’améliorer sans cesse.", c: "#F47B20", r: 264 / 236 },
  { en: "Demonstrating Integrity", fr: "Être cohérent et transparent dans ses décisions et ses actes.", c: "#2F8FD0", r: 318 / 222 },
  { en: "Activating Leadership", fr: "Montrer l’exemple, inspirer par l’action et les résultats, et prendre à cœur le développement des autres.", c: "#6FA32A", r: 285 / 304 },
  { en: "Living Diversity", fr: "Apprendre des modes de vie et des opinions de chacun, respecter et encourager l’apport de chaque personne.", c: "#2A4FA8", r: 313 / 220 },
  { en: "Enjoying Participation", fr: "Créer des environnements dynamiques et accueillants, où chacun participe avec enthousiasme.", c: "#E6168B", r: 240 / 227 },
  { en: "Acting Sustainably", fr: "Agir de façon durable pour l’organisation et la société.", c: "#2F8FD0", r: 280 / 222 },
];
const ValeurEcran: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const V = VALEURS[i];
  const W = 640;
  const H = Math.min(700, W / V.r);
  const Wc = V.r < 1 ? H * V.r : W;
  const p = ressort(f - 2, true);
  const disque = prog(f, 0, 16, coupe);
  const inclin = (i % 2 ? 4 : -4) + (1 - p) * (i % 2 ? 22 : -22);
  const sec = secousse(f, 10, 12);
  return (
    <AbsoluteFill style={{ transform: `translate(${sec.x}px, ${sec.y}px)` }}>
      <div style={{ position: "absolute", left: 540 - 520, top: 560 - 520, width: 1040, height: 1040, borderRadius: "50%", background: V.c, opacity: 0.16, transform: `scale(${disque})` }} />
      <div style={{ position: "absolute", left: 540 - Wc / 2 - 22, top: 560 - H / 2 - 22, padding: 22, background: "#fff", borderRadius: 14, boxShadow: "0 24px 40px rgba(60,30,10,0.28)", transform: `translateX(${(1 - p) * 900}px) rotate(${inclin}deg)` }}>
        <Img src={staticFile(`valeurs/${i + 1}.png`)} style={{ width: Wc, height: H, display: "block", transform: `scale(${1 + f * 0.0006})` }} />
        <div style={{ position: "absolute", top: -18, left: 40, width: 150, height: 46, background: "rgba(255,235,209,0.9)", transform: `rotate(-10deg) scaleX(${prog(f, 14, 8)})`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 980, height: 330, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Lettres texte={V.en} taille={112} couleur={V.c} mode="saut" pas={1} debut={8} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1330, height: 330, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <Lettres texte={V.fr} taille={54} fam={police.texte} poids={700} mode="monte" pas={1} debut={26} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, display: "flex", justifyContent: "center", gap: 22 }}>
        {VALEURS.map((_, k) => (
          <div key={k} style={{ width: 22, height: 22, borderRadius: "50%", background: k === i ? V.c : "rgba(58,27,12,0.25)", transform: `scale(${k === i ? 1.3 : 1})` }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
const T_VAL = CAL["04-valeurs"].T_VAL as number;
const DEBUTS = CAL["04-valeurs"].debuts as number[];
const DUREE_VAL = CAL["04-valeurs"].duree;
const Valeurs: React.FC = () => (
  <Camera duree={s(DUREE_VAL)} de={1.0} vers={1.04}>
    <Papier />
    <Sequence from={0} durationInFrames={s(T_VAL - 0.2)} layout="none">
      <Colonne gap={10}>
        <Bloc duree={s(T_VAL - 0.2)} sortie="zoom">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Lettres texte="Pour former ces leaders," taille={80} fam={police.texte} poids={700} mode="monte" pas={1} />
            <Lettres texte="AIESEC leur transmet" taille={100} mode="chute" pas={1} debut={12} />
            <Lettres texte="6 valeurs." taille={230} couleur={charte.orange} mode="zoom" pas={2} debut={s(1.0)} />
          </div>
        </Bloc>
      </Colonne>
    </Sequence>
    {VALEURS.map((_, i) => (
      <Sequence key={i} from={s(DEBUTS[i])} durationInFrames={s((DEBUTS[i + 1] ?? DUREE_VAL) - DEBUTS[i])} layout="none">
        <Bloc duree={s((DEBUTS[i + 1] ?? DUREE_VAL) - DEBUTS[i])}>
          <ValeurEcran i={i} />
        </Bloc>
      </Sequence>
    ))}
  </Camera>
);

/* ───────── 4. FRISE BENIN ───────── */
const Frise: React.FC = () => {
  const f = useCurrentFrame();
  const ligne = prog(f, 0, 60);
  const Y = { a: 400, b: 980, c: 1560 };
  const tE = s(4.6);
  const chute = ressort(f - tE, true);
  const impact = tE + 13;
  const sec = secousse(f, impact, 30);
  const couleur = prog(f, impact + 8, 22);
  const rot = interpolate(chute, [0, 1], [30, 5]);
  const point = (y: number, d: number, fort: boolean) => {
    const p = ressort(f - d);
    const t = fort ? 70 : 48;
    return <div style={{ position: "absolute", left: 153 - t / 2, top: y - t / 2, width: t, height: t, borderRadius: "50%", background: fort ? charte.orange : ENCRE, border: `7px solid ${charte.creme}`, boxShadow: "0 2px 6px rgba(0,0,0,0.3)", transform: `scale(${p})` }} />;
  };
  const note = (txt: string, y: number, d: number, fort: boolean) => (
    <div style={{ position: "absolute", left: 250, top: y + (fort ? 78 : 52) }}>
      <Lettres texte={txt} taille={fort ? 38 : 46} fam={police.texte} poids={700} mode="monte" pas={1} debut={d} />
    </div>
  );
  const an = (v: string, y: number, d: number, fort: boolean) => (
    <div style={{ position: "absolute", left: 250, top: y - (fort ? 90 : 60) }}>
      <Roulette valeur={v} debut={d} taille={fort ? 160 : 108} couleur={fort ? charte.brique : ENCRE} />
    </div>
  );
  const stamp = ressort(f - s(10.2));
  return (
    <Camera duree={s(14)} de={1.0} vers={1.06} sec={sec}>
      <Papier />
      <div style={{ position: "absolute", left: 150, top: 300, width: 6, height: (1780 - 300) * ligne, background: ENCRE, borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 250, top: 170 }}>
        <Lettres texte="Puis, chez nous :" taille={84} mode="monte" pas={1} />
      </div>
      {point(Y.a, s(1.0), false)}
      {an("2005", Y.a, s(1.2), false)}
      {note("AIESEC ouvre son premier comité", Y.a, s(2.0), false)}
      {point(Y.b, s(4.2), true)}
      {an("2015", Y.b, s(5.2), true)}
      {note("Mascotte de la vision", Y.b, s(6.4), true)}
      <div style={{ position: "absolute", left: 250, top: Y.b + 78 + 50 }}><Lettres texte="AIESEC 2015 : c’est moi." taille={38} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(6.8)} /></div>
      {point(Y.c, s(8.6), false)}
      {an("2026", Y.c, s(8.8), false)}
      <div style={{ position: "absolute", left: 250, top: Y.c + 52, whiteSpace: "pre" }}>
        <Lettres texte="+20 ans déjà." taille={46} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(9.6)} />
      </div>
      <Eclat x={850} y={1000} t={impact} />
      <div style={{ position: "absolute", right: 44, top: 760, transform: `translateY(${(1 - chute) * -1300}px) rotate(${rot}deg)`, opacity: Math.min(1, chute * 4) }}>
        <Sticker hauteur={500} couleur={couleur} vent={(f % 75) / 75} saut={bond(f, s(7.2), 50)} />
        {f > tE + 12 ? (
          <>
            <div style={{ position: "absolute", top: 6, left: 20, width: 130, height: 44, background: "rgba(255,235,209,0.88)", transform: `rotate(-12deg) scaleX(${prog(f, tE + 14, 8)})`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
            <div style={{ position: "absolute", top: 20, right: 10, width: 120, height: 44, background: "rgba(255,235,209,0.88)", transform: `rotate(14deg) scaleX(${prog(f, tE + 16, 8)})`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
          </>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: 640, top: 1470, width: 300, height: 300, borderRadius: "50%", border: `11px solid ${charte.brique}`, color: charte.brique, display: "grid", placeItems: "center", textAlign: "center", transform: `rotate(-14deg) scale(${1 + (1 - Math.min(1, stamp)) * 1.4})`, opacity: 0.88 * Math.min(1, stamp * 2.5) }}>
        <div>
          <Compteur vers={20} debut={s(10.2)} taille={116} couleur={charte.brique} prefixe="+" />
          <div style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 52, letterSpacing: "0.12em" }}>ANS</div>
        </div>
      </div>
    </Camera>
  );
};

/* ───────── 5. CE QU'ON GAGNE ───────── */
const Gain: React.FC = () => {
  const f = useCurrentFrame();
  const T = [s(1.5), s(3.7), s(5.9), s(8.1)];
  const fonds = [charte.orange, charte.sarcelle, charte.brique, charte.nuit];
  const rayon = (k: number) => 2300 * prog(f, T[k], 14, coupe);
  const sec = secousse(f, T[1] + 6, 26);
  return (
    <Camera duree={s(10)} de={1.0} vers={1.05} sec={sec}>
      <Papier />
      {fonds.map((c, k) => (
        <AbsoluteFill key={k} style={{ background: c, clipPath: `circle(${rayon(k)}px at 50% 62%)` }} />
      ))}
      <Sequence from={0} durationInFrames={T[0] + 6} layout="none">
        <div style={{ position: "absolute", left: 60, right: 60, top: 780, display: "flex", justifyContent: "center" }}>
          <Bloc duree={T[0] + 6}>
            <Lettres texte="Au NTMS 2026, tu vas :" taille={96} mode="chute" pas={1} />
          </Bloc>
        </div>
      </Sequence>
      <Sequence from={T[0] + 6} durationInFrames={s(2.2) - 6} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Bloc duree={s(2.2) - 6} sortie="zoom"><Lettres texte="Apprendre." taille={150} couleur={ENCRE} mode="monte" pas={2} /></Bloc>
        </div>
      </Sequence>
      <Sequence from={T[1] + 6} durationInFrames={s(2.2) - 6} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Bloc duree={s(2.2) - 6} sortie="zoom"><Lettres texte="Oser." taille={400} couleur={charte.creme} mode="zoom" pas={1} /></Bloc>
        </div>
        <Eclat x={540} y={1190} t={8} couleur={charte.creme} />
      </Sequence>
      <Sequence from={T[2] + 6} durationInFrames={s(2.2) - 6} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div>
            <Bloc duree={s(2.2) - 6} sortie="zoom"><Lettres texte="Rencontrer." taille={142} couleur={charte.creme} mode="chute" pas={2} /></Bloc>
            <div style={{ position: "relative", height: 150, marginTop: 40 }}>
              <div style={{ position: "absolute", left: 540 - 220 + (1 - prog(f - T[2], 14, 24)) * -300 - 60, top: 0, width: 130, height: 130, borderRadius: "50%", background: charte.orange, opacity: 0.9 }} />
              <div style={{ position: "absolute", left: 540 + 60 - 70 + (1 - prog(f - T[2], 14, 24)) * 300 - 60, top: 0, width: 130, height: 130, borderRadius: "50%", background: charte.creme, opacity: 0.85 }} />
            </div>
          </div>
        </div>
      </Sequence>
      <Sequence from={T[3] + 6} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Lettres texte="Retrouver." taille={150} couleur={charte.creme} mode="melee" pas={1} teintes={{ 0: charte.orange }} />
        </div>
      </Sequence>
    </Camera>
  );
};

/* ───────── 6. LE THEME ───────── */
const Theme: React.FC = () => {
  const f = useCurrentFrame();
  const imp = s(5.2) + 12;
  const sec = secousse(f, imp, 30);
  return (
    <Camera duree={s(10)} de={1.14} vers={1.0} sec={sec}>
      <AbsoluteFill style={{ background: charte.brique }} />
      {[140, 250, 380, 520].map((hh, k) => {
        const p = ressort(f - s(2.4) - k * 6, true);
        return <div key={k} style={{ position: "absolute", left: 120 + k * 230, bottom: 0, width: 150, height: hh * 0.95 * p, background: k === 3 ? charte.orange : "rgba(255,235,209,0.13)", borderRadius: "14px 14px 0 0" }} />;
      })}
      <div style={{ position: "absolute", left: 40, right: 40, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Lettres texte="20 ans d’existence :" taille={78} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} debut={4} />
        <div style={{ marginTop: 30 }}><Lettres texte="élever" taille={260} couleur={charte.creme} mode="monte" pas={5} debut={s(1.4)} escalier={18} /></div>
        <Lettres texte="nos standards" taille={118} couleur={charte.creme} mode="saut" pas={2} debut={s(3.0)} />
        <Lettres texte="pour un meilleur" taille={96} couleur={charte.creme} mode="monte" pas={1} debut={s(4.3)} />
        <Lettres texte="impact." taille={210} couleur={charte.orange} mode="zoom" pas={1} debut={s(5.2)} />
      </div>
      <Eclat x={540} y={1180} t={imp} couleur={charte.creme} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center" }}>
        <Lettres texte="Le thème du NTMS 2026" taille={60} couleur={charte.orange} fam={police.texte} poids={900} mode="monte" pas={1} />
      </div>
    </Camera>
  );
};

/* ───────── 7. APPEL ───────── */
const Appel: React.FC = () => {
  const f = useCurrentFrame();
  const sec = secousse(f, 14, 20);
  return (
    <Camera duree={s(CAL["11-appel"].duree)} de={1.06} vers={1.0} sec={sec}>
      <AbsoluteFill style={{ background: charte.nuit }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 62%, rgba(21,103,109,0.6) 0%, rgba(0,23,36,0) 70%)" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Lettres texte="NTMS" taille={230} couleur={charte.orange} mode="saut" pas={3} />
        <Roulette valeur="2026" debut={s(0.7)} taille={190} couleur={charte.creme} />
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 14 }}>
          <Roulette valeur="18–22" debut={s(1.6)} taille={84} couleur={charte.creme} />
          <Lettres texte="novembre" taille={84} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} debut={s(2.0)} />
        </div>
        <Lettres texte="Lokossa" taille={124} couleur={charte.creme} mode="chute" pas={2} debut={s(4.2)} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2 }}>
          <Lettres texte="ntms26.aiesec.bj" taille={66} couleur={charte.creme} fam={police.texte} poids={900} mode="monte" pas={1} debut={s(5.3)} />
          <Ondule largeur={520} t={s(5.8)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center", transform: `scale(${0.8 + 0.2 * ressort(f - s(0.5))})` }}>
        <Eddy hauteur={330} vent={(f % 75) / 75} saut={bond(f, s(1.4), 80) + bond(f, s(3.2), 80) + bond(f, s(5.0), 80)} couleur={1} ombre={false} />
      </div>
      <Confettis x={540} y={1180} t={s(1.4) + 6} />
      <Confettis x={540} y={1180} t={s(5.0) + 6} n={36} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1420, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Lettres texte="Qui je suis ?" taille={78} couleur={charte.creme} mode="chute" pas={1} debut={s(SEG("11-appel", "d").debut + 1.3)} tremble={3} />
        <Lettres texte="Viens le découvrir." taille={86} couleur={charte.orange} mode="saut" pas={1} debut={s(SEG("11-appel", "d").debut + 2.7)} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: prog(f, s(CAL["11-appel"].duree) - 16, 14, Easing.linear) }} />
    </Camera>
  );
};

/* ───────── 5b. LES CHIFFRES ───────── */
const Chiffres: React.FC = () => {
  const f = useCurrentFrame();
  const blocs = [
    { v: 20, suf: "", pre: "+", lab: "ans d’existence", d: s(1.2) },
    { v: 4, suf: "", pre: "", lab: "comités locaux", d: s(3.2) },
    { v: 1000, suf: "+", pre: "", lab: "jeunes touchés", d: s(5.2) },
  ];
  const sec = secousse(f, s(3.2) + 30, 14);
  return (
    <Camera duree={s(9)} de={1.08} vers={1} sec={sec}>
      <AbsoluteFill style={{ background: charte.orange }} />
      <div style={{ position: "absolute", left: 100, top: 190 }}>
        <Lettres texte="AIESEC in Benin, aujourd’hui :" taille={62} couleur={ENCRE} fam={police.texte} poids={900} mode="monte" pas={1} />
      </div>
      {blocs.map((b, i) => {
        const q = prog(f, b.d, 16);
        return (
          <div key={i} style={{ position: "absolute", left: 100, top: 330 + i * 450, opacity: q, transform: `translateX(${(1 - q) * -160}px)` }}>
            <Compteur vers={b.v} debut={b.d} taille={280} couleur={ENCRE} suffixe={b.suf} prefixe={b.pre} />
            <div style={{ marginTop: 6 }}>
              <Lettres texte={b.lab} taille={72} couleur={ENCRE} fam={police.texte} poids={900} mode="monte" pas={1} debut={b.d + 20} />
            </div>
          </div>
        );
      })}
      <Eclat x={880} y={500} t={s(1.2) + 40} couleur={ENCRE} rayon={200} />
      <Eclat x={880} y={950} t={s(3.2) + 20} couleur={ENCRE} rayon={200} />
      <Eclat x={900} y={1400} t={s(5.2) + 40} couleur={ENCRE} rayon={200} />
    </Camera>
  );
};

/* ───────── 5c. UN SALUT AUX ANCIENS ───────── */
const Salut: React.FC = () => {
  const f = useCurrentFrame();
  const dur = CAL["07-salut"].duree;
  const c = SEG("07-salut", "c").debut, d = SEG("07-salut", "d").debut, e = SEG("07-salut", "e").debut, g = SEG("07-salut", "f").debut;
  return (
    <Camera duree={s(dur)} de={1.0} vers={1.08}>
      <Papier />
      <Sequence from={0} durationInFrames={s(3.4)} layout="none">
        <Colonne gap={6}>
          <Bloc duree={s(3.4)}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Lettres texte="Derrière ces chiffres," taille={88} mode="monte" pas={1} />
              <Lettres texte="20 générations" taille={146} couleur={charte.brique} mode="chute" pas={2} debut={8} teintes={{ 0: charte.orange, 1: charte.orange }} />
              <Lettres texte="de jeunes. Un salut :" taille={86} mode="saut" pas={2} debut={s(1.2)} />
            </div>
          </Bloc>
        </Colonne>
      </Sequence>
      {/* la photo reste tant que la voix parle d'eux */}
      <Sequence from={s(3.6)} durationInFrames={s(d - 3.6 - 0.1)} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
          <Bloc duree={s(d - 3.7)} sortie="zoom">
            <Polaroid src="archives/gala-2006.jpg" legende="Gala · Palais des Congrès · 2006" sous="Notre plus ancienne photo" debut={6} rot={-3} />
          </Bloc>
        </div>
        <Colonne top={880} height={560} gap={6}>
          <Bloc duree={s(d - 3.7)} sortie="zoom">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Lettres texte="qui ne sont plus" taille={104} mode="monte" pas={1} debut={s(c - 3.6)} />
              <Lettres texte="tout à fait jeunes," taille={120} couleur={charte.brique} mode="zoom" pas={1} debut={s(c - 3.6 + 0.5)} />
            </div>
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(d - 0.1)} durationInFrames={s(e - d)} layout="none">
        <Colonne gap={14}>
          <Bloc duree={s(e - d)}>
            <div style={{ width: 920 }}>
              <Lettres texte="mais ce sont eux : deux décennies de comités, de projets et de promotions qui se sont passé le relais," taille={84} mode="monte" pas={1} />
            </div>
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(e - 0.1)} layout="none">
        <Colonne gap={14}>
          <Lettres texte="C’est grâce à eux" taille={104} mode="monte" pas={1} />
          <Lettres texte="qu’AIESEC est ce qu’elle est aujourd’hui." taille={92} mode="chute" pas={1} debut={s(0.6)} marque={s(2.0)} />
          <Lettres texte="Merci." taille={170} couleur={charte.brique} mode="zoom" pas={2} debut={s(g - (e - 0.1))} />
        </Colonne>
      </Sequence>
      <div style={{ position: "absolute", right: 90, bottom: 240, transform: "rotate(7deg)" }}>
        <Sticker hauteur={290} couleur={1} vent={(f % 75) / 75} saut={bond(f, s(0.5), 60) + bond(f, s(3.9), 60) + bond(f, s(c), 60) + bond(f, s(g), 60)} contour={8} />
      </div>
    </Camera>
  );
};

/* ───────── 5d. LA RELEVE ───────── */
const Releve: React.FC = () => {
  const f = useCurrentFrame();
  const sec = secousse(f, s(1.6) + 12, 22);
  return (
    <Camera duree={s(4.5)} de={1.12} vers={1} sec={sec}>
      <AbsoluteFill style={{ background: charte.nuit }} />
      <Anneaux x={540} y={960} t={s(1.5)} couleur="rgba(255,122,0,0.5)" />
      <Colonne gap={10}>
        <Lettres texte="Et maintenant," taille={90} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} />
        <Lettres texte="une nouvelle génération" taille={124} couleur={charte.creme} mode="chute" pas={1} debut={s(0.6)} />
        <Lettres texte="prend le relais." taille={140} couleur={charte.orange} mode="zoom" pas={1} debut={s(1.6)} />
      </Colonne>
    </Camera>
  );
};

/* ───────── 6b. LE NTMS : ANCIENS ET JEUNES ───────── */
const Ntms: React.FC = () => {
  const f = useCurrentFrame();
  const dur = CAL["10-ntms"].duree;
  const sb = SEG("10-ntms", "b").debut - 0.05, sc_ = SEG("10-ntms", "c").debut - 0.05, sd = SEG("10-ntms", "d").debut - 0.05, se = SEG("10-ntms", "e").debut - 0.05, sf = SEG("10-ntms", "f").debut - 0.05;
  const irisT = sd - 0.3;
  const iris = 2400 * prog(f, s(irisT), 16, coupe);
  const sec = secousse(f, s(irisT) + 8, 14);
  const bonds = [0.4, 3.2, 6.2, 9.4, 12.6, 15.4].reduce((a, x) => a + bond(f, s(x), 60), 0);
  const pile = (children: React.ReactNode) => <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>{children}</div>;
  return (
    <Camera duree={s(dur)} de={1.0} vers={1.07} sec={sec}>
      <Papier />
      <AbsoluteFill style={{ background: charte.sarcelle, clipPath: `circle(${iris}px at 50% 55%)` }} />
      <Sequence from={0} durationInFrames={s(sb)} layout="none">
        <Colonne gap={8}>
          <Bloc duree={s(sb)}>
            {pile(<>
              <Lettres texte="Pour élever ces standards," taille={70} fam={police.texte} poids={700} mode="monte" pas={1} />
              <Lettres texte="le NTMS 2026 réunit" taille={88} mode="chute" pas={1} debut={10} />
              <Lettres texte="les deux générations." taille={100} couleur={charte.brique} mode="zoom" pas={1} debut={s(1.0)} />
            </>)}
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(sb)} durationInFrames={s(sc_ - sb)} layout="none">
        <Colonne gap={8}>
          <Bloc duree={s(sc_ - sb)}>
            {pile(<>
              <Lettres texte="Alumni," taille={230} couleur={charte.brique} mode="chute" pas={2} />
              <Lettres texte="venez célébrer" taille={112} mode="monte" pas={1} debut={12} />
              <Lettres texte="avec les jeunes." taille={112} mode="monte" pas={1} debut={20} marque={34} />
            </>)}
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(sc_)} durationInFrames={s(sd - sc_)} layout="none">
        <Colonne gap={8}>
          <Bloc duree={s(sd - sc_)} sortie="zoom">
            {pile(<>
              <Lettres texte="retrouver" taille={100} mode="monte" pas={1} />
              <Lettres texte="vos souvenirs," taille={150} couleur={charte.brique} mode="zoom" pas={1} debut={8} />
              <Lettres texte="et suivre la relève." taille={100} mode="monte" pas={1} debut={s(1.3)} />
            </>)}
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(sd)} durationInFrames={s(se - sd)} layout="none">
        <Colonne gap={8}>
          <Bloc duree={s(se - sd)}>
            {pile(<>
              <Lettres texte="Jeunes," taille={230} couleur={charte.orange} mode="chute" pas={2} />
              <Lettres texte="venez élever" taille={110} couleur={charte.creme} mode="monte" pas={1} debut={12} />
              <Lettres texte="vos standards." taille={150} couleur={charte.creme} mode="zoom" pas={1} debut={22} />
            </>)}
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(se)} durationInFrames={s(sf - se)} layout="none">
        <Colonne gap={8}>
          <Bloc duree={s(sf - se)}>
            {pile(<>
              <Lettres texte="devenir de" taille={100} couleur={charte.creme} fam={police.texte} poids={700} mode="monte" pas={1} />
              <Lettres texte="meilleures personnes," taille={118} couleur={charte.creme} mode="saut" pas={1} debut={10} teintes={{ 0: charte.orange, 1: charte.orange, 2: charte.orange, 3: charte.orange, 4: charte.orange, 5: charte.orange, 6: charte.orange, 7: charte.orange, 8: charte.orange, 9: charte.orange }} />
            </>)}
          </Bloc>
        </Colonne>
      </Sequence>
      <Sequence from={s(sf)} layout="none">
        <Colonne gap={8}>
          <Lettres texte="des leaders" taille={146} couleur={charte.orange} mode="chute" pas={2} />
          <Lettres texte="qui incarnent les valeurs" taille={72} couleur={charte.creme} mode="monte" pas={1} debut={12} />
          <Lettres texte="et militent pour la paix." taille={78} couleur={charte.creme} mode="zoom" pas={1} debut={24} />
        </Colonne>
      </Sequence>
      <div style={{ position: "absolute", right: 90, bottom: 340, transform: "rotate(7deg)" }}>
        <Sticker hauteur={270} couleur={1} vent={(f % 75) / 75} saut={bonds} contour={8} />
      </div>
    </Camera>
  );
};

/* ───────── MONTAGE ───────── */
const PAPIER = new Set<React.FC>([Histoire, Valeurs, Frise, Salut, Ntms]);
const SCENES: { d: number; C: React.FC }[] = [
  { d: CAL["01-mystere"].duree, C: Mystere },
  { d: CAL["02-1948"].duree, C: Histoire },
  { d: 17, C: Vision },
  { d: DUREE_VAL, C: Valeurs },
  { d: 13, C: Frise },
  { d: 9, C: Chiffres },
  { d: CAL["07-salut"].duree, C: Salut },
  { d: 4.5, C: Releve },
  { d: 10.5, C: Theme },
  { d: CAL["10-ntms"].duree, C: Ntms },
  { d: CAL["11-appel"].duree, C: Appel },
];
const PLAN = SCENES.map((sc, i) => ({ ...sc, de: SCENES.slice(0, i).reduce((a, x) => a + x.d, 0) }));
export const DUREE_V1 = s(SCENES.reduce((a, x) => a + x.d, 0));

/** Transition : cinq bandes de couleur qui balaient l'ecran, le plan change sous elles. */
const Bandes: React.FC = () => {
  const f = useCurrentFrame();
  const couleurs = [charte.orange, charte.brique, charte.creme, charte.sarcelle, charte.nuit];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {couleurs.map((c, i) => {
        const entree = interpolate(f, [i * 2, i * 2 + 9], [-130, 0], { ...borne, easing: coupe });
        const sortie = interpolate(f, [17 + i * 2, 17 + i * 2 + 9], [0, 130], { ...borne, easing: coupe });
        return <div key={i} style={{ position: "absolute", left: 0, width: "100%", top: (i * 1920) / 5 - 1, height: 1920 / 5 + 2, background: c, transform: `translateX(${entree + sortie}%) skewX(-10deg)`, scale: "1.2 1" }} />;
      })}
    </AbsoluteFill>
  );
};

export const Eddy1: React.FC = () => (
  <AbsoluteFill style={{ background: charte.nuit }}>
    {PLAN.map(({ de, d, C }, i) => (
      <Sequence key={i} from={s(de)} durationInFrames={s(d)}>
        <C />
      </Sequence>
    ))}
    {PLAN.filter(({ C }) => PAPIER.has(C)).map(({ de, d }, i) => (
      <Sequence key={`l${i}`} from={s(de)} durationInFrames={s(d)} layout="none">
        <Lignes />
      </Sequence>
    ))}
    {PLAN.slice(1).map(({ de }, i) => (
      <Sequence key={`t${i}`} from={s(de) - 17} durationInFrames={36} layout="none">
        <Bandes />
      </Sequence>
    ))}
    <Grain />
  </AbsoluteFill>
);
