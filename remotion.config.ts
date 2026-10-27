import { Config } from "@remotion/cli/config";

// Sur le Mac : le Chrome deja installe fait le rendu (pas de second navigateur).
// Sur Linux (GitHub Actions) : Remotion telecharge son propre navigateur.
if (process.platform === "darwin") {
  Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
}
// 3D : ANGLE sur le Mac, SwiftShader (rendu logiciel) sur les serveurs sans carte graphique.
Config.setChromiumOpenGlRenderer(process.platform === "darwin" ? "angle" : "swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
