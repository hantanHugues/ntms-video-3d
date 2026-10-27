# Videos du NTMS 2026

Projet **independant du site** : il a son propre `package.json`, ses
propres dependances, et le site ne le compile ni ne le deploie
(`tsconfig.json`, `eslint.config.mjs` et `.gitignore` de la racine
l'ignorent). Les videos sont ecrites comme des pages web (React) avec
[Remotion](https://www.remotion.dev), puis rendues en MP4.

> **Direction artistique, narration et regles du projet :** voir le skill
> [`.claude/skills/ntms-video/SKILL.md`](../.claude/skills/ntms-video/SKILL.md).
> Claude le relit avant de travailler sur une video ; il vaut aussi comme
> guide pour toute personne qui reprend le dossier.

## Ce qu'il y a dedans

| | |
|---|---|
| `src/Racine.tsx` | la liste des videos : une `Composition` = une video |
| `src/charte.ts` | les couleurs de la charte NTMS |
| `src/Essai.tsx` | une scene d'essai (2 s) |
| `rendre.sh` | la commande qui rend une video en MP4 |
| `node_modules/node` | Node 22, **local a ce dossier** (le Node du Mac est trop ancien) |
| `bin/ffmpeg` | ffmpeg 9.0.2 autonome, pour Mac Intel (non commite) |

## Les outils de motion design (`outils/claude-motion`)

Dépôt tiers [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion)
(licence MIT), cloné dans `outils/claude-motion/` et **ignoré par git**.
Il apporte des règles de motion design chiffrées (`.claude/skills/`), une
boucle de vérification des images (planches-contact) et un **moteur de sons
procédural en Python** (whoosh, pops, nappes, mastering −14 LUFS).
Il a ses propres versions (Remotion 4.0.529) : ne jamais le mélanger au
projet principal (4.0.537).

```bash
cd video
export PATH="$PWD/node_modules/node/bin:$PWD/bin:$PATH"
export REMOTION_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cd outils/claude-motion
python3 -m sfx --list                      # les generateurs de sons
python3 -m sfx sfx/cues/effort.py          # son de l'exemple -> public/sfx.wav
./node_modules/.bin/remotion still EffortVideo out/image.png --frame=300
# Rendu video : meme methode en deux temps que rendre.sh (le ffmpeg de
# Remotion plante sous macOS 13) :
./node_modules/.bin/remotion render EffortVideo out/images --sequence --image-format=jpeg --scale=0.5
ffmpeg -y -framerate 60 -pattern_type glob -i 'out/images/element-*.jpeg' -i public/sfx.wav \
  -map 0:v -map 1:a -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest out/essai.mp4
```

Non installe : le navigateur de Playwright (`npx playwright install
chromium`, utile seulement pour les simulations 3D) et le serveur MCP
ElevenLabs (payant, optionnel).

## Utiliser

```bash
cd video
./rendre.sh Essai            # → out/Essai.mp4
./rendre.sh Essai 30 son.mp3 # avec une musique (fichier libre de droits)

# Pour voir et regler l'animation en direct, dans le navigateur :
PATH="$PWD/node_modules/node/bin:$PATH" npm run studio
```

## A savoir

- **Pourquoi deux temps pour le rendu.** Le ffmpeg integre a Remotion est
  compile pour macOS 15 ; ce Mac est en macOS 13 et il plante a
  l'assemblage. Remotion dessine donc les images, et `bin/ffmpeg` fait le
  MP4. Sur un Mac recent, `remotion render` seul suffit.
- **Versions identiques.** `remotion` et `@remotion/*` doivent avoir
  **exactement** la meme version (4.0.537) : ne jamais en mettre a jour une
  seule.
- **Cache npm local.** `~/.npm` a eu un souci de droits : on installe avec
  `npm i --cache "$PWD/.npm-cache"`.
- **Navigateur.** Le Chrome du Mac fait le rendu (`remotion.config.ts`) :
  rien a telecharger.
- **Licence de Remotion.** Gratuite pour un individu, une organisation a
  but non lucratif, ou une entreprise de 3 personnes au plus. A refaire
  verifier si le statut d'AIESEC in Benin est autre.
- **Eddy** est la mascotte officielle d'AIESEC : faire valider son usage
  par le comite avant de publier une video.
- **`bin/ffmpeg`** vient de evermeet.cx (version 9.0.2, binaire non signe,
  signature GPG non verifiee). Sa taille correspond a celle annoncee.
- Rien de ce dossier, sauf le code source, n'est commite : `node_modules/`,
  `bin/`, `out/` et `.npm-cache/` sont ignores.
