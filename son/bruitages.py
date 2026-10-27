#!/usr/bin/env python3
"""Place les VRAIS bruitages (son/banque/) sur les animations. Sortie : son/sfx-reels.wav"""
import json, os, subprocess, sys
ici = os.path.dirname(os.path.abspath(__file__)); FF = os.path.join(ici, "..", "bin", "ffmpeg")
cal = json.load(open(os.path.join(ici, "..", "voix", "calage.json"))); sc = cal["scenes"]; TOTAL = cal["total"]
E = []   # (temps absolu, son, gain)
def at(scene, local, son, g=0.5): E.append((sc[scene]["debut"] + local, son, g))
def sg(scene, id_): return next(s for s in sc[scene]["segments"] if s["id"] == id_)["debut"]
def serie(scene, t0, t1, n, son="tick", g=0.3):
    for k in range(n): at(scene, t0 + (t1 - t0) * k / n, son, g)

# transitions : whoosh avant chaque coupure, petit coup apres
for i, k in enumerate([x for x in list(sc)[1:] if x != "12-logo"]):
    E.append((sc[k]["debut"] - 0.55, "whoosh_t", 0.5)); E.append((sc[k]["debut"] + 0.05, "hit_soft", 0.3))

# 1 mystere
at("01-mystere", 0.1, "walk", 0.5)
at("01-mystere", 1.0, "pop1", 0.4); at("01-mystere", 1.45, "hit_soft", 0.25); at("01-mystere", 1.75, "pop2", 0.3)
at("01-mystere", 3.45, "whoosh_f", 0.35); at("01-mystere", 3.8, "hit_soft", 0.7); at("01-mystere", 3.82, "hit_wood", 0.35)
at("01-mystere", 6.15, "pop2", 0.35); at("01-mystere", 6.45, "pop3", 0.3)
at("01-mystere", 7.1, "riser", 0.3); at("01-mystere", 7.9, "heart", 0.5)
# 2 1948
at("02-1948", 0.1, "whoosh_f", 0.3); at("02-1948", 2.85, "whoosh_f", 0.3)
serie("02-1948", 3.3, 4.6, 14, "tick", 0.3); at("02-1948", 4.65, "hit_soft", 0.4); at("02-1948", 5.3, "pop3", 0.3)
# 3 vision
at("03-vision", 3.65, "pop1", 0.3); at("03-vision", 4.05, "hit_soft", 0.5); at("03-vision", 5.4, "pop2", 0.3)
at("03-vision", 6.95, "whoosh_f", 0.25); at("03-vision", 7.0, "sparkle", 0.3); at("03-vision", 7.1, "pop3", 0.3)
at("03-vision", 8.6, "hit_soft", 0.4); at("03-vision", 9.7, "pop2", 0.3)
at("03-vision", 11.75, "whoosh_f", 0.25); at("03-vision", 11.8, "sparkle", 0.3); at("03-vision", 12.6, "pop1", 0.3)
# 4 valeurs : une carte qui glisse, tombe, est scotchee, pour chacune
at("04-valeurs", 0.3, "whoosh_f", 0.3); at("04-valeurs", 1.5, "hit_soft", 0.5)
for d in sc["04-valeurs"]["debuts"]:
    at("04-valeurs", d + 0.02, "slide_paper", 0.55); at("04-valeurs", d + 0.4, "hit_wood", 0.35)
    at("04-valeurs", d + 0.5, "click", 0.4); at("04-valeurs", d + 0.6, "pop2", 0.25)
# 5 frise
at("05-frise", 0.0, "riser", 0.2)
for t in (1.0, 4.2, 8.6): at("05-frise", t, "pop1", 0.35)
serie("05-frise", 1.2, 2.4, 10); serie("05-frise", 5.2, 6.4, 12); serie("05-frise", 8.8, 9.9, 10)
at("05-frise", 4.55, "whoosh_fall", 0.5); at("05-frise", 5.0, "impact_big", 0.55); at("05-frise", 5.1, "chime", 0.35)
at("05-frise", 5.45, "click", 0.35); at("05-frise", 5.5, "click", 0.3); at("05-frise", 7.25, "pop3", 0.3)
at("05-frise", 10.35, "stomp", 0.7); serie("05-frise", 10.2, 11.5, 8, "tick", 0.25)
# 6 chiffres
for t0 in (1.2, 3.2, 5.2):
    at("06-chiffres", t0, "pop1", 0.3); at("06-chiffres", t0 + 0.05, "riser", 0.18)
    serie("06-chiffres", t0, t0 + 1.3, 16, "tick", 0.28); at("06-chiffres", t0 + 1.35, "bells", 0.3)
# 7 salut
at("07-salut", 0.9, "pop1", 0.3); at("07-salut", 3.7, "whoosh_fall", 0.35)
at("07-salut", 4.4, "shutter", 0.55); at("07-salut", 4.45, "hit_soft", 0.4); at("07-salut", 4.55, "click", 0.3)
at("07-salut", sg("07-salut", "f") + 0.1, "chime", 0.4)
# 8 releve
at("08-releve", 1.5, "sparkle", 0.3); at("08-releve", 2.0, "hit_soft", 0.5)
# 9 theme
for i in range(4): at("09-theme", 2.4 + i*0.2, ["pop1","pop2","pop3","pop1"][i], 0.3)
at("09-theme", 4.6, "riser", 0.3); at("09-theme", 5.6, "impact_big", 0.55); at("09-theme", 5.65, "chime", 0.3)
# 10 ntms
for i_ in "bcdef": at("10-ntms", sg("10-ntms", i_) - 0.05, "pop2", 0.3)
at("10-ntms", sg("10-ntms", "d") - 0.55, "whoosh_big", 0.4); at("10-ntms", sg("10-ntms", "d") - 0.3 + 0.35, "hit_soft", 0.4)
for t0 in (0.4,) + tuple(sg("10-ntms", i_) for i_ in "bcdef"): at("10-ntms", t0 + 0.2, "pop1", 0.2)
# 11 appel
for t0 in (1.4, 3.2, 5.0): at("11-appel", t0, "pop3", 0.4)
for t0 in (1.4, 5.0): at("11-appel", t0 + 0.45, "poof", 0.4); at("11-appel", t0 + 0.45, "party", 0.3)
for k in range(6): at("11-appel", 0.5 + k*0.12, "popclick", 0.22)
at("11-appel", sc["11-appel"]["duree"] - 2.0, "riser", 0.3)
# 12 logo : AUCUN son (demande)

E.sort(); noms = sorted({n for _, n, _ in E})
ins = []; idx = {n: i for i, n in enumerate(noms)}
for n in noms: ins += ["-i", os.path.join(ici, "banque", n + ".wav")]
cnt = {n: sum(1 for e in E if e[1] == n) for n in noms}
parts = []; labs = []
for n in noms:
    c = cnt[n]; outs = "".join(f"[{n}_{k}]" for k in range(c))
    parts.append(f"[{idx[n]}:a]" + (f"asplit={c}{outs}" if c > 1 else f"anull[{n}_0]"))
used = {n: 0 for n in noms}
for j, (t, n, g) in enumerate(E):
    k = used[n]; used[n] += 1; ms = max(0, int(t * 1000))
    parts.append(f"[{n}_{k}]volume={g},adelay={ms}|{ms}[e{j}]"); labs.append(f"[e{j}]")
fc = ";".join(parts) + ";" + "".join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={TOTAL},atrim=0:{TOTAL}[o]"
open(os.path.join(ici, "bruitages.filtre.txt"), "w").write(fc)
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *ins, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", "-ac", "1", os.path.join(ici, "sfx-reels.wav")], check=True)
print(len(E), "bruitages enregistrés placés ;", len(noms), "sons différents")
