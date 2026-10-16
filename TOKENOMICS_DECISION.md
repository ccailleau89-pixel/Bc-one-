# BC ONE — émission et tokenomics à décider

**État : document de décision, pas une approbation de lancement.** Aucun des montants de test ci-dessous ne constitue une offre commerciale.

## Deux modèles de contrat sont maintenant disponibles sur la branche de travail

### Option A — offre plafonnée avec émission contrôlée

Contrat : `contracts/BCOneToken.sol`

- Une offre initiale est créée au déploiement.
- Le propriétaire peut créer des tokens supplémentaires jusqu'au plafond immuable.
- Avantage : permet de distribuer l'offre progressivement.
- Risque : les détenteurs doivent faire confiance au propriétaire et à la sécurité de sa clé ; le plafond limite l'offre totale, mais ne supprime pas le pouvoir d'émission.

### Option B — offre fixe, sans fonction d'émission après création

Contrat alternatif : `contracts/BCOneFixedSupplyToken.sol`

- L'offre entière est créée une seule fois lors du déploiement et envoyée à une adresse de trésorerie.
- Il n'existe ni rôle propriétaire, ni fonction privilégiée de création de tokens.
- Avantage : les règles d'offre sont plus simples à vérifier et aucune clé d'administration ne peut créer de nouveaux tokens.
- Risques : la répartition initiale et la gestion de la trésorerie deviennent cruciales ; une erreur d'allocation ne peut pas être corrigée par une émission supplémentaire. Une offre fixe ne garantit ni prix, ni liquidité, ni valeur de remboursement.

## Recommandation de travail

Pour la confiance des utilisateurs, privilégier l'étude de l'option B comme point de départ, sauf si un besoin commercial documenté justifie une émission progressive. Il ne s'agit pas d'un choix définitif : aucun contrat n'est déployé, et le contrat A reste disponible pour comparaison.

## Questions à trancher avant de fixer les paramètres

1. Quelle utilité réelle le token aura-t-il : accès à une communauté, paiement, avantages, ou autre ?
2. Les tokens seront-ils échangeables librement, ou liés à des avantages dans un commerce ?
3. Quelle quantité totale et quelle répartition initiale sont justifiées ?
4. Une partie doit-elle être réservée à la trésorerie, à l'équipe ou à une communauté, avec quelles règles transparentes ?
5. Qui contrôlera les clés de trésorerie, avec quelle procédure de sauvegarde et de contrôle ?

Les crédits prépayés donnant droit à des produits ou services ne doivent pas être assimilés automatiquement à un token crypto. Il faut définir séparément les droits, la comptabilité, les conditions d'utilisation et les obligations réglementaires.

## Validation technique

La CI Foundry compile les contrats, vérifie le formatage et exécute les tests. Les tests prouvent seulement les comportements couverts ; ils ne remplacent ni un audit indépendant ni une revue juridique. La blockchain cible, les paramètres définitifs et toute mise en production restent à décider.
