import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { charte } from "../charte";
import ep1 from "./ep1.json";
import {
  Bokeh, Bureau, Cam, CarteFin, Cassette, EddyPlan, Finitions, GrilleCarres, Livre3D, Lumieres, Minutage, Piece,
  PageProche, Pixels, Scene3D, Tape, Texte3D, couvertureLivre, etatLivre, pageImage, pageSilhouettes, pageTitre, pageVide, parcours, prog, reperes, s, useImages,
} from "./communs";

/** EPISODE 1 · Le livre — Eddy se presente, ouvre le livre des debuts d'AIESEC. */
const M = ep1 as Minutage; const R = reperes(M);
export const DUREE_EP1 = s(M.total);

const IMAGES = ["serie/reconstruction-france.jpg", "serie/reconstruction-berlin.jpg", "serie/jeunes-reunis.jpg", ...[1, 2, 3, 4, 5, 6].map((i) => `valeurs/${i}.png`)];
const LIVRE = { x: 0.3, y: 1.57, z: 0.25 };
const PAGE_DROITE = { x: LIVRE.x + 0.41, z: LIVRE.z };

export const Episode1: React.FC = () => {
  const f = useCurrentFrame();
  const ims = useImages(IMAGES.map((u) => staticFile(u)));
  const pret = ims.every((i) => i);
  const pages = useMemo(() => (pret ? [
    pageTitre("Chapitre I", "les débuts d’AIESEC"),
    pageImage(ims[0], "La reconstruction"),
    pageImage(ims[1], "Les villes se relèvent"),
    pageImage(ims[2], "Des jeunes se réunissent"),
    pageSilhouettes(ims.slice(3)),
  ] : []), [pret]); // eslint-disable-line react-hooks/exhaustive-deps
  const couv = useMemo(() => couvertureLivre(), []);
  const vide = useMemo(() => pageVide(), []);

  // le livre s'ouvre au debut de la scene « livre », puis les pages tournent
  const ouverture = prog(f, R.sc("livre"), R.sc("livre") + 34, Easing.inOut(Easing.cubic));
  const livre = etatLivre(f, [R.sc("guerre"), R.seg("s2b") - 4, R.sc("mission"), R.sc("valeurs") + 4]);

  const face: Cam = { p: [-0.1, 2.3, 10.4], l: [-0.1, 1.7, 0.3], fov: 38 };
  const pres: Cam = { p: [0.15, 2.4, 8.6], l: [0.15, 1.7, 0.3], fov: 38 };
  const oblique: Cam = { p: [0.7, 3.35, 2.7], l: [0.4, 1.6, 0.3], fov: 36 };
  const recul: Cam = { p: [0.45, 3.35, 2.4], l: [0.45, 1.65, 0.25], fov: 38 };
  const cam = parcours(f, [
    [0, face], [R.seg("s1d"), pres], [R.sc("livre") - 6, oblique], [R.sc("guerre") + 10, recul], [R.sc("valeurs") + 8, recul],
  ]);
  const lum = prog(f, 0, 24);
  const penche = -0.09 * prog(f, R.seg("s1d") + s(2), R.seg("s1d") + s(3));
  const gros = prog(f, R.sc("guerre") - 6, R.sc("guerre") + 14);

  const fond = (<><Lumieres lum={lum} /><Piece couche="fond" /><fog attach="fog" args={["#0b0603", 12, 40]} /></>);
  const avant = (
    <>
      <Lumieres lum={lum} />
      <Piece couche="avant" />
      <Bureau />
      {pret ? (
        <group position={[LIVRE.x, LIVRE.y, LIVRE.z]}>
          <Livre3D pages={pages} couverture={couv} vide={vide} ouverture={ouverture} page={livre.page} tour={livre.tour} />
        </group>
      ) : null}
      <EddyPlan f={f} x={-0.62} z={1.75} hauteur={2.3} sauts={[R.seg("s1a"), R.seg("s1c") + 4]} penche={penche} />
      <fog attach="fog" args={["#0b0603", 12, 40]} />
    </>
  );

  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      {/* la salle et le livre (3D) ; floue derriere les gros plans */}
      <Sequence durationInFrames={R.sc("fin") + 4} layout="none">{pret ? <Scene3D cam={cam} fond={fond} avant={avant} flouAvant={gros * 9} /> : null}</Sequence>

      {/* gros plans sur les pages du livre (avant-plan) */}
      {pret ? <PageProche pages={pages} tours={[R.sc("guerre") - 30, R.seg("s2b") - 4, R.sc("mission"), R.sc("valeurs") + 4]} debut={R.sc("guerre") - 4} fin={R.sc("fin")} /> : null}
      {/* lueur chaude derriere Eddy (le detache du fond sombre) */}
      {f < R.sc("livre") + 10 ? <div style={{ position: "absolute", left: 40, top: 760, width: 620, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,150,70,0.22), transparent 65%)", opacity: 1 - prog(f, R.sc("livre") - 20, R.sc("livre") + 10), pointerEvents: "none" }} /> : null}
      <Bokeh force={0.85} />

      {/* textes */}
      <Texte3D texte="Hey AIESEC, what’s up !" debut={R.seg("s1a")} fin={R.seg("s1b") - 2} mode="tombe" taille={104} top={230} />
      <Texte3D texte="Moi, c’est Eddy." debut={R.seg("s1b")} fin={R.seg("s1d") + 8} mode="pivot" taille={104} top={220} />
      <Tape texte="la mascotte de la vision AIESEC 2015" debut={R.seg("s1b") + 22} fin={R.seg("s1c") - 2} top={380} />
      <Tape texte="Ça fait un bail, hein ?" debut={R.seg("s1c")} fin={R.seg("s1d") + 10} top={380} />
      <Texte3D texte="1948" debut={R.sc("livre") + 18} fin={R.sc("guerre") + 12} mode="leve" taille={300} top={300} couleur="#e2bd62" lueur="rgba(255,170,60,0.55)" />
      <Texte3D texte="Le monde se reconstruit." debut={R.seg("s2a") + s(1.1)} fin={R.sc("mission") - 4} mode="profondeur" taille={92} top={1660} />
      <Texte3D texte="la paix et le plein accomplissement du potentiel humain." debut={R.seg("s2c") + s(4.0)} fin={R.sc("idee") - 2} mode="leve" taille={84} top={1620} couleur="#f4d27a" lueur="rgba(255,170,60,0.6)" pas={0.9} />
      <Texte3D texte="Miser sur les jeunes." debut={R.seg("s3a")} fin={R.sc("valeurs") - 2} mode="pivot" taille={100} top={190} />
      <Texte3D texte="cultures" debut={R.seg("s3b") + s(2.2)} fin={R.seg("s3b") + s(4.0) - 2} mode="tombe" taille={120} top={1640} couleur={charte.orange} />
      <Texte3D texte="responsabilités" debut={R.seg("s3b") + s(4.0)} fin={R.seg("s3b") + s(5.9) - 2} mode="tombe" taille={110} top={1640} />
      <Texte3D texte="leadership" debut={R.seg("s3b") + s(5.9)} fin={R.sc("valeurs") - 2} mode="tombe" taille={130} top={1640} couleur={charte.orange} />
      <Texte3D texte="6 valeurs" debut={R.seg("s4a") + s(3.4)} fin={R.sc("fin") - 2} mode="profondeur" taille={130} top={150} />
      <Tape texte="Et ça, c’est la prochaine page." debut={R.seg("s4b")} fin={R.sc("fin") + 2} top={1740} />

      <Pixels t0={R.seg("s1a") + 2} x={360} y={900} />
      <Pixels t0={R.sc("livre") + 22} x={540} y={520} n={30} />
      <Cassette t0={R.sc("guerre") - 4} />
      <GrilleCarres t0={R.sc("fin") - 15} duree={30} />
      <CarteFin debut={R.sc("fin")} numero="ÉPISODE 2" titre="La galerie" />
      <Finitions />
    </AbsoluteFill>
  );
};
