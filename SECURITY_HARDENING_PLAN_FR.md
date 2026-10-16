# BC ONE / Burger Crush — plan de durcissement sécurité

> État : plan de contrôle pour la branche de développement. Ce document ne certifie pas une sécurité absolue et ne signifie pas que les contrôles de production sont activés.

## Garde-fous non négociables
- Aucun secret serveur (clé Supabase `service_role`, clé privée blockchain, secret de paiement, webhook secret) dans le navigateur, Git, les captures, les logs ou les variables préfixées `VITE_`.
- La clé Supabase `anon/publishable` peut être utilisée côté client uniquement avec RLS correcte sur toutes les tables exposées. Elle n'est pas un substitut aux politiques d'accès.
- Aucun crédit, solde, droit fondateur, paiement, transfert ou transaction blockchain ne doit être validé sur la seule base de données envoyées par le navigateur.
- Les crédits d'essai restent internes, non transférables, sans valeur monétaire et distincts de tout token ERC-20.
- Pas de déploiement, d'activation de paiement, de migration sur Supabase de production ou de fusion dans `main` sans validation explicite.

## Contrôles à réaliser avant toute mise en production

### Authentification et sessions
- [ ] Utiliser uniquement Supabase Auth pour vérifier l'identité ; ne jamais faire confiance à un identifiant utilisateur fourni par le client.
- [ ] Valider et limiter les redirections de connexion/réinitialisation aux domaines autorisés.
- [ ] Vérifier confirmation d'e-mail, expiration/rotation des sessions, déconnexion, réinitialisation de mot de passe et erreurs non révélatrices.
- [ ] Ne jamais journaliser les mots de passe, jetons de session, cookies ou liens de récupération.

### Base de données et isolation
- [ ] Activer RLS sur chaque table exposée par l'API Supabase.
- [ ] Écrire des politiques minimales par opération (SELECT/INSERT/UPDATE/DELETE) et par utilisateur ; tester qu'un compte A ne peut jamais lire/modifier les données du compte B.
- [ ] Ne pas accorder d'écriture directe côté client sur les journaux de crédits, soldes, paiements, fondateurs ou transactions.
- [ ] Garder les fonctions `SECURITY DEFINER` rares, avec `search_path = ''`, noms de tables/fonctions qualifiés et droits EXECUTE révoqués aux rôles publics lorsque possible.
- [ ] Ajouter des contraintes SQL, clés étrangères, unicité/idempotence et règles de montant non nul/non négatif adaptées au modèle.
- [ ] Vérifier les privilèges de séquence et les vues/fonctions RPC ; RLS seule ne couvre pas tous les chemins d'accès.
- [ ] Tester l'accès anonyme, utilisateur authentifié, propriétaire et non-propriétaire sur chaque table.

### Interface web
- [ ] Échapper/insérer le texte utilisateur avec `textContent` plutôt que `innerHTML`; assainir toute sortie riche.
- [ ] Ne jamais construire des requêtes SQL, HTML, URL de redirection ou commandes à partir de données non fiables sans validation.
- [ ] Définir une politique CSP adaptée, `frame-ancestors`/anti-clickjacking, `X-Content-Type-Options: nosniff`, `Referrer-Policy` et une politique de permissions côté hébergement.
- [ ] Limiter les dépendances externes, épingler les actions GitHub à des SHA complets pour les workflows sensibles et surveiller les dépendances.
- [ ] Ne pas inclure de données personnelles ou d'identifiants sensibles dans les URL, événements analytics ou messages d'erreur.

### Paiements, fondateurs et crypto — actuellement désactivés
- [ ] Vérifier chaque paiement côté serveur via webhook signé, avec idempotence, contrôle de montant/devise et rapprochement fournisseur.
- [ ] Ne jamais activer un avantage sur la seule page de retour du paiement.
- [ ] Ne pas conserver de données de carte ; utiliser une page hébergée par un prestataire de paiement.
- [ ] Faire valider les conditions, la qualification juridique, l'information consommateur et les obligations réglementaires avant toute offre de participation ou crypto-actif.
- [ ] Toute clé privée blockchain doit rester dans un gestionnaire de secrets/KMS ou environnement isolé, jamais dans l'application web.
- [ ] Afficher clairement que les chiffres de collecte ne représentent que les montants effectivement confirmés par le serveur et le prestataire.

### Tests automatiques et revue
- [ ] Tests positifs ET négatifs pour les politiques RLS (isolation entre deux utilisateurs).
- [ ] Tests d'inscription répétée, d'idempotence et de solde ; aucune possibilité de créditer son compte par une requête navigateur.
- [ ] Vérification des secrets et dépendances (secret scanning, Dependabot ou équivalent).
- [ ] Tests de build, syntaxe, unités et migrations sur une base jetable avant toute application en production.
- [ ] Examiner les résultats GitHub Actions et corriger tous les échecs avant de considérer le lot prêt.
- [ ] Revue manuelle des changements sensibles avant fusion ; conserver la branche de travail et la PR en brouillon tant que les contrôles ne sont pas validés.

## Points déjà visibles dans la migration des crédits d'essai
La migration utilise RLS et n'accorde que SELECT aux utilisateurs authentifiés sur `bc_one_demo_ledger`; les écritures sont prévues via le déclencheur de base de données. La politique de lecture limite les lignes à `auth.uid() = user_id`, et la clé d'idempotence évite un double bonus. Ces protections doivent encore être vérifiées dans le projet Supabase cible, avec des tests d'isolation réels. La migration n'est pas considérée comme appliquée en production.

## Critère de sortie
Ne qualifier le projet de « prêt à produire » qu'après les tests d'isolation RLS, la revue des secrets/dépendances, les tests de parcours d'authentification, la validation de toutes les migrations et une revue humaine. Aucun audit automatisé ne garantit à lui seul l'absence de vulnérabilité.
