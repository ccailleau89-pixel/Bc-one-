# BC ONE — prototype applicatif, périmètre et étapes

**Statut : plan de prototype uniquement. Pas d'application de production, pas de collecte d'argent, pas de portefeuille connecté et pas de déploiement blockchain.**

## Objectif produit

Tester une expérience de communauté autour de BC ONE avec :
- une page expliquant le projet et ses risques ;
- une carte de membre / profil de démonstration ;
- un catalogue d'avantages proposés par la communauté ou La Cabane ;
- un affichage pédagogique d'un solde fictif en environnement de test ;
- une simulation de transfert entre deux utilisateurs de test ;
- un historique de démonstration clairement identifié comme fictif.

Ce prototype ne doit pas prendre de paiements, demander une phrase de récupération, collecter de vraies clés privées, prétendre qu'un transfert fictif est une transaction blockchain, ni promettre la valeur d'un token.

## Parcours utilisateur proposé

1. **Découvrir** — comprendre le but de BC ONE, les risques et les règles.
2. **Rejoindre la communauté** — utiliser un profil de démonstration sans données sensibles.
3. **Consulter les avantages** — voir les conditions, dates et limites de chaque avantage.
4. **Voir un solde de test** — comprendre la différence entre une donnée simulée et un solde on-chain.
5. **Simuler un transfert P2P** — sélectionner un autre profil de test, saisir un montant et vérifier le récapitulatif.
6. **Voir l'historique** — afficher les événements de test sans les confondre avec des transactions réelles.

## Architecture à faible risque

- Frontend : interface responsive et accessible, sans connexion de portefeuille en première étape.
- Données de démonstration : profils et mouvements fictifs, séparés de toute base commerciale réelle.
- Contrat : les contrats ERC-20 restent dans le dossier `contracts/`, isolés de l'interface et non déployés.
- Avantages : catalogue indépendant avec règles explicites ; pas de conversion automatique du token en euros.
- Sécurité : aucune clé privée, seed phrase ou donnée de paiement stockée par le prototype.
- Journalisation : ne pas enregistrer plus de données personnelles que nécessaire ; prévoir une analyse RGPD avant tout pilote réel.

## Jalons et critères de passage

### Jalon 1 — décision produit et conformité
- [ ] Définir précisément les avantages et les conditions d'éligibilité.
- [ ] Décider si les tokens seront gratuits, vendus ou distribués comme récompenses.
- [ ] Décider si les utilisateurs pourront seulement transférer ou également échanger contre des euros ou d'autres actifs.
- [ ] Déterminer le modèle de portefeuille : auto-hébergé ou service de conservation.
- [ ] Faire vérifier la qualification MiCA, les éventuels services réglementés, les obligations consommateurs et la fiscalité par un professionnel compétent.

**Pas de passage au pilote public tant que ces points ne sont pas tranchés.**

### Jalon 2 — prototype local sans blockchain
- [ ] Écran d'accueil et explication des risques.
- [ ] Profil membre de démonstration.
- [ ] Catalogue d'avantages avec conditions visibles.
- [ ] Solde et transferts fictifs.
- [ ] Historique de démonstration.
- [ ] Tests d'interface, accessibilité et scénarios d'erreur.

### Jalon 3 — revue technique
- [ ] Revue du contrat retenu et de ses tests.
- [ ] Audit indépendant avant tout déploiement à valeur réelle.
- [ ] Comparaison des réseaux, frais, outils de portefeuille et risques.
- [ ] Procédures de clés, incidents, sauvegarde et support.
- [ ] Analyse de sécurité et de protection des données de l'application.

### Jalon 4 — pilote restreint, seulement après autorisation
- [ ] Valider la structure juridique et les documents d'information.
- [ ] Préparer un environnement de test ou une testnet sans valeur réelle.
- [ ] Faire tester le parcours par un petit groupe informé.
- [ ] Corriger les retours avant toute décision de mise en production.

## Définition du succès du prototype

- Un utilisateur comprend ce que BC ONE permet et ne permet pas.
- Il distingue clairement avantage commercial, solde simulé et token blockchain.
- Il peut simuler un transfert et comprendre les erreurs possibles.
- Aucune donnée financière ou clé privée réelle n'est nécessaire.
- Les tests sont reproductibles et aucune étape ne déploie automatiquement le contrat.

## Hors périmètre actuel

Vente de tokens, paiement en euros, marché d'échange, rachat, staking, rendement, garde de clés, connexion à un portefeuille réel, collecte de données clients, contrat déployé et campagnes publiques. Chaque fonction nécessite une décision produit et une revue de risque spécifique.
