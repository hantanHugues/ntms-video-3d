import { loadFont as chargerBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as chargerLato } from "@remotion/google-fonts/Lato";

/**
 * Les polices de la charte NTMS, comme sur le site : Bricolage Grotesque
 * pour les titres, Lato pour le texte. A importer UNE fois par video.
 */
const bricolage = chargerBricolage("normal", { weights: ["700", "800"], subsets: ["latin"] });
const lato = chargerLato("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const police = {
  titre: bricolage.fontFamily,
  texte: lato.fontFamily,
} as const;
