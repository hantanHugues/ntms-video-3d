#!/usr/bin/env python3
"""Bande-son d'un episode : voix (minutage epN.json) + bruitages enregistres (Mixkit) + musique basse et constante.
   python3 serie/mixer.py ep1   ->  out/serie/ep1-son.wav
Les bruitages et musiques sont telecharges s'ils manquent (licence Mixkit gratuite)."""
import json, os, subprocess, sys, urllib.request
ici = os.path.dirname(os.path.abspath(__file__)); racine = os.path.dirname(ici)
FF = os.environ.get("FFMPEG") or (os.path.join(racine, "bin", "ffmpeg") if os.path.exists(os.path.join(racine, "bin", "ffmpeg")) else "ffmpeg")
ep = sys.argv[1]; M = json.load(open(os.path.join(racine, "src", "serie", ep + ".json"))); TOTAL = M["total"]
seg = lambda k: M["seg"][k]["debut"]; segf = lambda k: M["seg"][k]["fin"]; sc = lambda k: M["scenes"][k]["debut"]

# bruitages : (instant en s, son, volume)
E = []
def a(t, son, g=0.5): E.append((t, son, g))
if ep == "ep1":
    a(seg("s1a") + 0.05, "pop1", 0.35); a(seg("s1b"), "whoosh_f", 0.25); a(seg("s1c"), "pop2", 0.3)
    a(sc("livre") - 0.2, "livre", 0.6); a(sc("livre") + 0.6, "sparkle", 0.35); a(sc("livre") + 0.7, "hit_soft", 0.4)
    a(sc("guerre") - 0.3, "rembobine", 0.45)
    for t in (sc("guerre") - 1.0, seg("s2b") - 0.13, sc("mission"), sc("valeurs") + 0.13): a(t, "page", 0.6)
    a(seg("s2a") + 1.1, "whoosh_f", 0.25); a(seg("s2c") + 4.0, "chime", 0.35); a(seg("s2c") + 4.0, "riser", 0.2)
    a(sc("idee") - 0.2, "whoosh_t", 0.35); a(seg("s3a"), "pop3", 0.3)
    for k in (2.2, 4.0, 5.9): a(seg("s3b") + k + 0.25, "hit_soft", 0.45)
    a(sc("valeurs") - 0.5, "whoosh_big", 0.35); a(seg("s4a") + 3.4, "poof", 0.35)
    a(sc("fin") - 0.5, "whoosh_big", 0.35); a(sc("fin") + 0.5, "hit_soft", 0.4)
elif ep == "ep2":
    a(0.2, "whoosh_t", 0.3); a(seg("s1a") + 0.15, "pop1", 0.3)
    for k in range(0, int(sc("portraits") * 30), 18): a(k / 30 + 0.45, "tick", 0.12)          # petits pas d'Eddy
    a(seg("s2a") + 0.6, "whoosh_f", 0.3)
    for k in ("s2b", "s2c", "s2d"): a(seg(k), "hit_soft", 0.35); a(seg(k) + 0.05, "chime", 0.18)
    a(sc("carte") + 0.8, "whoosh_big", 0.45)
    for i in range(45): a(sc("carte") + 1.5 + i * 0.073, "tick", 0.1)
    a(seg("s3b") + 0.4, "stomp", 0.55); a(seg("s3c") + 1.0, "impact_big", 0.45); a(seg("s3c") + 1.1, "sparkle", 0.3)
    a(sc("benin") - 0.5, "whoosh_big", 0.35); a(seg("s4a") + 0.3, "stomp", 0.5)
    a(seg("s4b") + 0.25, "shutter", 0.55); a(seg("s4b") + 0.35, "hit_soft", 0.3)
    a(seg("s4c") + 0.3, "poof", 0.4); a(seg("s4c") + 0.4, "chime", 0.3)
    for i in range(27): a(sc("feuilletage") + i * 5 / 30, "page", 0.22)
    a(sc("fin") - 0.5, "whoosh_big", 0.35); a(sc("fin") + 0.5, "hit_soft", 0.4)
elif ep == "ep3":
    a(seg("s1a"), "pop1", 0.3)
    for k in (0.2, 1.8, 3.1): a(seg("s1b") + k + 0.3, "hit_wood", 0.4)
    a(seg("s1c") - 0.1, "shutter", 0.4); a(seg("s1c") + 0.35, "shutter", 0.35)
    a(sc("gala") - 0.5, "whoosh_big", 0.35); a(seg("s2c") + 0.3, "chime", 0.4)
    a(sc("jeunes") - 0.5, "whoosh_big", 0.35); a(segf("s3b") - 0.6, "impact_big", 0.5)
    a(sc("ntms") - 0.5, "whoosh_big", 0.35); a(seg("s4a") + 0.5, "riser", 0.3); a(seg("s4a") + 1.5, "impact_big", 0.55); a(seg("s4a") + 1.6, "sparkle", 0.3)
    a(sc("fin") - 0.5, "whoosh_big", 0.35); a(sc("fin") + 1.2, "livre", 0.5); a(seg("s5a"), "pop2", 0.3)

# telechargements (s'ils manquent)
sys.path.insert(0, os.path.join(racine, "son")); os.chdir(racine)
if not all(os.path.exists(os.path.join(racine, "son", "banque", n + ".wav")) for _, n, _ in E):
    subprocess.run([sys.executable, os.path.join(racine, "son", "banque.py")], check=True)
MUS = {"ep1": ("discover", 587, 0), "ep2": ("discover", 587, 40), "ep3": ("driving-ambition", 32, 0)}
nom, mid, decale = MUS[ep]; mus = os.path.join(racine, "son", "musique", nom + ".mp3")
os.makedirs(os.path.dirname(mus), exist_ok=True)
if not os.path.exists(mus):
    open(mus, "wb").write(urllib.request.urlopen(urllib.request.Request(f"https://assets.mixkit.co/music/{mid}/{mid}.mp3", headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())

# graphe ffmpeg : voix + bruitages + musique
ins, parts, labs = [], [], []
voix = sorted(M["seg"].items(), key=lambda kv: kv[1]["debut"])
for i, (k, v) in enumerate(voix):
    ins += ["-i", os.path.join(ici, "voix", ep, k + ".mp3")]; ms = int(v["debut"] * 1000)
    parts.append(f"[{i}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{i}]"); labs.append(f"[v{i}]")
n0 = len(voix); sons = sorted({n for _, n, _ in E})
for j, n in enumerate(sons): ins += ["-i", os.path.join(racine, "son", "banque", n + ".wav")]
cnt = {n: sum(1 for e in E if e[1] == n) for n in sons}
for j, n in enumerate(sons):
    c = cnt[n]; parts.append(f"[{n0 + j}:a]aresample=44100,pan=stereo|c0=c0|c1=c0" + (f",asplit={c}" + "".join(f"[{n}_{k}]" for k in range(c)) if c > 1 else f"[{n}_0]"))
used = {n: 0 for n in sons}
for e, (t, n, g) in enumerate(E):
    k = used[n]; used[n] += 1; ms = max(0, int(t * 1000))
    parts.append(f"[{n}_{k}]volume={g * 0.8},adelay={ms}|{ms}[e{e}]"); labs.append(f"[e{e}]")
im = n0 + len(sons); ins += ["-ss", str(decale), "-i", mus]
fin_mus = max(0.5, TOTAL - 2.5)
parts.append(f"[{im}:a]aresample=44100,dynaudnorm=f=800:g=31:p=0.95:m=30:s=5,loudnorm=I=-29:TP=-3:LRA=3,atrim=0:{TOTAL},afade=t=in:st=0:d=1.2,afade=t=out:st={fin_mus}:d=2.4[mus]"); labs.append("[mus]")
fc = ";".join(parts) + ";" + "".join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={TOTAL},atrim=0:{TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[o]"
os.makedirs(os.path.join(racine, "out", "serie"), exist_ok=True)
sortie = os.path.join(racine, "out", "serie", ep + "-son.wav")
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *ins, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", sortie], check=True)
print(f"ok {sortie} ({TOTAL} s, {len(voix)} phrases, {len(E)} bruitages)")
