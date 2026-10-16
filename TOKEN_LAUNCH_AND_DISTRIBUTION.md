# BC ONE — plan de génération et de diffusion

**Statut : plan de travail. Aucun token n'est approuvé pour émission, aucune vente n'est ouverte et aucun contrat n'est déployé.** Les dates ci-dessous sont des jalons de préparation, pas une promesse de lancement.

## 1. Choix du produit avant la génération

Il faut séparer deux produits qui ne doivent pas être confondus :

- **Crédits commerciaux / préventes** : donnent droit à des produits ou avantages selon des conditions contractuelles. Les offres commerciales envisagées de 20 €, 50 € et 100 €, ainsi que l'objectif de préfinancement de 10 000 €, doivent être traitées séparément.
- **Token BCONE sur blockchain** : actif ERC-20 transférable, avec des risques techniques et des obligations potentiellement différentes. Aucun prix, rendement, liquidité, remboursement ou hausse de valeur ne doit être promis.

### Choix technique recommandé pour l'étude

Évaluer en priorité le contrat à offre fixe `contracts/BCOneFixedSupplyToken.sol`, car il ne permet pas de création de tokens après le déploiement. Comparer avec `contracts/BCOneToken.sol` seulement si une émission progressive est justifiée par des règles publiques et approuvées.

Ne pas choisir le nombre total de tokens en partant d'un objectif de prix ou d'une levée de fonds. Définir d'abord l'utilité, les droits, les allocations, les limites et la gouvernance. Les quantités de test dans les tests automatisés ne sont pas des paramètres de production.

## 2. Conditions obligatoires avant génération en production

- [ ] Utilité du token écrite et distincte des crédits commerciaux.
- [ ] Blockchain cible sélectionnée après comparaison des coûts, utilisateurs, outils et risques.
- [ ] Offre totale, allocation initiale, éventuelles réserves et calendrier de distribution approuvés.
- [ ] Politique de trésorerie, gouvernance des clés et procédure de récupération documentées.
- [ ] Classification réglementaire revue par un professionnel compétent en France/UE ; déterminer les exigences MiCA et les éventuelles règles relatives aux paiements, à la monnaie électronique, à la consommation, à la fiscalité et aux données.
- [ ] Livre blanc et communications préparés si nécessaires, avec notification préalable à l'autorité compétente avant publication selon le régime applicable.
- [ ] Revue de sécurité indépendante et plan de réponse aux incidents.
- [ ] Déploiement de testnet et répétition documentée ; adresses et paramètres vérifiés par deux personnes.
- [ ] Approbation explicite du propriétaire du projet avant toute transaction de production.

## 3. Distribution : stratégie par étapes

### Étape A — transparence et écoute (préparation)
Public : clients fidèles, membres potentiels du Club des Fondateurs et partenaires locaux.

- Présenter le problème résolu, les avantages concrets et les limites.
- Créer une page d'information avec FAQ, risques, conditions, contact et liste d'attente facultative.
- Réaliser des entretiens et recueillir les retours sans vendre de token ni demander de fonds.
- Séparer les inscriptions à la communauté des achats et des portefeuilles crypto.

### Étape B — pilote de fidélité sans blockchain
- Tester le catalogue d'avantages et les règles de consommation avec des crédits de démonstration ou un programme de fidélité juridiquement validé.
- Mesurer les inscriptions, l'utilisation réelle des avantages, les réachats et les coûts de service.
- N'utiliser aucune promesse de conversion future vers BCONE.

### Étape C — distribution limitée du token, uniquement après validation
- Définir une allocation publique, une allocation de trésorerie et, si nécessaire, une allocation de contribution avec calendriers transparents.
- Publier simultanément les règles, les risques, le contrat vérifié, les adresses officielles et les éventuelles restrictions géographiques.
- Commencer avec une cohorte limitée et des limites de distribution ; surveiller erreurs, fraude, assistance et coûts.
- Ne pas organiser de liquidité de marché ni d'admission en plateforme sans décision et analyse séparées.

### Étape D — diffusion plus large
- Étendre aux réseaux sociaux, au site, aux partenaires et aux événements uniquement si le pilote répond aux objectifs.
- Employer des messages factuels : pas de rendement garanti, pas de promesse de hausse de prix, pas de faux compte à rebours ni de chiffres de rareté non démontrés.
- Mesurer les membres actifs, avantages utilisés, taux de rétention, coût par membre et incidents ; ne pas mesurer le succès uniquement au prix du token.

## 4. Calendrier de travail indicatif

- **Octobre–novembre 2026** : décider du modèle, cartographier les exigences, rédiger l'utilité et l'allocation ; continuer les tests.
- **Décembre 2026** : préparer les documents d'information, la FAQ, la page d'attente et le pilote de fidélité sans token.
- **Janvier 2027** : tester le parcours de fidélité avec un petit groupe, sans vente de crypto-actifs.
- **Février 2027** : bilan du pilote et décision formelle : continuer le programme de fidélité, préparer une émission conforme ou abandonner le token si son utilité n'est pas démontrée.
- **Mars–avril 2027** : envisager une communication plus large alignée sur la réouverture commerciale seulement si les validations techniques, juridiques, financières et opérationnelles sont terminées. Sinon, lancer uniquement les avantages commerciaux validés.

Ces dates sont des objectifs internes ajustables. Elles ne remplacent pas les délais réglementaires ni une décision de lancement.

## 5. Cadre réglementaire à vérifier

MiCA prévoit des exigences de livre blanc, notification et communications pour de nombreuses offres publiques de crypto-actifs, avec des exclusions et exemptions conditionnelles. Une offre limitée à un réseau de commerçants peut relever d'un traitement particulier, mais il ne faut pas présumer de l'exemption : les droits exacts, la transférabilité, les partenaires, les montants et l'usage doivent être analysés. Pour un émetteur établi en France, l'AMF décrit les modalités de notification et indique notamment un délai préalable de 20 jours ouvrables pour les dossiers concernés.

Références officielles :
- Règlement MiCA, règlement (UE) 2023/1114 : https://eur-lex.europa.eu/eli/reg/2023/1114/oj
- AMF — offres au public et notification des livres blancs : https://www.amf-france.org/en/professionals/fintech/my-relations-amf/public-offerings-and-admission-trading-crypto-assets

Ce document n'est pas un avis juridique. La classification exacte du projet doit être confirmée avant toute sollicitation du public, vente ou distribution.

## 6. Indicateurs de décision

Avant d'augmenter la diffusion, exiger :
- une utilité comprise par les membres lors des tests ;
- un taux d'utilisation des avantages mesuré ;
- des coûts d'exploitation et d'assistance soutenables ;
- zéro incident critique non résolu ;
- des documents contractuels et d'information validés ;
- une procédure de trésorerie et de support testée.

**Décision actuelle : continuer la préparation technique et la recherche utilisateurs. Ne pas déployer, vendre ou distribuer de token réel à ce stade.**
