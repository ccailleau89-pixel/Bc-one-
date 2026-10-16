# BC ONE — plan du backend MVP

Statut : proposition technique, non déployée. Ce document prépare une application de fidélité communautaire ; il ne définit pas une crypto-monnaie ni une promesse de valeur.

## Décision d'architecture provisoire

- API : Node.js + TypeScript, API REST versionnée sous `/api/v1`.
- Base : PostgreSQL.
- Authentification : fournisseur éprouvé ou sessions serveur sécurisées ; mots de passe jamais stockés en clair.
- Hébergement : à choisir après estimation du coût, de la région d'hébergement et des obligations de protection des données.
- Interface actuelle : maquette HTML locale uniquement. Elle ne doit pas contenir de secrets ni se connecter directement à PostgreSQL.

## Modèle fonctionnel MVP

1. Comptes et profils membres.
2. Catalogue d'avantages avec dates, limites et conditions.
3. Registre immuable des opérations de crédits de fidélité.
4. Réservations/utilisations d'avantages avec identifiant anti-doublon.
5. Administration avec rôles et journal d'audit.
6. Export des données du membre et procédure de suppression/anonymisation selon les obligations applicables.

## Règles comptables et anti-fraude

- Les crédits du MVP sont des points de fidélité internes, non transférables et sans valeur monétaire promise. Ce n'est pas le contrat ERC-20 BCONE.
- Chaque opération écrit une entrée de registre ; le solde est dérivé du registre ou mis à jour dans la même transaction SQL.
- Une clé d'idempotence unique est obligatoire pour toute opération qui ajoute, retire ou consomme des points.
- Refuser les montants non entiers ou non positifs, les soldes insuffisants, les opérations répétées et les avantages expirés/épuisés.
- Ne jamais faire confiance au solde, au rôle ou au prix fournis par le navigateur.
- Les ajustements administratifs exigent un motif, une identité opérateur et une trace d'audit.
- Pas de transfert membre-à-membre dans le premier MVP ; le prévoir comme évolution après analyse du risque et des règles applicables.

## Endpoints à implémenter

- `GET /api/v1/me` — profil du membre authentifié.
- `GET /api/v1/benefits` — avantages actifs.
- `GET /api/v1/ledger?cursor=...` — opérations du membre, pagination par curseur.
- `POST /api/v1/redemptions` — utiliser un avantage ; exige une clé d'idempotence.
- `GET /api/v1/redemptions/:id` — consulter le résultat.
- `GET /health` — santé technique sans détails sensibles.
- Routes d'administration séparées et soumises à une autorisation explicite ; aucun endpoint public pour créditer un compte.

## Sécurité minimale avant tout pilote

- HTTPS, validation des entrées côté serveur, requêtes SQL paramétrées.
- Cookies de session `HttpOnly`, `Secure`, `SameSite` si sessions web ; protection CSRF adaptée.
- Limitation de débit sur connexion et consommation d'avantages.
- Contrôles d'accès par rôle, journaux sans secrets ni données excessives.
- Sauvegardes chiffrées, restauration testée, rotation des secrets et mises à jour des dépendances.
- Tests de concurrence pour empêcher double consommation et solde négatif.
- Politique de conservation, information des membres et analyse RGPD avant collecte de données réelles.

## Ordre de livraison

1. Valider le périmètre commercial, les règles des crédits et les rôles.
2. Créer le schéma SQL et les migrations.
3. Implémenter authentification et profil.
4. Ajouter le registre transactionnel et les clés d'idempotence.
5. Ajouter le catalogue et l'utilisation d'avantages.
6. Tests unitaires, intégration, sécurité et sauvegarde/restauration.
7. Pilote fermé avec données fictives puis décision de mise en production.

## Hors périmètre à ce stade

Aucune connexion à un wallet, aucun paiement, aucune vente de token, aucun déploiement de contrat et aucune donnée client réelle. Toute fonction liée à un crypto-actif doit être décidée séparément après analyse juridique, sécurité et tokenomics.
