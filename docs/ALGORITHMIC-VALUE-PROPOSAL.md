# Proposition de calcul indicatif de valeur BC ONE

## Formule expérimentale : indice robuste à confiance graduée

Cette proposition combine un indice de panier burger, un filtre robuste aux valeurs atypiques, un score de couverture et une limite de variation par période. C’est une piste de conception, ni une formule validée, ni une invention dont la nouveauté aurait été vérifiée par une recherche scientifique exhaustive.

Pour chaque produit j, calculer la médiane des prix en EUR auprès de commerçants distincts dans chaque période, puis le rendement logarithmique :

`r_j = ln(médiane actuelle_j / médiane base_j)`

Calculer le centre m = médiane(r) et la dispersion MAD = médiane(|r_j − m|). Borner chaque rendement à l’intervalle [m − w, m + w], avec `w = max(2 %, 3 × 1,4826 × MAD)`. Cette borne empêche qu’un produit aberrant domine à lui seul un petit panier; le plancher de 2 % est provisoire.

Définir ensuite la couverture C = min(1, plus petit nombre de commerçants par produit / cible) et l’accord A = exp(−8 × MAD). La confiance indicative vaut q = C × A. Le facteur 8 est un paramètre provisoire et modifiable. La variation robuste est la moyenne non pondérée des rendements bornés. Multiplier cette variation par q, puis la limiter à ±5 % par période (paramètre provisoire). Enfin :

`indice suivant = indice précédent × exp(variation appliquée)`

`repère EUR = convention EUR de base × indice suivant / 100`

La démo commence à l’indice 100; 1,00 EUR à la période initiale n’est qu’une convention illustrative. Minimum de trois commerçants par produit; cible par défaut de cinq.

## Intuition et limites

La médiane et la borne limitent le poids d’une observation de prix extrême; la couverture et l’accord réduisent le mouvement quand les données sont rares ou que les produits divergent; le plafond réduit les changements brusques. En contrepartie, le filtre peut ignorer une vraie flambée, la confiance n’évalue ni l’identité ni l’honnêteté des sources, les observations peuvent être corrélées, et le plafonnement crée du retard. Un panier burger n’est pas un panier général de coût de la vie. Ces règles n’empêchent ni manipulation coordonnée, ni panne de données, ni divergence entre ce repère et un éventuel prix de marché.

Avant d’utiliser la formule au-delà d’une démonstration, définir un panier et des produits comparables, une collecte reproductible, l’authentification et la licence des sources, les règles de données manquantes, les fenêtres de calcul, la gouvernance des paramètres, des tests rétrospectifs sur plusieurs années et des scénarios de crise. Les paramètres par défaut ne résultent pas d’un calibrage historique.

## Ce que la formule ne fait pas

L’indice ne stabilise pas BC ONE par rapport à l’euro et ne garantit aucune valeur échangeable. Il ne crée pas de réserves, de liquidité, de droit au remboursement, ni de mécanisme d’émission ou de destruction. Aucun contrat, oracle, portefeuille, ordre ou déploiement n’est connecté. Le simulateur de trading SMA reste séparé. Toute émission, commercialisation ou offre publique requiert une analyse juridique et financière adaptée, notamment au regard du règlement MiCA et des règles applicables.

Références de contexte : [ECB sur les mécanismes et risques des stablecoins](https://www.ecb.europa.eu/press/financial-stability-publications/macroprudential-bulletin/html/ecb.mpbu202207_2~836f682ed7.da.html), [règlement MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj), [AMF sur les crypto-actifs](https://www.amf-france.org/fr/espace-epargnants/lexique-simulateurs-et-outils-pratiques/faq-epargnants/crypto-actifs).

## État

Calculateur local de démonstration seulement. Aucune donnée initiale fictive, aucun flux en direct, aucun jeton émis.
