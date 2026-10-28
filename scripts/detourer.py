#!/usr/bin/env python3
"""Detoure un personnage dessine sur fond blanc uni : le blanc RELIE AU BORD de l'image devient
transparent (le blanc a l'interieur du dessin, entoure par le trait, est garde : yeux, museau...).

    python3 scripts/detourer.py mascottes/renard/apres.jpg mascottes/renard/apres.png
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

entree, sortie = sys.argv[1], sys.argv[2]
im = Image.open(entree).convert("RGB")
a = np.asarray(im).astype(np.int16)

# « presque blanc » : clair et peu sature (tolere la compression JPEG)
clair = a.min(axis=2) > 225
gris = (a.max(axis=2) - a.min(axis=2)) < 22
fond_possible = clair & gris

# ne garder que le blanc connecte au bord
etiquettes, _ = ndimage.label(fond_possible)
bords = np.unique(np.concatenate([etiquettes[0], etiquettes[-1], etiquettes[:, 0], etiquettes[:, -1]]))
fond = np.isin(etiquettes, bords[bords > 0])

# bord doux : on grignote 1 px de halo blanc, puis on adoucit l'alpha
fond = ndimage.binary_dilation(fond, iterations=1)
alpha = Image.fromarray(np.where(fond, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))

rgba = im.copy()
rgba.putalpha(alpha)
rgba.save(sortie)
print(f"ok {sortie} {im.size[0]}x{im.size[1]}")
