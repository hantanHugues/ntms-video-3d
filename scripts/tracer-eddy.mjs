// Calque l'image d'Eddy pour en tirer ses VRAIS contours en vectoriel.
//
//   node scripts/tracer-eddy.mjs outils/references/eddy.jpg src/eddyChemins.json
//
// Principe : Chrome (headless) charge l'image, l'agrandit x3 avec un
// lissage de qualite, separe les pixels par couleur (noir, vert, jaune,
// rouge), puis suit le contour exterieur de chaque piece et le simplifie.
// Rien n'est redessine a la main : la forme est celle de l'image.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [entree, sortie] = process.argv.slice(2);
const donnees = readFileSync(entree).toString("base64");
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`,
   `--user-data-dir=${mkdtempSync(join(tmpdir(), "tr-"))}`, "about:blank"],
  { stdio: "ignore" }
);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 120000);

let ws, ouvert, n = 0;
const att = new Map();
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const p = l.find((x) => x.type === "page");
    if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); ouvert = new Promise((r) => (ws.onopen = r)); }
  } catch {}
  await attendre(250);
}
await ouvert;
ws.onmessage = (e) => { const d = JSON.parse(e.data); if (d.id && att.has(d.id)) { att.get(d.id)(d); att.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((r) => { const id = ++n; att.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

const programme = `(async () => {
  const S = 3;
  const img = new Image();
  img.src = "data:image/jpeg;base64,${donnees}";
  await img.decode();
  const W = img.naturalWidth * S, H = img.naturalHeight * S;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
  cx.drawImage(img, 0, 0, W, H);
  const px = cx.getImageData(0, 0, W, H).data;

  const masque = (f) => { const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) { const r = px[i*4], g = px[i*4+1], b = px[i*4+2]; if (f(r, g, b)) m[i] = 1; } return m; };
  const noir  = masque((r, g, b) => r < 80 && g < 80 && b < 80);
  const vert  = masque((r, g, b) => g > 150 && g - r > 60 && g - b > 60);
  const jaune = masque((r, g, b) => r > 170 && g > 170 && b < 150 && Math.abs(r - g) < 70);
  const rouge = masque((r, g, b) => r > 170 && g < 110 && b < 110);
  const colore = masque((r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) > 80);

  // couleurs moyennes mesurees (pour rester fidele)
  const moyenne = (m) => { let a = 0, rr = 0, gg = 0, bb = 0; for (let i = 0; i < W*H; i++) if (m[i]) { a++; rr += px[i*4]; gg += px[i*4+1]; bb += px[i*4+2]; } return a ? [Math.round(rr/a), Math.round(gg/a), Math.round(bb/a)] : null; };
  const couleurs = { noir: moyenne(noir), vert: moyenne(vert), jaune: moyenne(jaune), rouge: moyenne(rouge) };

  // composantes connexes (4-voisins), iteratif
  function composantes(m, minAire) {
    const etiq = new Int32Array(W * H); const res = []; let k = 0;
    const pile = new Int32Array(W * H);
    for (let s = 0; s < W * H; s++) {
      if (!m[s] || etiq[s]) continue;
      k++; let sp = 0, aire = 0, x0 = W, x1 = 0, y0 = H, y1 = 0; pile[sp++] = s; etiq[s] = k;
      while (sp) { const p = pile[--sp]; aire++; const x = p % W, y = (p / W) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && m[p-1] && !etiq[p-1]) { etiq[p-1] = k; pile[sp++] = p-1; }
        if (x < W-1 && m[p+1] && !etiq[p+1]) { etiq[p+1] = k; pile[sp++] = p+1; }
        if (y > 0 && m[p-W] && !etiq[p-W]) { etiq[p-W] = k; pile[sp++] = p-W; }
        if (y < H-1 && m[p+W] && !etiq[p+W]) { etiq[p+W] = k; pile[sp++] = p+W; } }
      if (aire >= minAire) res.push({ id: k, aire, x0, x1, y0, y1, depart: s });
    }
    return { etiq, res };
  }

  // contour exterieur par suivi de bord (Moore, critere de Jacob)
  const D = [[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1]]; // O, NO, N, NE, E, SE, S, SO
  function contour(etiq, id, depart) {
    const dans = (x, y) => x >= 0 && y >= 0 && x < W && y < H && etiq[y*W+x] === id;
    const sx = depart % W, sy = (depart / W) | 0;
    const pts = [[sx, sy]]; let x = sx, y = sy, d = 6; // on est arrive par le sud-ouest
    const limite = 4 * (W + H) * 20; let it = 0;
    // point de depart du suivi : le voisin precedent (backtrack) est a l'ouest
    let bx = sx - 1, by = sy;
    let premier = true;
    while (it++ < limite) {
      let trouve = false;
      // balaie les 8 voisins dans le sens horaire a partir du backtrack
      let idx = D.findIndex(([dx, dy]) => x + dx === bx && y + dy === by);
      if (idx < 0) idx = 0;
      for (let t = 1; t <= 8; t++) {
        const j = (idx + t) % 8; const nx = x + D[j][0], ny = y + D[j][1];
        if (dans(nx, ny)) {
          const jp = (j + 7) % 8; bx = x + D[jp][0]; by = y + D[jp][1];
          x = nx; y = ny; trouve = true; break;
        }
      }
      if (!trouve) break;
      if (x === sx && y === sy && !premier) break;
      premier = false;
      pts.push([x, y]);
    }
    return pts;
  }

  // Douglas-Peucker (iteratif), polygone ferme
  function simplifier(pts, eps) {
    const n = pts.length; if (n < 4) return pts;
    const garde = new Uint8Array(n); garde[0] = garde[n-1] = 1;
    const pile = [[0, n-1]];
    while (pile.length) {
      const [a, b] = pile.pop(); let dmax = 0, im = -1;
      const [ax, ay] = pts[a], [bx, by] = pts[b]; const dx = bx - ax, dy = by - ay; const L = Math.hypot(dx, dy) || 1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs(dy*(pts[i][0]-ax) - dx*(pts[i][1]-ay)) / L; if (d > dmax) { dmax = d; im = i; } }
      if (dmax > eps) { garde[im] = 1; pile.push([a, im], [im, b]); }
    }
    return pts.filter((_, i) => garde[i]);
  }

  const chemin = (pts) => "M" + pts.map(([x, y]) => (x / S).toFixed(1) + " " + (y / S).toFixed(1)).join("L") + "Z";
  const sortie = {};
  const piece = (nom, m, minAire, eps) => {
    const { etiq, res } = composantes(m, minAire);
    return res.map((c) => {
      const brut = contour(etiq, c.id, c.depart);
      const simple = simplifier(brut, eps);
      return { nom, aire: c.aire, boite: [c.x0 / S, c.y0 / S, (c.x1 - c.x0) / S, (c.y1 - c.y0) / S], points: simple.length, d: chemin(simple) };
    });
  };
  sortie.noir = piece("noir", noir, 4000, 1.3);
  sortie.chemise = piece("chemise", colore, 6000, 1.3);
  sortie.vert = piece("vert", vert, 3000, 1.3);
  sortie.jaune = piece("jaune", jaune, 3000, 1.3);
  sortie.rouge = piece("rouge", rouge, 3000, 1.3);
  sortie.couleurs = couleurs;
  sortie.taille = [img.naturalWidth, img.naturalHeight];
  return JSON.stringify(sortie);
})()`;

try {
  await cmd("Runtime.enable");
  const r = await cmd("Runtime.evaluate", { expression: programme, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
  const out = JSON.parse(r.result.result.value);
  writeFileSync(sortie, JSON.stringify(out, null, 1));
  console.log("taille source :", out.taille.join("x"));
  console.log("couleurs mesurées :", JSON.stringify(out.couleurs));
  for (const k of ["noir", "chemise", "vert", "jaune", "rouge"]) {
    for (const p of out[k]) console.log(`  ${k.padEnd(8)} aire=${p.aire}  boîte=${p.boite.map((v) => Math.round(v)).join(",")}  points=${p.points}`);
  }
  console.log("écrit :", sortie);
} finally {
  ws.close(); proc.kill(); process.exit(0);
}
