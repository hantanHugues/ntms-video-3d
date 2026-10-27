import { Config } from "@remotion/cli/config";

// Le Chrome deja installe sur le Mac fait le rendu : pas de second
// navigateur a telecharger.
Config.setBrowserExecutable(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
);
Config.setChromiumOpenGlRenderer(process.platform === "darwin" ? "angle" : "swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
