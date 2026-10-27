#!/usr/bin/env python3
"""Telecharge les bruitages ENREGISTRES (Mixkit, licence gratuite) et prepare chaque son (mono, court, fondu)."""
import os, subprocess, urllib.request
ici = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get("FFMPEG") or (os.path.join(ici, "..", "bin", "ffmpeg") if os.path.exists(os.path.join(ici, "..", "bin", "ffmpeg")) else "ffmpeg")
# nom : (id Mixkit, duree gardee en s, fondu final en s, titre)
BANQUE = {
 "whoosh_t":  (1492, 1.0, 0.25, "Cinematic whoosh fast transition"),
 "whoosh_f":  (1490, 1.0, 0.25, "Fast whoosh transition"),
 "whoosh_fall": (1469, 1.0, 0.25, "Flying fast swoosh"),
 "whoosh_big": (1486, 2.2, 0.8, "Cinematic tunnel reverb woosh"),
 "impact_big": (788, 3.2, 1.6, "Big cinematic impact"),
 "hit_soft":  (2299, 1.0, 0.3, "Short bass hit"),
 "hit_wood":  (2182, 1.0, 0.3, "Wood hard hit"),
 "stomp":     (3049, 1.0, 0.3, "Quest game heavy stomp"),
 "pop1":      (2354, 0.8, 0.15, "Message pop alert"),
 "pop2":      (2356, 0.8, 0.15, "Dry pop up notification alert"),
 "pop3":      (2358, 0.8, 0.15, "Long pop"),
 "popclick":  (2364, 0.5, 0.1, "Hard pop click"),
 "slide_paper": (1530, 1.0, 0.2, "Paper slide"),
 "click":     (1117, 0.5, 0.1, "Classic click"),
 "tick":      (1125, 0.4, 0.1, "Typewriter soft click"),
 "shutter":   (1430, 1.0, 0.2, "Camera shutter hard click"),
 "sparkle":   (871, 1.2, 0.4, "Fairy magic sparkle"),
 "chime":     (3108, 2.0, 1.0, "Crystal chime"),
 "bells":     (938, 2.0, 0.8, "Uplifting bells notification"),
 "poof":      (3082, 1.5, 0.6, "Magic sparkle poof hit"),
 "riser":     (790, 2.0, 0.3, "Cinematic trailer riser"),
 "heart":     (490, 1.0, 0.3, "Human single heart beat"),
 "party":     (530, 1.6, 0.4, "Happy party horn sound"),
 "walk":      (1269, 2.4, 0.4, "Walking on stones loop"),
 "logo":      (2900, 4.0, 2.0, "Movie logo intro impact"),
 "page":      (1104, 1.0, 0.3, "Page turn single"),
 "livre":     (1101, 1.8, 0.5, "Single book paging"),
 "rembobine": (1088, 2.0, 0.6, "Tape rewind cinematic transition"),
}
os.makedirs(os.path.join(ici, "banque"), exist_ok=True)
for nom, (id_, dur, fade, titre) in BANQUE.items():
    brut = os.path.join(ici, "banque", f"{nom}.mp3"); net = os.path.join(ici, "banque", f"{nom}.wav")
    if not os.path.exists(brut):
        req = urllib.request.Request(f"https://assets.mixkit.co/active_storage/sfx/{id_}/{id_}-preview.mp3", headers={"User-Agent": "Mozilla/5.0"})
        open(brut, "wb").write(urllib.request.urlopen(req, timeout=60).read())
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", brut, "-t", str(dur), "-af",
                    f"aresample=44100,pan=mono|c0=c0,afade=t=out:st={max(0, dur-fade)}:d={fade}", "-ar", "44100", net], check=True)
    print("ok", nom, "-", titre)
