import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import chemins from "./eddyChemins.json";
import { charte } from "./charte";
import { police } from "./polices";

/**
 * ESSAI 3D (15 s) : la salle des archives, Eddy qui se reveille, camera qui voyage,
 * transitions « rembobinage de cassette » et « traversee de l'affiche ».
 * Tout est deterministe (aucun hasard) pour que le rendu soit identique a chaque fois.
 */
const FPS = 30;
const doux = Easing.bezier(0.16, 1, 0.3, 1);
const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prog = (f: number, a: number, b: number, e = doux) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/* ───────── Eddy en relief, a partir du calque vectoriel ───────── */
const c = chemins as unknown as {
  couleurs: Record<"noir" | "vert" | "jaune" | "rouge", [number, number, number]>;
  noir: { d: string; boite: number[] }[];
  chemise: { d: string }[]; vert: { d: string }[]; jaune: { d: string }[]; rouge: { d: string }[];
};
const charge = new SVGLoader();
const formes = (d: string) => charge.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths.flatMap((p) => SVGLoader.createShapes(p));
const rgb = ([r, g, b]: [number, number, number]) => new THREE.Color(r / 255, g / 255, b / 255);
const pieces = [...c.noir].sort((a, b) => b.boite[3] * b.boite[2] - a.boite[3] * a.boite[2]);

const Eddy3D: React.FC<{ lumiere?: number }> = () => {
  const groupe = useMemo(() => {
    const g = new THREE.Group();
    const piece = (d: string, couleur: THREE.Color, profondeur: number, z: number, bord = 3) => {
      const geo = new THREE.ExtrudeGeometry(formes(d), { depth: profondeur, bevelEnabled: true, bevelThickness: bord, bevelSize: bord, bevelSegments: 3, curveSegments: 6 });
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide }));
      m.position.z = z; m.castShadow = true; m.receiveShadow = true; g.add(m);
    };
    const noir = rgb(c.couleurs.noir), jaune = rgb(c.couleurs.jaune), vert = rgb(c.couleurs.vert), rouge = rgb(c.couleurs.rouge);
    pieces.slice(1).forEach((p) => piece(p.d, noir, 40, 0));          // jambes
    piece(c.chemise[0].d, jaune, 44, 0);                                 // maillot
    piece(c.vert[0].d, vert, 14, 46, 2);                                // bloc vert
    piece(c.rouge[0].d, rouge, 14, 46, 2);                              // bloc rouge
    piece(pieces[0].d, noir, 54, 2, 3);                                  // tete et meche
    const s = 0.0062;
    g.scale.set(s, -s, s); g.position.set(-470 * s, 363 * s, -0.17);
    return g;
  }, []);
  return <primitive object={groupe} />;
};

/* ───────── textures : chargees HORS de la 3D, puis transmises (fiable pour le rendu) ───────── */
const useTextures = (urls: string[]) => {
  const [tex, setTex] = useState<(THREE.Texture | null)[]>(urls.map(() => null));
  const [hd] = useState(() => delayRender("textures"));
  useEffect(() => {
    let reste = urls.length; const res: (THREE.Texture | null)[] = urls.map(() => null);
    const fini = () => { reste -= 1; if (reste === 0) { setTex(res); setTimeout(() => continueRender(hd), 300); } };
    urls.forEach((u, i) => new THREE.TextureLoader().load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res[i] = t; fini(); }, undefined, (e) => { console.log("texture introuvable", u, String(e)); fini(); }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hd]);
  return tex;
};
const useAffiche = (ligne1: string, ligne2: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [hd] = useState(() => delayRender("affiche"));
  useEffect(() => {
    document.fonts.load(`800 200px "${police.titre}"`).catch(() => null).then(() => {
      const cv = document.createElement("canvas"); cv.width = 768; cv.height = 1024;
      const x = cv.getContext("2d")!;
      const g = x.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, "#F6E8CC"); g.addColorStop(1, "#DCC49A");
      x.fillStyle = g; x.fillRect(0, 0, 768, 1024);
      x.strokeStyle = "rgba(58,27,12,0.12)"; x.lineWidth = 2; for (let y = 64; y < 1024; y += 64) { x.beginPath(); x.moveTo(0, y); x.lineTo(768, y); x.stroke(); }
      x.fillStyle = "#3A1B0C"; x.textAlign = "center";
      x.font = `700 70px "${police.texte}"`; x.fillText("Tout commence en", 384, 250);
      x.fillStyle = "#79280E"; x.font = `800 250px "${police.titre}"`; x.fillText(ligne1, 384, 520);
      x.fillStyle = "#3A1B0C"; x.font = `800 130px "${police.titre}"`; x.fillText(ligne2, 384, 760);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t); setTimeout(() => continueRender(hd), 300);
    });
  }, [ligne1, ligne2, hd]);
  return tex;
};

/* ───────── textures procedurales : lambris de bois sombre, tapis rouge ───────── */
const useLambris = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512; const x = cv.getContext("2d")!;
  x.fillStyle = "#1c0f08"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) {                       // lames verticales
    const v = 22 + Math.floor(h(i) * 14);
    x.fillStyle = `rgb(${v + 14},${v - 2},${Math.max(0, v - 12)})`; x.fillRect(i * 64 + 3, 0, 58, 512);
    x.fillStyle = "rgba(0,0,0,0.55)"; x.fillRect(i * 64, 0, 3, 512);
    for (let k = 0; k < 18; k++) { x.fillStyle = `rgba(0,0,0,${0.05 + h(i * 30 + k) * 0.08})`; x.fillRect(i * 64 + 6 + h(k + i) * 50, 0, 1 + h(k * 3 + i) * 2, 512); }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 2); return t;
}, []);
const useTapis = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512; const x = cv.getContext("2d")!;
  const px = 16;                                       // tapis « pixel » en anneaux, comme la reference
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) {
    const d = Math.hypot(i - 15.5, j - 15.5); if (d > 15.8) continue;
    const anneau = Math.floor(d / 2.6) % 2; const v = h(i * 33 + j) * 0.15;
    x.fillStyle = anneau ? `rgb(${150 + v * 255},10,18)` : `rgb(${200 + v * 200},20,26)`;
    x.fillRect(i * px, j * px, px, px);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}, []);

/* ───────── la salle ───────── */
type Couche = "fond" | "avant";
const Salle: React.FC<{ f: number; affiche: THREE.Texture | null; couche: Couche }> = ({ affiche, couche }) => {
  const lambris = useLambris(); const tapis = useTapis();
  const carton = (i: number) => {
    const w = 0.9 + h(i) * 0.9, hh = 0.6 + h(i + 5) * 0.8, d = 0.8;
    const cols = ["#5a1f0c", "#8a4a1a", "#c9b38a", "#3d1a0b"];
    return { w, hh, d, x: -9 + i * 1.7 + h(i + 2) * 0.4, c: cols[i % 4] };
  };
  if (couche === "fond") return (
    <group>
      <mesh position={[0, 7, -6]}><planeGeometry args={[60, 14]} /><meshStandardMaterial map={lambris} roughness={0.85} /></mesh>
      {/* fenetres de lumiere froide (floues dans le fond) et petite lampe chaude */}
      <mesh position={[-2.2, 6.2, -5.9]}><planeGeometry args={[3.2, 2.2]} /><meshBasicMaterial color="#dfeaff" /></mesh>
      <mesh position={[12.5, 4.8, -5.9]}><planeGeometry args={[2.4, 3.4]} /><meshBasicMaterial color="#cfe0ff" /></mesh>
      <mesh position={[3.6, 3.2, -5.5]}><sphereGeometry args={[0.35, 16, 16]} /><meshBasicMaterial color="#ffb45a" /></mesh>
      <mesh position={[8, 2.6, -5.2]}><boxGeometry args={[11, 0.18, 1.6]} /><meshStandardMaterial color="#1a0c06" roughness={0.8} /></mesh>
      <mesh position={[8, 5.4, -5.2]}><boxGeometry args={[11, 0.18, 1.6]} /><meshStandardMaterial color="#1a0c06" roughness={0.8} /></mesh>
      {Array.from({ length: 7 }, (_, i) => { const b = carton(i); return (
        <mesh key={i} position={[b.x + 8 - 2, 2.69 + b.hh / 2, -5.2]}><boxGeometry args={[b.w, b.hh, b.d]} /><meshStandardMaterial color={b.c} roughness={0.85} /></mesh>); })}
      {Array.from({ length: 6 }, (_, i) => { const b = carton(i + 9); return (
        <mesh key={i} position={[b.x + 11 - 2, 5.49 + b.hh / 2, -5.2]}><boxGeometry args={[b.w, b.hh, b.d]} /><meshStandardMaterial color={b.c} roughness={0.85} /></mesh>); })}
    </group>
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 40]} /><meshStandardMaterial color="#120905" roughness={0.9} /></mesh>
      {/* tapis rouge, legerement lumineux */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]} receiveShadow><circleGeometry args={[5.2, 64]} /><meshStandardMaterial map={tapis} roughness={0.95} emissive="#ff1020" emissiveIntensity={0.18} /></mesh>
      {/* socle d'Eddy */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[3.2, 0.9, 2.4]} /><meshStandardMaterial color="#0e0806" roughness={0.6} /></mesh>
      <mesh position={[0, 0.95, 0]} receiveShadow><boxGeometry args={[3.3, 0.1, 2.5]} /><meshStandardMaterial color="#2a1a12" roughness={0.5} /></mesh>
      {/* l'affiche « 1948 · la paix » (nette : on va la traverser) */}
      <group position={[-6.5, 4.6, -5.6]}>
        <mesh position={[0, 0, -0.05]} castShadow><boxGeometry args={[3.6, 4.7, 0.12]} /><meshStandardMaterial color="#120905" roughness={0.8} /></mesh>
        {affiche ? <mesh position={[0, 0, 0.07]}><planeGeometry args={[3.3, 4.4]} /><meshStandardMaterial map={affiche} roughness={0.9} emissive="#ffffff" emissiveMap={affiche} emissiveIntensity={0.25} /></mesh> : null}
      </group>
    </group>
  );
};

const MurValeurs: React.FC<{ t: (THREE.Texture | null)[]; couche: Couche }> = ({ t, couche }) => {
  const lambris = useLambris();
  const noms = ["#F47B20", "#2F8FD0", "#6FA32A", "#2A4FA8", "#E6168B", "#2F8FD0"];
  if (couche === "fond") return (
    <group position={[40, 0, 0]}>
      <mesh position={[0, 7, -6]}><planeGeometry args={[80, 14]} /><meshStandardMaterial map={lambris} roughness={0.85} /></mesh>
      <mesh position={[-11, 6.4, -5.9]}><planeGeometry args={[2.4, 3]} /><meshBasicMaterial color="#dfeaff" /></mesh>
      <mesh position={[12, 6.4, -5.9]}><planeGeometry args={[2.4, 3]} /><meshBasicMaterial color="#dfeaff" /></mesh>
    </group>
  );
  return (
    <group position={[40, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[80, 40]} /><meshStandardMaterial color="#120905" roughness={0.9} /></mesh>
      {t.map((tx, i) => (
        <group key={i} position={[(i - 2.5) * 4.6, 4.2 + Math.sin(i * 1.7) * 0.15, -5.7]} rotation={[0, 0, (h(i + 3) - 0.5) * 0.08]}>
          <mesh position={[0, 0, -0.06]} castShadow><boxGeometry args={[3.7, 3.7, 0.14]} /><meshStandardMaterial color="#fbf6ea" roughness={0.7} /></mesh>
          <mesh position={[0, 0, 0.07]}><planeGeometry args={[3.3, 3.3]} />{tx ? <meshStandardMaterial key="img" map={tx} roughness={0.9} emissive="#ffffff" emissiveMap={tx} emissiveIntensity={0.2} /> : <meshStandardMaterial key="vide" color="#fff" />}</mesh>
          <mesh position={[0, -2.35, 0.07]}><planeGeometry args={[3.0, 0.22]} /><meshStandardMaterial color={noms[i]} emissive={noms[i]} emissiveIntensity={0.6} /></mesh>
        </group>
      ))}
    </group>
  );
};

const Poussiere: React.FC<{ f: number }> = ({ f }) => {
  const geo = useMemo(() => {
    const p = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) { p[i * 3] = (h(i) - 0.5) * 9; p[i * 3 + 1] = h(i + 40) * 8; p[i * 3 + 2] = (h(i + 90) - 0.5) * 7; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); return g;
  }, []);
  const pos = (geo.getAttribute("position") as THREE.BufferAttribute);
  for (let i = 0; i < 260; i++) {
    pos.setY(i, ((h(i + 40) * 8 + f * (0.004 + h(i + 7) * 0.01)) % 8));
    pos.setX(i, (h(i) - 0.5) * 9 + Math.sin(f / 40 + i) * 0.15);
  }
  pos.needsUpdate = true;
  return <points geometry={geo}><pointsMaterial size={0.045} color="#ffd59a" transparent opacity={0.7} depthWrite={false} sizeAttenuation /></points>;
};

/* ───────── camera (partagee par les deux couches) ───────── */
const cameraA = (f: number) => {
  let cx: number, cy: number, cz: number, lx: number, ly: number, lz: number, fov: number;
  if (f < 330) {
    const orb = prog(f, 120, 280, Easing.inOut(Easing.cubic));
    const ang = lerp(0.0, 0.55, orb), dist = lerp(10.5, 7.2, prog(f, 0, 280, Easing.inOut(Easing.quad)));
    const pan = prog(f, 270, 325, Easing.inOut(Easing.cubic));
    cx = lerp(Math.sin(ang) * dist, -6.2, pan); cy = lerp(2.4 + orb * 0.6, 4.4, pan); cz = lerp(Math.cos(ang) * dist, 6.4, pan);
    lx = lerp(0, -6.5, pan); ly = lerp(2.5, 4.6, pan); lz = lerp(0, -5.6, pan); fov = 38;
  } else if (f < 346) {
    const k = prog(f, 326, 346, Easing.in(Easing.cubic));
    cx = lerp(-6.2, -6.5, k); cy = lerp(4.4, 4.6, k); cz = lerp(6.4, -4.4, k);
    lx = -6.5; ly = 4.6; lz = -5.6; fov = lerp(38, 52, k);
  } else {
    const k = prog(f, 346, 450, Easing.inOut(Easing.sin));
    cx = lerp(40 - 8, 40 + 8, k); cy = 4.2 + Math.sin(k * Math.PI) * 0.25; cz = lerp(12.5, 10.5, k);
    lx = cx + 0.4; ly = 3.9; lz = -5.7; fov = 36;
  }
  const secoue = (f > 322 && f < 352 ? 0.12 : 0) + 0.015;
  return { p: [cx + Math.sin(f * 1.7) * secoue, cy + Math.cos(f * 2.3) * secoue, cz] as const, l: [lx, ly, lz] as const, fov };
};

const Lumieres: React.FC<{ f: number }> = ({ f }) => {
  const lum = prog(f, 40, 90, Easing.out(Easing.cubic)); const lumB = prog(f, 340, 360);
  return (
    <>
      <ambientLight intensity={0.08 + 0.14 * lum} color="#ffcf9a" />
      <hemisphereLight args={["#ffd9a8", "#0a0503", 0.08 + 0.12 * lum]} />
      <spotLight position={[-4.5, 10, 6]} angle={0.32} penumbra={0.8} intensity={300 * lum} color="#ffd2a0" castShadow shadow-mapSize={[1024, 1024]} target-position={[0, 1, 0]} />
      <directionalLight position={[4, 6, -7]} intensity={2.6 * lum} color="#ff9a5a" />
      <directionalLight position={[-6, 4, -6]} intensity={1.8 * lum} color="#9cc4ff" />
      <pointLight position={[0, 1.2, 3.5]} intensity={18 * lum} color="#ff2a3a" />
      <pointLight position={[40 - 2, 7, 5]} intensity={70 * lumB} color="#ffb766" />
      <pointLight position={[40 + 6, 7, 5]} intensity={70 * lumB} color="#ffe0b8" />
    </>
  );
};

const Monde: React.FC<{ f: number; affiche: THREE.Texture | null; valeurs: (THREE.Texture | null)[]; couche: Couche }> = ({ f, affiche, valeurs, couche }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const cam = cameraA(f);
  camera.position.set(cam.p[0], cam.p[1], cam.p[2]); camera.lookAt(cam.l[0], cam.l[1], cam.l[2]); camera.fov = cam.fov; camera.updateProjectionMatrix();
  // reveil d'Eddy : couche sur le dos -> debout (rebond)
  const reveil = spring({ frame: f - 100, fps: FPS, config: { damping: 9, stiffness: 90, mass: 0.9 } });
  const rotZ = lerp(-1.45, 0, Math.min(1.12, reveil));
  const saut = Math.max(0, Math.sin(Math.max(0, f - 100) / 12)) * Math.exp(-(Math.max(0, f - 100)) / 30) * 0.8;
  const respire = Math.sin(f / 18) * 0.03;
  const eddyY = 1.0 + 1.7 + saut + respire - (1 - Math.min(1, reveil)) * 0.75;
  return (
    <>
      <Lumieres f={f} />
      <Salle f={f} affiche={affiche} couche={couche} />
      <MurValeurs t={valeurs} couche={couche} />
      {couche === "avant" ? (
        <>
          <Poussiere f={f} />
          <group position={[0, eddyY - 1.7, 0]} rotation={[0, Math.sin(f / 50) * 0.16 + 0.15, rotZ]}><group position={[0, 1.7, 0]}><Eddy3D /></group></group>
        </>
      ) : null}
      <fog attach="fog" args={["#0b0603", 14, 42]} />
    </>
  );
};

/* ───────── effets d'image : cassette, flash, grain, texte ───────── */
const Cassette: React.FC<{ f: number }> = ({ f }) => {
  const a = 1 - prog(f, 0, 48, Easing.linear);
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a, mixBlendMode: "screen", pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => {
        const y = ((f * (14 + i * 9) + i * 700) % 2100) - 120;
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 70 + i * 55, background: `linear-gradient(0deg, transparent, rgba(255,255,255,${0.22 - i * 0.05}), transparent)` }} />;
      })}
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0 2px, transparent 2px 5px)", mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};
const Texte: React.FC<{ f: number; texte: string; debut: number; fin: number; haut?: number; taille?: number; couleur?: string }> = ({ f, texte, debut, fin, haut = 220, taille = 112, couleur = charte.creme }) => {
  const a = prog(f, debut, debut + 14) * (1 - prog(f, fin - 10, fin, Easing.in(Easing.cubic)));
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: haut, textAlign: "center", opacity: a, transform: `translateY(${(1 - prog(f, debut, debut + 18)) * 50}px) scale(${1 + (1 - a) * 0.12})`, fontFamily: police.titre, fontWeight: 800, fontSize: taille, letterSpacing: "-0.03em", color: couleur, textShadow: "0 6px 28px rgba(0,0,0,0.65)" }}>{texte}</div>
  );
};

/** Bokeh : de grosses taches de lumiere floues au premier plan, qui derivent (parallaxe). */
const Bokeh: React.FC<{ f: number }> = ({ f }) => {
  const cam = cameraA(f);
  const cols = ["255,140,60", "255,60,60", "255,220,170", "160,200,255"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 16 }, (_, i) => {
        const taille = 90 + h(i + 2) * 220;
        const x = ((h(i) * 1400 - cam.p[0] * (30 + h(i + 9) * 60) + f * (0.2 + h(i + 4) * 0.6)) % 1400 + 1400) % 1400 - 160;
        const y = h(i + 7) * 1920 + Math.sin(f / 60 + i) * 30;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: taille, height: taille, borderRadius: "50%", background: `radial-gradient(circle, rgba(${cols[i % 4]},0.28) 0%, rgba(${cols[i % 4]},0.12) 45%, transparent 70%)` }} />;
      })}
    </AbsoluteFill>
  );
};
/** Pixels carres qui jaillissent et s'eteignent (autour d'un point, a un instant). */
const Pixels: React.FC<{ f: number; t0: number; x: number; y: number; n?: number }> = ({ f, t0, x, y, n = 26 }) => {
  const d = f - t0; if (d < 0 || d > 40) return null;
  const cols = ["#FF7A00", "#ff2a3a", "#FFEBD1", "#FFD000", "#00b050"];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = h(i + t0) * Math.PI * 2, v = 6 + h(i + 3) * 16, c = 10 + Math.floor(h(i + 8) * 3) * 6;
        const o = d < 4 ? d / 4 : 1 - (d - 4) / 36;
        const vis = Math.floor((d + i) / 3) % 3 !== 0;   // scintillement « pixel »
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * v * d, top: y + Math.sin(a) * v * d * 0.8 - d * 1.5, width: c, height: c, background: cols[i % 5], opacity: vis ? o : o * 0.2, boxShadow: `0 0 12px ${cols[i % 5]}` }} />;
      })}
    </>
  );
};
/** Transition : grille de carres orange qui recouvre l'ecran puis se retire (comme la reference). */
const GrilleCarres: React.FC<{ f: number; t0: number; duree?: number }> = ({ f, t0, duree = 30 }) => {
  const d = f - t0; if (d < 0 || d > duree) return null;
  const C = 18, L = 32, cell = 1080 / C;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: C * L }, (_, k) => {
        const i = k % C, j = Math.floor(k / C);
        const dist = Math.hypot(i - C / 2, (j - L / 2) * 0.62) / (C * 0.62);
        const entree = Math.min(1, Math.max(0, (d / (duree * 0.5)) * 1.6 - dist));
        const sortie = Math.min(1, Math.max(0, ((d - duree * 0.5) / (duree * 0.5)) * 1.6 - (1 - dist)));
        const s = Math.max(0, entree - sortie);
        if (s <= 0.01) return null;
        const v = h(k);
        return <div key={k} style={{ position: "absolute", left: i * cell + (cell * (1 - s)) / 2, top: j * cell + (cell * (1 - s)) / 2, width: cell * s * 0.94, height: cell * s * 0.94, background: v > 0.85 ? "#FFEBD1" : v > 0.55 ? "#FF7A00" : "#E0560A", boxShadow: "0 0 18px rgba(255,122,0,0.5)" }} />;
      })}
    </AbsoluteFill>
  );
};

export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  const affiche = useAffiche("1948", "la paix");
  const valeurs = useTextures([1, 2, 3, 4, 5, 6].map((i) => staticFile(`valeurs/${i}.png`)));
  const glitch = f < 50 || (f > 322 && f < 352);
  const tremble = glitch ? Math.sin(f * 3.3) * (f < 50 ? 14 * (1 - f / 50) : 10) : 0;
  const flash = 0;
  return (
    <AbsoluteFill style={{ background: "#0b0603" }}>
      <AbsoluteFill style={{ transform: `translateX(${tremble}px)`, filter: glitch ? "drop-shadow(8px 0 0 rgba(255,40,40,.55)) drop-shadow(-8px 0 0 rgba(40,255,255,.45)) saturate(1.3) contrast(1.12)" : "contrast(1.12) saturate(1.1)" }}>
        {/* couche du FOND : floutee (profondeur de champ), sans ombres */}
        <AbsoluteFill style={{ filter: "blur(7px) saturate(1.15)" }}>
          <ThreeCanvas width={1080} height={1920} camera={{ fov: 38, position: [0, 2.4, 10.5], near: 0.1, far: 200 }}>
            <color attach="background" args={["#0b0603"]} />
            <Monde f={f} affiche={affiche} valeurs={valeurs} couche="fond" />
          </ThreeCanvas>
        </AbsoluteFill>
        {/* couche AVANT : nette, fond transparent */}
        <AbsoluteFill>
          <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: true }} camera={{ fov: 38, position: [0, 2.4, 10.5], near: 0.1, far: 200 }}>
            <Monde f={f} affiche={affiche} valeurs={valeurs} couche="avant" />
          </ThreeCanvas>
        </AbsoluteFill>
      </AbsoluteFill>
      <Bokeh f={f} />
      <Pixels f={f} t0={104} x={520} y={1120} n={30} />
      <Pixels f={f} t0={72} x={540} y={300} n={18} />
      <Pixels f={f} t0={162} x={540} y={300} n={18} />
      <Pixels f={f} t0={374} x={540} y={1560} n={22} />
      <Cassette f={f} />
      <Texte f={f} texte="Hey AIESEC, what’s up !" debut={70} fin={150} />
      <Texte f={f} texte="Moi, c’est Eddy." debut={160} fin={250} />
      <Texte f={f} texte="Six valeurs." debut={372} fin={448} haut={1500} taille={120} />
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <GrilleCarres f={f} t0={330} duree={32} />
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.14, pointerEvents: "none" }}>
        <Img src={staticFile(`grain${(Math.floor(f / 2) % 3) + 1}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
