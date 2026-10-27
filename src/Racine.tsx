import { Composition } from "remotion";
import { Essai } from "./Essai";
import { EddyTest } from "./EddyTest";
import { Eddy1, DUREE_V1 } from "./Eddy1";
import { Test3D } from "./Test3D";
import { Episode1, DUREE_EP1 } from "./serie/Episode1";
import { Episode2, DUREE_EP2 } from "./serie/Episode2";
import { Episode3, DUREE_EP3 } from "./serie/Episode3";
import { StyleA, StyleB, StyleC } from "./Styles";

/** La liste des videos du projet. Une `Composition` = une video. */
export const Racine: React.FC = () => (
  <>
    <Composition
      id="Essai"
      component={Essai}
      durationInFrames={60}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="EddyTest" component={EddyTest} durationInFrames={1} fps={30} width={960} height={720} />
    <Composition id="Eddy1" component={Eddy1} durationInFrames={DUREE_V1} fps={30} width={1080} height={1920} />
    <Composition id="Episode1" component={Episode1} durationInFrames={DUREE_EP1} fps={30} width={1080} height={1920} />
    <Composition id="Episode2" component={Episode2} durationInFrames={DUREE_EP2} fps={30} width={1080} height={1920} />
    <Composition id="Episode3" component={Episode3} durationInFrames={DUREE_EP3} fps={30} width={1080} height={1920} />
    <Composition id="Test3D" component={Test3D} durationInFrames={450} fps={30} width={1080} height={1920} />
    {/* Trois directions artistiques, en images fixes (1 image = 1 composition). */}
    <Composition id="StyleA" component={StyleA} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="StyleB" component={StyleB} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="StyleC" component={StyleC} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
