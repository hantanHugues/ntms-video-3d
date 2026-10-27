# Brief — la video « Eddy » du NTMS 2026

Etat des decisions au 22 octobre 2026. **Ce fichier fait foi** : en cas de
doute, il l'emporte sur les messages d'une longue conversation. Les regles
de travail sont dans `.claude/skills/ntms-video/SKILL.md`.

## 1. Objectif
- **1 a 2 minutes.** Donner envie de venir au NTMS 2026 (18–22 novembre,
  Lokossa) : **nostalgie** pour les alumni, **poids de vingt ans** pour les
  nouveaux.
- Deux formats, une seule animation : **9:16** et **16:9** (le 1:1 en
  option). Version courte de 30–45 s pour les stories.
- **Voix IA tres naturelle** (ni robotique, ni la voix « TikTok »). Sous-
  titres systematiques. **Pas de musique pour l'instant** (a chercher :
  banque libre de droits, verifier la licence de chaque morceau).
- But precis : le discours d'Eddy « donne l'eau a la bouche ».

## 2. Faits (seuls autorises)
| fait | source |
|---|---|
| AIESEC in Benin fete ses **20 ans** | comite |
| AIESEC est arrive au Benin en **2005** | comite |
| **Eddy** : mascotte de la vision AIESEC 2015, arrive en **2015** | comite |
| Theme : « 20 ans d'existence : elever nos standards pour un meilleur impact » | comite |
| NTMS 2026 = National Training and Motivation Seminar, **18–22 nov., Lokossa** | site |
| AIESEC fondee en **1948**, apres la guerre, par des jeunes d'Europe ; la paix ; dirigee par des jeunes ; **plus de 100 pays et territoires** | sources web |
| Six valeurs : excellence, integrite, leadership, diversite, participation, durabilite | planche + sources |

**Interdits** : inventer un fait ; nommer les fondateurs ou compter les
pays (sources contradictoires) ; **parler du gala de 2006** ; mentionner
un **prix** ; promettre un programme precis (il n'est pas publie).

## 3. Eddy
- **Mysterieux au debut** : « Hey AIESEC, what's up ! Moi, c'est Eddy. Qui
  je suis ? Chut. » — il se **revele dans la chronologie**, a 2015 (« la
  mascotte de la vision AIESEC 2015 »).
- Personnalite : malicieux, nostalgique, fier, passionne, complice. Tutoie.
- **Calque fidele** de l'image d'origine (jamais redessine a la main).
  Vue de dos seulement ; une vue de face est a dessiner et a faire valider.

## 4. Style
- **Retenu : le « carnet d'archives »** (style B) : papier lignete, encre
  brune, frise 2005 · 2015 · 2026, Eddy en sticker scotche, tampon « 20 ans ».
- Le « projecteur » (style C) peut servir a l'ouverture ; l'« affiche
  brique » (A) a l'appel final : **non confirme**.
- Regles de gout : une regle visuelle par video, une idee par ecran au
  centre, grands vides, un ou deux accents, aplats nets, accroche qui
  intrigue (voir la reference EGO, a ne pas copier).
- Charte : nuit `#001724`, brique `#79280E`, creme `#FFEBD1`, orange
  `#FF7A00`, sarcelle `#15676D`. Polices : Bricolage Grotesque, Lato.

## 5. Trame (a ajuster, ~1 min 45)
1. **Mystere** (0:00–0:20) : Eddy de dos, vent, « Hey AIESEC, what's up ! »,
   « Moi, c'est Eddy », « Qui je suis ? Chut. »
2. **Etre AIESECer** (0:20–0:40) : des jeunes qui dirigent pour des jeunes.
3. **Histoire** (0:40–1:05) : « Avant tout, remontons au debut. » 1948 →
   100+ pays → **2005, AIESEC arrive au Benin** → **2015, Eddy entre en
   scene : « moi, la mascotte de la vision AIESEC 2015 »** [revelation] →
   2026, 20 ans. Etapes intermediaires : **a fournir**.
4. **Ce qu'on gagne** (1:05–1:25) : apprendre, oser, rencontrer, retrouver ;
   formules generales, rien de precis sur le programme.
5. **Le theme** (1:25–1:40) : « elever nos standards pour un meilleur
   impact » ; quelques valeurs seulement.
6. **Appel** (1:40–1:55) : NTMS 2026 · 18–22 novembre · Lokossa ·
   `ntms26.aiesec.bj`. « Qui je suis ? Viens le decouvrir. » **(a valider)**

## 6. Ce qu'il manque
- [ ] **Les etapes de l'histoire au Benin** (2005 → 2026), verifiees par le comite.
- [ ] Les **cris AIESEC** en plus de « Hey AIESEC, what's up ! ».
- [ ] Ce que le NTMS apporte **concretement** (programme non publie).
- [ ] **La promesse de reveler Eddy a la conference** : oui ou non ?
- [ ] La **voix** : outil et reglages ; un fichier audio **par phrase**.
- [ ] La **musique**, licence verifiee.
- [ ] **Validation du comite** : Eddy, valeurs, scenario, photos.
- [ ] Format **1:1** : oui ou non ?

## 7. Etat technique (dans `video/`)
- Installe : Node 22 local, Remotion 4.0.537, ffmpeg 9.0.2 autonome,
  polices de la charte. **Rendu en deux temps** (`./rendre.sh`) a cause de
  macOS 13. Outils tiers (regles de motion design, moteur de sons) dans
  `outils/claude-motion/`, ignores par git.
- Fait : **Eddy calque** (`src/Eddy.tsx`), trois **images de style**
  (`src/Styles.tsx`, rendus dans `out/`), comparaison avec l'original.
- **Prochaine etape** : animer la scene « chronologie » en style B (~6 s),
  allegee, pour juger le mouvement ; puis l'acte 1.
- Le mouvement n'est **pas encore verifie** : seulement des images fixes.
