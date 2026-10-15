# Décisions requises avant le contrat BC ONE

Aucun jeton BC ONE ni contrat n’est déclaré créé ou déployé. Avant d’écrire le contrat et ses tests, définir :

1. Réseau (Base, Polygon PoS, Arbitrum One ou autre EVM).
2. Nom, symbole et décimales.
3. Offre maximale exacte et émission initiale éventuelle.
4. Émission unique ou progressive, limites par période et date de fin.
5. Répartition communauté, équipe, trésorerie, liquidité et autres usages.
6. Vesting : bénéficiaires, blocage, durée et libérations.
7. Rôles autorisés à créer/mettre en pause, multisignature et révocation.
8. Utilité, territoires concernés, analyse juridique et audit indépendant.

Après validation humaine, préparer sur une branche séparée un contrat ERC-20 plafonné, OpenZeppelin épinglé et tests Foundry. Pas de déploiement mainnet, transaction ni clé de portefeuille.
