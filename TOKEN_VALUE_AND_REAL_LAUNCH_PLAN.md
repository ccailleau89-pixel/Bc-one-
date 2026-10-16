# BC ONE — lancement réel et méthode de valorisation

**Document préparatoire. Aucun token n'est déployé, vendu ou coté. Ce document n'autorise aucune opération de production.**

## Les trois notions à ne pas confondre

1. **Indice communautaire** : mesure interne de la santé du projet. Le module `token_index/` mesure l'adoption, l'activité, la fidélisation, les commerçants et l'usage. Il ne mesure pas un prix.
2. **Utilité** : droits concrets que BCONE permettra éventuellement d'utiliser, décrits avec leurs limites, coûts et conditions.
3. **Prix de marché** : prix réellement accepté entre acheteurs et vendeurs sur un marché où le token est échangeable. Il ne peut pas être garanti par une formule d'utilisateurs.

## Plan recommandé

### Étape 1 — prouver l'utilité sans blockchain
- Tester Burger ID, Burger Crush et les avantages avec des données de démonstration.
- Mesurer les utilisateurs actifs vérifiés, la rétention à 30/90 jours, les avantages réellement utilisés, les commerçants actifs, la marge après coût des avantages et les incidents.
- Séparer les points de jeu, les avantages commerciaux et le token. Ne promettre aucune conversion future automatique.

### Étape 2 — définir les droits de BCONE
Rédiger une fiche indiquant ce que le token permet réellement, où il est utilisable, les conditions et limites, les coûts pour le projet et la procédure en cas de litige. Ne pas promettre de rendement, de rachat ou de hausse de prix.

### Étape 3 — choisir l'offre et les règles
Étudier en priorité le contrat à offre fixe `contracts/BCOneFixedSupplyToken.sol`, déjà présent dans le dépôt, et le comparer au contrat à offre plafonnée. Décider ensuite de la quantité totale, de la distribution, des réserves, du calendrier de déblocage et de la gouvernance. Les quantités de test ne sont pas des recommandations. Une offre fixe n'assure pas une valeur de marché.

### Étape 4 — avant toute émission réelle
1. Faire examiner le modèle par un professionnel du droit français/UE et déterminer les obligations applicables.
2. Choisir la blockchain selon les coûts, la sécurité, les outils et le public visé.
3. Finaliser l'offre, les allocations, la gouvernance et la gestion des clés.
4. Préparer les informations et documents requis, dont un livre blanc et une notification à l'autorité compétente lorsque le régime applicable l'exige.
5. Faire auditer le contrat et les processus ; réaliser une répétition sur testnet.
6. Vérifier les adresses et paramètres par deux personnes.
7. Obtenir une approbation explicite avant tout déploiement mainnet.

Le règlement européen MiCA encadre notamment certaines offres au public, admissions à la négociation et activités de services sur crypto-actifs. Les exigences et exemptions dépendent du modèle précis ; une revue juridique est nécessaire.

## Quel indice utiliser ?

### Indice communautaire — maintenant
Conserver l'indice expérimental comme tableau de bord interne. Les données doivent être vérifiées côté serveur, dédoublonnées et corrigées des annulations et remboursements. Publier la méthode et ses versions. L'afficher comme « indice communautaire — non financier », sans conversion en euros ni en BCONE.

### Prix de marché — uniquement si des échanges réels existent
- **Carnet d'ordres** : afficher les transactions récentes, prix acheteur/vendeur, volume, profondeur et heure de mise à jour.
- **Pool de liquidité** : dans un pool automatisé simple à produit constant, le prix marginal théorique dépend du rapport entre les réserves des deux actifs. Les frais, la profondeur et le slippage affectent le prix effectivement obtenu.
- **Agrégation de marchés** : uniquement avec des sources vérifiables et une liquidité suffisante ; documenter la méthode et signaler les données insuffisantes.

Un indice externe tel que BTC ou EUR peut servir de référence d'affichage ou de paire de cotation, mais ne garantit pas que BCONE suive sa valeur. Une promesse de valeur stable ou un mécanisme de remboursement peut changer les obligations réglementaires.

## Garde-fous
- Ne jamais calculer un cours en multipliant l'indice communautaire par un prix cible.
- Ne pas augmenter le score avec les achats du token ou le seul nombre d'inscriptions.
- Aucun mécanisme de soutien de prix ou d'achat automatique sans analyse juridique, financière et technique distincte.
- Afficher la méthode, les risques, la liquidité et les dates de mise à jour.
- Ne pas communiquer de promesse de rendement ou de hausse.

## Indicateurs de réussite
Priorité aux utilisateurs actifs vérifiés, à la rétention, aux avantages utilisés, aux commerçants actifs, à la marge nette des coûts de récompense, aux coûts d'acquisition, à la fraude et à la disponibilité. Le prix éventuel du token sera volatil et ne peut être garanti par le code.

## Décisions restantes
- [ ] Utilité exacte et droits du token.
- [ ] Séparation définitive entre points Crush, avantages et BCONE.
- [ ] Offre totale et allocation justifiées.
- [ ] Réseau et gouvernance des clés.
- [ ] Analyse juridique France/UE et documents applicables.
- [ ] Audit indépendant et testnet.
- [ ] Budget et approbation explicite du déploiement.

## Références officielles
- AMF — MiCA : https://www.amf-france.org/fr/actualites-publications/dossiers-thematiques/mica
- AMF — offres au public et admission à la négociation : https://www.amf-france.org/en/professionals/fintech/my-relations-amf/public-offerings-and-admission-trading-crypto-assets
- Règlement (UE) 2023/1114 : https://eur-lex.europa.eu/eli/reg/2023/1114/oj

**Conclusion :** BCONE ne devient pas économiquement valorisé simplement parce que son contrat existe. Il faut une utilité crédible, des règles transparentes, des validations juridiques et techniques et, pour un prix de marché, des échanges réels avec une liquidité observable.
