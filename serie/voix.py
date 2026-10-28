#!/usr/bin/env python3
"""Voix d'Eddy pour la serie en 3 episodes (texte valide le 27/10/2026).
   python3 serie/voix.py            -> genere tout ce qui manque
   python3 serie/voix.py ep1 ep3    -> seulement ces episodes (regenere)
La cle est lue dans voix/.cle (ignoree par git), jamais affichee."""
import json, os, re, subprocess, sys, urllib.request, urllib.error
ici = os.path.dirname(os.path.abspath(__file__)); racine = os.path.dirname(ici)
cle = open(os.path.join(racine, "voix", ".cle")).read().strip()
VOIX = "O31r762Gb3WFygrEOGh0"   # Victoria
FF = os.environ.get("FFMPEG") or (os.path.join(racine, "bin", "ffmpeg") if os.path.exists(os.path.join(racine, "bin", "ffmpeg")) else "ffmpeg")
# ton : "taquin" (plus expressif), "recit" (pose), "sincere" (doux, sans humour)
TONS = {"taquin": (0.35, 0.55), "recit": (0.5, 0.3), "sincere": (0.6, 0.2)}
EPISODES = {
 "ep1": [
  ("s1a", "taquin", "Hey AIESEC, what's up !"),
  ("s1b", "taquin", "Moi, c'est Eddy, la mascotte de la vision AIESEC 2015."),
  ("s1c", "taquin", "Ça fait un bail, hein ?"),
  ("s1d", "taquin", "Bon, pendant tout ce temps, je suis resté rangé dans les archives… et j'y ai retrouvé un vieux livre sur les débuts d'AIESEC. Viens, on regarde ça."),
  ("s2a", "recit", "Après la Seconde Guerre mondiale, le monde se reconstruit."),
  ("s2b", "recit", "Les villes, mais aussi les relations entre les peuples."),
  ("s2c", "recit", "Et en mille neuf cent quarante-huit, des jeunes fondent AIESEC, avec une vision : la paix et le plein accomplissement du potentiel humain."),
  ("s3a", "recit", "L'idée, c'était de miser sur les jeunes."),
  ("s3b", "recit", "Leur donner l'occasion de découvrir d'autres cultures, de prendre des responsabilités et de développer leur leadership."),
  ("s4a", "recit", "Mais pour comprendre comment AIESEC fonctionne, il faut aussi parler de ses six valeurs."),
  ("s4b", "taquin", "Et ça, c'est la prochaine page."),
 ],
 "ep2": [
  ("s1a", "taquin", "Alors, nous y voilà. Les six valeurs d'AIESEC."),
  ("s1b", "recit", "Chacune représente un principe qui guide la façon dont on veut agir et former des leaders."),
  ("s2a", "recit", "Et ces valeurs ont formé des leaders. Certains ont même marqué la vie publique."),
  ("s2b", "recit", "Un ancien président de la Finlande, prix Nobel de la paix."),
  ("s2c", "recit", "Un ancien Premier ministre italien."),
  ("s2d", "recit", "Et un ancien président du Portugal."),
  ("s3a", "recit", "D'une génération à l'autre, l'organisation s'est développée dans le monde."),
  ("s3b", "recit", "Aujourd'hui, elle est présente dans plus de cent pays et territoires."),
  ("s3c", "recit", "Et au Bénin aussi, l'histoire a commencé à s'écrire."),
  ("s4a", "recit", "Au Bénin, AIESEC est née en deux mille cinq."),
  ("s4b", "recit", "Un an plus tard, on a célébré cette première année au Palais des Congrès. Et on en a gardé cette photo, devenue emblématique."),
  ("s4c", "recit", "Puis les années passent, les promotions se succèdent…"),
  ("s4d", "taquin", "jusqu'en deux mille quinze… ma grande époque !"),
  ("s5a", "taquin", "Et depuis, il s'est passé quoi ? On regarde ça dans le prochain épisode."),
 ],
 "ep3": [
  ("s1a", "taquin", "Bon, nous voilà revenus à aujourd'hui."),
  ("s1b", "recit", "Plus de vingt ans d'histoire, quatre comités locaux et plus de mille jeunes touchés."),
  ("s1c", "recit", "Quand on regarde tout ça, on se rend compte qu'il y a eu du chemin parcouru."),
  ("s2a", "sincere", "À tous ceux qui ont fait partie de cette aventure, à une époque ou à une autre : anciens membres, responsables, équipes…"),
  ("s2b", "sincere", "vous avez construit cette histoire."),
  ("s2c", "sincere", "Ces plus de vingt ans, c'est aussi grâce à vous. Alors venez les célébrer avec nous."),
  ("s3a", "sincere", "Et si tu viens de rejoindre AIESEC, sache que tu arrives dans une histoire qui a commencé bien avant toi."),
  ("s3b", "sincere", "Mais tu as aussi la possibilité d'y apporter quelque chose. C'est à ton tour de jouer."),
  ("s4a", "recit", "Du dix-huit au vingt-deux novembre, le NTMS deux mille vingt-six nous donne rendez-vous à Lokossa, sur le thème : vingt ans d'existence, élever nos standards pour un meilleur impact."),
  ("s4b", "recit", "Anciens, venez célébrer avec nous. Jeunes, venez rencontrer ceux qui ont écrit cette histoire, et écrire la suite."),
  ("s5a", "taquin", "On se retrouve à Lokossa !"),
 ],
}
def duree(f):
    o = subprocess.run([FF, "-hide_banner", "-i", f, "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", o); return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
choix = sys.argv[1:] or list(EPISODES)
for ep in choix:
    dos = os.path.join(ici, "voix", ep); os.makedirs(dos, exist_ok=True)
    segs = EPISODES[ep]; tot = 0
    for i, (sid, ton, txt) in enumerate(segs):
        sortie = os.path.join(dos, sid + ".mp3")
        if not os.path.exists(sortie) or len(sys.argv) > 1:
            st, sty = TONS[ton]
            corps = {"text": txt, "model_id": "eleven_multilingual_v2",
                     "voice_settings": {"stability": st, "similarity_boost": 0.8, "style": sty, "use_speaker_boost": True, "speed": 0.95}}
            if i > 0: corps["previous_text"] = segs[i - 1][2]
            if i + 1 < len(segs): corps["next_text"] = segs[i + 1][2]
            req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}?output_format=mp3_44100_128",
                data=json.dumps(corps).encode(), method="POST",
                headers={"xi-api-key": cle, "Content-Type": "application/json", "Accept": "audio/mpeg"})
            try:
                with urllib.request.urlopen(req, timeout=180) as r, open(sortie, "wb") as f: f.write(r.read())
            except urllib.error.HTTPError as e:
                print("ECHEC", ep, sid, e.code, e.read().decode()[:150]); continue
        d = duree(sortie); tot += d
        print(f"{ep} {sid:4} {d:5.1f}s  {txt[:70]}")
    print(f"== {ep} : {tot:.1f} s de voix\n")
