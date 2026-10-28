#!/usr/bin/env python3
"""Minutage de chaque episode : la voix d'abord, avec des respirations et des moments sans parole.
Ecrit src/serie/epN.json (lu par la video ET par le mixage du son)."""
import json, os, re, subprocess
ici = os.path.dirname(os.path.abspath(__file__)); racine = os.path.dirname(ici)
FF = os.environ.get("FFMPEG") or (os.path.join(racine, "bin", "ffmpeg") if os.path.exists(os.path.join(racine, "bin", "ffmpeg")) else "ffmpeg")
def duree(f):
    o = subprocess.run([FF, "-hide_banner", "-i", f, "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", o); return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
# ("S", nom) = debut de scene ; nombre = silence (s) ; texte = segment de voix
PLANS = {
 "ep1": [("S","eddy"),0.9,"s1a",0.35,"s1b",0.35,"s1c",0.5,"s1d",("S","livre"),2.4,
         ("S","guerre"),"s2a",0.5,"s2b",1.1,("S","mission"),"s2c",2.2,
         ("S","idee"),"s3a",0.45,"s3b",1.3,("S","valeurs"),"s4a",0.5,"s4b",("S","fin"),2.8],
 "ep2": [("S","galerie"),1.0,"s1a",0.45,"s1b",6.4,
         ("S","portraits"),"s2a",1.1,"s2b",1.5,"s2c",1.5,"s2d",1.7,
         ("S","carte"),1.4,"s3a",0.45,"s3b",0.6,"s3c",1.4,
         ("S","benin"),"s4a",0.8,"s4b",1.6,"s4c",0.4,"s4d",1.2,("S","feuilletage"),4.5,("S","fin"),"s5a",2.4],
 "ep3": [("S","aujourdhui"),1.0,"s1a",0.45,"s1b",0.6,"s1c",1.2,
         ("S","gala"),2.6,"s2a",0.35,"s2b",0.7,"s2c",1.8,
         ("S","jeunes"),"s3a",0.45,"s3b",2.6,
         ("S","ntms"),"s4a",0.8,"s4b",1.4,("S","fin"),"s5a",2.6],
}
for ep, plan in PLANS.items():
    t = 0.0; seg = {}; scenes = {}; ordre = []
    for x in plan:
        if isinstance(x, tuple):
            if ordre: scenes[ordre[-1]]["fin"] = round(t, 2)
            scenes[x[1]] = {"debut": round(t, 2)}; ordre.append(x[1])
        elif isinstance(x, (int, float)): t += x
        else:
            d = duree(os.path.join(ici, "voix", ep, x + ".mp3")); seg[x] = {"debut": round(t, 2), "fin": round(t + d, 2)}; t += d
    scenes[ordre[-1]]["fin"] = round(t, 2)
    json.dump({"total": round(t, 2), "seg": seg, "scenes": scenes}, open(os.path.join(racine, "src", "serie", ep + ".json"), "w"), indent=1)
    print(ep, f"{t:.1f} s  |", "  ".join(f"{k} {v['debut']:.1f}" for k, v in scenes.items()))
