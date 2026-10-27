import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Eddy } from "../Eddy";
import { charte } from "../charte";
import { police } from "../polices";
import ep2 from "./ep2.json";
import {
  Bokeh, Cam, CarteFin, EddyPlan, Etiquette, Finitions, GrilleCarres, Lumieres, Minutage, Piece, Pixels, Polaroid, Scene3D, Tape, Texte3D,
  h, imageTexture, lerp, parcours, plaque, prog, reperes, s, useImages,
} from "./communs";

/** EPISODE 2 · La galerie — les six valeurs, des leaders, le monde, puis le Benin. */
const M = ep2 as Minutage; const R = reperes(M);
export const DUREE_EP2 = s(M.total);

const VALEURS = ["Striving for Excellence", "Demonstrating Integrity", "Activating Leadership", "Living Diversity", "Enjoying Participation", "Acting Sustainably"];
const COULEURS = ["#F47B20", "#2F8FD0", "#8CC63F", "#4C6FD8", "#E6168B", "#2F8FD0"];
const XV = (i: number) => -11.5 + i * 4.6;                          // tableaux des valeurs
const PORTRAITS = [
  { src: "serie/ahtisaari.jpg", nom: "Martti Ahtisaari", titre: "Président de la Finlande · Prix Nobel de la paix", x: 19 },
  { src: "serie/monti.jpg", nom: "Mario Monti", titre: "Premier ministre d’Italie", x: 24.5 },
  { src: "serie/cavaco-silva.jpg", nom: "Aníbal Cavaco Silva", titre: "Président du Portugal", x: 30 },
];
const XCARTE = 38.5;
const PHOTOS = ["bandeau-01", "public-01", "atelier-01", "bandeau-04", "prise-parole-01", "groupe-01", "bandeau-07", "soiree-01", "public-02", "bandeau-09", "atelier-02", "promo-01", "bandeau-11", "prise-parole-02", "public-03", "bandeau-13", "portrait-01", "bandeau-02", "public-04", "bandeau-05", "prise-parole-03", "bandeau-08", "bandeau-12", "bandeau-14", "bandeau-03", "bandeau-06", "bandeau-10"];

/* carte du monde (projection equirectangulaire) */
const VILLES: [number, number][] = [[48.9, 2.4], [51.5, -0.1], [40.4, -3.7], [41.9, 12.5], [52.5, 13.4], [59.3, 18.1], [60.2, 24.9], [52.2, 21.0], [38.7, -9.1], [38.0, 23.7], [41.0, 29.0], [30.0, 31.2], [6.5, 3.4], [5.6, -0.2], [14.7, -17.4], [5.3, -4.0], [-1.3, 36.8], [-26.2, 28.0], [-4.3, 15.3], [33.6, -7.6], [36.8, 10.2], [9.0, 38.7], [55.8, 37.6], [28.6, 77.2], [19.1, 72.9], [39.9, 116.4], [35.7, 139.7], [37.6, 127.0], [-6.2, 106.8], [14.6, 121.0], [1.35, 103.8], [13.8, 100.5], [-33.9, 151.2], [40.7, -74.0], [19.4, -99.1], [4.7, -74.1], [-12.0, -77.0], [-23.5, -46.6], [-34.6, -58.4], [43.7, -79.4], [25.2, 55.3], [24.9, 67.0], [23.8, 90.4], [0.35, 32.6], [3.9, 11.5]];
const BENIN: [number, number] = [6.37, 2.43];
const CHEMIN: [number, number][] = [[50.8, 4.4], [43.5, 6.5], [33, 4], [20, 2.5], [12.4, 1.8], BENIN];
const MW = 3836, MH = 1918;
const pt = ([lat, lon]: [number, number]) => [((lon + 180) / 360) * MW, ((90 - lat) / 180) * MH] as const;

const Carte: React.FC<{ debut: number }> = ({ debut }) => {
  const f = useCurrentFrame(); const d = f - debut;
  // vue : monde entier -> zoom sur le Benin
  const z = prog(f, R.seg("s3b") + s(1.6), R.seg("s3c") + s(1.0), Easing.inOut(Easing.cubic));
  const echelle = lerp(0.3, 2.1, z);
  const [bx, by] = pt(BENIN); const cx = lerp(MW / 2, bx, z), cy = lerp(MH * 0.42, by, z);
  const trace = prog(f, R.seg("s3a"), R.seg("s3c") + s(0.6), Easing.inOut(Easing.cubic));
  const longueur = CHEMIN.slice(1).reduce((a, p, i) => { const [x1, y1] = pt(CHEMIN[i]); const [x2, y2] = pt(p); return a + Math.hypot(x2 - x1, y2 - y1); }, 0);
  const pulse = prog(f, R.seg("s3c"), R.seg("s3c") + 16);
  return (
    <AbsoluteFill style={{ background: "#05080c", overflow: "hidden", opacity: prog(f, debut, debut + 8) }}>
      <div style={{ position: "absolute", left: 540, top: 960, width: MW, height: MH, transformOrigin: "0 0", transform: `scale(${echelle}) translate(${-cx}px, ${-cy}px)` }}>
        <Img src={staticFile("serie/carte-monde.jpg")} style={{ width: MW, height: MH, filter: "brightness(0.5) saturate(0.55) sepia(0.35)" }} />
        <svg width={MW} height={MH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {VILLES.map((v, i) => { const [x, y] = pt(v); const a = prog(f, debut + 6 + i * 2.2, debut + 16 + i * 2.2); return a > 0 ? <circle key={i} cx={x} cy={y} r={(5 + 9 * a) / Math.max(0.6, echelle)} fill="#FF7A00" opacity={0.85 * a} /> : null; })}
          <polyline points={CHEMIN.map((p) => pt(p).join(",")).join(" ")} fill="none" stroke="#FFD27A" strokeWidth={6 / echelle} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={longueur} strokeDashoffset={longueur * (1 - trace)} style={{ filter: "drop-shadow(0 0 6px #ffb347)" }} />
          {pulse > 0 ? <>
            <circle cx={bx} cy={by} r={(14 + 40 * ((d % 30) / 30)) / echelle * 2} fill="none" stroke="#FFEBD1" strokeWidth={3 / echelle} opacity={1 - (d % 30) / 30} />
            <circle cx={bx} cy={by} r={12 / echelle * 2} fill="#FFEBD1" />
          </> : null}
        </svg>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Episode2: React.FC = () => {
  const f = useCurrentFrame();
  const ims = useImages([...[1, 2, 3, 4, 5, 6].map((i) => staticFile(`valeurs/${i}.png`)), ...PORTRAITS.map((p) => staticFile(p.src)), staticFile("serie/carte-monde.jpg")]);
  const pret = ims.every((i) => i);
  const tex = useMemo(() => (pret ? ims.map((im, i) => imageTexture(im, i >= 6 && i < 9)) : []), [pret]); // eslint-disable-line react-hooks/exhaustive-deps
  const plaques = useMemo(() => [...VALEURS.map((v) => plaque(v)), ...PORTRAITS.map((p) => plaque(p.nom))], []);

  // camera : on longe la galerie, on s'arrete devant chaque portrait, on fonce dans la carte
  const vue = (x: number, z = 7.6, y = 3.7, fov = 40): Cam => ({ p: [x, y, z], l: [x + 0.4, 3.9, -5.7], fov });
  const cam = parcours(f, [
    [0, vue(-13.5)], [R.sc("portraits") - 6, vue(13)],
    [R.seg("s2a") + s(1.0), vue(16.5, 8.2)], [R.seg("s2b"), vue(PORTRAITS[0].x - 0.4, 5.6)], [R.seg("s2c"), vue(PORTRAITS[1].x - 0.4, 5.6)], [R.seg("s2d"), vue(PORTRAITS[2].x - 0.4, 5.6)],
    [R.sc("carte"), vue(XCARTE - 0.4, 7.0)], [R.sc("carte") + s(1.3), { p: [XCARTE, 3.9, -4.1], l: [XCARTE, 3.9, -5.7], fov: 34 }],
  ]);
  const camX = cam.p[0];
  const marche = (a: number, b: number) => f >= a && f < b;
  const enMarche = marche(0, R.sc("portraits")) || marche(R.seg("s2a"), R.seg("s2b")) || marche(R.seg("s2b") + 10, R.seg("s2d") + 10);
  const pas = enMarche ? Array.from({ length: 40 }, (_, k) => k * 18).filter((t) => t <= f && f - t < 16) : [];

  const fond = (<><Lumieres lum={1} chaud={0.8} /><Piece couche="fond" largeur={140} /><fog attach="fog" args={["#0b0603", 14, 46]} /></>);
  const avant = (
    <>
      <Lumieres lum={1} chaud={0.8} />
      <Piece couche="avant" largeur={140} />
      <pointLight position={[camX, 6.5, 1]} intensity={60} color="#ffcf9a" />
      {/* les six valeurs */}
      {tex.length ? VALEURS.map((_, i) => (
        <group key={i} position={[XV(i), 4.1 + Math.sin(i * 1.7) * 0.12, -5.7]} rotation={[0, 0, (h(i + 3) - 0.5) * 0.06]}>
          <mesh position={[0, 0, -0.06]} castShadow><boxGeometry args={[3.7, 3.7, 0.16]} /><meshStandardMaterial color="#b8862e" metalness={0.6} roughness={0.35} /></mesh>
          <mesh position={[0, 0, 0.04]}><planeGeometry args={[3.3, 3.3]} /><meshStandardMaterial map={tex[i] as THREE.Texture} roughness={0.9} /></mesh>
          <mesh position={[0, -2.35, 0.03]}><planeGeometry args={[3.2, 0.47]} /><meshStandardMaterial map={plaques[i]} metalness={0.4} roughness={0.4} /></mesh>
        </group>
      )) : null}
      {/* les portraits, cadres dores */}
      {tex.length ? PORTRAITS.map((p, i) => (
        <group key={i} position={[p.x, 4.3, -5.7]}>
          <mesh position={[0, 0, -0.08]} castShadow><boxGeometry args={[3.5, 4.5, 0.22]} /><meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.3} /></mesh>
          <mesh position={[0, 0, 0.05]}><planeGeometry args={[3.0, 4.0]} /><meshStandardMaterial map={tex[6 + i] as THREE.Texture} roughness={0.85} /></mesh>
          <mesh position={[0, -2.7, 0.03]}><planeGeometry args={[3.2, 0.47]} /><meshStandardMaterial map={plaques[6 + i]} metalness={0.4} roughness={0.4} /></mesh>
        </group>
      )) : null}
      {/* la carte du monde, en tableau */}
      {tex.length ? (
        <group position={[XCARTE, 3.9, -5.7]}>
          <mesh position={[0, 0, -0.08]} castShadow><boxGeometry args={[6.3, 3.5, 0.22]} /><meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.3} /></mesh>
          <mesh position={[0, 0, 0.05]}><planeGeometry args={[6.0, 3.0]} /><meshStandardMaterial map={tex[9] as THREE.Texture} roughness={0.9} /></mesh>
        </group>
      ) : null}
      <EddyPlan f={f} x={camX - 0.85} z={-2.4} hauteur={2.1} sauts={pas} />
      <fog attach="fog" args={["#0b0603", 14, 46]} />
    </>
  );

  // nom de la valeur la plus proche (titre en parallaxe)
  const proche = VALEURS.map((_, i) => Math.abs(camX + 0.4 - XV(i))).reduce((a, d, i, arr) => (d < arr[a] ? i : a), 0);
  const ecart = camX + 0.4 - XV(proche);
  const visValeur = f < R.sc("portraits") ? Math.max(0, 1 - Math.abs(ecart) / 1.9) * prog(f, s(1.2), s(1.8)) : 0;

  const debutCarte = R.sc("carte") + s(1.3);
  const photosT0 = R.sc("feuilletage");
  const photoIdx = Math.min(PHOTOS.length - 1, Math.floor((f - photosT0) / 5));
  const annee = Math.round(lerp(2015, 2026, prog(f, photosT0, R.scFin("feuilletage") - 6, Easing.linear)));

  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      <Sequence durationInFrames={debutCarte + 4} layout="none">{pret ? <Scene3D cam={cam} fond={fond} avant={avant} /> : null}</Sequence>
      <Bokeh derive={camX * 0.6} force={0.75} />

      {/* GALERIE : le nom de chaque valeur, en anglais, au passage devant son tableau */}
      {visValeur > 0.01 ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: 1560, textAlign: "center", perspective: 1200, opacity: visValeur }}>
          <div style={{ transform: `rotateY(${ecart * -22}deg) translateX(${ecart * -70}px)`, fontFamily: police.titre, fontWeight: 800, fontSize: 92, letterSpacing: "-0.02em", color: COULEURS[proche], textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{VALEURS[proche]}</div>
        </div>
      ) : null}
      <Texte3D texte="Les six valeurs" debut={R.seg("s1a") + 4} fin={R.seg("s1b") + s(1.6)} mode="pivot" taille={120} top={190} />
      <Tape texte="un principe pour agir et former des leaders" debut={R.seg("s1b") + 6} fin={R.sc("portraits") - 4} top={360} />

      {/* PORTRAITS */}
      <Texte3D texte="Des leaders." debut={R.seg("s2a") + s(0.6)} fin={R.seg("s2b") - 2} mode="profondeur" taille={140} top={220} />
      {PORTRAITS.map((p, i) => {
        const d = R.seg(["s2b", "s2c", "s2d"][i]); const fin = i < 2 ? R.seg(["s2c", "s2d"][i]) - 2 : R.sc("carte") - 2;
        return (
          <React.Fragment key={i}>
            <Texte3D texte={p.nom} debut={d} fin={fin} mode="pivot" taille={96} top={1500} />
            <Tape texte={p.titre} debut={d + 14} fin={fin} top={1640} taille={40} />
          </React.Fragment>
        );
      })}

      {/* CARTE : le monde, puis le Benin */}
      {f >= debutCarte && f < R.sc("benin") + 2 ? <Carte debut={debutCarte} /> : null}
      <Texte3D texte="100+" debut={R.seg("s3b") + s(0.3)} fin={R.seg("s3c") - 2} mode="tombe" taille={260} top={230} couleur={charte.orange} />
      <Tape texte="pays et territoires" debut={R.seg("s3b") + s(0.9)} fin={R.seg("s3c") - 2} top={540} />
      <Texte3D texte="Bénin" debut={R.seg("s3c") + s(1.2)} fin={R.sc("benin") - 2} mode="tombe" taille={170} top={300} />
      <Pixels t0={R.seg("s3c") + s(1.0)} x={540} y={960} n={30} />

      {/* LE BENIN : 2005, 2006 (la photo du gala, le coeur de l'episode), 2015 */}
      {f >= R.sc("benin") - 4 && f < R.sc("feuilletage") + 4 ? <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 45%, #2a160c 0%, #0b0603 75%)" }} /> : null}
      {f >= R.sc("benin") - 4 && f < R.sc("feuilletage") + 4 ? <Bokeh force={0.6} /> : null}
      <Texte3D texte="2005" debut={R.seg("s4a")} fin={R.seg("s4b") - 2} mode="tombe" taille={260} top={560} couleur={charte.orange} />
      <Tape texte="Premier comité au Bénin" debut={R.seg("s4a") + 10} fin={R.seg("s4b") - 2} top={880} />
      <Texte3D texte="2006" debut={R.seg("s4b")} fin={R.seg("s4c") - 2} mode="pivot" taille={150} top={190} couleur={charte.orange} />
      <Polaroid src="archives/gala-2006.jpg" debut={R.seg("s4b") + 6} fin={R.seg("s4c") - 2} x={70} y={480} largeur={940} rot={-2} legende="Gala · Palais des Congrès · 2006" ancien />
      <Tape texte="Notre plus ancienne photo" debut={R.seg("s4b") + 30} fin={R.seg("s4c") - 2} top={1500} />
      <Texte3D texte="2015" debut={R.seg("s4c")} fin={R.sc("feuilletage") - 2} mode="tombe" taille={220} top={220} couleur={charte.orange} />
      <Polaroid src="serie/eddy-2015.jpg" debut={R.seg("s4c") + 8} fin={R.sc("feuilletage") - 2} x={120} y={600} largeur={620} rot={4} legende="Vision AIESEC 2015" />
      {f >= R.seg("s4c") + 14 && f < R.sc("feuilletage") - 2 ? (
        <div style={{ position: "absolute", left: 680, top: 980, transform: `translateY(${-Math.max(0, Math.sin(((f - R.seg("s4c")) / 14) * Math.PI)) * 40}px)` }}>
          <Eddy hauteur={520} vent={(f % 75) / 75} ombre={false} contour={8} />
        </div>
      ) : null}
      <Tape texte="ma grande époque !" debut={R.seg("s4c") + s(1.2)} fin={R.sc("feuilletage") - 2} top={1600} />

      {/* FEUILLETAGE des conferences, jusqu'a aujourd'hui */}
      {f >= photosT0 && f < R.scFin("feuilletage") + 2 ? (
        <AbsoluteFill style={{ background: "#0b0603", perspective: 1800 }}>
          <div style={{ position: "absolute", inset: 60, top: 220, bottom: 260, transform: `rotateY(${((f - photosT0) % 5) * -3}deg)`, boxShadow: "0 40px 80px rgba(0,0,0,0.7)", overflow: "hidden", borderRadius: 6 }}>
            <Img src={staticFile(`serie/photos/${PHOTOS[Math.max(0, photoIdx)]}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: police.titre, fontWeight: 800, fontSize: 120, color: charte.orange, letterSpacing: "-0.03em", textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{annee}</div>
        </AbsoluteFill>
      ) : null}

      <Etiquette debut={R.sc("portraits")} fin={R.sc("carte") - 2} texte="Anciens d’AIESEC" />
      <GrilleCarres t0={R.sc("benin") - 15} duree={30} />
      <GrilleCarres t0={R.sc("fin") - 15} duree={30} />
      <CarteFin debut={R.sc("fin")} numero="ÉPISODE 3" titre="Aujourd’hui et demain" />
      <Finitions />
    </AbsoluteFill>
  );
};
