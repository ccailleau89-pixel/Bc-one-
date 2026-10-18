# BC ONE — algorithme expérimental d'indice communautaire

**Indice de santé du réseau, PAS prix du BCONE, valeur liquidative, taux de conversion, rendement, oracle, stablecoin ou conseil d'investissement.** Aucun token n'est créé, vendu ou valorisé en euros par ce module.

## Formule v1

Pour une période mensuelle (30 jours glissants), calculer :

```text
I_brut = 100 × (
  0,25 × min(2, ln(1+U) / ln(1+1000))
+ 0,30 × min(2, ln(1+A) / ln(1+300))
+ 0,20 × min(2, (R/A)/0,50)
+ 0,15 × min(2, ln(1+M) / ln(1+20))
+ 0,10 × min(2, ln(1+T) / ln(1+500))
)
```

- U : comptes utilisateurs uniques vérifiés et dédoublonnés, hors bots
- A : utilisateurs uniques actifs sur 30 jours, parmi U, avec une action qualifiante vérifiée
- R : utilisateurs de A ayant été actifs aussi pendant la période précédente (fidélisation)
- M : commerçants actifs vérifiés et indépendants
- T : transactions commerciales vérifiées, finalisées, nettes des annulations et remboursements, avec anti-fraude

Si A=0, le taux R/A est fixé à 0. Les seuils 1000, 300, 20, 500, les poids et l'objectif de rétention de 50 % sont **des hypothèses de simulation** et non des données observées. Les valeurs sont plafonnées : I_brut entre 0 et 200 points.

Pour amortir les variations : `I_publié(t) = clamp(I_publié(t−1) + 0,25 × (I_brut(t) − I_publié(t−1)), I_publié(t−1) − 10, I_publié(t−1) + 10)`. Premier mois : I_publié=I_brut. Ne pas changer les paramètres sans versionner la méthodologie.

## Agrégation anti-fraude

`aggregate_metrics(users, merchants, transactions)` construit les métriques à partir des enregistrements bruts, côté serveur : une personne vérifiée = un membre (doublons fusionnés), robots et comptes non vérifiés exclus, commerçants non vérifiés ou non indépendants exclus, achats non finalisés, remboursés, auto-achats et identifiants rejoués ignorés, au plus 5 achats comptés par paire client–commerçant et par période. Les tests `test_index_robustness.py` vérifient que ces fraudes ne font pas monter l'indice.

Note : plus d'actifs sans plus de fidèles fait baisser le facteur de rétention (R/A). C'est voulu.

## Page publique

`indice.html` explique la formule et propose un simulateur à données fictives. Il utilise `indice.js`, copie navigateur de la formule ; `prototype/indice.test.js` vérifie qu'elle donne les mêmes résultats que ce module Python.

## Exécution locale

```sh
python -m unittest discover -s token_index -v
python -c "import sys;sys.path.insert(0,'token_index');from community_index import *;print(scenario(Metrics(1000,300,150,20,500)))"
```

## Processus avant toute intégration réelle

1. Définir l'identité vérifiée, les événements qualifiants et les règles de dédoublonnage (anti-Sybil, anti-bots, commerçants indépendants). Ne pas exposer les données personnelles.
2. Agréger les métriques côté serveur uniquement, avec contrôle des permissions, journal d'audit, règles de remboursements et snapshots horodatés. Le navigateur ne peut pas écrire ces métriques.
3. Tester fraude, doublons, transactions circulaires, rétention artificielle, jeux de données manquants et périodes décalées. Bloquer la publication si les métriques ne sont pas fiables.
4. Afficher l'indice et sa méthodologie avec la mention visible « indice communautaire fictif / non financier » tant que les métriques sont simulées.
5. Pour un prix réel éventuel : définir indépendamment offre en circulation, droits du token, liquidité, gouvernance, réglementation applicable, et mécanisme de découverte de prix. **Ne jamais présenter I/100, I×prix initial ou une formule d'utilisateurs comme cours négociable ou garantie de rachat.**
6. Examen juridique et audit de sécurité avant toute émission, vente, indexation contractuelle ou automatisation de marché.

Le code ne touche pas au smart contract, aux paiements, à la blockchain ou aux bases de données réelles.
