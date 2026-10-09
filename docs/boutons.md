# Boutons de l'accueil et de l'introduction

Passe du 9 octobre 2026 (version 0.2.0). Public : des adultes qui cherchent une rencontre moins jouée que le swipe, et leurs amis, qui valident un profil.

| Écran | Stade | Avant | Après | Test « Je veux... » |
|---|---|---|---|---|
| Accueil | Découverte | Commencer | Créer mon profil validé par un ami | Je veux créer mon profil validé par un ami |
| Connexion, lien | Décision | Créer un compte | Créer mon profil | Je veux créer mon profil |
| Introduction, bienvenue | Considération | C'est parti | Ajouter mes photos | Je veux ajouter mes photos (l'étape suivante) |
| Introduction, dernière étape | Décision | Créer mon compte | Créer mon compte et mon code Wingman | Je veux mon code Wingman (donné à l'écran suivant) |
| Introduction, partage | Décision | Envoyer le lien | Demander à un ami de valider | Je veux demander à un ami de valider (ouvre le partage) |
| Page de l'ami, accueil | Découverte | C'est parti ! | Aider (prénom) | Je veux aider (prénom) |
| Page de l'ami, dernière étape | Décision | Valider | Valider le profil de (prénom) | Je veux valider le profil de (prénom) |

Inchangés, parce que fonctionnels : Continuer (étapes de saisie), Se connecter, Continuer avec Google, Je ferai ça plus tard, flèches de retour.

Les textes de `src/lib/i18n/translations.ts` suivent (FR et EN). Les pages écrivent encore leurs libellés en dur : seuls les réglages passent par ce fichier.

## Contrastes mesurés

Mesure sur le rendu réel (Chrome, 390 px), texte blanc sur le pire arrêt de chaque dégradé, fond contre la page `#0a0a0f`. Thème sombre uniquement, il n'y en a pas d'autre. Seuils : texte 4,5:1, fond 3:1.

| Bouton | Avant, texte | Après, dégradé | Après, texte | Fond contre la page |
|---|---|---|---|---|
| `.btn-primary` (accueil, Wingman) | 1,35 | cyan néon vers violet néon éclairci de 10 %, encre sombre | 4,67 | 4,67 |
| Violet vers fuchsia (connexion, bienvenue, dégradé principal) | 3,54 | violet-600 vers fuchsia-700 | 5,89 | 3,15 |
| Orange vers rose (création du compte) | 2,89 | orange-700 vers rose-600 | 4,53 | 3,78 |
| Cyan vers bleu (photos) | 2,37 | cyan-700 vers bleu-600 | 5,25 | 3,74 |
| Ambre vers orange (date de naissance) | 2,13 | ambre-700 vers orange-700 | 5,03 | 3,78 |
| Fuchsia, violet, indigo (partage du lien) | 3,54 | fuchsia-700, violet-600, indigo-600 | 5,54 | 3,06 |

Le sens des couleurs ne change pas, elles descendent d'un cran de luminosité. Les écrans protégés par la connexion n'ont pas pu être photographiés sans session : la mesure porte sur les classes réelles du code, posées dans la page de connexion.

## Icônes

Toutes les icônes viennent de `reicon-react`. Le glyphe cigarette (profil, tabac) n'a pas d'équivalent : tracé conservé en SVG local, à trancher.
