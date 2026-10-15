# BC ONE — Prototype de l'application

## Statut
Prototype HTML autonome, version 0.1. Il s'agit d'une maquette de navigation responsive, pas d'une application connectée.

## Ouvrir
Depuis GitHub, ouvrir `prototype.html` sur la branche `feature/app-prototype-2026-10`. Pour voir le rendu, télécharger ce fichier et l'ouvrir dans un navigateur récent. Aucun serveur ni aucune dépendance ne sont requis.

## Ce que contient le prototype
- Vue d'ensemble responsive avec identité visuelle BC ONE.
- Navigation vers Vue d'ensemble, Portefeuille, Avantages et Projet.
- Portefeuille explicitement non connecté, sans solde inventé ni historique fictif.
- Avantages présentés comme pistes à valider, et non comme une offre active.
- Feuille de route et avis explicite sur l'état du projet.
- Navigation active, repères de focus clavier et prise en compte de la préférence de réduction des animations.
- Aucun formulaire, paiement, connexion wallet, appel réseau ou stockage de données.

## Vérifications réalisées
- Vérification de l'arborescence GitHub, de la branche par défaut `main`, et du commit de départ avant création de branche.
- Création de la branche `feature/app-prototype-2026-10` depuis le commit `57ff819404656dbd40f260573139297903cc72a3`.
- Ajout de `prototype.html` sur cette branche uniquement.
- Contrôle statique du fichier source après création à effectuer avant revue visuelle. Aucun test automatisé ni test navigateur n'a été exécuté dans cette étape ; ne pas considérer l'interface comme validée en production.

## Prochaines étapes
1. Prévisualiser le fichier sur mobile et ordinateur, tester les ancres, le clavier et les tailles d'écran.
2. Ajouter une validation HTML automatisée dans GitHub Actions ou un outil local, puis l'exécuter.
3. Décider du périmètre réel du produit : programme de fidélité classique, actif numérique, ou les deux avec des règles séparées.
4. Avant toute fonction financière : finaliser les règles, examiner le cadre juridique et les obligations de protection des données, sélectionner le réseau et faire auditer les contrats.
5. Ouvrir une pull request pour revue ; ne pas fusionner ni déployer sans validation explicite.

## Sécurité
Aucun secret, aucune clé privée, aucune phrase de récupération et aucune donnée client ne sont nécessaires. Aucun contrat blockchain n'est ajouté ici. Aucun jeton n'est déclaré émis ou déployé.
