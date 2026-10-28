#!/bin/bash
# Rendu LOCAL complet d'un episode : images -> bande-son -> logo AIESEC muet -> EpisodeN.mp4 a la racine.
#   ./rendre-episode.sh 2
set -euo pipefail
cd "$(dirname "$0")"
E="${1:?Donne le numero de l episode : 1, 2 ou 3}"
mkdir -p out
echo "== Images (Episode$E)"
npx remotion render src/index.ts "Episode$E" "out/video$E.mp4" --codec=h264 --crf=16 --jpeg-quality=100 --port=3877
echo "== Bande-son"
python3 serie/mixer.py "ep$E"
echo "== Assemblage + logo muet"
ffmpeg -hide_banner -loglevel error -y -i "out/video$E.mp4" -t 5 -i assets/logo-aiesec.mov -i "out/serie/ep$E-son.wav" -filter_complex \
  "color=c=white:s=1080x1920:r=30:d=5[bg];[1:v]fps=30,scale=iw*1.6:-1,format=yuva444p[lg];[bg][lg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p,setsar=1[fin];[0:v]format=yuv420p,setsar=1[deb];[deb][fin]concat=n=2:v=1:a=0[v];[2:a]apad=pad_dur=5.2[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 16 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -shortest -movflags +faststart "Episode$E.mp4"
echo "Termine : Episode$E.mp4"
