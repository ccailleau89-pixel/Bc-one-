# BC ONE — The Burger Currency

**Projet food-tech en préparation.** L'objectif immédiat est de concevoir un programme de fidélité utile aux clients et viable pour les commerçants, sans présenter de fonctionnalité inactive comme disponible.

## Liens

- [Site BC ONE](https://ccailleau89-pixel.github.io/Bc-one-/)
- [Burger ID](https://ccailleau89-pixel.github.io/Bc-one-/burger-id.html) — maquette ; authentification réelle à vérifier
- [Parcours fidélité](https://ccailleau89-pixel.github.io/Bc-one-/fidelite.html) — concept, aucune récompense active
- [Démo Crush Burger](https://ccailleau89-pixel.github.io/crush-burger-demo/) — expérience séparée en mode démonstration
- [Feuille de route MVP](ROADMAP_MVP.md)
- [État technique](PROJECT_STATUS.md)
- [Garde-fous sécurité et production](SECURITY_AND_RELEASE_GATES.md)
- [Audit du 18 octobre 2026](AUDIT_2026-10-18.md)

## État des fonctionnalités

- Site vitrine : publié.
- Tests de syntaxe, tests automatisés et build : suivis via GitHub Actions.
- Burger ID : interface préparée ; l'authentification réelle n'est pas validée.
- Fidélité : parcours de conception uniquement ; aucune récompense commerciale active n'est annoncée.
- Paiements, comptes clients de production et règlement commerçant : non actifs.

## Priorités

1. Garder une expérience claire, accessible et adaptée au mobile.
2. Définir des avantages réellement disponibles, avec coûts, conditions et règles de remboursement validés par les commerçants.
3. Ne pas activer d'authentification distante tant que les migrations et les tests d'isolation ne sont pas validés explicitement.
4. Construire un historique vérifiable côté serveur avant tout pilote public.

## Développement local

Node.js 20 ou 22 est recommandé.

```bash
npm install
npm run check
npm test
npm run build
npm run dev
```

Le serveur local sert le prototype. La présence d'un module backend ne signifie pas qu'un service de production est configuré. Les points de démonstration ne sont pas de l'argent, ne sont pas transférables et n'ont pas de valeur monétaire.
