"""Partition des bruitages de la video NTMS : un son par animation marquante.
Temps = debut de la sequence (calage.json) + instant LOCAL de l'animation dans la sequence."""
import sys
sys.path.insert(0, "outils/claude-motion")
from sfx import synth as S

SEED = 7
TARGET_LUFS = -20.0   # discret : la voix passe devant
OUT = "son/sfx.wav"

def score(mix, tl):
    sc = tl["scenes"]
    st = {k: v["debut"] for k, v in sc.items()}
    def at(scene, local): return st[scene] + local
    P = mix.put

    def impact(t, g=0.55, d=0.9): P(t, S.impact(d), g)
    def pop(t, g=0.35, f0=900, f1=400): P(t, S.pop(f0, f1, 0.14), g)
    def whoosh(t, d=0.7, f0=500, f1=4200, g=0.35): P(t, S.whoosh(d, f0, f1), g)
    def chime(t, g=0.28, notes=(784, 1175, 1568), d=1.4): P(t, S.chime(list(notes), d), g)
    def ticks(t0, t1, n, g=0.2): mix.typing(t0, t1, n, gain=(g*0.7, g))

    # --- transitions : un « whoosh » avant chaque coupure + un petit coup apres
    ordre = list(sc)
    for k in ordre[1:]:
        whoosh(st[k] - 0.55, 0.8, 350, 5200, 0.38); pop(st[k] + 0.05, 0.3, 700, 300)

    # --- 1. Mystere : pas d'Eddy, mots qui tombent, « Eddy. », « Chut. »
    for i in range(7): P(at("01-mystere", 0.15 + i*0.33), S.click(220, 0.06), 0.35)
    pop(at("01-mystere", 1.0)); pop(at("01-mystere", 1.45), 0.3, 700, 300); pop(at("01-mystere", 1.75), 0.3, 800, 350)
    whoosh(at("01-mystere", 3.45), 0.5, 300, 2500, 0.3); impact(at("01-mystere", 3.8), 0.6)
    pop(at("01-mystere", 6.15), 0.3, 500, 700); pop(at("01-mystere", 6.45), 0.25, 550, 750)
    P(at("01-mystere", 7.55), S.riser(0.5, 200, 1500), 0.25); impact(at("01-mystere", 7.85), 0.35, 1.2)

    # --- 2. 1948 : compteur qui defile
    whoosh(at("02-1948", 0.1), 0.6, 400, 3000, 0.28)
    whoosh(at("02-1948", 2.85), 0.5, 400, 3000, 0.28)
    ticks(at("02-1948", 3.3), at("02-1948", 4.6), 16, 0.2); impact(at("02-1948", 4.65), 0.35, 0.8)
    pop(at("02-1948", 5.3), 0.25)

    # --- 3. Vision : « la paix », cercles qui s'etendent
    impact(at("03-vision", 0.78), 0.45); pop(at("03-vision", 1.3)); pop(at("03-vision", 2.9), 0.3, 800, 500)
    chime(at("03-vision", 5.6), 0.22); whoosh(at("03-vision", 5.55), 0.8, 300, 2200, 0.25)
    pop(at("03-vision", 5.7), 0.4, 600, 800); impact(at("03-vision", 7.75), 0.45); pop(at("03-vision", 9.1), 0.3)
    chime(at("03-vision", 11.8), 0.22); whoosh(at("03-vision", 11.75), 0.8, 300, 2200, 0.25); pop(at("03-vision", 12.6), 0.3)

    # --- 4. Valeurs : une carte qui glisse, tombe, est scotchee, pour chacune des six
    a = sc["04-valeurs"]
    for i, d in enumerate(a["debuts"]):
        t = st["04-valeurs"] + d
        whoosh(t + 0.02, 0.45, 400, 3000, 0.3); impact(t + 0.4, 0.3, 0.6)
        P(t + 0.5, S.click(2600, 0.04), 0.3); pop(t + 0.6, 0.25, 1000, 600)
    whoosh(at("04-valeurs", 0.3), 0.6, 300, 3000, 0.3); impact(at("04-valeurs", 1.5), 0.6)

    # --- 5. Frise : trait qui se dessine, points, compteurs, chute d'Eddy, tampon
    P(at("05-frise", 0.0), S.riser(1.8, 300, 1400), 0.2)
    for tl_ in (1.0, 4.2, 8.6): pop(at("05-frise", tl_), 0.35, 1100, 500)
    ticks(at("05-frise", 1.2), at("05-frise", 2.4), 10, 0.18)
    ticks(at("05-frise", 5.2), at("05-frise", 6.4), 12, 0.18)
    ticks(at("05-frise", 8.8), at("05-frise", 9.9), 10, 0.18)
    whoosh(at("05-frise", 4.55), 0.5, 3500, 300, 0.4)        # Eddy tombe
    impact(at("05-frise", 5.03), 0.9, 1.1)                    # il atterrit
    chime(at("05-frise", 5.1), 0.3, (659, 988, 1319), 1.6)   # ses couleurs apparaissent
    P(at("05-frise", 5.45), S.click(2600, 0.04), 0.3); P(at("05-frise", 5.5), S.click(2400, 0.04), 0.3)
    for tl_ in (7.25, ): pop(at("05-frise", tl_), 0.3, 700, 1000)
    impact(at("05-frise", 10.35), 0.7, 0.9); ticks(at("05-frise", 10.2), at("05-frise", 11.5), 8, 0.15)

    # --- 6. Chiffres : trois compteurs qui montent, eclat a l'arrivee
    for t0 in (1.2, 3.2, 5.2):
        P(at("06-chiffres", t0), S.riser(1.3, 250, 1800), 0.2)
        ticks(at("06-chiffres", t0), at("06-chiffres", t0 + 1.3), 20, 0.17)
        chime(at("06-chiffres", t0 + 1.35), 0.3); pop(at("06-chiffres", t0 + 0.05), 0.3)

    # --- 7. Salut : la photo tombe, le « Merci. »
    whoosh(at("07-salut", 3.7), 0.5, 3000, 300, 0.35); impact(at("07-salut", 4.4), 0.45, 0.7)
    P(at("07-salut", 4.5), S.click(2600, 0.04), 0.3); P(at("07-salut", 4.55), S.click(2300, 0.04), 0.3)
    pop(at("07-salut", 0.9), 0.3); chime(at("07-salut", 11.45), 0.3, (523, 784, 1047), 2.0)

    # --- 8. Releve
    chime(at("08-releve", 1.5), 0.25); impact(at("08-releve", 2.0), 0.5)

    # --- 9. Theme : barres qui montent, « impact. »
    for i in range(4): pop(at("09-theme", 2.4 + i*0.2), 0.3, 500 + i*150, 900 + i*150)
    P(at("09-theme", 4.6), S.riser(0.9, 250, 3000), 0.3)
    impact(at("09-theme", 5.6), 0.8, 1.1); chime(at("09-theme", 5.65), 0.25, (523, 784, 1047), 1.8)

    # --- 10. NTMS : deux generations, le cercle qui s'etend
    for t0 in (2.8, 6.0, 9.2, 12.4, 15.2): pop(at("10-ntms", t0 + 0.1), 0.3, 800, 500)
    whoosh(at("10-ntms", 8.95), 0.8, 300, 3500, 0.4); impact(at("10-ntms", 9.35), 0.45)
    for t0 in (0.4, 3.2, 6.2, 9.4, 12.6, 15.4): P(at("10-ntms", t0 + 0.2), S.blip(660, 0.18, 0.06), 0.18)

    # --- 11. Appel : Eddy saute, confettis, fondu vers le logo
    for t0 in (1.4, 3.2, 5.0): pop(at("11-appel", t0), 0.4, 500, 900)
    for t0 in (1.4, 5.0): impact(at("11-appel", t0 + 0.45), 0.45, 0.6); chime(at("11-appel", t0 + 0.45), 0.25, (784, 1175, 1568), 1.4)
    for k in range(6): pop(at("11-appel", 0.5 + k*0.12), 0.2, 700 + k*60, 400)
    P(at("11-appel", 8.2), S.riser(1.8, 300, 3500), 0.3)

    # --- 12. Logo AIESEC : signature sonore
    whoosh(at("12-logo", 0.0), 0.8, 500, 3500, 0.3); impact(at("12-logo", 1.4), 0.5, 1.0)
    chime(at("12-logo", 1.5), 0.3, (523, 784, 1047, 1568), 2.4)
