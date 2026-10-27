import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import chemins from "../eddyChemins.json";
import { charte } from "../charte";
import { police } from "../polices";

/**
 * Briques communes de la serie « Voyage avec Eddy » (3 episodes).
 * Regles : une idee par plan, fond sombre et flou, texte anime mais pas partout,
 * Eddy = figurine PLATE posee dans un decor 3D. Tout est deterministe (aucun hasard).
 */
export const FPS = 30;
export const s = (x: number) => Math.round(x * FPS);
export const doux = Easing.bezier(0.16, 1, 0.3, 1);
export const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (f: number, a: number, b: number, e: (t: number) => number = doux) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export type Minutage = { total: number; seg: Record<string, { debut: number; fin: number }>; scenes: Record<string, { debut: number; fin: number }> };
/** Raccourcis de minutage (en images) a partir du fichier epN.json. */
export const reperes = (m: Minutage) => ({
  seg: (id: string) => s(m.seg[id].debut),
  segFin: (id: string) => s(m.seg[id].fin),
  sc: (id: string) => s(m.scenes[id].debut),
  scFin: (id: string) => s(m.scenes[id].fin),
});

/* ───────── chargement d'images (hors de la 3D : fiable pour le rendu) ───────── */
export const useImages = (urls: string[]) => {
  const [imgs, setImgs] = useState<(HTMLImageElement | null)[]>(urls.map(() => null));
  const [hd] = useState(() => delayRender("images " + urls.length));
  useEffect(() => {
    let reste = urls.length;
    const res: (HTMLImageElement | null)[] = urls.map(() => null);
    const fini = () => { reste -= 1; if (reste === 0) { setImgs(res); setTimeout(() => continueRender(hd), 250); } };
    if (reste === 0) { continueRender(hd); return; }
    urls.forEach((u, i) => {
      const im = new Image();
      im.onload = () => { res[i] = im; fini(); };
      im.onerror = () => { console.log("image introuvable", u); fini(); };
      im.src = u;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hd]);
  return imgs;
};
export const texture = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

/** Dessine une image en « cover » dans un rectangle. */
const couvrir = (x: CanvasRenderingContext2D, im: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
  const r = Math.max(dw / im.width, dh / im.height); const w = im.width * r, hh = im.height * r;
  x.save(); x.beginPath(); x.rect(dx, dy, dw, dh); x.clip(); x.drawImage(im, dx + (dw - w) / 2, dy + (dh - hh) / 2, w, hh); x.restore();
};
const papier = (x: CanvasRenderingContext2D, w: number, hh: number) => {
  const g = x.createLinearGradient(0, 0, w, hh); g.addColorStop(0, "#f3e7cb"); g.addColorStop(1, "#dcc9a1");
  x.fillStyle = g; x.fillRect(0, 0, w, hh);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(90,60,30,${0.02 + h(i) * 0.04})`; x.fillRect(h(i + 1) * w, h(i + 2) * hh, 1 + h(i + 3) * 2, 1 + h(i + 4) * 2); }
  const v = x.createRadialGradient(w / 2, hh / 2, w * 0.3, w / 2, hh / 2, w * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(80,50,20,0.28)");
  x.fillStyle = v; x.fillRect(0, 0, w, hh);
};

/** Page de livre : papier vieilli + photo + petite mention « Images d'illustration ». */
export const pageImage = (im: HTMLImageElement | null, legende?: string, illustration = true) => {
  const W = 800, H = 1100; const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!; papier(x, W, H);
  if (im) {
    const maxW = W - 140, maxH = 780; const r = Math.min(maxW / im.width, maxH / im.height);
    const w = Math.round(im.width * r), hh = Math.round(im.height * r); const px = (W - w) / 2, py = 90 + (maxH - hh) / 2;
    x.save(); x.shadowColor = "rgba(40,20,5,0.45)"; x.shadowBlur = 18; x.fillStyle = "#fff"; x.fillRect(px - 14, py - 14, w + 28, hh + 28); x.restore();
    x.filter = "sepia(0.45) contrast(1.08) brightness(0.98)"; x.drawImage(im, px, py, w, hh); x.filter = "none";
    if (illustration) {
      x.font = `800 22px "${police.texte}"`; const txt = "IMAGES D'ILLUSTRATION"; const tw = x.measureText(txt).width;
      x.fillStyle = "rgba(10,6,4,0.7)"; x.beginPath(); x.roundRect(px + 12, py + hh - 46, tw + 40, 34, 17); x.fill();
      x.fillStyle = "#FF7A00"; x.beginPath(); x.arc(px + 30, py + hh - 29, 6, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#FFEBD1"; x.textAlign = "left"; x.fillText(txt, px + 44, py + hh - 21);
    }
  }
  x.fillStyle = "#3A1B0C"; x.textAlign = "center";
  if (legende) { x.font = `italic 700 40px "${police.texte}"`; x.fillText(legende, W / 2, 970); }
  return texture(cv);
};
/** Page de titre (ex. « 1948 »). */
export const pageTitre = (titre: string, sous: string) => {
  const W = 800, H = 1100; const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!; papier(x, W, H);
  x.fillStyle = "#79280E"; x.textAlign = "center"; x.font = `800 112px "${police.titre}"`; x.fillText(titre, W / 2, 560);
  x.fillStyle = "#3A1B0C"; x.font = `700 46px "${police.texte}"`; x.fillText(sous, W / 2, 660);
  x.strokeStyle = "rgba(121,40,14,0.6)"; x.lineWidth = 3; x.beginPath(); x.moveTo(220, 720); x.lineTo(580, 720); x.stroke();
  return texture(cv);
};
/** Page des six valeurs « cachees » : silhouettes noires des six personnages. */
export const pageSilhouettes = (ims: (HTMLImageElement | null)[]) => {
  const W = 800, H = 1100; const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!; papier(x, W, H);
  ims.forEach((im, i) => {
    if (!im) return; const cx = 90 + (i % 2) * 330, cy = 120 + Math.floor(i / 2) * 300;
    const r = Math.min(290 / im.width, 250 / im.height); const w = Math.round(im.width * r), hh = Math.round(im.height * r);
    const tmp = document.createElement("canvas"); tmp.width = w; tmp.height = hh; const tx = tmp.getContext("2d")!; tx.drawImage(im, 0, 0, w, hh);
    const d = tx.getImageData(0, 0, w, hh);
    for (let k = 0; k < d.data.length; k += 4) { const lum = (d.data[k] + d.data[k + 1] + d.data[k + 2]) / 3; const sat = Math.max(d.data[k], d.data[k + 1], d.data[k + 2]) - Math.min(d.data[k], d.data[k + 1], d.data[k + 2]);
      const encre = lum < 200 || sat > 45; d.data[k] = 30; d.data[k + 1] = 16; d.data[k + 2] = 8; d.data[k + 3] = encre ? 225 : 0; }
    tx.putImageData(d, 0, 0); x.drawImage(tmp, cx + (290 - w) / 2, cy);
    x.fillStyle = "#79280E"; x.font = `800 44px "${police.titre}"`; x.textAlign = "center"; x.fillText("?", cx + 145, cy + 285);
  });
  return texture(cv);
};
/** Page blanche vieillie. */
export const pageVide = () => { const cv = document.createElement("canvas"); cv.width = 400; cv.height = 550; papier(cv.getContext("2d")!, 400, 550); return texture(cv); };
/** Couverture du livre : cuir sombre + titre dore. */
export const couvertureLivre = () => {
  const W = 800, H = 1100; const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#5a2412"); g.addColorStop(1, "#2a0f07"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(0,0,0,${h(i) * 0.12})`; x.fillRect(h(i + 1) * W, h(i + 2) * H, 2, 2); }
  x.strokeStyle = "#c9a24a"; x.lineWidth = 6; x.strokeRect(60, 60, W - 120, H - 120); x.lineWidth = 2; x.strokeRect(80, 80, W - 160, H - 160);
  x.fillStyle = "#d8b45c"; x.textAlign = "center"; x.font = `800 92px "${police.titre}"`; x.fillText("ARCHIVES", W / 2, 520);
  x.font = `700 44px "${police.texte}"`; x.fillText("AIESEC", W / 2, 600);
  return texture(cv);
};
/** Plaque doree avec un texte (sous les tableaux). */
export const plaque = (texte: string, sous = "") => {
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = sous ? 220 : 150; const x = cv.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, cv.height); g.addColorStop(0, "#e9c873"); g.addColorStop(0.5, "#b8862e"); g.addColorStop(1, "#7a561a");
  x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height);
  x.fillStyle = "#2a1606"; x.textAlign = "center"; x.font = `800 64px "${police.titre}"`; x.fillText(texte.toUpperCase(), 512, sous ? 92 : 98);
  if (sous) { x.font = `700 40px "${police.texte}"`; x.fillText(sous, 512, 170); }
  return texture(cv);
};
/** Image en texture, avec un leger ton ancien optionnel. */
export const imageTexture = (im: HTMLImageElement | null, ancien = false) => {
  if (!im) return null; const cv = document.createElement("canvas"); cv.width = im.width; cv.height = im.height; const x = cv.getContext("2d")!;
  if (ancien) x.filter = "sepia(0.35) contrast(1.06)"; x.drawImage(im, 0, 0); return texture(cv);
};

/* ───────── Eddy, figurine plate (calque d'origine), avec un liseré clair ───────── */
const c = chemins as unknown as {
  couleurs: Record<"noir" | "vert" | "jaune" | "rouge", [number, number, number]>;
  noir: { d: string; boite: number[] }[]; chemise: { d: string }[]; vert: { d: string }[]; rouge: { d: string }[];
};
export const useEddyTexture = () => useMemo(() => {
  const S = 3, B = { x: 280, y: 80, l: 380, h: 566 };
  const cv = document.createElement("canvas"); cv.width = B.l * S; cv.height = B.h * S;
  const x = cv.getContext("2d")!; x.scale(S, S); x.translate(-B.x, -B.y);
  const rgb = (k: keyof typeof c.couleurs) => `rgb(${c.couleurs[k].join(",")})`;
  const pieces = [...c.noir].sort((a, b) => b.boite[3] * b.boite[2] - a.boite[3] * a.boite[2]);
  x.lineJoin = "round"; x.strokeStyle = "rgba(255,238,214,0.95)"; x.lineWidth = 9;
  [...pieces.slice(1), c.chemise[0], pieces[0]].forEach((p) => x.stroke(new Path2D(p.d)));
  x.fillStyle = rgb("noir"); pieces.slice(1).forEach((p) => x.fill(new Path2D(p.d)));
  x.fillStyle = rgb("jaune"); x.fill(new Path2D(c.chemise[0].d));
  x.fillStyle = rgb("vert"); x.fill(new Path2D(c.vert[0].d));
  x.fillStyle = rgb("rouge"); x.fill(new Path2D(c.rouge[0].d));
  x.fillStyle = rgb("noir"); x.fill(new Path2D(pieces[0].d));
  return { tex: texture(cv), ratio: B.l / B.h };
}, []);

/** Eddy debout dans la 3D (pieds a y). Petits sauts, respiration, balancement. Pas de marche « realiste ». */
export const EddyPlan: React.FC<{ f: number; x: number; y?: number; z: number; hauteur?: number; sauts?: number[]; miroir?: boolean; penche?: number; tourne?: number }> = ({ f, x, y = 0, z, hauteur = 2.6, sauts = [], miroir, penche = 0, tourne = 0 }) => {
  const { tex, ratio } = useEddyTexture();
  const profondeur = useMemo(() => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }), [tex]);
  let saut = 0, ecrase = 0;
  for (const t of sauts) {
    const d = f - t;
    if (d >= 0 && d < 16) saut += Math.sin((d / 16) * Math.PI) * 0.32;
    if (d >= 14 && d < 22) ecrase += Math.sin(((d - 14) / 8) * Math.PI) * 0.07;
  }
  const respire = Math.sin(f / 16) * 0.012;
  const w = hauteur * ratio;
  return (
    <group position={[x, y + saut, z]} rotation={[0, tourne, Math.sin(f / 37) * 0.022 + penche]}>
      <mesh position={[0, hauteur / 2, 0]} scale={[(miroir ? -1 : 1) * (1 + ecrase), 1 - ecrase + respire, 1]} castShadow customDepthMaterial={profondeur}>
        <planeGeometry args={[w, hauteur]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.5} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/* ───────── decor : lambris sombre, tapis, bois ───────── */
export const useLambris = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512; const x = cv.getContext("2d")!;
  x.fillStyle = "#1c0f08"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) {
    const v = 22 + Math.floor(h(i) * 14);
    x.fillStyle = `rgb(${v + 14},${v - 2},${Math.max(0, v - 12)})`; x.fillRect(i * 64 + 3, 0, 58, 512);
    x.fillStyle = "rgba(0,0,0,0.55)"; x.fillRect(i * 64, 0, 3, 512);
    for (let k = 0; k < 18; k++) { x.fillStyle = `rgba(0,0,0,${0.05 + h(i * 30 + k) * 0.08})`; x.fillRect(i * 64 + 6 + h(k + i) * 50, 0, 1 + h(k * 3 + i) * 2, 512); }
  }
  const t = texture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 2); return t;
}, []);
export const useTapis = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512; const x = cv.getContext("2d")!; const px = 16;
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) {
    const d = Math.hypot(i - 15.5, j - 15.5); if (d > 15.8) continue;
    const anneau = Math.floor(d / 2.6) % 2; const v = h(i * 33 + j) * 0.15;
    x.fillStyle = anneau ? `rgb(${150 + v * 255},10,18)` : `rgb(${200 + v * 200},20,26)`; x.fillRect(i * px, j * px, px, px);
  }
  const t = texture(cv); t.magFilter = THREE.NearestFilter; return t;
}, []);
export const useBois = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; const x = cv.getContext("2d")!;
  x.fillStyle = "#3b1e0e"; x.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 140; i++) { x.strokeStyle = `rgba(${20 + h(i) * 40},${8 + h(i + 1) * 15},0,${0.25 + h(i + 2) * 0.35})`; x.lineWidth = 1 + h(i + 3) * 3; x.beginPath(); const y = h(i + 4) * 256; x.moveTo(0, y); x.bezierCurveTo(300, y + (h(i + 5) - 0.5) * 30, 700, y + (h(i + 6) - 0.5) * 30, 1024, y + (h(i + 7) - 0.5) * 20); x.stroke(); }
  return texture(cv);
}, []);

export type Couche = "fond" | "avant";
/** La piece (lambris, fenetres floues, petite lampe) et son sol + tapis. */
export const Piece: React.FC<{ couche: Couche; largeur?: number }> = ({ couche, largeur = 60 }) => {
  const lambris = useLambris(); const tapis = useTapis();
  if (couche === "fond") return (
    <group>
      <mesh position={[0, 7, -6]}><planeGeometry args={[largeur, 14]} /><meshStandardMaterial map={lambris} roughness={0.85} /></mesh>
      <mesh position={[-3.6, 6.0, -5.9]}><planeGeometry args={[2.6, 2.0]} /><meshBasicMaterial color="#dfeaff" /></mesh>
      <mesh position={[5.2, 5.4, -5.9]}><planeGeometry args={[1.8, 2.8]} /><meshBasicMaterial color="#cfe0ff" /></mesh>
      <mesh position={[2.4, 3.4, -5.5]}><sphereGeometry args={[0.3, 16, 16]} /><meshBasicMaterial color="#ffb45a" /></mesh>
      <mesh position={[-6.5, 3.2, -5.5]}><boxGeometry args={[3.5, 4.5, 0.6]} /><meshStandardMaterial color="#140a05" /></mesh>
    </group>
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[largeur, 40]} /><meshStandardMaterial color="#120905" roughness={0.9} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.6]} receiveShadow><circleGeometry args={[4.6, 64]} /><meshStandardMaterial map={tapis} roughness={0.95} emissive="#ff1020" emissiveIntensity={0.15} /></mesh>
    </group>
  );
};

/** Le bureau d'Eddy (dessus en bois, panneau avant qui cache ses jambes, pieds). */
export const Bureau: React.FC = () => {
  const bois = useBois();
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[4.8, 0.14, 2.2]} /><meshStandardMaterial map={bois} roughness={0.55} /></mesh>
      <mesh position={[0, 0.82, 1.0]} castShadow receiveShadow><boxGeometry args={[4.6, 1.22, 0.08]} /><meshStandardMaterial map={bois} color="#9a7a66" roughness={0.6} /></mesh>
      {[[-2.25, -0.95], [2.25, -0.95]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.72, pz]} castShadow><boxGeometry args={[0.12, 1.44, 0.12]} /><meshStandardMaterial color="#1e0f07" /></mesh>
      ))}
    </group>
  );
};

/** Le livre : couverture qui s'ouvre, une feuille qui tourne. `page` = feuille de droite, `tour` 0→1 = elle passe a gauche. */
export const Livre3D: React.FC<{ pages: THREE.Texture[]; couverture: THREE.Texture; vide: THREE.Texture; ouverture: number; page: number; tour: number }> = ({ pages, couverture, vide, ouverture, page, tour }) => {
  const W = 0.82, D = 1.13, E = 0.08;
  const sous = pages[Math.min(pages.length - 1, page + (tour > 0 ? 1 : 0))];
  const dessus = pages[Math.min(pages.length - 1, page)];
  return (
    <group>
      <mesh position={[W / 2, E / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, E, D]} /><meshStandardMaterial color="#e2d3ad" roughness={0.9} /></mesh>
      <mesh position={[-W / 2, (E * Math.max(0.02, ouverture)) / 2, 0]} scale={[1, Math.max(0.02, ouverture), 1]} castShadow receiveShadow><boxGeometry args={[W, E, D]} /><meshStandardMaterial color="#e2d3ad" roughness={0.9} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, E + 0.002, 0]}><planeGeometry args={[W * 0.98, D * 0.98]} /><meshStandardMaterial map={sous} roughness={0.9} /></mesh>
      {ouverture > 0.5 ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-W / 2, E * ouverture + 0.002, 0]}><planeGeometry args={[W * 0.98, D * 0.98]} /><meshStandardMaterial map={vide} roughness={0.9} /></mesh> : null}
      {/* pivot a la reliure, au niveau du haut des pages */}
      <group position={[0, E, 0]}>
        {tour > 0 && tour < 1 ? (
          <group rotation={[0, 0, tour * Math.PI]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0.006, 0]}><planeGeometry args={[W * 0.98, D * 0.98]} /><meshStandardMaterial map={dessus} roughness={0.9} /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, 0.004, 0]}><planeGeometry args={[W * 0.98, D * 0.98]} /><meshStandardMaterial map={vide} roughness={0.9} /></mesh>
          </group>
        ) : null}
        <group rotation={[0, 0, ouverture * Math.PI]}>
          <mesh position={[W / 2 + 0.01, 0.016, 0]} castShadow><boxGeometry args={[W + 0.04, 0.03, D + 0.05]} /><meshStandardMaterial color="#3a160a" roughness={0.6} /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 + 0.01, 0.032, 0]}><planeGeometry args={[W, D]} /><meshStandardMaterial map={couverture} roughness={0.55} /></mesh>
        </group>
      </group>
    </group>
  );
};

/** Lumiere d'ambiance de la salle (s'allume avec `lum`). */
export const Lumieres: React.FC<{ lum?: number; chaud?: number }> = ({ lum = 1, chaud = 1 }) => (
  <>
    <ambientLight intensity={0.1 + 0.16 * lum} color="#ffcf9a" />
    <hemisphereLight args={["#ffd9a8", "#0a0503", 0.1 + 0.12 * lum]} />
    <spotLight position={[-3.5, 9, 6]} angle={0.42} penumbra={0.85} intensity={260 * lum} color="#ffd2a0" castShadow shadow-mapSize={[1024, 1024]} target-position={[0, 1.5, 0]} />
    <directionalLight position={[4, 6, -7]} intensity={2.4 * lum * chaud} color="#ff9a5a" />
    <directionalLight position={[-6, 4, -6]} intensity={1.6 * lum} color="#9cc4ff" />
    <pointLight position={[1.5, 2.6, 1.2]} intensity={6 * lum * chaud} color="#ffb060" />
  </>
);

/** Camera : position + cible + ouverture, ecrites a chaque image. */
export type Cam = { p: [number, number, number]; l: [number, number, number]; fov: number };
export const melange = (a: Cam, b: Cam, t: number): Cam => ({
  p: [lerp(a.p[0], b.p[0], t), lerp(a.p[1], b.p[1], t), lerp(a.p[2], b.p[2], t)],
  l: [lerp(a.l[0], b.l[0], t), lerp(a.l[1], b.l[1], t), lerp(a.l[2], b.l[2], t)],
  fov: lerp(a.fov, b.fov, t),
});
/** Suite de plans de camera : [image, Cam] ; interpolation douce entre deux plans. */
export const parcours = (f: number, cles: [number, Cam][]): Cam => {
  if (f <= cles[0][0]) return cles[0][1];
  for (let i = 0; i < cles.length - 1; i++) {
    const [fa, a] = cles[i], [fb, b] = cles[i + 1];
    if (f <= fb) return melange(a, b, prog(f, fa, fb, Easing.inOut(Easing.cubic)));
  }
  return cles[cles.length - 1][1];
};

/* ───────── texte anime (DOM, en perspective 3D) ───────── */
export type ModeTexte = "pivot" | "tombe" | "profondeur" | "leve";
export const Texte3D: React.FC<{
  texte: string; debut: number; fin?: number; mode?: ModeTexte; taille?: number; couleur?: string;
  top: number; left?: number; right?: number; poids?: number; fam?: string; pas?: number; lueur?: string; align?: "center" | "flex-start";
}> = ({ texte, debut, fin, mode = "pivot", taille = 120, couleur = charte.creme, top, left = 60, right = 60, poids = 800, fam = police.titre, pas = 1.6, lueur = "rgba(0,0,0,0.6)", align = "center" }) => {
  const f = useCurrentFrame();
  if (f < debut - 2 || (fin !== undefined && f > fin + 2)) return null;
  const q = fin !== undefined ? prog(f, fin - 10, fin, Easing.in(Easing.cubic)) : 0;
  let i = -1;
  return (
    <div style={{ position: "absolute", top, left, right, perspective: 1400, perspectiveOrigin: "50% 50%", opacity: 1 - q, filter: q > 0.01 ? `blur(${q * 14}px)` : undefined, transform: `translateZ(${q * 300}px) scale(${1 + q * 0.25})` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align, columnGap: taille * 0.27, transformStyle: "preserve-3d" }}>
        {texte.split(" ").map((mot, w) => (
          <span key={w} style={{ display: "inline-flex", transformStyle: "preserve-3d" }}>
            {mot.split("").map((ch, k) => {
              i += 1;
              const ressort = mode === "tombe"
                ? spring({ frame: f - debut - i * pas, fps: FPS, config: { damping: 9, stiffness: 120, mass: 0.9 } })
                : spring({ frame: f - debut - i * pas, fps: FPS, config: { damping: 15, stiffness: 140, mass: 0.8 } });
              const p = ressort; const o = Math.min(1, p * 3);
              let tr = "";
              if (mode === "pivot") tr = `rotateY(${(1 - p) * -100}deg) translateZ(${(1 - p) * -220}px)`;
              if (mode === "tombe") tr = `translateY(${(1 - p) * -900}px) rotateZ(${(h(i) - 0.5) * 50 * (1 - Math.min(1, p))}deg)`;
              if (mode === "profondeur") tr = `translateZ(${(1 - p) * -2400}px)`;
              if (mode === "leve") tr = `rotateX(${(1 - p) * 88}deg) translateY(${(1 - p) * 40}px)`;
              return (
                <span key={k} style={{ display: "inline-block", fontFamily: fam, fontWeight: poids, fontSize: taille, lineHeight: 1.04, letterSpacing: "-0.03em", color: couleur,
                  opacity: o, transform: tr, transformOrigin: mode === "leve" ? "50% 100%" : "50% 50%",
                  filter: mode === "profondeur" && p < 0.98 ? `blur(${(1 - p) * 16}px)` : undefined, textShadow: `0 8px 30px ${lueur}` }}>{ch}</span>
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Petite phrase : revelee de gauche a droite par un masque, avec une fine barre orange devant. */
export const Tape: React.FC<{ texte: string; debut: number; fin?: number; top: number; taille?: number; vitesse?: number }> = ({ texte, debut, fin, top, taille = 46 }) => {
  const f = useCurrentFrame();
  if (f < debut || (fin !== undefined && f > fin)) return null;
  const rev = prog(f, debut + 4, debut + 4 + Math.min(30, 10 + texte.length * 0.5));
  const barre = prog(f, debut, debut + 10);
  const q = fin !== undefined ? prog(f, fin - 8, fin) : 0;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - q, transform: `translateY(${-q * 20}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 940 }}>
        <div style={{ width: 6, height: taille * 1.1, background: charte.orange, transform: `scaleY(${barre})`, borderRadius: 3, boxShadow: "0 0 14px rgba(255,122,0,0.6)" }} />
        <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: taille, color: charte.creme, letterSpacing: "0.01em", textShadow: "0 4px 18px rgba(0,0,0,0.85)",
          clipPath: `inset(-20% ${(1 - rev) * 100}% -20% 0)`, transform: `translateX(${(1 - rev) * -12}px)` }}>{texte}</span>
      </div>
    </div>
  );
};

/** Mention « Images d'illustration » (images qui ne sont pas des archives d'AIESEC). */
export const Etiquette: React.FC<{ debut: number; fin: number; texte?: string }> = ({ debut, fin, texte = "Images d'illustration" }) => {
  const f = useCurrentFrame(); if (f < debut || f > fin) return null;
  const o = prog(f, debut, debut + 10) * (1 - prog(f, fin - 8, fin));
  return (
    <div style={{ position: "absolute", top: 1760, left: 60, opacity: o, display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 999, background: "rgba(10,6,4,0.6)", border: "1px solid rgba(255,235,209,0.25)" }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: charte.orange }} />
      <span style={{ fontFamily: police.texte, fontWeight: 700, fontSize: 30, color: charte.creme, letterSpacing: "0.06em", textTransform: "uppercase" }}>{texte}</span>
    </div>
  );
};

/* ───────── effets d'image ───────── */
export const Bokeh: React.FC<{ derive?: number; force?: number }> = ({ derive = 0, force = 1 }) => {
  const f = useCurrentFrame(); const cols = ["255,140,60", "255,60,60", "255,220,170", "160,200,255"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: force }}>
      {Array.from({ length: 14 }, (_, i) => {
        const taille = 90 + h(i + 2) * 220;
        const x = ((h(i) * 1400 - derive * (30 + h(i + 9) * 60) + f * (0.2 + h(i + 4) * 0.6)) % 1400 + 1400) % 1400 - 160;
        const y = h(i + 7) * 1920 + Math.sin(f / 60 + i) * 30;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: taille, height: taille, borderRadius: "50%", background: `radial-gradient(circle, rgba(${cols[i % 4]},0.26) 0%, rgba(${cols[i % 4]},0.1) 45%, transparent 70%)` }} />;
      })}
    </AbsoluteFill>
  );
};
export const Pixels: React.FC<{ t0: number; x: number; y: number; n?: number }> = ({ t0, x, y, n = 24 }) => {
  const f = useCurrentFrame(); const d = f - t0; if (d < 0 || d > 40) return null;
  const cols = ["#FF7A00", "#ff2a3a", "#FFEBD1", "#FFD000", "#00b050"];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = h(i + t0) * Math.PI * 2, v = 6 + h(i + 3) * 16, cc = 10 + Math.floor(h(i + 8) * 3) * 6;
        const o = d < 4 ? d / 4 : 1 - (d - 4) / 36; const vis = Math.floor((d + i) / 3) % 3 !== 0;
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * v * d, top: y + Math.sin(a) * v * d * 0.8 - d * 1.5, width: cc, height: cc, background: cols[i % 5], opacity: vis ? o : o * 0.2, boxShadow: `0 0 12px ${cols[i % 5]}` }} />;
      })}
    </>
  );
};
/** Transition : grille de carres orange qui couvre l'ecran puis se retire. Le changement de plan se fait au milieu. */
export const GrilleCarres: React.FC<{ t0: number; duree?: number }> = ({ t0, duree = 30 }) => {
  const f = useCurrentFrame(); const d = f - t0; if (d < 0 || d > duree) return null;
  const C = 18, L = 32, cell = 1080 / C;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: C * L }, (_, k) => {
        const i = k % C, j = Math.floor(k / C); const dist = Math.hypot(i - C / 2, (j - L / 2) * 0.62) / (C * 0.62);
        const entree = Math.min(1, Math.max(0, (d / (duree * 0.5)) * 1.6 - dist));
        const sortie = Math.min(1, Math.max(0, ((d - duree * 0.5) / (duree * 0.5)) * 1.6 - (1 - dist)));
        const sz = Math.max(0, entree - sortie); if (sz <= 0.01) return null; const v = h(k);
        return <div key={k} style={{ position: "absolute", left: i * cell + (cell * (1 - sz)) / 2, top: j * cell + (cell * (1 - sz)) / 2, width: cell * sz * 0.94, height: cell * sz * 0.94, background: v > 0.85 ? "#FFEBD1" : v > 0.55 ? "#FF7A00" : "#E0560A", boxShadow: "0 0 18px rgba(255,122,0,0.5)" }} />;
      })}
    </AbsoluteFill>
  );
};
/** Rembobinage de cassette (bandes, lignes, tremblement) : pour plonger dans le passe. */
export const Cassette: React.FC<{ t0: number; duree?: number }> = ({ t0, duree = 26 }) => {
  const f = useCurrentFrame(); const d = f - t0; if (d < 0 || d > duree) return null;
  const a = 1 - d / duree;
  return (
    <AbsoluteFill style={{ opacity: a, mixBlendMode: "screen", pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => { const y = ((f * (14 + i * 9) + i * 700) % 2100) - 120; return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 70 + i * 55, background: `linear-gradient(0deg, transparent, rgba(255,255,255,${0.24 - i * 0.05}), transparent)` }} />; })}
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0 2px, transparent 2px 5px)", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", top: 160, right: 70, fontFamily: "monospace", fontSize: 44, color: "#fff", letterSpacing: 4 }}>◀◀ REW</div>
    </AbsoluteFill>
  );
};
export const Flash: React.FC<{ t0: number; couleur?: string; duree?: number }> = ({ t0, couleur = "#fff", duree = 14 }) => {
  const f = useCurrentFrame(); const d = f - t0; if (d < 0 || d > duree) return null;
  return <AbsoluteFill style={{ background: couleur, opacity: d < 3 ? d / 3 : 1 - (d - 3) / (duree - 3), pointerEvents: "none" }} />;
};
/** Finitions : vignette + grain de film. */
export const Finitions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,0.62) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.13, pointerEvents: "none" }}>
        <Img src={staticFile(`grain${(Math.floor(f / 2) % 3) + 1}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </>
  );
};
/** Photo : par defaut ENTIERE (rien de coupe) sur un fond flou d'elle-meme, avec un zoom tres leger. */
export const PhotoPlein: React.FC<{ src: string; debut: number; fin: number; zoom?: [number, number]; ancien?: boolean; fondu?: number; couvrir?: boolean }> = ({ src, debut, fin, zoom = [1.0, 1.04], ancien, fondu = 10, couvrir }) => {
  const f = useCurrentFrame(); if (f < debut - 1 || f > fin + 1) return null;
  const t = prog(f, debut, fin, Easing.linear); const o = prog(f, debut, debut + fondu) * (1 - prog(f, fin - fondu, fin));
  const filtre = ancien ? "sepia(0.35) contrast(1.06)" : "saturate(1.05)";
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      {!couvrir ? <Img src={staticFile(src)} style={{ position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: `${filtre} blur(38px) brightness(0.55)` }} /> : null}
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: couvrir ? "cover" : "contain", transform: `scale(${lerp(zoom[0], zoom[1], t)})`, filter: filtre, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} />
    </AbsoluteFill>
  );
};
/** Carte de fin d'episode. */
export const CarteFin: React.FC<{ debut: number; numero: string; titre: string }> = ({ debut, numero, titre }) => {
  const f = useCurrentFrame(); if (f < debut) return null;
  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      <Bokeh force={0.7} />
      <Texte3D texte={numero} debut={debut + 4} mode="profondeur" taille={64} top={760} couleur={charte.orange} fam={police.texte} poids={900} />
      <Texte3D texte={titre} debut={debut + 12} mode="pivot" taille={130} top={860} />
    </AbsoluteFill>
  );
};

/** Pose la camera de la scene 3D (dans chaque couche). */
export const CameraFixe: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  camera.position.set(cam.p[0], cam.p[1], cam.p[2]); camera.lookAt(cam.l[0], cam.l[1], cam.l[2]);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  return null;
};
/** Une scene 3D en deux couches : le FOND flou (profondeur de champ) et l'AVANT net. */
export const Scene3D: React.FC<{ cam: Cam; fond: React.ReactNode; avant: React.ReactNode; flou?: number; flouAvant?: number; cle?: string }> = ({ cam, fond, avant, flou = 7, flouAvant = 0, cle = "" }) => (
  <>
    <AbsoluteFill style={{ filter: `blur(${flou}px) saturate(1.15)` }}>
      <ThreeCanvas key={"fond" + cle} width={1080} height={1920} camera={{ fov: 38, position: [0, 2, 8], near: 0.05, far: 200 }}>
        <color attach="background" args={["#0b0603"]} />
        <CameraFixe cam={cam} />
        {fond}
      </ThreeCanvas>
    </AbsoluteFill>
    <AbsoluteFill style={{ filter: flouAvant > 0.2 ? `blur(${flouAvant}px) brightness(${1 - flouAvant / 40})` : undefined }}>
      <ThreeCanvas key={"avant" + cle} width={1080} height={1920} shadows gl={{ alpha: true }} camera={{ fov: 38, position: [0, 2, 8], near: 0.05, far: 200 }}>
        <CameraFixe cam={cam} />
        {avant}
      </ThreeCanvas>
    </AbsoluteFill>
  </>
);
/** Etat du livre a partir des instants (images) ou une page commence a tourner (duree 20 images). */
export const etatLivre = (f: number, tours: number[], duree = 20) => {
  let page = 0, tour = 0;
  for (const t0 of tours) { if (f >= t0 + duree) page += 1; else if (f >= t0) { tour = (f - t0) / duree; break; } else break; }
  return { page, tour: Easing.inOut(Easing.cubic)(tour) };
};

/**
 * Gros plan sur le livre ouvert : la page de droite en grand, en perspective, et une vraie page
 * qui tourne (pivot sur la reliure, a gauche). `tours` = images ou une page commence a tourner.
 */
export const PageProche: React.FC<{ pages: (THREE.Texture | null)[]; tours: number[]; debut: number; fin: number; duree?: number }> = ({ pages, tours, debut, fin, duree = 22 }) => {
  const f = useCurrentFrame();
  const urls = useMemo(() => pages.map((p) => (p && (p.image as HTMLCanvasElement).toDataURL ? (p.image as HTMLCanvasElement).toDataURL("image/jpeg", 0.92) : "")), [pages]);
  if (f < debut - 1 || f > fin + 1) return null;
  const etat = etatLivre(f, tours, duree);
  const entree = prog(f, debut, debut + 18), sortie = prog(f, fin - 12, fin, Easing.in(Easing.cubic));
  const W = 860, H = Math.round(W * 1100 / 800);
  const cur = urls[Math.min(urls.length - 1, etat.page)], suivante = urls[Math.min(urls.length - 1, etat.page + 1)];
  const derive = Math.sin(f / 70) * 1.5;
  const style = (src: string): React.CSSProperties => ({ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", borderRadius: 6 });
  return (
    <AbsoluteFill style={{ perspective: 2200, opacity: entree * (1 - sortie) }}>
      <div style={{ position: "absolute", left: (1080 - W) / 2, top: (1920 - H) / 2 + 40, width: W, height: H, transformStyle: "preserve-3d",
        transform: `rotateX(${14 + derive}deg) rotateZ(${-1.5 + derive * 0.4}deg) scale(${0.9 + entree * 0.1 + sortie * 0.15})`, boxShadow: "0 60px 90px rgba(0,0,0,0.7)" }}>
        <div style={style(etat.tour > 0 ? suivante : cur)} />
        {etat.tour > 0 ? (
          <div style={{ ...style(cur), transformOrigin: "0% 50%", transform: `rotateY(${-etat.tour * 178}deg)`, backfaceVisibility: "hidden",
            boxShadow: `${-40 * Math.sin(etat.tour * Math.PI)}px 0 60px rgba(0,0,0,${0.5 * Math.sin(etat.tour * Math.PI)})` }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${0.35 * etat.tour}), transparent 60%)` }} />
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(115deg, rgba(255,210,140,0.18), transparent 40%, rgba(0,0,0,0.25))", pointerEvents: "none" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Polaroid (photo + cadre blanc + legende), qui arrive avec un rebond. */
export const Polaroid: React.FC<{ src: string; debut: number; fin?: number; x: number; y: number; largeur?: number; rot?: number; legende?: string; ancien?: boolean }> = ({ src, debut, fin, x, y, largeur = 640, rot = -3, legende, ancien }) => {
  const f = useCurrentFrame(); if (f < debut || (fin !== undefined && f > fin)) return null;
  const p = spring({ frame: f - debut, fps: FPS, config: { damping: 13, stiffness: 110, mass: 0.9 } });
  const q = fin !== undefined ? prog(f, fin - 10, fin, Easing.in(Easing.cubic)) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: largeur, padding: `${largeur * 0.035}px ${largeur * 0.035}px ${legende ? largeur * 0.16 : largeur * 0.06}px`, background: "#fbf6ea", borderRadius: 4,
      boxShadow: "0 40px 70px rgba(0,0,0,0.6)", opacity: Math.min(1, p * 2) * (1 - q),
      transform: `perspective(1600px) translateY(${(1 - p) * 500 + q * -200}px) rotate(${rot + (1 - p) * 14}deg) rotateX(${(1 - p) * 30}deg) scale(${1 + q * 0.2})` }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block", filter: ancien ? "sepia(0.35) contrast(1.06)" : undefined }} />
      {legende ? <div style={{ position: "absolute", left: 0, right: 0, bottom: largeur * 0.045, textAlign: "center", fontFamily: police.titre, fontWeight: 800, fontSize: largeur * 0.052, color: "#3A1B0C" }}>{legende}</div> : null}
    </div>
  );
};
