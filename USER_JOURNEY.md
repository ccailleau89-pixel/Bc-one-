# BC ONE × Burger Crush — parcours utilisateur de référence

**Version : 16 octobre 2026 — spécification fonctionnelle de travail**  
**Statut : à implémenter et tester en environnement de développement. Ce document n'autorise ni fusion dans `main`, ni déploiement, ni collecte de fonds, ni opération financière réelle.**

## 1. Principes non négociables

1. **Un seul Burger ID** pour s'inscrire, se connecter, récupérer son accès et se déconnecter de BC ONE comme de Burger Crush.
2. **Deux espaces métier séparés** : BC ONE et ses avantages d'un côté ; Burger Crush et ses défis/scores de l'autre.
3. **Trois notions distinctes** :
   - **Points Crush** : points de jeu, sans valeur monétaire annoncée et non convertibles automatiquement.
   - **Avantages commerciaux** : offres ou crédits définis par des conditions explicites, avec durée, disponibilité et règles d'utilisation.
   - **BCONE** : token blockchain éventuel, inexistant en production à ce stade. Aucun solde réel, achat, transfert on-chain ou valeur de marché ne doit être simulé comme réel.
4. **Données privées par compte** : chaque utilisateur ne voit que ses données et les informations publiques nécessaires.
5. **Pas de frais ou d'achat caché** : toute action qui aurait un coût doit afficher le montant, les frais et les conditions avant validation.
6. **Pas de conversion automatique** entre points Crush, avantages commerciaux et BCONE.
7. **Mobile-first**, libellés compréhensibles, états de chargement et messages d'erreur explicites.
8. **Pas de mise en production** avant tests de sécurité, validation des règles métier et approbation explicite.

## 2. Navigation principale

- **Accueil** : présentation courte, bénéfices réels, statut du projet et accès « Créer mon Burger ID » / « Me connecter ».
- **Tableau de bord** : raccourcis vers BC ONE, Burger Crush, avantages et paramètres du compte.
- **BC ONE** : profil membre, catalogue d'avantages, historique des avantages ; espace token uniquement en mode démonstration tant qu'il n'est pas autorisé et lancé.
- **Burger Crush** : lancer un défi, voir les scores et les points Crush.
- **Activité** : historique clairement séparé par catégorie ; ne jamais mélanger points de jeu, avantages et transactions blockchain.
- **Compte et confidentialité** : données du compte, consentements, sécurité, déconnexion, demande de suppression et assistance.

## 3. Parcours principal — nouvel utilisateur

### Étape 1 — Découverte
L'utilisateur arrive sur le site ou l'application et comprend :
- ce qu'est BC ONE et le lien avec Burger Crush ;
- ce qui fonctionne déjà et ce qui est encore en test ;
- la différence entre points Crush, avantages commerciaux et éventuel token BCONE ;
- où trouver les conditions, la confidentialité et l'assistance.

**Action principale :** « Créer mon Burger ID ».  
**Action secondaire :** « Me connecter ».  
Ne pas présenter un token comme déjà émis, négociable ou coté.

### Étape 2 — Création du Burger ID
Champs minimaux : e-mail et mot de passe, ou autre méthode d'authentification uniquement si elle est effectivement configurée. Afficher les règles de mot de passe et les liens vers les conditions et la confidentialité.

- Vérifier l'adresse e-mail avant d'activer les fonctions qui exigent un compte confirmé.
- Afficher un message de confirmation et une action pour renvoyer l'e-mail.
- Ne jamais enregistrer le mot de passe dans le frontend ni dans les journaux.
- Ne pas demander de phrase de récupération, de clé privée ou d'adresse de portefeuille pour créer un compte.

### Étape 3 — Consentements et préférences
Séparer les éléments obligatoires au fonctionnement du service des consentements facultatifs, notamment les communications marketing. Ne pas précocher les consentements facultatifs. Enregistrer la version des textes acceptés et l'horodatage lorsque nécessaire.

### Étape 4 — Première connexion
Afficher un accueil bref avec trois choix :
- **Découvrir BC ONE** ;
- **Jouer à Burger Crush** ;
- **Voir les avantages**.

Présenter les points Crush à zéro ou leur valeur réelle issue du compte ; ne jamais afficher un solde inventé. En environnement de démonstration, apposer la mention « Démonstration — données fictives » près de chaque solde et historique fictifs.

### Étape 5 — Tableau de bord
Le tableau de bord affiche des cartes séparées :
- **Burger ID** : état du compte et paramètres ;
- **Burger Crush** : dernier défi, score et points Crush ;
- **BC ONE** : avantages disponibles et statut du service ;
- **Activité** : événements récents, classés par catégorie.

Chaque carte conduit à son espace. Aucun transfert de points entre espaces n'est proposé par défaut.

## 4. Parcours Burger Crush

1. L'utilisateur ouvre Burger Crush avec sa session Burger ID existante ; aucune seconde inscription.
2. Il accepte, si nécessaire, les règles du jeu et les informations de confidentialité propres au jeu.
3. Il lance un défi, joue et voit son résultat.
4. Le score est validé côté serveur dans une version réelle ; le prototype local indique clairement que le résultat est fictif.
5. Les points Crush éventuels sont inscrits uniquement dans le registre Burger Crush.
6. L'utilisateur peut consulter le détail du score et l'historique des défis.
7. Le jeu ne peut jamais créditer directement un solde BCONE, un avantage commercial ou un compte de paiement.

**En cas de score invalide ou d'erreur :** afficher un message, ne pas attribuer de points non validés et permettre de réessayer sans dupliquer la récompense.

## 5. Parcours BC ONE et avantages

1. L'utilisateur ouvre BC ONE sans se reconnecter.
2. Il consulte les avantages disponibles.
3. Chaque avantage affiche avant utilisation : description, valeur ou bénéfice réel, commerçant concerné, dates de validité, stock/limite si applicable, conditions, exclusions et procédure en cas de problème.
4. L'utilisateur sélectionne « Voir les conditions », puis « Utiliser cet avantage ».
5. Avant confirmation, afficher un récapitulatif. Si l'avantage est limité ou consommable, la validation et la décrémentation doivent être atomiques côté serveur.
6. Afficher un reçu ou une confirmation et inscrire l'événement dans l'historique **des avantages**, distinct de l'historique du jeu et de toute activité blockchain.

Aucun avantage ne doit être présenté comme échangeable contre de l'argent si ce n'est pas explicitement autorisé, documenté et validé.

## 6. Espace BCONE / portefeuille — règles d'affichage

À ce stade, l'espace token est **informatif ou de démonstration seulement**.

- Afficher un bandeau visible : « Le token BCONE n'est pas lancé en production » tant que c'est exact.
- Un solde de démonstration doit porter la mention « Fictif — environnement de test » sur l'écran, le détail et l'historique.
- Désactiver les boutons d'achat, de vente, de retrait et de transfert réel tant que le contrat, le réseau, le portefeuille, la conformité et la sécurité ne sont pas validés.
- Ne pas afficher de prix, de rendement, de liquidité, de valeur de rachat ou de cotation non vérifiés.
- Ne jamais demander ni stocker de clé privée ou de phrase de récupération.
- Tout futur parcours réel nécessitera une spécification distincte, une revue juridique et sécurité, des frais/risques clairement affichés et une approbation explicite avant activation.

## 7. Parcours d'achat auprès d'un commerçant — à spécifier avant activation

Le projet envisage une commission de plateforme de **2 %** sur les achats commerçants, mais la base de calcul et le traitement des remboursements restent à confirmer. Aucun paiement réel n'est activé par ce document.

Avant tout développement de production, préciser : montant servant de base, TVA, frais du prestataire, remboursements partiels/totaux, contestations et chargebacks, délai et calcul du versement commerçant, rapprochement comptable, responsabilités du vendeur et support.

Le futur parcours devra être :
1. Voir le produit/service, le commerçant, le prix total et les conditions.
2. Vérifier le panier et les éventuels frais avant paiement.
3. Confirmer l'achat via un prestataire de paiement autorisé et configuré ; ne jamais conserver les données de carte.
4. Recevoir une confirmation et une référence de commande.
5. Voir la commande dans l'historique commercial, séparée des points Crush et du registre BCONE.
6. En cas d'échec, ne pas créer de commande payée ni attribuer de récompense ; permettre une nouvelle tentative.
7. En cas de remboursement, appliquer une règle documentée et tracer le remboursement sans modifier rétroactivement un score de jeu.

La commission de 2 % est un paramètre économique à valider, pas une promesse de fonctionnement déjà opérationnel.

## 8. Connexion, récupération et sécurité du compte

- Connexion avec le Burger ID unique.
- Déconnexion explicite de la session partagée.
- Récupération via le mécanisme sécurisé réellement configuré, avec réponse qui ne révèle pas si une adresse est inscrite.
- Expiration de session et renouvellement gérés côté serveur.
- Autorisations vérifiées côté serveur sur chaque lecture ou écriture sensible.
- Règles RLS testées si Supabase est retenu.
- Tests obligatoires avec au moins deux comptes : aucun accès croisé aux profils, scores, avantages, commandes ou historiques.
- Limiter les tentatives de connexion et journaliser les événements sensibles sans enregistrer secrets ou mots de passe.

## 9. Compte, confidentialité et assistance

Depuis « Compte et confidentialité », l'utilisateur doit pouvoir :
- consulter les données de profil pertinentes ;
- modifier les informations autorisées ;
- gérer les consentements facultatifs ;
- accéder aux conditions et à la politique de confidentialité ;
- contacter l'assistance ;
- demander la suppression du compte et comprendre ses conséquences.

La suppression doit suivre une procédure conforme aux obligations de conservation applicables. Expliquer si certaines données doivent être conservées légalement et pour quelle raison. Ne pas promettre une suppression immédiate de données qui doivent légalement être gardées.

## 10. États d'erreur à concevoir

- E-mail non confirmé : expliquer comment confirmer ou renvoyer le message.
- Mot de passe invalide / connexion échouée : message générique, sans révéler si le compte existe.
- Session expirée : proposer une reconnexion et préserver les saisies non sensibles lorsque c'est sûr.
- Réseau indisponible : signaler que rien n'a été confirmé ; proposer de réessayer.
- Avantage expiré ou épuisé : ne pas le consommer ; afficher l'explication et les autres avantages disponibles.
- Double clic / requête répétée : éviter la double attribution ou la double commande avec des contrôles d'idempotence.
- Paiement échoué ou en attente : afficher le statut réel du prestataire, sans annoncer un paiement réussi prématurément.
- Score suspect : ne pas créditer de points tant que le résultat n'est pas validé.
- Accès non autorisé : refuser côté serveur et ne pas révéler les données demandées.
- Service token indisponible/non lancé : expliquer le statut réel et désactiver les actions correspondantes.

## 11. Critères d'acceptation avant pilote réel

- [ ] Un Burger ID fonctionne sur BC ONE et Burger Crush, sans deuxième compte.
- [ ] Inscription, confirmation d'e-mail, connexion, déconnexion, récupération et expiration de session sont testées.
- [ ] Deux comptes de test ne peuvent accéder aux données l'un de l'autre.
- [ ] Points Crush, avantages, commandes et éventuelles données BCONE sont séparés dans le modèle de données et l'interface.
- [ ] Un score de jeu ne peut pas créer ou modifier un solde token ou une commande.
- [ ] Les soldes et historiques fictifs portent une mention visible sur chaque écran concerné.
- [ ] Les erreurs, doubles clics, expirations et tentatives non autorisées sont testés.
- [ ] Conditions, confidentialité, consentements et suppression du compte sont prêts.
- [ ] Le parcours commerçant, les remboursements et la commission de 2 % ont une règle approuvée avant d'activer le paiement.
- [ ] Les parcours token réels restent désactivés tant que les validations juridiques, techniques et de sécurité ne sont pas terminées.
- [ ] Aucun coût, achat, déploiement ou fusion n'est déclenché sans approbation explicite.

## 12. Ordre d'implémentation

1. Finaliser les écrans et textes en mode démonstration.
2. Valider le schéma des données et les droits d'accès.
3. Configurer l'authentification Burger ID dans un environnement de test.
4. Tester deux comptes et l'isolation des données.
5. Implémenter les registres séparés pour points Crush et avantages.
6. Tester tous les états d'erreur et les parcours mobiles.
7. Documenter le parcours commerçant et valider ses règles économiques avant tout paiement.
8. Soumettre la conformité, le portefeuille et le token à une revue distincte avant de décider d'une activation réelle.

**Règle de livraison :** le prototype peut montrer les parcours, mais chaque fonctionnalité doit refléter honnêtement son état réel. Aucun écran de démonstration ne doit laisser croire qu'un paiement, un solde blockchain ou un transfert réel a eu lieu.
