#!/usr/bin/env python3
"""Decoupe une planche de 4 vues (2 x 2 : face, dos / profil gauche, profil droit) en 4 images
carrees separees, fond blanc pur, sans les titres ni les lignes de repere. Format attendu par les
generateurs 3D multi-vues (Hunyuan3D-2mv, TRELLIS...).

    python3 scripts/decouper_vues.py mascottes/renard/vues-4.jpg mascottes/renard/vues
"""
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

entree, dossier = sys.argv[1], sys.argv[2]
os.makedirs(dossier, exist_ok=True)
im = Image.open(entree).convert("RGB")
W, H = im.size
NOMS = [["face", "dos"], ["profil-gauche", "profil-droit"]]

for ligne in range(2):
    for col in range(2):
        case = im.crop((col * W // 2, ligne * H // 2, (col + 1) * W // 2, (ligne + 1) * H // 2))
        a = np.asarray(case).astype(np.int16)
        # fond = clair et peu sature (blanc, lignes de repere grises, titres fins) relie au bord
        clair = a.min(axis=2) > 150
        gris = (a.max(axis=2) - a.min(axis=2)) < 30
        etiq, n = ndimage.label(clair & gris)
        bords = np.unique(np.concatenate([etiq[0], etiq[-1], etiq[:, 0], etiq[:, -1]]))
        fond = np.isin(etiq, bords[bords > 0])
        # le personnage = la plus grande tache non-fond (le texte, petit, est elimine)
        perso, m = ndimage.label(~fond)
        tailles = ndimage.sum(np.ones_like(perso), perso, range(1, m + 1))
        garde = np.isin(perso, 1 + np.flatnonzero(tailles > 0.02 * tailles.max()))
        # retire les petits morceaux de texte : on ne garde que ce qui touche la plus grande tache
        principal = perso == (1 + int(np.argmax(tailles)))
        proches = ndimage.binary_dilation(principal, iterations=12)
        garde &= np.isin(perso, np.unique(perso[proches & garde]))
        ys, xs = np.nonzero(garde)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        out = np.full_like(np.asarray(case), 255)
        out[garde] = np.asarray(case)[garde]
        rogne = Image.fromarray(out).crop((x0, y0, x1 + 1, y1 + 1))
        # carre, marge de 6 %, personnage centre
        cote = int(max(rogne.size) * 1.12)
        carre = Image.new("RGB", (cote, cote), (255, 255, 255))
        carre.paste(rogne, ((cote - rogne.size[0]) // 2, (cote - rogne.size[1]) // 2))
        nom = NOMS[ligne][col]
        carre.resize((1024, 1024), Image.LANCZOS).save(os.path.join(dossier, nom + ".png"))
        print("ok", nom, rogne.size)
