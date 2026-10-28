# Instructions pour l'agent IA — série « Voyage avec Eddy » (NTMS 2026)

> Tu reprends un projet en cours. Lis ce fichier en entier avant de toucher à quoi que ce soit.
> Propriétaire : Hugues HANTAN (GitHub `hantanHugues`). Langue de travail : **français**, tutoiement.

## 1. De quoi il s'agit
Trois vidéos courtes (format **vertical 9:16, 1080×1920, 30 i/s**, ≤ 1 min 20 chacune) pour annoncer le
**NTMS 2026** d'AIESEC in Benin (18–22 novembre 2026, Lokossa) et fêter **plus de 20 ans** d'AIESEC au Bénin.
Personnage : **Eddy**, ancienne mascotte de la vision AIESEC 2015, figurine **plate** posée dans un décor 3D.

| Épisode | Composition | Contenu |
|---|---|---|
| 1 · Le livre | `Episode1` | Eddy se présente, ouvre le livre des débuts d'AIESEC (1948, la vision, miser sur les jeunes, 6 valeurs cachées) |
| 2 · La galerie | `Episode2` | 6 valeurs (en anglais), 3 anciens célèbres, carte (points qui se répandent → zoom Bénin), histoire au Bénin (2005, 2006, 2015), feuilletage des photos |
| 3 · Aujourd'hui et demain | `Episode3` | chiffres, merci aux anciens (photo 2006 → photos récentes), aux jeunes, NTMS 2026 + son thème, logo |

Les vidéos finales sont à la **racine** du dépôt : `Episode1.mp4`, `Episode2.mp4`, `Episode3.mp4`.

## 2. Installation sur un nouvel ordinateur
Prérequis : **Node 22**, **npm**, **ffmpeg**, **python3**, **git**, **gh** (GitHub CLI).

```bash
git clone https://github.com/hantanHugues/ntms-video-3d.git && cd ntms-video-3d
./installer.sh          # verifie les outils, npm ci, navigateur de rendu Remotion, banque de sons
```
- Les versions de Remotion sont **épinglées à 4.0.537** (tous les paquets `remotion` / `@remotion/*` doivent
  avoir exactement la même version). Ne pas mettre à jour sans raison.
- 3D : Remotion + Three.js (`@remotion/three`, `@react-three/fiber`, `three`). Le rendu 3D choisit
  automatiquement `angle` (macOS) ou `swangle` (Linux sans carte graphique), voir `remotion.config.ts`.
  Sur une machine avec carte graphique sous Linux, `--gl=angle` ou `--gl=egl` est bien plus rapide.
- **Windows** (PC du propriétaire : Ryzen 5 220 + RTX 5050) : `angle` = Direct3D, la carte graphique fait le rendu.
  ffmpeg : `winget install Gyan.FFmpeg`. Sur un portable à deux cartes, forcer la NVIDIA pour le navigateur de rendu
  (une fois, après `npx remotion browser ensure`) :
  ```bash
  reg add "HKCU\Software\Microsoft\DirectX\UserGpuPreferences" /v "<chemin>\node_modules\.remotion\chrome-headless-shell\win64\chrome-headless-shell-win64\chrome-headless-shell.exe" /t REG_SZ /d "GpuPreference=2;" /f
  ```
  Vérifier avec `nvidia-smi` pendant un rendu (`chrome-headless-shell.exe` doit apparaître). Mesuré : 300 images
  de l'épisode 1 en 43 s (≈ 7 i/s), soit ≈ 4–5 min par épisode, plus rapide que GitHub Actions.

## 3. Travailler
```bash
npx remotion studio src/index.ts                          # apercu interactif
npx remotion still src/index.ts Episode2 out/x.png --frame=1200 --scale=0.3 --port=3877   # une image
./rendre-episode.sh 2                                     # rendu local complet d'un episode (images + son + logo)
```
- Si le port 3000 est pris (ex. site Next.js lancé), ajouter `--port=3877`.
- **Rendu en ligne (recommandé, gratuit)** : GitHub → Actions → « **Rendre la serie (3 episodes)** » → Run workflow,
  champ `episodes` = `[2]` pour un seul épisode ou `[1,2,3]` pour tout. 4 machines par épisode, puis
  assemblage (son + logo) et dépôt à la racine. Compter ~20 à 50 min.
  Si seule l'étape son/assemblage échoue : workflow « **Assembler la serie (sans refaire les images)** »
  avec le numéro de l'exécution qui a rendu les images.

## 4. Où est quoi
| Chemin | Rôle |
|---|---|
| `src/serie/Episode1.tsx`, `Episode2.tsx`, `Episode3.tsx` | les trois épisodes |
| `src/serie/communs.tsx` | briques communes : salle et bureau 3D, livre 3D, Eddy plat, textes 3D (`Texte3D`, `Tape`), transitions, photos |
| `src/serie/ep1.json`… | **minutage** (généré, ne pas éditer à la main) |
| `serie/voix.py` | texte de la voix d'Eddy (validé par le propriétaire) + génération ElevenLabs |
| `serie/caler.py` | calcule le minutage à partir des durées de voix → `src/serie/epN.json` |
| `serie/mixer.py` | bande-son : voix + bruitages (Mixkit) + musique basse et constante |
| `serie/voix/epN/*.mp3` | voix générées (une phrase par fichier) |
| `serie/CREDITS.md` | crédits des images (à mettre dans la description des vidéos) |
| `public/serie/` | images (Wikimedia/NASA/Natural Earth), photos de conférences AIESEC in Benin, carte `pays.json` |
| `public/archives/gala-2006.jpg` | **seule vraie archive** : gala de 2006, Palais des Congrès |
| `assets/logo-aiesec.mov` | logo AIESEC animé, ajouté **muet** à la fin de chaque épisode |
| `son/banque.py` | télécharge et prépare les bruitages Mixkit (non stockés dans le dépôt) |

## 5. Modifier la voix (ElevenLabs)
1. Clé API dans `voix/.cle` (une ligne). **Ce fichier est ignoré par git : ne jamais afficher, coller ni committer la clé.** Demander la clé au propriétaire.
2. Modifier le texte dans `serie/voix.py`, supprimer le(s) mp3 concerné(s) dans `serie/voix/epN/`, puis :
   ```bash
   python3 serie/voix.py      # ne regenere que les fichiers manquants
   python3 serie/caler.py     # nouveau minutage
   ```
3. Voix : **Victoria** (`O31r762Gb3WFygrEOGh0`), `eleven_multilingual_v2`, vitesse 0.95. Les nombres s'écrivent en
   toutes lettres (« deux mille quinze »). Le site web n'est **jamais lu** à voix haute (seulement affiché).

## 6. Règles du projet (non négociables)
- **Ne rien inventer.** Faits autorisés : AIESEC fondée en 1948 après la Seconde Guerre mondiale par des jeunes ;
  vision « la paix et le plein accomplissement du potentiel humain » ; plus de 100 pays et territoires ; 6 valeurs
  officielles (Striving for Excellence, Demonstrating Integrity, Activating Leadership, Living Diversity, Enjoying
  Participation, Acting Sustainably) ; au Bénin : née en 2005, première année fêtée en 2006 au Palais des Congrès,
  Eddy = mascotte de la vision AIESEC 2015, plus de 20 ans, 4 comités locaux, plus de 1000 jeunes touchés.
  Anciens célèbres **vérifiés** : Martti Ahtisaari, Mario Monti, Aníbal Cavaco Silva (**pas** Bill Clinton : non sourcé).
- **Thème du NTMS, mot pour mot** : « 20 ans d'existence : élever nos standards pour un meilleur impact. »
- Les images qui ne sont pas des archives d'AIESEC portent la mention **« Images d'illustration »** (coin inférieur).
- Photos **entières** (jamais recadrées au point de couper des personnes) : fond flou de la même photo.
- Une idée par plan, fond sombre et flou, texte animé mais pas sur chaque scène, Eddy = figurine plate (petits
  sauts, pas de marche réaliste). Le **logo AIESEC final est muet**. Musique **basse et constante**.
- Ton d'Eddy : curieux, un peu taquin, **sincère** avec les anciens et les jeunes. Jamais académique.

## 7. Git
- Identité des commits : `hantanhugues <hugueshantan@gmail.com>` (vérifier `git config user.name/email` avant de committer).
- **Ne pousser que si le propriétaire le demande.**
- Dépôts liés : site web `hantanHugues/NTMS_2026` (Next.js), ancien projet vidéo privé `hantanHugues/ntms-video`.

## 8. Pièges déjà rencontrés (et résolus)
- `ThreeCanvas` : ne **jamais** le remonter (changement de `key`) quand des images finissent de charger →
  plantage « addEventListener of null ». On ne monte la scène 3D qu'une fois les images prêtes (`pret ? <Scene3D/> : null`).
- Images/textures : charger **hors** de la 3D (`useImages`), puis passer les textures en props.
- Dans une `<Sequence from=…>`, `useCurrentFrame()` est **local** à la séquence : attention aux minutages absolus.
- Les plans de caméra se décrivent avec `parcours(f, [[image, Cam], …])` ; la caméra doit **arriver avant** que la voix parle.
- Sur un vieux Mac (macOS 13), le ffmpeg intégré à Remotion plante et Chrome rate parfois des images :
  inutile sur une machine récente ou Linux.

## 9. Où en est le projet
- Version 2 des 3 épisodes rendue et validée en grande partie par le propriétaire.
- Avant publication : mettre les crédits de `serie/CREDITS.md` (Monti, Cavaco Silva : CC BY) dans la description.
- Idées non faites : version horizontale 16:9, version courte (stories).
