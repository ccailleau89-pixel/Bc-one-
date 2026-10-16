# BC ONE — plan d'exécution produit, acquisition et visibilité

**Version de travail — 16 octobre 2026.** Ce document prépare le lancement ; il n'autorise ni dépense, ni fusion dans `main`, ni mise en production, ni vente de crypto-actifs.

## Décision de séquencement recommandée

Commencer par un pilote de fidélité et d'avantages sans blockchain, avec des données clairement identifiées comme test, puis décider séparément si BCONE doit être achetable dans l'application, via des plateformes externes, ou les deux. Cette séquence ne vaut pas validation juridique et ne constitue pas une décision définitive sur le canal d'achat.

## Principes à préserver

- Garder les travaux sur la branche de fonctionnalité jusqu'à revue et autorisation explicite.
- Ne pas engager de dépenses, signer de transaction, déployer de contrat ou collecter de fonds sans accord explicite.
- Ne pas annoncer de prix, de rendement, de liquidité, de valeur de rachat, de rareté ou de cotation non vérifiés.
- Séparer BCONE sur blockchain, les avantages commerciaux et les points Burger Crush.
- Conserver un Burger ID commun à terme, avec données métier et droits séparés pour BC ONE et Burger Crush.
- Ne jamais demander une phrase de récupération ou une clé privée aux utilisateurs.
- N'utiliser que des statistiques, témoignages, téléchargements et partenariats réels et vérifiables.

## Phase 0 — cadrage produit avant configuration de services

1. Décrire les usages concrets de BC ONE et les avantages accessibles.
2. Définir les règles d'éligibilité, la durée, les limites, les remboursements éventuels et le support.
3. Séparer clairement :
   - points Crush du jeu ;
   - avantages ou crédits commerciaux, avec leurs conditions ;
   - token BCONE ERC-20, s'il est finalement lancé.
4. Déterminer le modèle économique de chaque flux, notamment la commission de plateforme envisagée à 2 % sur les achats commerçants : base de calcul, TVA, remboursement, chargeback, versement commerçant et comptabilisation.
5. Définir les données personnelles nécessaires, les durées de conservation et les consentements.
6. Documenter les choix non résolus : réseau, offre totale, émission fixe ou plafonnée, allocation, garde des portefeuilles, achat dans l'application ou via tiers.

**Critère de passage :** produit, flux d'argent, règles de récompense et points juridiques à analyser sont documentés. Aucun achat crypto public à ce stade.

## Phase 1 — prototype de fidélité sans blockchain

- Finaliser le parcours mobile de découverte, inscription, connexion, profil et consultation des avantages.
- Configurer un environnement Supabase de test uniquement après validation du schéma, des règles RLS et des redirections.
- Tester inscription, confirmation d'e-mail, récupération, déconnexion, session expirée et accès non autorisé.
- Tester avec au moins deux comptes et vérifier l'isolation des données.
- Vérifier que les scores Burger Crush ne peuvent pas modifier un solde BCONE.
- Ajouter une mention visible pour toutes les données de démonstration.
- Faire tester le parcours par un petit groupe, sans vente de crypto-actifs ni collecte de fonds.

**Critère de passage :** tests de sécurité et d'usage documentés ; aucune anomalie critique ouverte.

## Phase 2 — conformité, token et choix du parcours d'achat

Avant toute offre ou promotion publique de BCONE, obtenir une analyse adaptée au fonctionnement réel en France/UE, notamment concernant MiCA, les éventuels services sur crypto-actifs, les paiements, la consommation, la fiscalité et le RGPD.

- Comparer les modèles d'offre fixe et d'offre plafonnée ; approuver explicitement l'offre et les allocations.
- Choisir la blockchain après comparaison des frais, de la sécurité, des utilisateurs et des outils.
- Faire examiner le contrat final et ses dépendances ; organiser une revue de sécurité indépendante.
- Répéter le déploiement sur testnet, vérifier l'adresse du contrat et documenter les procédures de clés.
- Décider ensuite entre :
  1. achat dans l'application, si le flux est autorisé et techniquement sécurisé ;
  2. accès à des prestataires externes, après vérification de leur statut, de leurs conditions et de la disponibilité réelle ;
  3. les deux, uniquement si chaque parcours est conforme et testé.
- Ne pas annoncer de cotation ni de liquidité avant confirmation vérifiable.

**Critère de passage :** validation juridique et technique documentée, parcours d'achat testé en environnement non productif, approbation humaine explicite avant toute opération réelle.

## Phase 3 — visibilité organique et préparation des fiches

### Site web et référencement

- Préparer un site officiel rapide, mobile-first, sécurisé et accessible.
- Créer des pages distinctes et utiles : présentation BC ONE, Burger ID, Burger Crush, avantages, fonctionnement, risques/FAQ, contact, confidentialité et conditions.
- Ajouter titres, descriptions, URL canoniques, sitemap XML, robots.txt et données structurées pertinentes seulement lorsque les informations sont exactes.
- Connecter Google Search Console et mesurer indexation, impressions, clics et requêtes.
- Publier des contenus pédagogiques répondant aux questions réelles des utilisateurs, sans promesse de rendement ni affirmations non vérifiées.
- Vérifier les liens, les erreurs mobiles, les performances et l'accessibilité.

### Google Play et App Store

- Ne préparer une soumission que lorsque la version est fonctionnelle et respecte les politiques en vigueur.
- Préparer icône, captures d'écran réelles, description fidèle, URL d'assistance, politique de confidentialité et déclarations nécessaires.
- Vérifier en particulier les politiques actuelles des magasins relatives aux crypto-actifs, paiements, achats intégrés, portefeuille et pays ciblés.
- Ne pas présenter une maquette ou un solde fictif comme une application financière active.
- Le référencement dans les magasins et l'acceptation de la fiche ne sont jamais garantis.

### Plateformes et annuaires crypto

- Ne soumettre aucune demande de cotation ou de suivi de marché tant qu'un token réel n'est pas déployé et que l'adresse officielle n'est pas vérifiée.
- Étudier séparément les critères, frais éventuels, documents requis, liquidité et obligations de chaque plateforme.
- Ne jamais payer pour une fausse cotation, de faux avis, de faux volumes ou des recommandations trompeuses.
- Ne pas annoncer une admission avant confirmation publique de la plateforme concernée.

## Phase 4 — campagne de lancement graduelle

1. Construire une liste d'attente facultative avec information claire sur l'utilisation des données.
2. Publier des démonstrations courtes de l'application et expliquer les avantages réels.
3. Recruter un petit groupe de testeurs et recueillir leurs retours avec consentement.
4. Mesurer les visites, inscriptions confirmées, utilisateurs actifs, utilisation des avantages, rétention, coût d'acquisition et demandes au support.
5. Corriger les points de friction avant d'élargir la communication.
6. Lancer une communication publique sur le token uniquement après franchissement des validations légales et techniques.

Ne pas acheter de publicité ni souscrire de service payant sans validation explicite du budget.

## Indicateurs à suivre

- Site : pages indexées, impressions, clics organiques, requêtes, performance mobile.
- Produit : inscriptions confirmées, activation, utilisateurs actifs, taux d'utilisation des avantages, rétention.
- Support et sécurité : erreurs critiques, accès refusés attendus, délais de réponse, incidents.
- Économie : coût par utilisateur actif, coût des avantages, marge réelle par achat et rapprochement des commissions.
- Token, uniquement après lancement autorisé : distribution vérifiable, concentration des détenteurs, incidents et état réel des marchés ; ne pas traiter le prix comme l'unique mesure de succès.

## Checklist avant toute mise en production

- [ ] Produit et conditions documentés.
- [ ] Séparation des points Crush, avantages commerciaux et BCONE testée.
- [ ] Burger ID et RLS testés avec plusieurs comptes.
- [ ] Parcours d'achat et responsabilités de paiement documentés.
- [ ] Analyse juridique et réglementaire adaptée obtenue.
- [ ] Contrat final revu et audit indépendant planifié ou terminé selon le risque.
- [ ] Site, confidentialité, conditions, support et procédures d'incident prêts.
- [ ] Politique de chaque magasin ou prestataire vérifiée à la date de soumission.
- [ ] Tests, sauvegardes et plan de restauration documentés.
- [ ] Approbation explicite avant fusion, déploiement, dépenses ou transaction de production.

## Sources officielles à revalider au moment du lancement

- Règlement MiCA (UE) 2023/1114 : https://eur-lex.europa.eu/eli/reg/2023/1114/oj
- AMF — crypto-actifs et offres au public : https://www.amf-france.org/fr/actualites-publications/dossiers-thematiques/mica
- Google Search — données structurées d'application : https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google Play — politique relative aux contenus et services blockchain : https://support.google.com/googleplay/android-developer/answer/13607354
- Apple App Review Guidelines : https://developer.apple.com/app-store/review/guidelines/

Les règles et critères des services évoluent ; vérifier les versions en vigueur avant toute soumission. Ce document est un plan opérationnel, pas un avis juridique ni une garantie de classement ou d'admission.
