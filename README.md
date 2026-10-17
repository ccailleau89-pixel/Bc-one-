# BC ONE — The Burger Currency

[![Quality checks](https://github.com/ccailleau89-pixel/Bc-one-/actions/workflows/ci.yml/badge.svg)](https://github.com/ccailleau89-pixel/Bc-one-/actions/workflows/ci.yml)
[![Public site checks](https://github.com/ccailleau89-pixel/Bc-one-/actions/workflows/public-site-checks.yml/badge.svg)](https://github.com/ccailleau89-pixel/Bc-one-/actions/workflows/public-site-checks.yml)

**Projet food-tech en préparation.** L'objectif immédiat est de valider un programme d'avantages utile pour les clients et commerçants, avant toute fonctionnalité financière ou crypto.

## Liens

- **[Site BC ONE](https://ccailleau89-pixel.github.io/Bc-one-/)** — présentation du projet
- **[Burger ID](https://ccailleau89-pixel.github.io/Bc-one-/burger-id.html)** — portail préparatoire, authentification réelle inactive
- **[Démo Crush Burger](https://ccailleau89-pixel.github.io/crush-burger-demo/)** — expérience séparée en mode démonstration
- [Feuille de route MVP](ROADMAP_MVP.md)
- [État technique et contrôles de lancement](PROJECT_STATUS.md)
- [Garde-fous sécurité et production](SECURITY_AND_RELEASE_GATES.md)

## Priorités actuelles

1. Maintenir un site clair, accessible et adapté au mobile.
2. Définir un pilote fidélité avec 3 à 5 avantages réellement disponibles, coûts connus et règles écrites.
3. Configurer et tester Burger ID sur un projet Supabase de test, après revue des migrations et des règles RLS.
4. Construire un historique de points vérifiable côté serveur avant tout pilote public.

## État des fonctionnalités

- Site vitrine : publié.
- Tests de syntaxe, tests automatisés et build Vite : contrôlés via GitHub Actions.
- Burger ID : interface préparée, authentification réelle non configurée.
- Avantages : pistes de travail uniquement, aucune récompense commerciale active n'est promise.
- Paiements, comptes clients de production et règlement commerçant : non actifs.
- Token et blockchain : aucun token de production déclaré comme émis ; aucun déploiement mainnet autorisé.

## Principes de sécurité

- Aucun déploiement sur le réseau principal sans approbation humaine explicite.
- Aucune clé privée, phrase de récupération ou secret serveur dans le dépôt ou le navigateur.
- Aucune donnée financière fictive présentée comme réelle.
- Aucun paiement réel avant validation technique, juridique, fiscale et commerciale.
- Aucun message commercial envoyé automatiquement sans validation humaine.
- Les points de démonstration ne sont pas de l'argent, ne sont pas transférables et n'ont pas de valeur monétaire.

## Développement local

Node.js 20 ou 22 est recommandé.

```bash
npm install
npm run check
npm test
npm run build
npm run dev
```

Le serveur local sert le prototype web. La présence d'une route ou d'un module backend ne signifie pas qu'un service de production est configuré.

**Statut :** prototype public et fondations techniques en développement. Une validation réussie des tests ne remplace ni une revue de sécurité indépendante ni une validation juridique.
