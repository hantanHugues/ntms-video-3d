#!/bin/bash
# Rend une video du projet en MP4.
#
#   ./rendre.sh <Composition> [images_par_seconde] [fichier_audio]
#   ./rendre.sh Essai
#   ./rendre.sh Essai 30 musique.mp3
#
# Deux temps, car le ffmpeg integre a Remotion est compile pour macOS 15
# et plante sur ce Mac (macOS 13) :
#   1. Remotion dessine chaque image (Chrome) en JPEG ;
#   2. le ffmpeg de bin/ les assemble en MP4 (et ajoute l'audio si donne).
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$PWD/node_modules/node/bin:$PATH"

COMPO="${1:?Donne le nom de la composition, ex : ./rendre.sh Essai}"
FPS="${2:-30}"
AUDIO="${3:-}"
ECHELLE="${ECHELLE:-1}"   # ECHELLE=0.5 pour un brouillon
DOSSIER="out/${COMPO}-images"

rm -rf "$DOSSIER"
./node_modules/.bin/remotion render src/index.ts "$COMPO" "$DOSSIER" --sequence --image-format=jpeg --jpeg-quality=100 --scale="$ECHELLE"

# Controle : Chrome (sur ce Mac) dessine parfois UNE image de travers : ecran vide,
# ou « en carreaux ». Une telle image ne ressemble pas a ses deux voisines, alors
# que celles-ci se ressemblent entre elles. On les repere et on les redessine.
for PASSE in 1 2 3; do
  ./bin/ffmpeg -hide_banner -loglevel error -y -framerate "$FPS" -pattern_type glob -i "$DOSSIER/element-*.jpeg" \
    -vf "scale=72:128,format=gray" -f rawvideo "$DOSSIER/../controle.raw"
  MAUVAISES=$(python3 - "$DOSSIER/../controle.raw" <<'PY'
import sys
d = open(sys.argv[1], "rb").read(); W = 72 * 128; n = len(d) // W
fr = [d[i * W:(i + 1) * W] for i in range(n)]
mad = lambda a, b: sum(abs(x - y) for x, y in zip(a, b)) / W
vus = set()
for i in range(1, n - 1):
    for k in (1, 2, 3, 4):          # une suite de k images de travers : i .. i+k-1
        j = i + k
        if j >= n: break
        a, b, c = mad(fr[i-1], fr[i]), mad(fr[j-1], fr[j]), mad(fr[i-1], fr[j])
        if min(a, b) > 2.5 and c < 0.4 * min(a, b):
            vus.update(range(i, j)); break
for i in sorted(vus): print(i)
PY
)

  rm -f "$DOSSIER/../controle.raw"
  [ -z "$MAUVAISES" ] && break
  for N in $MAUVAISES; do
    echo "Image douteuse a refaire (passe $PASSE) : $N"
    CIBLE=$(ls "$DOSSIER"/element-*.jpeg | sed -n "$((N + 1))p")
    ./node_modules/.bin/remotion still src/index.ts "$COMPO" "$CIBLE" --frame="$N" --image-format=jpeg --jpeg-quality=100 --scale="$ECHELLE" >/dev/null
  done
done

ENTREES=(-framerate "$FPS" -pattern_type glob -i "$DOSSIER/element-*.jpeg")
SORTIE="out/${COMPO}.mp4"

if [ -n "${OUTRO:-}" ]; then
  # Fin « reseaux sociaux » : l'animation du logo (ProRes, fond transparent) posee
  # sur un fond blanc 9:16, collee apres la video. OUTRO_DUREE = secondes gardees.
  SON=(); MAPSON=(); if [ -n "$AUDIO" ]; then SON=(-i "$AUDIO"); MAPSON=(-map 2:a -c:a aac -b:a 192k -shortest); fi
  ./bin/ffmpeg -hide_banner -loglevel error -y "${ENTREES[@]}" -t "${OUTRO_DUREE:-5}" -i "$OUTRO" "${SON[@]}" \
    -filter_complex "color=c=white:s=1080x1920:r=$FPS:d=${OUTRO_DUREE:-5}[bg];[1:v]fps=$FPS,scale=iw*${OUTRO_ECHELLE:-1.6}:-1,format=yuva444p[lg];[bg][lg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p,setsar=1[fin];[0:v]scale=in_range=pc:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709,format=yuv420p,setsar=1[deb];[deb][fin]concat=n=2:v=1:a=0[v]" \
    -map "[v]" "${MAPSON[@]}" -c:v libx264 -preset slow -crf 14 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart "$SORTIE"
else
  if [ -n "$AUDIO" ]; then ENTREES+=(-i "$AUDIO" -c:a aac -b:a 192k -shortest); fi
  ./bin/ffmpeg -hide_banner -loglevel error -y "${ENTREES[@]}" \
    -vf "scale=in_range=pc:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
    -c:v libx264 -preset slow -crf 14 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -pix_fmt yuv420p -movflags +faststart "$SORTIE"
fi

rm -rf "$DOSSIER"
echo "Termine : video/$SORTIE"
