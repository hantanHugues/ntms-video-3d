#!/bin/bash
# Installe tout ce qu'il faut pour travailler sur la serie « Voyage avec Eddy ».
# macOS ou Linux. Ne demande jamais de mot de passe administrateur : s'il manque un outil, il le dit.
set -uo pipefail
cd "$(dirname "$0")"
manque=0
verifie() { if command -v "$1" >/dev/null 2>&1; then echo "  ok  $1 : $($1 --version 2>&1 | head -1)"; else echo "  MANQUE  $1  ($2)"; manque=1; fi; }
echo "== Outils"
verifie node "Node 22 : https://nodejs.org ou 'brew install node@22'"
verifie npm "fourni avec Node"
verifie ffmpeg "'brew install ffmpeg' (macOS) ou 'sudo apt install ffmpeg' (Linux)"
verifie python3 "https://www.python.org"
verifie git "https://git-scm.com"
verifie gh "GitHub CLI : 'brew install gh' ou https://cli.github.com (pour lancer les rendus en ligne)"
if command -v node >/dev/null 2>&1; then
  v=$(node -p "process.versions.node.split('.')[0]"); [ "$v" -lt 20 ] && { echo "  Node $v trop ancien : il faut Node 22."; manque=1; }
fi
[ "$manque" = 1 ] && { echo; echo "Installe d'abord les outils marques MANQUE, puis relance ./installer.sh"; exit 1; }

if [ "$(uname)" = "Linux" ] && command -v apt-get >/dev/null 2>&1; then
  echo "== Linux : bibliotheques du navigateur de rendu (une seule fois, demande sudo) :"
  echo "   sudo apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2t64 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2"
fi
echo "== Paquets (versions exactes du package-lock)"
npm ci || exit 1
echo "== Navigateur de rendu Remotion"
npx remotion browser ensure || exit 1
echo "== Banque de bruitages (Mixkit, telecharges)"
python3 son/banque.py >/dev/null && echo "  ok"
echo "== Verification : une image de l'episode 1"
mkdir -p out && npx remotion still src/index.ts Episode1 out/verification.png --frame=120 --scale=0.3 --port=3877 >/dev/null 2>&1 \
  && echo "  ok : out/verification.png" || echo "  ECHEC du rendu d'essai : lire AGENTS.md section 8"
echo; echo "Pret. Lire AGENTS.md pour la suite."
