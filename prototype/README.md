# BC ONE — prototype communautaire

## Nouveau : parcours utilisateur interactif

Ouvrir [`user-journey.html`](./user-journey.html) dans un navigateur récent pour tester le parcours complet : accueil, simulation de création du Burger ID, avantages avec conditions et confirmation, mini-jeu Burger Crush, historique filtrable/exportable et préférences de confidentialité. Le parcours fonctionne sans serveur ni installation, avec des données en mémoire uniquement. Il ne crée aucun compte réel et n'envoie aucune donnée.

Pour tester : créer un profil de démonstration, lancer le défi Burger Crush (10 appuis), consulter les avantages et confirmer une utilisation fictive, puis filtrer ou exporter l'activité. Le bouton de réinitialisation remet la démo à zéro.

Le fichier `index.html` reste la maquette membre existante ; `user-journey.html` est la version de démonstration du parcours fonctionnel complet.

Ce prototype est une maquette HTML autonome. Il ne se connecte à aucun portefeuille et ne manipule aucun crypto-actif.

## Ouvrir sur Windows

1. Ouvrir le fichier `index.html` dans un navigateur récent (Chrome, Edge ou Firefox).
2. Tester les liens de navigation en haut de page.
3. Cliquer sur **Simuler un transfert**, saisir un destinataire fictif et un montant entier disponible.
4. Vérifier que le solde et l'activité se mettent à jour, puis cliquer sur **Réinitialiser la démo**.
5. Recharger la page et vérifier que le solde et l'activité simulés sont conservés dans ce navigateur.
6. Cliquer sur **Exporter l’activité CSV** pour télécharger l’historique, puis sur **Réinitialiser la démo** pour effacer la sauvegarde locale.
7. Refaire le test sur une fenêtre étroite ou sur un téléphone.

## Vérifications manuelles

- [ ] Les liens Accueil, Portefeuille démo, Avantages, Profil, Activité et FAQ amènent à la bonne section.
- [ ] Le dialogue de transfert s'ouvre et se ferme.
- [ ] Un montant positif, entier et inférieur ou égal au solde est accepté.
- [ ] Un montant supérieur au solde ou invalide est refusé par le formulaire.
- [ ] Une simulation diminue le solde et ajoute une ligne à l'activité.
- [ ] Après rechargement, le solde et l'activité simulés sont restaurés localement.
- [ ] L'export CSV télécharge l'activité et les montants simulés.
- [ ] La réinitialisation remet le solde à 250, restaure l'activité initiale et efface la sauvegarde locale.
- [ ] Les questions de la FAQ peuvent être ouvertes et refermées.
- [ ] La navigation et les boutons sont utilisables au clavier.
- [ ] La mise en page reste lisible sur mobile.

## Limites explicites

- Solde et profils entièrement fictifs ; les opérations simulées sont sauvegardées uniquement dans le stockage local du navigateur, sur cet appareil. Elles ne sont ni synchronisées ni envoyées à un serveur.
- Aucun portefeuille, aucune clé privée, aucun réseau blockchain, aucun paiement.
- Aucun droit, avantage commercial, conversion ou valeur monétaire n'est promis.
- Ne pas utiliser ce prototype pour vendre des tokens ou collecter des fonds.
- Toute version pilote doit d'abord définir les règles du programme, la protection des données, les conditions commerciales et l'analyse juridique applicable.

## Étape suivante

Valider cette maquette avec quelques utilisateurs, consigner leurs retours, puis définir le modèle fonctionnel. La persistance locale et le CSV ne remplacent pas un registre serveur fiable pour un vrai programme de fidélité.


## Crédit d’essai à l’inscription

La version Burger ID prévoit un crédit unique de **1 BCONE d’essai** à la création du compte. Il est enregistré côté base de données dans `bc_one_member_profiles.trial_tokens`, avec une ligne d’audit dans `bc_one_trial_ledger`. Le trigger PostgreSQL protège l’attribution contre les doubles inscriptions au même identifiant. Les clients du navigateur peuvent lire leur propre solde mais ne peuvent pas l’augmenter ou le modifier.

**Important :** ce crédit est un compteur d’essai hors blockchain. Il n’est ni un token ERC-20, ni transférable, ni achetable, ni convertible en euros, et ne possède aucune valeur monétaire. Il ne doit pas être présenté comme un actif négociable.

Pour activer le crédit en environnement Supabase :
1. Configurer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans l’environnement de build.
2. Appliquer dans le projet Supabase voulu les migrations `supabase/migrations/202610160001_burger_id_profiles.sql` puis `supabase/migrations/202610160002_signup_trial_token.sql`.
3. Vérifier avec un compte de test que l’inscription déclenche un seul crédit, qu’il apparaît après confirmation de l’e-mail et connexion, et qu’un client ne peut pas modifier son solde.
4. Ne jamais utiliser de clé `service_role` dans le navigateur. La migration doit être relue et appliquée explicitement au bon projet ; elle n’est pas exécutée par le dépôt GitHub lui-même.

## Contrôle statique automatisé

Le script `check_prototype.py` vérifie la présence des sections principales, l'unicité des identifiants HTML, les liens de navigation internes, les messages de sécurité, l'absence de scripts JavaScript externes et quelques marqueurs de validation/accessibilité. Si Node.js est installé, il vérifie aussi la syntaxe du JavaScript intégré.

Pour le lancer localement avec Python 3 :

```sh
python prototype/check_prototype.py
```

GitHub Actions exécute ce contrôle sur les changements du dossier `prototype/`. Il s'agit d'un contrôle statique, pas d'un test complet dans un navigateur ni d'un audit de sécurité.


## Bonus d'inscription Burger ID (crédits d'essai)

Après application de la migration `supabase/migrations/202610160002_bc_one_welcome_test_credits.sql`, chaque **nouveau compte** reçoit une seule attribution de **100 crédits BC ONE d'essai** dans le registre Supabase.

- Ce sont des crédits internes de test, non transférables, sans valeur monétaire et distincts du contrat ERC-20.
- Le crédit est créé côté base de données à la création du compte ; le navigateur ne peut pas créditer, modifier ou supprimer le registre.
- RLS limite la lecture du registre au compte connecté.
- Les comptes existants ne reçoivent pas automatiquement le bonus.
- En cas de confirmation par e-mail, le bonus est visible après confirmation puis connexion.
- Le code n'applique pas lui-même la migration au projet Supabase distant et ne déploie aucun token.

Tester : créer un nouveau compte, confirmer l'e-mail si demandé, se connecter et vérifier le solde de 100 crédits d'essai ainsi qu'une seule ligne `welcome_bonus` dans `public.bc_one_demo_ledger`.
