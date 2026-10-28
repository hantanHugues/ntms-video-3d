import { Config } from "@remotion/cli/config";

// Sur le Mac : le Chrome deja installe fait le rendu (pas de second navigateur).
// Sur Linux (GitHub Actions) : Remotion telecharge son propre navigateur.
if (process.platform === "darwin") {
  Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
}
// 3D : ANGLE sur le Mac et sur Windows (Direct3D : la carte graphique fait le rendu),
// SwiftShader (rendu logiciel) sur les serveurs Linux sans carte graphique.
// Sur un portable Windows a deux cartes, forcer la carte NVIDIA pour chrome-headless-shell.exe
// (Parametres > Affichage > Graphiques, ou la cle UserGpuPreferences : voir AGENTS.md).
Config.setChromiumOpenGlRenderer(process.platform === "darwin" || process.platform === "win32" ? "angle" : "swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
