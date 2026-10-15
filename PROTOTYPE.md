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
- Ajout de `prototype.html`, du script de contrôle et du workflow CI sur cette branche.
- GitHub Actions **Prototype checks : succès** le 15 octobre 2026. Le job a exécuté `node scripts/check-prototype.mjs`, qui vérifie le type de document, la langue, la balise viewport, le titre, les sections attendues, l'avis de statut, l'absence de formulaire et d'URL externe, l'unicité des identifiants et la validité des ancres internes.
- La validation CI est un contrôle statique ciblé, pas une validation complète du HTML ou de l'accessibilité.
- Aucun test navigateur ni contrôle visuel mobile/ordinateur n'a encore été exécuté. Ne pas considérer l'interface comme validée pour la production.

## Revue GitHub
- Pull request brouillon : [#5 — Ajouter le prototype responsive BC ONE](https://github.com/ccailleau89-pixel/Bc-one-/pull/5).
- Elle reste non fusionnée pour revue humaine.
- La branche `main` a avancé après la création de la branche de travail. La PR est déclarée fusionnable par GitHub, mais la compatibilité avec les derniers changements doit être vérifiée avant toute fusion.

## Prochaines étapes
1. Prévisualiser le fichier sur mobile et ordinateur, tester les ancres, le clavier et les tailles d'écran.
2. Ajouter, si nécessaire, un validateur HTML et un test de rendu navigateur.
3. Décider du périmètre réel du produit : programme de fidélité classique, actif numérique, ou les deux avec des règles séparées.
4. Avant toute fonction financière : finaliser les règles, examiner le cadre juridique et les obligations de protection des données, sélectionner le réseau et faire auditer les contrats.
5. Fusionner uniquement après revue visuelle, revue du diff et validation humaine.

## Sécurité
Aucun secret, aucune clé privée, aucune phrase de récupération et aucune donnée client ne sont nécessaires. Aucun contrat blockchain n'est ajouté ici. Aucun jeton n'est déclaré émis ou déployé.
