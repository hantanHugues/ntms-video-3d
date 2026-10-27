import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Eddy } from "../Eddy";
import { charte } from "../charte";
import { police } from "../polices";
import ep2 from "./ep2.json";
import {
  Bokeh, Cam, CarteFin, EddyPlan, Etiquette, Finitions, GrilleCarres, Lumieres, Minutage, PhotoPlein, Piece, Pixels, Polaroid, Scene3D, Tape, Texte3D,
  h, imageTexture, lerp, parcours, plaque, prog, reperes, s, useImages,
} from "./communs";

/** EPISODE 2 · La galerie — les six valeurs, des leaders, le monde, puis le Benin. */
const M = ep2 as Minutage; const R = reperes(M);
export const DUREE_EP2 = s(M.total);

const VALEURS = ["Striving for Excellence", "Demonstrating Integrity", "Activating Leadership", "Living Diversity", "Enjoying Participation", "Acting Sustainably"];
const COULEURS = ["#F47B20", "#2F8FD0", "#8CC63F", "#4C6FD8", "#E6168B", "#2F8FD0"];
const XV = (i: number) => -11.5 + i * 4.6;                          // tableaux des valeurs
const PORTRAITS = [
  { src: "serie/ahtisaari.jpg", nom: "Martti Ahtisaari", titre: "Ancien président de la Finlande · Prix Nobel de la paix", x: 19 },
  { src: "serie/monti.jpg", nom: "Mario Monti", titre: "Ancien Premier ministre d’Italie", x: 24.5 },
  { src: "serie/cavaco-silva.jpg", nom: "Aníbal Cavaco Silva", titre: "Ancien président du Portugal", x: 30 },
];
const XCARTE = 38.5;
const PHOTOS = ["bandeau-01", "public-01", "atelier-01", "bandeau-04", "prise-parole-01", "groupe-01", "bandeau-07", "soiree-01", "public-02", "bandeau-09", "atelier-02", "promo-01", "bandeau-11", "prise-parole-02", "public-03", "bandeau-13", "portrait-01", "bandeau-02", "public-04", "bandeau-05", "prise-parole-03", "bandeau-08", "bandeau-12", "bandeau-14", "bandeau-03", "bandeau-06", "bandeau-10"];

/* carte : les vrais contours des pays (Natural Earth, domaine public), projection equirectangulaire */
type Pays = { iso: string; nom: string; a: [number, number][][] };
const MW = 3600, MH = 1800;
const px = (lon: number, lat: number) => [((lon + 180) / 360) * MW, ((90 - lat) / 180) * MH] as const;
const BENIN_C: [number, number] = [2.3, 9.3];
const CHEMIN: [number, number][] = [[4.4, 50.8], [6.5, 43.5], [4, 33], [2.5, 20], [1.8, 12.4], [2.4, 6.6]];
const useCarte = () => {
  const [d, setD] = useState<{ pays: { iso: string; d: string }[] } | null>(null);
  const [hd] = useState(() => delayRender("carte"));
  useEffect(() => {
    fetch(staticFile("serie/pays.json")).then((r) => r.json()).then((liste: Pays[]) => {
      setD({ pays: liste.map((p) => ({ iso: p.iso, d: p.a.map((anneau) => "M" + anneau.map(([lo, la]) => px(lo, la).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z").join("") })) });
      setTimeout(() => continueRender(hd), 200);
    }).catch(() => continueRender(hd));
  }, [hd]);
  return d;
};
const Carte: React.FC<{ debut: number; carte: { pays: { iso: string; d: string }[] } | null }> = ({ debut, carte }) => {
  const f = useCurrentFrame();
  const z = prog(f, R.seg("s3b") + s(1.0), R.seg("s3c") + s(1.6), Easing.inOut(Easing.cubic));
  const echelle = Math.exp(lerp(Math.log(0.29), Math.log(9.5), z));
  const [bx, by] = px(BENIN_C[0], BENIN_C[1]);
  const cx = lerp(MW / 2, bx, Math.min(1, z * 1.4)), cy = lerp(MH * 0.43, by, Math.min(1, z * 1.4));
  const trace = prog(f, R.seg("s3a"), R.seg("s3c"), Easing.inOut(Easing.cubic));
  const pts = CHEMIN.map(([lo, la]) => px(lo, la));
  const longueur = pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const allume = prog(f, R.seg("s3c") + s(0.6), R.seg("s3c") + s(1.8));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #0d1620 0%, #04070b 80%)", overflow: "hidden", opacity: prog(f, debut, debut + 8) }}>
      <div style={{ position: "absolute", left: 540, top: 960, width: MW, height: MH, transformOrigin: "0 0", transform: `scale(${echelle}) translate(${-cx}px, ${-cy}px)` }}>
        <svg width={MW} height={MH} style={{ overflow: "visible" }}>
          {carte?.pays.map((p) => (
            <path key={p.iso + p.d.length} d={p.d} vectorEffect="non-scaling-stroke"
              fill={p.iso === "BEN" ? `rgba(255,122,0,${0.15 + 0.75 * allume})` : "#1d140d"}
              stroke={p.iso === "BEN" ? "#FFEBD1" : "rgba(255,235,209,0.32)"} strokeWidth={p.iso === "BEN" ? 1.5 + 2 * allume : 1.1} />
          ))}
          <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#FFD27A" strokeWidth={4} vectorEffect="non-scaling-stroke"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray={longueur} strokeDashoffset={longueur * (1 - trace)} style={{ filter: "drop-shadow(0 0 6px #ffb347)" }} />
        </svg>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Episode2: React.FC = () => {
  const f = useCurrentFrame();
  const ims = useImages([...[1, 2, 3, 4, 5, 6].map((i) => staticFile(`valeurs/${i}.png`)), ...PORTRAITS.map((p) => staticFile(p.src))]);
  const pret = ims.every((i) => i);
  const tex = useMemo(() => (pret ? ims.map((im, i) => imageTexture(im, i >= 6)) : []), [pret]); // eslint-disable-line react-hooks/exhaustive-deps
  const ratio = (i: number) => (ims[i] ? (ims[i] as HTMLImageElement).width / (ims[i] as HTMLImageElement).height : 1);
  const plaques = useMemo(() => [...VALEURS.map((v) => plaque(v)), ...PORTRAITS.map((p) => plaque(p.nom))], []);
  const carte = useCarte();

  // camera : arret ~1,5 s devant chaque valeur ; puis devant chaque portrait PENDANT que la voix en parle
  const vue = (x: number, z = 7.6, y = 3.7, fov = 40): Cam => ({ p: [x, y, z], l: [x + 0.4, 3.9, -5.7], fov });
  const cles: [number, Cam][] = [[0, vue(-14)]];
  VALEURS.forEach((_, i) => { const t0 = s(1.4 + i * 2.25); cles.push([t0, vue(XV(i) - 0.4, 6.8)], [t0 + s(1.55), vue(XV(i) - 0.4, 6.8)]); });
  cles.push([R.seg("s2a") + s(0.9), vue(16.4, 8.2)]);
  const segP = ["s2b", "s2c", "s2d"];
  PORTRAITS.forEach((p, i) => { cles.push([R.seg(segP[i]) - 12, vue(p.x - 0.4, 5.6)], [R.segFin(segP[i]) + 4, vue(p.x - 0.4, 5.6)]); });
  cles.push([R.sc("carte"), vue(XCARTE - 0.4, 7.0)], [R.sc("carte") + s(1.3), { p: [XCARTE, 3.9, -4.1], l: [XCARTE, 3.9, -5.7], fov: 34 }]);
  const cam = parcours(f, cles);
  const camX = cam.p[0];
  const bouge = Math.abs(parcours(f + 1, cles).p[0] - camX) > 0.01;
  const pas = bouge ? Array.from({ length: 60 }, (_, k) => k * 16).filter((t) => t <= f && f - t < 16) : [];

  const fond = (<><Lumieres lum={1} chaud={0.8} /><Piece couche="fond" largeur={140} /><fog attach="fog" args={["#0b0603", 14, 46]} /></>);
  const avant = (
    <>
      <Lumieres lum={1} chaud={0.8} />
      <Piece couche="avant" largeur={140} />
      <pointLight position={[camX, 6.5, 1]} intensity={60} color="#ffcf9a" />
      {tex.length ? VALEURS.map((_, i) => {
        const r = ratio(i); const w = r >= 1 ? 3.3 : 3.3 * r, hh = r >= 1 ? 3.3 / r : 3.3;
        return (
          <group key={i} position={[XV(i), 4.1 + Math.sin(i * 1.7) * 0.12, -5.7]} rotation={[0, 0, (h(i + 3) - 0.5) * 0.05]}>
            <mesh position={[0, 0, -0.06]} castShadow><boxGeometry args={[3.8, 3.8, 0.16]} /><meshStandardMaterial color="#b8862e" metalness={0.6} roughness={0.35} /></mesh>
            <mesh position={[0, 0, 0.03]}><planeGeometry args={[3.5, 3.5]} /><meshStandardMaterial color="#f7f1e3" roughness={0.9} /></mesh>
            <mesh position={[0, 0, 0.05]}><planeGeometry args={[w, hh]} /><meshStandardMaterial map={tex[i] as THREE.Texture} roughness={0.9} /></mesh>
            <mesh position={[0, -2.4, 0.03]}><planeGeometry args={[3.2, 0.47]} /><meshStandardMaterial map={plaques[i]} metalness={0.4} roughness={0.4} /></mesh>
          </group>
        );
      }) : null}
      {tex.length ? PORTRAITS.map((p, i) => {
        const w = 4.0 * ratio(6 + i);
        return (
          <group key={i} position={[p.x, 4.3, -5.7]}>
            <mesh position={[0, 0, -0.08]} castShadow><boxGeometry args={[w + 0.5, 4.5, 0.22]} /><meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.3} /></mesh>
            <mesh position={[0, 0, 0.05]}><planeGeometry args={[w, 4.0]} /><meshStandardMaterial map={tex[6 + i] as THREE.Texture} roughness={0.85} /></mesh>
            <mesh position={[0, -2.7, 0.03]}><planeGeometry args={[3.2, 0.47]} /><meshStandardMaterial map={plaques[6 + i]} metalness={0.4} roughness={0.4} /></mesh>
          </group>
        );
      }) : null}
      <group position={[XCARTE, 3.9, -5.7]}>
        <mesh position={[0, 0, -0.08]} castShadow><boxGeometry args={[6.3, 3.5, 0.22]} /><meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.3} /></mesh>
        <mesh position={[0, 0, 0.05]}><planeGeometry args={[6.0, 3.0]} /><meshStandardMaterial color="#1d140d" emissive="#3a2a1a" emissiveIntensity={0.3} /></mesh>
      </group>
      <EddyPlan f={f} x={camX - 0.85} z={-2.4} hauteur={2.1} sauts={pas} />
      <fog attach="fog" args={["#0b0603", 14, 46]} />
    </>
  );

  // nom de la valeur devant laquelle on s'arrete (en anglais)
  const proche = VALEURS.map((_, i) => Math.abs(camX + 0.4 - XV(i))).reduce((a, d, i, arr) => (d < arr[a] ? i : a), 0);
  const ecart = camX + 0.4 - XV(proche);
  const visValeur = f < R.sc("portraits") ? Math.max(0, 1 - Math.abs(ecart) / 1.6) : 0;

  const debutCarte = R.sc("carte") + s(1.3);
  const photosT0 = R.sc("feuilletage");
  const photoIdx = Math.min(PHOTOS.length - 1, Math.max(0, Math.floor((f - photosT0) / 5)));
  const annee = Math.round(lerp(2015, 2026, prog(f, photosT0, R.scFin("feuilletage") - 6, Easing.linear)));
  const anneesPassent = Math.round(lerp(2007, 2014, prog(f, R.seg("s4c"), R.segFin("s4c") + 6, Easing.inOut(Easing.quad))));
  const fondBenin = f >= R.sc("benin") - 4 && f < R.sc("feuilletage") + 4;

  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      <Sequence durationInFrames={debutCarte + 4} layout="none">{pret ? <Scene3D cam={cam} fond={fond} avant={avant} /> : null}</Sequence>
      <Bokeh derive={camX * 0.6} force={0.75} />

      {/* GALERIE */}
      {visValeur > 0.01 ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: 1560, textAlign: "center", perspective: 1200, opacity: visValeur }}>
          <div style={{ transform: `rotateY(${ecart * -22}deg) translateX(${ecart * -70}px)`, fontFamily: police.titre, fontWeight: 800, fontSize: 92, letterSpacing: "-0.02em", color: COULEURS[proche], textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{VALEURS[proche]}</div>
        </div>
      ) : null}
      <Texte3D texte="Les six valeurs" debut={R.seg("s1a") + 4} fin={R.seg("s1b") + s(1.6)} mode="pivot" taille={120} top={190} />
      <Tape texte="un principe pour agir et former des leaders" debut={R.seg("s1b") + 6} fin={R.sc("portraits") - 4} top={360} />

      {/* PORTRAITS : le nom reste affiche pendant que la voix donne le titre */}
      <Texte3D texte="Des leaders." debut={R.seg("s2a") + s(0.6)} fin={R.seg("s2b") - 14} mode="profondeur" taille={140} top={220} />
      {PORTRAITS.map((p, i) => {
        const d = R.seg(segP[i]) - 8; const fin = i < 2 ? R.seg(segP[i + 1]) - 14 : R.sc("carte") - 2;
        return (
          <React.Fragment key={i}>
            <Texte3D texte={p.nom} debut={d} fin={fin} mode="pivot" taille={92} top={1500} />
            <Tape texte={p.titre} debut={d + 12} fin={fin} top={1630} taille={40} />
          </React.Fragment>
        );
      })}
      <Etiquette debut={R.seg("s2b") - 8} fin={R.sc("carte") - 2} texte="Anciens d’AIESEC" />

      {/* CARTE */}
      {f >= debutCarte && f < R.sc("benin") + 2 ? <Carte debut={debutCarte} carte={carte} /> : null}
      <Texte3D texte="100+" debut={R.seg("s3b") + s(0.3)} fin={R.seg("s3c") - 2} mode="tombe" taille={260} top={230} couleur={charte.orange} />
      <Tape texte="pays et territoires" debut={R.seg("s3b") + s(0.9)} fin={R.seg("s3c") - 2} top={540} />
      <Texte3D texte="Bénin" debut={R.seg("s3c") + s(1.3)} fin={R.sc("benin") - 2} mode="tombe" taille={170} top={300} />
      <Pixels t0={R.seg("s3c") + s(1.2)} x={540} y={960} n={30} />

      {/* LE BENIN, raconte : 2005, la premiere annee fetee en 2006, les annees qui passent, 2015 */}
      {fondBenin ? <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 45%, #2a160c 0%, #0b0603 75%)" }} /> : null}
      {fondBenin ? <Bokeh force={0.6} /> : null}
      <Texte3D texte="2005" debut={R.seg("s4a")} fin={R.seg("s4b") - 2} mode="tombe" taille={260} top={620} couleur={charte.orange} />
      <Tape texte="AIESEC naît au Bénin" debut={R.seg("s4a") + 10} fin={R.seg("s4b") - 2} top={940} />
      <Texte3D texte="2006" debut={R.seg("s4b")} fin={R.seg("s4c") - 2} mode="pivot" taille={140} top={170} couleur={charte.orange} />
      <Tape texte="La première année, fêtée au Palais des Congrès" debut={R.seg("s4b") + 12} fin={R.seg("s4c") - 2} top={350} taille={40} />
      <Polaroid src="archives/gala-2006.jpg" debut={R.seg("s4b") + s(3.0)} fin={R.seg("s4c") - 2} x={70} y={560} largeur={940} rot={-2} legende="Gala · Palais des Congrès · 2006" ancien />
      {f >= R.seg("s4c") - 2 && f < R.seg("s4d") ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: police.titre, fontWeight: 800, fontSize: 260, color: charte.creme, opacity: 0.9,
          filter: `blur(${(f - R.seg("s4c")) % 4 < 2 ? 2 : 0}px)`, textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>{anneesPassent}</div>
      ) : null}
      <Tape texte="les promotions se succèdent…" debut={R.seg("s4c") + 8} fin={R.seg("s4d") - 2} top={1060} />
      <Texte3D texte="2015" debut={R.seg("s4d")} fin={R.sc("feuilletage") - 2} mode="tombe" taille={220} top={220} couleur={charte.orange} />
      <Polaroid src="serie/eddy-2015.jpg" debut={R.seg("s4d") + 8} fin={R.sc("feuilletage") - 2} x={120} y={600} largeur={620} rot={4} legende="Vision AIESEC 2015" />
      {f >= R.seg("s4d") + 14 && f < R.sc("feuilletage") - 2 ? (
        <div style={{ position: "absolute", left: 680, top: 980, transform: `translateY(${-Math.max(0, Math.sin(((f - R.seg("s4d")) / 14) * Math.PI)) * 40}px)` }}>
          <Eddy hauteur={520} vent={(f % 75) / 75} ombre={false} contour={8} />
        </div>
      ) : null}
      <Tape texte="ma grande époque !" debut={R.seg("s4d") + s(1.2)} fin={R.sc("feuilletage") - 2} top={1600} />

      {/* FEUILLETAGE des conferences, photos entieres */}
      {f >= photosT0 && f < R.scFin("feuilletage") + 2 ? (
        <AbsoluteFill style={{ background: "#0b0603" }}>
          <PhotoPlein src={`serie/photos/${PHOTOS[photoIdx]}.jpg`} debut={photosT0 + photoIdx * 5 - 1} fin={photosT0 + photoIdx * 5 + 6} fondu={1} zoom={[1, 1.01]} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", fontFamily: police.titre, fontWeight: 800, fontSize: 120, color: charte.orange, letterSpacing: "-0.03em", textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{annee}</div>
        </AbsoluteFill>
      ) : null}

      <GrilleCarres t0={R.sc("benin") - 15} duree={30} />
      <GrilleCarres t0={R.sc("fin") - 15} duree={30} />
      <CarteFin debut={R.sc("fin")} numero="ÉPISODE 3" titre="Aujourd’hui et demain" />
      <Finitions />
    </AbsoluteFill>
  );
};
