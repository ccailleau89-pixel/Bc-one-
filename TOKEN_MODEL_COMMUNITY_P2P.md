# BC ONE — modèle communauté + avantages + échanges P2P

**Statut : analyse préliminaire au 16 octobre 2026. Aucun lancement, aucune vente et aucun déploiement autorisés par ce document.** Cette note n'est pas un avis juridique. La qualification dépend des droits exacts du token, du parcours utilisateur, des flux financiers et de l'activité réellement opérée.

## 1. Produit recommandé à prototyper

Distinguer deux choses dès la conception :

1. **Avantages commerciaux de La Cabane de la Pointe Rouge** : avantages clairement définis et financés par le commerce (accès communauté, offres, événements, récompenses).
2. **BCONE transférable entre portefeuilles** : jeton crypto sur une blockchain publique, transférable directement entre utilisateurs, sans promettre une valeur en euros, un rendement, un rachat ou une liquidité.

Ne pas faire du token une créance en euros ni promettre « 1 BCONE = 1 € ». Ne pas présenter les tokens comme des crédits prépayés remboursables sans analyse juridique et comptable distincte. Les offres prépayées précédemment envisagées (par exemple 20 € donnant 24 € de crédit) restent un modèle commercial séparé, pas une tokenomics validée.

## 2. Conséquences techniques

### Portefeuille et transferts

- Préférer, pour le premier prototype, des portefeuilles auto-hébergés : l'utilisateur contrôle sa clé et signe lui-même ses transferts.
- Les transferts standards ERC-20 sont possibles de portefeuille à portefeuille ; le contrat ne doit pas ajouter de fonction de transfert administrée, de blocage discrétionnaire ou de frais cachés.
- Prévoir une interface qui explique les frais de réseau, les confirmations, les erreurs d'adresse et le caractère généralement irréversible des transactions.
- Ne jamais demander à un utilisateur sa phrase de récupération ou sa clé privée.
- Ne pas créer de carnet d'ordres, de marché interne, de conversion en euros, de rachat ou d'intermédiation d'échanges dans le prototype.
- Pour les avantages communautaires, utiliser un registre applicatif séparé des règles de transfert du token. Le solde blockchain n'est pas, à lui seul, une preuve de droit à un produit, une réservation ou un remboursement.

### Choix d'offre

- **Offre fixe** : meilleure lisibilité de l'offre et aucune clé ne peut créer de tokens après le déploiement ; nécessite de définir soigneusement la distribution initiale et la gestion de la trésorerie.
- **Offre plafonnée avec mint propriétaire** : permet une distribution progressive, mais le propriétaire conserve un pouvoir d'émission jusqu'au plafond ; cela doit être transparent et protégé par une gouvernance adaptée.
- Les chiffres présents dans les tests sont des fixtures de test et ne sont pas des paramètres de lancement.

### Sécurité avant tout lancement

- Faire auditer le contrat retenu et les dépendances ; les tests unitaires et fuzz ne remplacent pas un audit.
- Fixer le réseau et les frais de gas après comparaison des coûts, de la sécurité, de l'expérience mobile et des outils disponibles.
- Prévoir procédure de récupération d'accès, support, sauvegarde, surveillance, gestion des incidents et politique de mises à jour de l'interface.
- Séparer les fonds du commerce, les fonds de la communauté et les éventuels fonds de clients ; tenir une comptabilité traçable.
- Garder l'application hors garde de clés et ne jamais déployer depuis un portefeuille personnel sans procédure de contrôle.

## 3. Points réglementaires à examiner en France / UE

### MiCA : émission et offre au public

MiCA encadre l'émission, l'offre au public et l'admission à la négociation de crypto-actifs, ainsi que les services sur crypto-actifs. Un jeton utilitaire au sens de MiCA est destiné uniquement à donner accès à un bien ou service fourni par son émetteur. Le fait de permettre des échanges P2P ne suffit pas à trancher la qualification : il faut analyser la fonction économique réelle, les communications commerciales et les droits promis.

Si BCONE est offert au public ou présenté à la négociation, un livre blanc et des obligations d'information peuvent s'appliquer, sauf exception applicable à confirmer juridiquement. Ne pas supposer qu'une communauté de petite taille, une offre gratuite ou l'absence de déploiement public suffit automatiquement à écarter MiCA. Le livre blanc et les communications doivent être exacts, équilibrés et non trompeurs.

### Services sur crypto-actifs (PSCA/CASP)

Le règlement MiCA définit notamment la conservation pour le compte de clients, l'exploitation d'une plateforme de négociation, l'échange contre des fonds ou d'autres crypto-actifs, la réception/transmission d'ordres et le transfert pour le compte de clients comme des services réglementés. En France, depuis la fin de la période transitoire au 1er juillet 2026, les professionnels fournissant de tels services doivent disposer de l'autorisation requise.

Conséquence pratique : un simple contrat ERC-20 n'est pas la même chose que l'exploitation d'un service. Mais une application qui conserve les clés, contrôle des portefeuilles, organise des échanges ou transfère des tokens pour les utilisateurs peut changer substantiellement l'analyse. Avant de développer ces fonctions, faire qualifier précisément le rôle de l'exploitant et consulter un avocat spécialisé / l'AMF si nécessaire.

### Monnaie électronique et services de paiement

Éviter toute promesse de valeur stable par référence à l'euro et toute promesse de remboursement à parité sans analyse dédiée. Les jetons conçus pour maintenir une valeur stable par référence à une monnaie officielle peuvent relever des règles sur les jetons de monnaie électronique ; des obligations de paiement supplémentaires peuvent alors apparaître. Le fait d'accepter des tokens en échange de produits doit aussi être examiné au regard du montage réel.

### Consommation, vente et données

Avant toute commercialisation, examiner au minimum :
- conditions d'utilisation et CGV, règles d'accès aux avantages, expiration éventuelle et réclamations ;
- information claire sur volatilité, absence de garantie de valeur, frais, irréversibilité et risques de perte ;
- droits de rétractation et obligations d'information applicables au parcours de vente ;
- fiscalité et comptabilisation des ventes, avantages accordés et transferts ;
- RGPD pour comptes, adresses de portefeuille liées à une personne, analytics et marketing ;
- règles de promotion commerciale, publicité et protection des consommateurs.

Cette liste est une grille de contrôle, pas une conclusion de conformité.

## 4. Décisions à prendre avant de coder une application publique

1. Le token sera-t-il gratuit au lancement ou vendu contre des euros ?
2. Les avantages seront-ils accordés par La Cabane uniquement, et lesquels exactement ?
3. Les utilisateurs pourront-ils seulement transférer leurs tokens, ou aussi les vendre contre des euros / les échanger contre d'autres tokens ?
4. Qui contrôlera les portefeuilles et les clés : chaque utilisateur, ou l'opérateur ?
5. L'offre sera-t-elle fixe, ou plafonnée avec une fonction d'émission ?
6. Le projet vise-t-il uniquement la France ou plusieurs pays de l'UE ?

## 5. Sources officielles de départ

- AMF — dossier MiCA : https://www.amf-france.org/fr/actualites-publications/dossiers-thematiques/mica
- AMF — informations sur les livres blancs et offres au public : https://www.amf-france.org/en/professionals/fintech/my-relations-amf/public-offerings-and-admission-trading-crypto-assets
- EUR-Lex — règlement MiCA (UE) 2023/1114 : https://eur-lex.europa.eu/legal-content/FR-EN/TXT/?from=EN&uri=CELEX%3A32023R1114
- ACPR — articulation entre services sur crypto-actifs et services de paiement, 19 février 2026 : https://acpr.banque-france.fr/fr/actualites/attentes-de-lacpr-en-vue-de-lagrement-en-qualite-detablissement-de-paiement-des-prestataires-offrant

**Prochaine étape recommandée :** garder le contrat et les tests sur la branche isolée, décider des droits exacts et du modèle de garde, puis obtenir une qualification juridique avant toute offre, vente ou mise à disposition publique. Aucun déploiement n'est requis pour cette étape.
