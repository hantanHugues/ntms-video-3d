import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from "remotion";
import { charte } from "../charte";
import ep3 from "./ep3.json";
import {
  Bokeh, Bureau, Cam, Finitions, GrilleCarres, Livre3D, Lumieres, Minutage, Piece, PhotoPlein, Pixels, Polaroid, Scene3D, Tape, Texte3D, EddyPlan,
  couvertureLivre, pageTitre, pageVide, parcours, prog, reperes, s,
} from "./communs";

/** EPISODE 3 · Aujourd'hui et demain — les chiffres, merci aux anciens, aux jeunes, le NTMS 2026. */
const M = ep3 as Minutage; const R = reperes(M);
export const DUREE_EP3 = s(M.total);
const LIVRE = { x: 0.3, y: 1.57, z: 0.25 };
const DEFILE_ANCIENS = ["groupe-01", "promo-01", "soiree-01", "bandeau-01", "public-01", "bandeau-05", "prise-parole-01", "bandeau-09", "public-03", "bandeau-12", "atelier-02", "bandeau-14"];
const DEFILE_JEUNES = ["atelier-01", "public-02", "prise-parole-02", "bandeau-03", "public-04", "bandeau-07", "prise-parole-03", "bandeau-10", "portrait-01", "bandeau-13"];

export const Episode3: React.FC = () => {
  const f = useCurrentFrame();
  const pages = useMemo(() => [pageTitre("Chapitre III", "aujourd’hui et demain")], []);
  const couv = useMemo(() => couvertureLivre(), []);
  const vide = useMemo(() => pageVide(), []);

  const face: Cam = { p: [-0.1, 2.3, 10.4], l: [-0.1, 1.7, 0.3], fov: 38 };
  const pres: Cam = { p: [0.1, 2.35, 8.4], l: [0.0, 1.75, 0.3], fov: 38 };
  const cam = f < R.sc("gala") ? parcours(f, [[0, face], [R.sc("gala"), pres]]) : parcours(f, [[R.sc("fin") - 10, pres], [R.sc("fin") + s(2), face]]);
  const ouverture = 1 - prog(f, R.sc("fin") + s(0.8), R.sc("fin") + s(1.8), Easing.inOut(Easing.cubic));

  const fond = (<><Lumieres lum={1} /><Piece couche="fond" /><fog attach="fog" args={["#0b0603", 12, 40]} /></>);
  const avant = (
    <>
      <Lumieres lum={1} />
      <Piece couche="avant" />
      <Bureau />
      <group position={[LIVRE.x, LIVRE.y, LIVRE.z]}>
        <Livre3D pages={pages} couverture={couv} vide={vide} ouverture={ouverture} page={0} tour={0} />
      </group>
      <EddyPlan f={f} x={-0.62} z={1.75} hauteur={2.3} sauts={[R.seg("s1a"), R.seg("s1b") + s(0.3), R.seg("s1b") + s(1.9), R.seg("s1b") + s(3.2), R.seg("s5a")]} />
      <fog attach="fog" args={["#0b0603", 12, 40]} />
    </>
  );
  const blanc = prog(f, s(M.total) - 14, s(M.total) - 1, Easing.linear);

  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      {/* le bureau d'Eddy : au debut et a la fin */}
      <Sequence durationInFrames={R.sc("gala") + 4} layout="none"><Scene3D cam={cam} fond={fond} avant={avant} /></Sequence>
      <Sequence from={R.sc("fin") - 16} layout="none"><Scene3D cam={cam} fond={fond} avant={avant} /></Sequence>

      {/* AUJOURD'HUI : les chiffres tombent, des photos de conferences arrivent */}
      <Texte3D texte="+20 ans" debut={R.seg("s1b") + s(0.2)} fin={R.sc("gala") - 2} mode="tombe" taille={150} top={180} couleur={charte.orange} />
      <Texte3D texte="4 comités locaux" debut={R.seg("s1b") + s(1.8)} fin={R.sc("gala") - 2} mode="tombe" taille={92} top={370} />
      <Texte3D texte="1000+ jeunes touchés" debut={R.seg("s1b") + s(3.1)} fin={R.sc("gala") - 2} mode="tombe" taille={92} top={490} />
      <Polaroid src="serie/photos/bandeau-03.jpg" debut={R.seg("s1c") - 4} fin={R.sc("gala") - 2} x={560} y={640} largeur={420} rot={6} />
      <Polaroid src="serie/photos/public-01.jpg" debut={R.seg("s1c") + 10} fin={R.sc("gala") - 2} x={600} y={1010} largeur={380} rot={-5} />
      <Pixels t0={R.seg("s1b") + s(0.3)} x={540} y={300} />

      {/* MERCI AUX ANCIENS : la photo de 2006 (entiere), puis les photos d'aujourd'hui, en rafale douce */}
      <PhotoPlein src="archives/gala-2006.jpg" debut={R.sc("gala") - 6} fin={R.seg("s2a") + s(2.0)} ancien fondu={14} />
      {DEFILE_ANCIENS.map((nom, i) => {
        const t0 = R.seg("s2a") + s(2.0) - 8 + i * s(1.5);
        return t0 < R.sc("jeunes") ? <PhotoPlein key={nom} src={`serie/photos/${nom}.jpg`} debut={t0} fin={Math.min(R.sc("jeunes") + 6, t0 + s(1.5) + 10)} fondu={8} /> : null;
      })}
      {f >= R.sc("gala") - 6 && f < R.sc("ntms") + 6 ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,6,3,0.45) 0%, transparent 22%, transparent 62%, rgba(11,6,3,0.85) 100%)" }} /> : null}
      <Tape texte="Gala · Palais des Congrès · 2006" debut={R.sc("gala") + 8} fin={R.seg("s2a") + s(2.0)} top={1700} taille={40} />
      <Texte3D texte="Merci." debut={R.seg("s2c") + s(0.3)} fin={R.sc("jeunes") - 2} mode="profondeur" taille={220} top={1380} />
      <Tape texte="Venez célébrer avec nous." debut={R.seg("s2c") + s(2.4)} fin={R.sc("jeunes") - 2} top={1680} />

      {/* AUX JEUNES : plus de photos, plus courtes */}
      {DEFILE_JEUNES.map((nom, i) => {
        const t0 = R.sc("jeunes") - 6 + i * s(1.4);
        return t0 < R.sc("ntms") ? <PhotoPlein key={nom} src={`serie/photos/${nom}.jpg`} debut={t0} fin={Math.min(R.sc("ntms") + 6, t0 + s(1.4) + 10)} fondu={8} /> : null;
      })}
      <Texte3D texte="C’est ton tour." debut={R.segFin("s3b") - s(0.9)} fin={R.sc("ntms") - 2} mode="tombe" taille={150} top={1300} couleur={charte.orange} />

      {/* LE NTMS 2026 */}
      {f >= R.sc("ntms") - 4 && f < R.sc("fin") + 4 ? <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 40%, #2a160c 0%, #0b0603 75%)" }} /> : null}
      {f >= R.sc("ntms") - 4 && f < R.sc("fin") + 4 ? <Bokeh force={0.9} /> : null}
      <Texte3D texte="18 – 22 novembre 2026" debut={R.seg("s4a") + s(0.2)} fin={R.sc("fin") - 2} mode="pivot" taille={70} top={250} />
      <Texte3D texte="NTMS 2026" debut={R.seg("s4a") + s(1.4)} fin={R.sc("fin") - 2} mode="tombe" taille={150} top={350} couleur={charte.orange} />
      <Texte3D texte="Lokossa, Bénin" debut={R.seg("s4a") + s(3.4)} fin={R.sc("fin") - 2} mode="pivot" taille={96} top={540} />
      <Tape texte="THÈME" debut={R.seg("s4a") + s(5.0)} fin={R.sc("fin") - 2} top={760} taille={36} />
      <Texte3D texte="20 ans d’existence : élever nos standards pour un meilleur impact." debut={R.seg("s4a") + s(5.6)} fin={R.sc("fin") - 2} mode="leve" taille={74} top={840} couleur="#f4d27a" lueur="rgba(255,170,60,0.55)" pas={0.8} />
      <Tape texte="ntms26.aiesec.bj" debut={R.seg("s4a") + s(8.5)} fin={R.sc("fin") - 2} top={1150} />
      <Texte3D texte="Anciens : venez célébrer." debut={R.seg("s4b")} fin={R.sc("fin") - 2} mode="profondeur" taille={66} top={1380} />
      <Texte3D texte="Jeunes : venez écrire la suite." debut={R.seg("s4b") + s(2.4)} fin={R.sc("fin") - 2} mode="profondeur" taille={66} top={1490} couleur={charte.orange} />
      <Pixels t0={R.seg("s4a") + s(1.5)} x={540} y={430} n={30} />

      {/* FIN : retour au bureau, Eddy referme le livre */}
      <Texte3D texte="On se retrouve à Lokossa !" debut={R.seg("s5a")} mode="pivot" taille={100} top={230} />

      <GrilleCarres t0={R.sc("gala") - 15} duree={30} />
      <GrilleCarres t0={R.sc("ntms") - 15} duree={30} />
      <GrilleCarres t0={R.sc("fin") - 15} duree={30} />
      <Finitions />
      {/* fondu au blanc : enchaine sur le logo AIESEC (muet) */}
      <AbsoluteFill style={{ background: "#fff", opacity: blanc }} />
    </AbsoluteFill>
  );
};
