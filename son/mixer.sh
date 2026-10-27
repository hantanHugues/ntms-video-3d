#!/bin/bash
# Bande-son finale = voix + vrais bruitages + musique a NIVEAU CONSTANT et FAIBLE (pas de ducking).
#   ./son/mixer.sh   -> son/bande-son.wav + son/bande-son.mp3
set -euo pipefail
cd "$(dirname "$0")/.."
F=./bin/ffmpeg
TOTAL=$(python3 -c "import json;print(json.load(open('voix/calage.json'))['total'])")
# reperes de la video, lus dans le calage : debut du NTMS, fin de la partie sonore (le logo reste SILENCIEUX)
read NTMS FINMAIN < <(python3 -c "import json;s=json.load(open('voix/calage.json'))['scenes'];print(s['10-ntms']['debut'],s['12-logo']['debut'])")
D2=$(python3 -c "print(round($NTMS+0.5-16.5,2))")          # Discover : de 16,5 s jusqu'au NTMS
D3S=$(python3 -c "print(round($NTMS-3.0,2))")              # Driving Ambition : entre 3 s avant le NTMS
D3=$(python3 -c "print(round($FINMAIN-($NTMS-3.0),2))")    # ... et se termine exactement a la fin de l'appel
D3MS=$(python3 -c "print(int(round(($NTMS-3.0)*1000)))")
D2F=$(python3 -c "print(round($D2-3.5,2))"); D3F=$(python3 -c "print(round($D3-2.5,2))")
NIVEAU_MUSIQUE=-29   # LUFS : 13 dB sous la voix (-16)
DYN="dynaudnorm=f=800:g=31:p=0.95:m=30:s=5"
$F -hide_banner -loglevel error -y \
 -i voix/voix-calee.mp3 -i son/sfx-reels.wav \
 -i son/musique/valley-sunset.mp3 -i son/musique/discover.mp3 -i son/musique/driving-ambition.mp3 \
 -filter_complex "
 [0:a]aresample=44100,pan=stereo|c0=c0|c1=c0[vox];
 [1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,volume=0.8[sfx];
 [2:a]aresample=44100,$DYN,loudnorm=I=$NIVEAU_MUSIQUE:TP=-3:LRA=3,atrim=0:20,afade=t=in:st=0:d=1.2,afade=t=out:st=16.5:d=3.5:curve=qsin[m1];
 [3:a]aresample=44100,$DYN,loudnorm=I=$NIVEAU_MUSIQUE:TP=-3:LRA=3,atrim=0:$D2,afade=t=in:st=0:d=3.5:curve=qsin,afade=t=out:st=$D2F:d=3.5:curve=qsin,adelay=16500|16500[m2];
 [4:a]aresample=44100,$DYN,loudnorm=I=$NIVEAU_MUSIQUE:TP=-3:LRA=3,atrim=0:$D3,afade=t=in:st=0:d=3.5:curve=qsin,afade=t=out:st=$D3F:d=2.5:curve=qsin,adelay=$D3MS|$D3MS[m3];
 [m1][m2][m3]amix=inputs=3:normalize=0[mus];
 [vox][sfx][mus]amix=inputs=3:normalize=0:duration=longest,apad=whole_dur=$TOTAL,atrim=0:$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[o]" \
 -map "[o]" -ar 44100 son/bande-son.wav
$F -hide_banner -loglevel error -y -i son/bande-son.wav -c:a libmp3lame -b:a 192k son/bande-son.mp3
echo "ok : son/bande-son.mp3 ($TOTAL s)"
