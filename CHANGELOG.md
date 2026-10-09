# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-10-09

### Les boutons disent ce que l'on gagne

L'accueil propose « Créer mon profil validé par un ami », la première étape de l'introduction « Ajouter mes photos », la fin « Créer mon compte et mon code Wingman », l'envoi du lien « Demander à un ami de valider ». Côté ami, « Aider » suivi du prénom ouvre le témoignage et la dernière étape devient « Valider le profil de » suivi du prénom. Inventaire : `docs/boutons.md`.

### Migration des icônes vers Reicon

Les 66 icônes viennent de `reicon-react`, `lucide-react` disparaît des dépendances et de la documentation. Le glyphe cigarette n'a pas d'équivalent chez Reicon : son tracé reste en SVG local (`src/components/ui/icons/Cigarette.tsx`), à trancher. Les pastilles pleines (statut en ligne, arrêt de l'enregistrement) prennent la graisse `Filled`.

### Fixed

- CI: the E2E workflow builds again (unused declarations removed from Onboarding), has the permissions its result publisher needs, and runs on Node 22.
- CI: only the `@public` E2E tests run until an authenticated session fixture exists (#11).
- Auth: the password visibility toggle now carries an accessible label.

## [0.1.0] - 2026-10-07

First tagged release. Latest changes:

- docs: add colors to mermaid diagrams (#9)
- chore: star-history retire (#5)
- docs: add semver version badge (0.1.0) to README (#4)
- docs: typography pass, no em dash or middle dot (#1)
- docs: add MIT license
- docs: add star history chart to readme
- docs: add architecture diagram, badges and repo topics
- docs: add commits/visits/last-commit/language/license badges
- chore(topics): update .github/workflows/sync-topics.yml
- chore(topics): update .github/workflows/sync-topics.yml
- chore(topics): add .github/workflows/sync-topics.yml
- chore(topics): add .github/topics.yml
- docs: add shields.io badges to README
- docs: add LinkedIn link to footer
- docs: add branded footer linking to adam.beloucif.com
