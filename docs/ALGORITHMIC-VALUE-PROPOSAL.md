# Proposition de calcul indicatif de valeur BC ONE

## Proposition — à examiner, non adoptée

Pour relier l’unité BC ONE à son identité « Burger Currency », proposer un indice d’évolution d’un panier à poids égal de produits burger. Pour chaque produit, calculer la médiane des prix observés en EUR auprès d’au moins trois commerçants distincts. Comparer chaque médiane actuelle à sa médiane de période de base :

`indice = 100 × moyenne_j(médiane_prix_actuelle_j / médiane_prix_base_j)`

`valeur_de_référence = valeur_conventionnelle_de_base × indice / 100`

La démo propose uniquement comme convention de calcul `1 BC ONE = 1,00 EUR` à la période de base. Ce n’est ni une valeur de marché ni une promesse de conversion; cette convention et les produits, poids, commerçants et dates doivent être validés. Le calculateur n’a aucune donnée préchargée et n’invente pas de prix.

## Limites du mécanisme

Cet indice mesure l’évolution des prix du panier; il ne stabilise pas la valeur par rapport à l’euro. La médiane et le minimum de trois commerçants sont des protections provisoires, pas une preuve de qualité des sources ou de résistance à la manipulation. Les prix doivent être vérifiables, comparables, recueillis légalement et mis à jour selon une fréquence définie.

Le repère calculé ne crée pas de réserve, de droit de remboursement, de liquidité ou de prix d’échange. Il ne déclenche aucune émission ou destruction de jetons. Le prix de marché peut s’en écarter fortement. L’ECB décrit la régulation algorithmique par ajustement d’offre/demande et ses risques; MiCA prévoit des obligations selon la catégorie et le mécanisme. Toute classification ou offre publique nécessite un avis juridique spécialisé.

Références : [ECB sur les stablecoins et mécanismes de stabilisation](https://www.ecb.europa.eu/press/financial-stability-publications/macroprudential-bulletin/html/ecb.mpbu202207_2~836f682ed7.da.html), [règlement MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj), [AMF sur les catégories de crypto-actifs](https://www.amf-france.org/fr/espace-epargnants/lexique-simulateurs-et-outils-pratiques/faq-epargnants/crypto-actifs).

## État

Prototype de formule hors ligne seulement. Pas de flux d’oracle, de contrat, d’émission, de réserve, de portefeuille ou de déploiement.
