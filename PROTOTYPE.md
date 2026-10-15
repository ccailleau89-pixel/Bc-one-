# BC ONE — Prototype de l'application

## Statut
Prototype HTML autonome, version 0.1. Il s'agit d'une maquette responsive, pas d'une application connectée.

## Ouvrir
Ouvrir `prototype.html` depuis la branche `feature/app-prototype-2026-10`, ou télécharger le fichier et l'ouvrir dans un navigateur récent. Aucun serveur ni aucune dépendance ne sont requis.

## Ce que contient le prototype
- Vue d'ensemble responsive avec identité visuelle BC ONE.
- Navigation vers Vue d'ensemble, Portefeuille, Avantages et Projet.
- Portefeuille explicitement non connecté, sans solde inventé ni historique fictif.
- Avantages présentés comme pistes à valider, et non comme une offre active.
- Démonstration locale de fidélité avec boutons de simulation et remise à zéro ; points fictifs, non persistants et sans valeur.
- Feuille de route et avis explicite sur l'état du projet.
- Navigation active, repères de focus clavier et prise en compte de la préférence de réduction des animations.
- Aucun formulaire, paiement, connexion wallet, appel réseau ou stockage persistant de données.

## Vérifications réalisées
- Branche de travail créée séparément de `main`, depuis le commit `57ff819404656dbd40f260573139297903cc72a3`.
- Contrôles statiques exécutés avec `node scripts/check-prototype.mjs` : structure HTML, langue, viewport, titre, sections attendues, avis de statut, absence de formulaire et d'URL externe, unicité des identifiants et validité des ancres.
- GitHub Actions **Prototype checks : succès** sur le commit `018139109f016da741923cba91d0701a06945b81`, le 15 octobre 2026 : [exécution n° 38819960304](https://github.com/ccailleau89-pixel/Bc-one-/actions/runs/38819960304).
- Tests Playwright réussis sur mobile (360 × 800), tablette (768 × 1024) et ordinateur (1440 × 900). Le test vérifie le titre, les quatre liens de navigation et leurs limites dans la fenêtre, les ancres attendues, les erreurs JavaScript, l'absence de débordement horizontal et le fonctionnement des boutons de fidélité de démonstration (addition puis remise à zéro).
- Captures d'écran des trois formats disponibles dans l'artefact GitHub Actions `bc-one-prototype-screenshots` de cette exécution.
- Revue visuelle des captures automatisées effectuée : le contenu et la navigation restent dans la fenêtre aux trois formats. Cela ne remplace pas un essai manuel complet au clavier, sur différents navigateurs ou appareils.

## Revue GitHub
- Pull request brouillon : [#5 — Ajouter le prototype responsive BC ONE](https://github.com/ccailleau89-pixel/Bc-one-/pull/5).
- Elle reste ouverte, en brouillon et non fusionnée.
- Au dernier contrôle, GitHub indiquait la PR comme fusionnable. La branche de travail avait néanmoins un commit de retard sur `main`. Les fichiers ajoutés dans la PR n'ont pas de chemin en commun avec les fichiers du dernier commit `main` observé ; aucun conflit direct de fichiers n'a été relevé. Recontrôler l'état GitHub avant toute fusion.

## Prochaines étapes
1. Tester manuellement les ancres et le parcours au clavier dans un navigateur réel.
2. Décider du périmètre produit : programme de fidélité classique, actif numérique, ou les deux avec des règles séparées.
3. Avant toute fonction financière : finaliser les règles, examiner le cadre juridique et les obligations de protection des données, sélectionner le réseau et faire auditer les contrats.
4. Fusionner uniquement après revue du diff, des contrôles et validation humaine explicite.

## Sécurité
Aucun secret, aucune clé privée, aucune phrase de récupération et aucune donnée client ne sont nécessaires. Aucun contrat blockchain n'est ajouté ici. Aucun jeton n'est déclaré émis ou déployé.
