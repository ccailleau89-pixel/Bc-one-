# Décisions requises avant le contrat BC ONE

## Proposition de formule

Une proposition d’indice de prix burger et ses limites sont décrites dans [ALGORITHMIC-VALUE-PROPOSAL.md](ALGORITHMIC-VALUE-PROPOSAL.md). Elle reste une hypothèse non adoptée; le repère n’est pas un cours garanti.

## Objectif confirmé

BC ONE doit devenir une monnaie numérique dont la valeur est définie ou stabilisée par un algorithme. La simulation de trading SMA du prototype n’est pas ce mécanisme monétaire : elle ne fixe pas de prix et ne pilote aucune émission.

Avant de coder ce mécanisme, il faut choisir l’indice de référence (par exemple une parité avec l’euro, un panier d’actifs, un indice de prix lié aux burgers, ou une valeur flottante calculée selon une formule). Il faut ensuite préciser les données de référence, leur source fiable, les règles de stabilisation et d’émission, les limites en cas de panne ou de forte variation, les garanties et les droits de remboursement. Un algorithme seul ne garantit ni une parité ni une valeur minimale.

Si le jeton est offert dans l’Union européenne, sa classification et les obligations applicables dépendront du mécanisme et de l’offre; une revue juridique spécialisée est indispensable avant toute offre au public ou admission à la négociation. Voir le [règlement MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj) et les [catégories de crypto-actifs expliquées par l’AMF](https://www.amf-france.org/fr/espace-epargnants/lexique-simulateurs-et-outils-pratiques/faq-epargnants/crypto-actifs).

## Paramètres techniques et économiques encore à décider

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
