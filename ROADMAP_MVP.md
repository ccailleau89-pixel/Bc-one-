# BC ONE — feuille de route MVP

Dernière mise à jour : 17 octobre 2026

## Objectif

Construire d'abord un programme d'avantages utile pour les clients et commerçants, avant toute fonction financière ou crypto. BC ONE et Crush Burger peuvent partager un identifiant à terme, mais leurs profils, scores et données restent séparés.

## Phase 0 — Présentation publique (en cours)

- [x] Page publique responsive avec présentation de BC ONE.
- [x] Liens vers le portail Burger ID et la démo Crush Burger.
- [x] Mention explicite que les avantages affichés sont des pistes, pas des récompenses actives.
- [x] Contrôles CI pour syntaxe, tests et build ajoutés.
- [ ] Vérifier le résultat du workflow CI après son premier passage complet.
- [ ] Vérifier le rendu réel sur mobile après déploiement GitHub Pages.

Critère de sortie : le site explique le projet sans laisser croire qu'un compte, un solde ou un avantage est déjà opérationnel.

## Phase 1 — Définir un pilote fidélité

Avant de coder des récompenses réelles :

- choisir 3 à 5 avantages réellement disponibles auprès des commerçants ;
- calculer le coût et la marge de chaque récompense ;
- définir les règles d'obtention, d'expiration, de fraude et de remboursement ;
- tester la compréhension des règles auprès de clients ;
- décider des données minimales nécessaires et de leur durée de conservation.

Les points de test restent non transférables, sans valeur monétaire et sans conversion en argent. Les exemples de récompenses sur le site ne constituent pas une promesse commerciale.

Critère de sortie : règles validées par les commerçants pilotes et coût maximal connu.

## Phase 2 — Burger ID sécurisé

- créer ou choisir un projet Supabase unique pour les deux applications ;
- configurer les URL autorisées et la confirmation d'e-mail ;
- appliquer après revue les migrations versionnées de `supabase/migrations/` ;
- utiliser uniquement la clé publique `anon` / `publishable` côté navigateur ;
- tester inscription, confirmation, connexion, déconnexion et récupération ;
- tester l'isolation avec deux comptes et vérifier les politiques RLS ;
- tester l'accès mobile et la suppression des données.

Bloquant : aucune configuration Supabase distante n'est effectuée par cette feuille de route. Aucune clé secrète ou `service_role` ne doit être publiée ou intégrée au frontend.

Critère de sortie : tests de sécurité et de confidentialité concluants avant activation publique.

## Phase 3 — Avantages et historique

- afficher le profil et les avantages disponibles ;
- afficher l'historique des opérations ;
- stocker les points dans un registre côté serveur, avec journal append-only ;
- vérifier côté serveur toute attribution et toute utilisation ;
- empêcher Crush Burger de modifier le solde BC ONE ;
- ajouter des tests contre les doublons, l'altération de requêtes et l'accès entre comptes.

Les soldes visibles en prototype sont des données de démonstration, pas des créances, des dépôts ou des actifs financiers.

Critère de sortie : les écritures sont autorisées côté serveur, traçables et testées.

## Phase 4 — Pilote limité

- lancer un test avec un petit nombre de commerçants et des règles écrites ;
- mesurer inscriptions, utilisateurs actifs, avantages utilisés, coût et réachat ;
- recueillir un consentement clair pour les communications ;
- prévoir support, signalement d'abus, gestion des demandes de suppression et incidents ;
- décider à partir des résultats si le programme mérite d'être élargi.

Critère de sortie : utilité et coût confirmés par des données réelles, pas seulement des inscriptions.

## Phase 5 — Financement ou crypto (bloqué)

Aucune collecte d'argent, offre d'investissement, promesse de rendement, vente de token ou déploiement blockchain n'est lancé par cette feuille de route.

Toute éventuelle opération impliquant des fondateurs, une participation au capital, un token ou une rémunération doit d'abord avoir une structure juridique et fiscale définie, des documents adaptés et les vérifications réglementaires nécessaires. Les paramètres discutés en amont ne sont pas une offre publiée ni une opération autorisée.

Critère de sortie : revue juridique, fiscale, comptable, réglementaire et technique achevée, puis validation humaine explicite avant toute action.

## Règles de lancement

- Ne pas présenter une maquette comme un service de production.
- Ne pas présenter des points de démonstration comme de l'argent.
- Ne pas activer paiement, émission de token ou transfert d'actifs sans approbation explicite.
- Ne pas envoyer de prospection automatique sans validation humaine.
- Ne jamais publier de secret, mot de passe, clé privée ou phrase de récupération.
- Conserver les résultats des tests et les décisions de mise en production.
