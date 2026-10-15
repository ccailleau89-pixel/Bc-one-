# Prototype BC ONE

Première maquette responsive d’espace projet, construite dans la continuité de la vitrine et de sa palette noir, or, crème et orange.

## Sections

- Tableau de bord avec statut explicite et panneaux de données non connectés.
- Portefeuille en préparation : aucun solde, adresse ou historique fictif; aucune connexion ou signature activée.
- Marché en préparation : aucun cours, volume ou liquidité inventés.
- Présentation du projet avec jalons marqués comme en cours, prototype, ou à définir.

La navigation entre sections fonctionne côté navigateur et permet également d’ouvrir une section via son ancre, par exemple `#wallet`. L’interface ne se connecte à aucun service ou réseau blockchain.

## Contrôle automatisé

Avec Node.js 18 ou plus récent, exécuter :

```sh
node tests/prototype-check.mjs
```

Le contrôle vérifie les éléments structurels et les libellés de transparence. Il ne remplace pas une vérification visuelle multi-navigateurs, un audit d’accessibilité complet ou des tests d’intégration.

## Limites et sécurité

Cette maquette ne fournit pas de service financier. Aucun jeton, contrat, portefeuille, solde ou marché réel n’est affirmé. Ne pas y saisir de clé privée ou de phrase de récupération. Une page de simulation crypto hors ligne permet d’évaluer un croisement de moyennes mobiles sur un CSV fourni par l’utilisateur; aucun ordre ni service externe n’est connecté. Aucun contrat Solidity n’est inclus car les paramètres du jeton restent à valider.

## Démarrage

Ouvrir `index.html` dans un navigateur. La section « Le projet » donne accès à la simulation crypto. Aucun outil de construction ou dépendance n’est requis.
