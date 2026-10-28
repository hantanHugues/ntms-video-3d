import React from "react";
import { AbsoluteFill } from "remotion";
import { charte } from "./charte";
import { police } from "./polices";

/**
 * NOUVELLE MASCOTTE du NTMS 2026 : cinq propositions (a choisir, puis a faire valider).
 * Meme principe que la serie : figurine PLATE (aplats nets + liseré crème), posable
 * telle quelle dans le decor 3D. Chaque mascotte se dessine dans un repere 300 x 400,
 * pieds en bas (y ≈ 385), et prend une expression.
 */
export type Expr = "joie" | "taquin" | "surpris" | "fier";
const ENCRE = "#1d0d06";

/* ───────── visage commun (yeux, sourcils, bouche, joues) ───────── */
const Visage: React.FC<{
  x: number; y: number; s?: number; ex: Expr; ecart?: number; oeil?: number;
  sourcils?: string; bouche?: boolean; boucheY?: number; joues?: boolean;
}> = ({ x, y, s = 1, ex, ecart = 18, oeil = 1, sourcils = ENCRE, bouche = true, boucheY, joues = true }) => {
  const e = ecart * s, k = s * oeil;
  const by = boucheY ?? y + 22 * s;
  const arc = (cx: number, haut: boolean) => (
    <path d={`M${cx - 9 * k} ${y + (haut ? 3 : -2) * s} Q${cx} ${y + (haut ? -9 : 7) * k} ${cx + 9 * k} ${y + (haut ? 3 : -2) * s}`} fill="none" stroke={ENCRE} strokeWidth={4.2 * s} strokeLinecap="round" />
  );
  const rond = (cx: number, grand = false, regard = 0) => (
    <g>
      <ellipse cx={cx} cy={y} rx={(grand ? 11.5 : 9) * k} ry={(grand ? 13.5 : 11) * k} fill="#fff" />
      <circle cx={cx + regard * k} cy={y + 1 * k} r={(grand ? 4 : 5.2) * k} fill={ENCRE} />
      <circle cx={cx + regard * k - 1.8 * k} cy={y - 1.8 * k} r={1.6 * k} fill="#fff" />
    </g>
  );
  const sc = (cx: number, dy1: number, dy2: number) => (
    <path d={`M${cx - 9 * k} ${y - 18 * k + dy1 * s} L${cx + 9 * k} ${y - 18 * k + dy2 * s}`} stroke={sourcils} strokeWidth={4.2 * s} strokeLinecap="round" />
  );
  const ligne = (d: string) => <path d={d} fill="none" stroke={ENCRE} strokeWidth={4.2 * s} strokeLinecap="round" />;
  return (
    <g>
      {joues && ex !== "surpris" ? (
        <>
          <ellipse cx={x - e - 6 * s} cy={y + 14 * s} rx={8 * s} ry={4.5 * s} fill={charte.orange} opacity={0.55} />
          <ellipse cx={x + e + 6 * s} cy={y + 14 * s} rx={8 * s} ry={4.5 * s} fill={charte.orange} opacity={0.55} />
        </>
      ) : null}
      {ex === "joie" ? <>{rond(x - e)}{rond(x + e)}{sc(x - e, 0, -1)}{sc(x + e, -1, 0)}</> : null}
      {ex === "taquin" ? <>{arc(x - e, true)}{rond(x + e, false, 2)}{sc(x - e, 2, 3)}{sc(x + e, -6, -3)}</> : null}
      {ex === "surpris" ? <>{rond(x - e, true)}{rond(x + e, true)}{sc(x - e, -6, -8)}{sc(x + e, -8, -6)}</> : null}
      {ex === "fier" ? <>{arc(x - e, false)}{arc(x + e, false)}{sc(x - e, -2, -4)}{sc(x + e, -4, -2)}</> : null}
      {bouche ? (
        ex === "joie" ? ligne(`M${x - 13 * s} ${by - 2 * s} Q${x} ${by + 10 * s} ${x + 13 * s} ${by - 2 * s}`)
        : ex === "taquin" ? ligne(`M${x - 11 * s} ${by + 1 * s} Q${x + 3 * s} ${by + 7 * s} ${x + 14 * s} ${by - 5 * s}`)
        : ex === "surpris" ? <ellipse cx={x} cy={by + 2 * s} rx={6 * s} ry={7.5 * s} fill="#3a120a" stroke={ENCRE} strokeWidth={2.5 * s} />
        : <g>
            <path d={`M${x - 16 * s} ${by - 4 * s} Q${x} ${by + 18 * s} ${x + 16 * s} ${by - 4 * s} Z`} fill="#3a120a" stroke={ENCRE} strokeWidth={3 * s} strokeLinejoin="round" />
            <path d={`M${x - 7 * s} ${by + 6 * s} Q${x} ${by + 1 * s} ${x + 7 * s} ${by + 6 * s} Q${x} ${by + 11 * s} ${x - 7 * s} ${by + 6 * s} Z`} fill="#e0555a" />
          </g>
      ) : null}
    </g>
  );
};

/* ───────── A · Lumi, la flamme ───────── */
const Lumi: React.FC<{ ex: Expr }> = ({ ex }) => (
  <g>
    <rect x={122} y={340} width={16} height={34} rx={8} fill={charte.brique} />
    <rect x={162} y={340} width={16} height={34} rx={8} fill={charte.brique} />
    <ellipse cx={128} cy={378} rx={17} ry={8} fill={charte.nuit} />
    <ellipse cx={172} cy={378} rx={17} ry={8} fill={charte.nuit} />
    <path d="M76 250 Q50 252 44 226" stroke={charte.brique} strokeWidth={12} strokeLinecap="round" fill="none" />
    <path d="M224 246 Q252 236 256 204" stroke={charte.brique} strokeWidth={12} strokeLinecap="round" fill="none" />
    <path d="M150 36 C186 92 240 140 236 236 C233 312 196 358 150 358 C104 358 67 312 64 236 C62 176 100 150 112 102 C121 138 134 150 140 160 C137 120 134 80 150 36 Z" fill={charte.orange} />
    <path d="M150 118 C176 164 206 196 201 256 C198 306 178 334 150 334 C122 334 102 306 99 256 C97 214 120 194 128 168 C134 189 142 196 146 202 C144 170 142 144 150 118 Z" fill="#FFC24A" />
    <path d="M96 300 Q150 320 204 300 L206 320 Q150 340 94 320 Z" fill={charte.sarcelle} />
    <path d="M176 322 L196 360 L178 356 L170 326 Z" fill={charte.sarcelle} />
    <Visage x={150} y={246} s={1.25} ex={ex} />
  </g>
);

/* ───────── B · Kamé, le caméléon ───────── */
const VERT = "#22a093", VERT_FONCE = "#177a70";
const Kame: React.FC<{ ex: Expr }> = ({ ex }) => (
  <g>
    <path d="M196 330 C256 336 274 276 240 262 C212 252 200 290 226 293" stroke={VERT} strokeWidth={24} strokeLinecap="round" fill="none" />
    <rect x={118} y={332} width={18} height={44} rx={9} fill={VERT} />
    <rect x={164} y={332} width={18} height={44} rx={9} fill={VERT} />
    <ellipse cx={127} cy={379} rx={18} ry={8} fill={charte.sarcelle} />
    <ellipse cx={173} cy={379} rx={18} ry={8} fill={charte.sarcelle} />
    <path d="M96 282 Q74 300 80 324" stroke={VERT} strokeWidth={14} strokeLinecap="round" fill="none" />
    <path d="M204 280 Q228 266 232 240" stroke={VERT} strokeWidth={14} strokeLinecap="round" fill="none" />
    <ellipse cx={150} cy={290} rx={60} ry={62} fill={VERT} />
    <ellipse cx={150} cy={300} rx={36} ry={44} fill={charte.creme} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${126 + i * 0} ${280 + i * 18} Q150 ${272 + i * 18} 174 ${280 + i * 18}`} stroke="#ffd9a0" strokeWidth={3} fill="none" opacity={0.8} />)}
    <path d="M82 190 C82 130 120 78 150 62 C180 78 218 130 218 190 C218 228 190 246 150 246 C110 246 82 228 82 190 Z" fill={VERT} />
    <path d="M120 112 Q150 96 180 112" stroke={charte.orange} strokeWidth={7} strokeLinecap="round" fill="none" />
    <path d="M106 136 Q150 118 194 136" stroke="#FFD000" strokeWidth={7} strokeLinecap="round" fill="none" />
    <path d="M136 88 Q150 80 164 88" stroke="#e8455a" strokeWidth={7} strokeLinecap="round" fill="none" />
    <circle cx={112} cy={180} r={30} fill={VERT_FONCE} />
    <circle cx={188} cy={180} r={30} fill={VERT_FONCE} />
    <Visage x={150} y={180} s={1.25} ex={ex} ecart={30} oeil={1.35} boucheY={218} sourcils={charte.creme} />
  </g>
);

/* ───────── C · Tisso, le tisserin (l'oiseau qui tisse son nid) ───────── */
const JAUNE = "#FFC531", JAUNE_FONCE = "#E8A800";
const Tisso: React.FC<{ ex: Expr }> = ({ ex }) => {
  const ouvert = ex === "surpris" || ex === "fier";
  return (
    <g>
      <path d="M130 340 L128 378 M170 340 L172 378 M114 380 L142 380 M158 380 L186 380" stroke="#d9822b" strokeWidth={7} strokeLinecap="round" />
      <path d="M140 132 Q128 98 146 90 Q148 114 154 130 Z" fill={JAUNE_FONCE} />
      <path d="M152 130 Q162 94 180 100 Q166 116 162 134 Z" fill={JAUNE_FONCE} />
      <ellipse cx={150} cy={240} rx={100} ry={112} fill={JAUNE} />
      <ellipse cx={150} cy={288} rx={62} ry={60} fill="#FFE08A" />
      <path d="M56 218 Q34 292 86 332 Q98 270 82 212 Z" fill={JAUNE_FONCE} />
      <path d="M244 214 Q276 270 236 312 Q216 262 220 208 Z" fill={JAUNE_FONCE} />
      <path d="M70 300 L86 332 M74 286 L88 318" stroke={charte.brique} strokeWidth={4} strokeLinecap="round" />
      {/* le petit nid tisse qu'il porte */}
      <g>
        <path d="M246 300 Q262 300 266 318 Q268 350 246 356 Q224 350 226 318 Q230 300 246 300 Z" fill="#a8733a" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M228 ${312 + i * 10} Q246 ${306 + i * 10} 264 ${312 + i * 10}`} stroke="#6e4422" strokeWidth={2.5} fill="none" />)}
        <ellipse cx={246} cy={322} rx={7} ry={8} fill="#3a2010" />
      </g>
      <path d="M92 214 C95 180 125 166 150 172 C175 166 205 180 208 214 C205 248 180 260 150 262 C120 260 95 248 92 214 Z" fill={ENCRE} />
      <Visage x={150} y={208} s={1.25} ex={ex} ecart={22} bouche={false} sourcils={charte.creme} />
      {ouvert ? (
        <>
          <path d="M134 232 L166 232 L150 250 Z" fill={charte.orange} />
          <path d="M140 252 L160 252 L150 264 Z" fill="#d9600a" />
        </>
      ) : (
        <path d={ex === "taquin" ? "M136 230 L168 234 L148 262 Z" : "M134 230 L166 230 L150 262 Z"} fill={charte.orange} />
      )}
    </g>
  );
};

/* ───────── D · Guépi, le guépard ───────── */
const FAUVE = "#F2A93B";
const Guepi: React.FC<{ ex: Expr }> = ({ ex }) => (
  <g>
    <path d="M200 340 C250 342 264 300 252 268" stroke={FAUVE} strokeWidth={16} strokeLinecap="round" fill="none" />
    <circle cx={252} cy={266} r={9} fill={ENCRE} />
    <rect x={120} y={330} width={20} height={46} rx={10} fill={FAUVE} />
    <rect x={160} y={330} width={20} height={46} rx={10} fill={FAUVE} />
    <ellipse cx={130} cy={378} rx={16} ry={8} fill={charte.creme} />
    <ellipse cx={170} cy={378} rx={16} ry={8} fill={charte.creme} />
    <path d="M96 276 Q70 300 76 326" stroke={FAUVE} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d="M204 274 Q232 258 238 230" stroke={FAUVE} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d="M90 266 Q150 244 210 266 L216 342 Q150 354 84 342 Z" fill={charte.sarcelle} />
    <path d="M90 266 Q150 244 210 266 L208 278 Q150 258 92 278 Z" fill={charte.orange} />
    <text x={150} y={324} textAnchor="middle" fontFamily={police.titre} fontWeight={800} fontSize={40} fill={charte.creme}>20</text>
    <circle cx={90} cy={126} r={22} fill={FAUVE} /><circle cx={90} cy={126} r={11} fill={charte.brique} />
    <circle cx={210} cy={126} r={22} fill={FAUVE} /><circle cx={210} cy={126} r={11} fill={charte.brique} />
    <ellipse cx={150} cy={184} rx={84} ry={74} fill={FAUVE} />
    {[[128, 134, 5], [150, 124, 5], [172, 134, 5], [110, 154, 4], [190, 154, 4], [96, 196, 4], [204, 196, 4], [139, 146, 3.5], [161, 146, 3.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={ENCRE} />)}
    <ellipse cx={150} cy={218} rx={42} ry={30} fill={charte.creme} />
    <path d="M130 190 Q124 202 118 212 M170 190 Q176 202 182 212" stroke={ENCRE} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <path d="M140 204 L160 204 L150 214 Z" fill={ENCRE} />
    <Visage x={150} y={176} s={1.15} ex={ex} ecart={22} boucheY={228} />
  </g>
);

/* ───────── E · Séna, la jeune leader ───────── */
const PEAU = "#8a5434";
const Sena: React.FC<{ ex: Expr }> = ({ ex }) => (
  <g>
    <rect x={120} y={330} width={22} height={42} rx={8} fill="#123247" />
    <rect x={158} y={330} width={22} height={42} rx={8} fill="#123247" />
    <ellipse cx={129} cy={377} rx={21} ry={9} fill={charte.orange} />
    <ellipse cx={171} cy={377} rx={21} ry={9} fill={charte.orange} />
    <path d="M94 272 Q70 300 76 330" stroke={charte.brique} strokeWidth={20} strokeLinecap="round" fill="none" />
    <path d="M206 270 Q236 250 240 220" stroke={charte.brique} strokeWidth={20} strokeLinecap="round" fill="none" />
    <circle cx={76} cy={334} r={10} fill={PEAU} />
    <circle cx={241} cy={214} r={10} fill={PEAU} />
    <path d="M84 262 Q150 238 216 262 L222 342 Q150 354 78 342 Z" fill={charte.brique} />
    <path d="M112 250 Q150 278 188 250" stroke="#5c1d09" strokeWidth={10} strokeLinecap="round" fill="none" />
    <path d="M136 262 L150 296 L164 262" stroke={charte.sarcelle} strokeWidth={4} fill="none" />
    <rect x={130} y={294} width={40} height={30} rx={5} fill={charte.creme} />
    <text x={150} y={314} textAnchor="middle" fontFamily={police.titre} fontWeight={800} fontSize={13} fill={charte.brique}>NTMS</text>
    <circle cx={98} cy={112} r={34} fill={ENCRE} />
    <circle cx={202} cy={112} r={34} fill={ENCRE} />
    <circle cx={86} cy={182} r={12} fill={PEAU} />
    <circle cx={214} cy={182} r={12} fill={PEAU} />
    <circle cx={150} cy={176} r={66} fill={PEAU} />
    <path d="M86 166 Q88 106 150 106 Q212 106 214 166 Q192 132 150 134 Q108 132 86 166 Z" fill={ENCRE} />
    <circle cx={208} cy={104} r={6} fill={charte.orange} />
    <Visage x={150} y={180} s={1.2} ex={ex} />
  </g>
);

/* ───────── planche ───────── */
type Fiche = { id: string; nom: string; quoi: string; idee: string; caractere: string; Corps: React.FC<{ ex: Expr }>; tete: [number, number, number, number] };
export const MASCOTTES: Fiche[] = [
  { id: "lumi", nom: "Lumi", quoi: "la flamme", idee: "Depuis 20 ans, on se passe le flambeau.", caractere: "chaleureuse · enthousiaste", Corps: Lumi, tete: [60, 120, 180, 190] },
  { id: "kame", nom: "Kamé", quoi: "le caméléon", idee: "Il change de couleur avec chaque culture : Living Diversity.", caractere: "curieux · malin · taquin", Corps: Kame, tete: [72, 56, 156, 196] },
  { id: "tisso", nom: "Tisso", quoi: "le tisserin", idee: "L'oiseau qui tisse son nid, fil après fil : on construit ensemble.", caractere: "bâtisseur · attentionné", Corps: Tisso, tete: [56, 88, 188, 190] },
  { id: "guepi", nom: "Guépi", quoi: "le guépard", idee: "Énergie et vitesse : élever nos standards.", caractere: "fonceur · fier · drôle", Corps: Guepi, tete: [62, 96, 176, 168] },
  { id: "sena", nom: "Séna", quoi: "la jeune leader", idee: "Une jeune comme toi, badge du NTMS au cou.", caractere: "proche · inspirante", Corps: Sena, tete: [58, 72, 184, 188] },
];

/** Contour « sticker » crème autour de toute la figurine. */
const Sticker: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={4.5} result="epais" />
      <feFlood floodColor={charte.creme} />
      <feComposite in2="epais" operator="in" result="liseré" />
      <feMerge><feMergeNode in="liseré" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

export const Figurine: React.FC<{ m: Fiche; ex: Expr; boite?: [number, number, number, number]; largeur: number; id: string; ombre?: boolean }> = ({ m, ex, boite = [0, 0, 300, 400], largeur, id, ombre = true }) => (
  <svg width={largeur} height={(largeur * boite[3]) / boite[2]} viewBox={boite.join(" ")} style={{ display: "block", overflow: "visible" }}>
    <Sticker id={id} />
    {ombre ? <ellipse cx={150} cy={388} rx={84} ry={9} fill="#000" opacity={0.35} /> : null}
    <g filter={`url(#${id})`}><m.Corps ex={ex} /></g>
  </svg>
);

const LIB: Record<Expr, string> = { joie: "joyeux", taquin: "taquin", surpris: "surpris", fier: "fier" };

export const PlancheMascottes: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #0d2a3a, ${charte.nuit} 60%)`, padding: "56px 80px", display: "flex", flexDirection: "column", gap: 40 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
      <div style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 72, color: charte.creme, letterSpacing: "-0.02em" }}>Nouvelle mascotte du NTMS 2026</div>
      <div style={{ fontFamily: police.texte, fontWeight: 900, fontSize: 26, color: charte.orange, letterSpacing: "0.1em", textTransform: "uppercase" }}>5 propositions · à choisir</div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {MASCOTTES.map((m, i) => (
        <div key={m.id} style={{ width: 460, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 460, height: 560, borderRadius: 32, background: "radial-gradient(circle at 50% 42%, #2a160c, #0b0603 78%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <Figurine m={m} ex="joie" largeur={380} id={`g-${m.id}`} />
          </div>
          <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: police.texte, fontWeight: 900, fontSize: 28, color: charte.orange }}>{String.fromCharCode(65 + i)}</span>
            <span style={{ fontFamily: police.titre, fontWeight: 800, fontSize: 52, color: charte.creme }}>{m.nom}</span>
            <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 28, color: "rgba(255,235,209,0.65)" }}>{m.quoi}</span>
          </div>
          <div style={{ fontFamily: police.texte, fontWeight: 400, fontSize: 25, lineHeight: 1.35, color: charte.creme, textAlign: "center", height: 70, marginTop: 6 }}>{m.idee}</div>
          <div style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 21, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5fb8bd", marginTop: 6 }}>{m.caractere}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {(["taquin", "surpris", "fier"] as Expr[]).map((ex) => (
              <div key={ex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 140, height: 140, borderRadius: 22, background: "#140a05", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <Figurine m={m} ex={ex} boite={m.tete} largeur={118} id={`t-${m.id}-${ex}`} ombre={false} />
                </div>
                <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 20, color: "rgba(255,235,209,0.7)" }}>{LIB[ex]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
