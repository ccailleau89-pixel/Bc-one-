# BC ONE — prototype communautaire

Ce prototype est une maquette HTML autonome. Il ne se connecte à aucun portefeuille et ne manipule aucun crypto-actif.

## Ouvrir sur Windows

1. Ouvrir le fichier `index.html` dans un navigateur récent (Chrome, Edge ou Firefox).
2. Tester les liens de navigation en haut de page.
3. Cliquer sur **Simuler un transfert**, saisir un destinataire fictif et un montant entier disponible.
4. Vérifier que le solde et l'activité se mettent à jour, puis cliquer sur **Réinitialiser la démo**.
5. Refaire le test sur une fenêtre étroite ou sur un téléphone.

## Vérifications manuelles

- [ ] Les liens Accueil, Portefeuille démo, Avantages, Profil, Activité et FAQ amènent à la bonne section.
- [ ] Le dialogue de transfert s'ouvre et se ferme.
- [ ] Un montant positif, entier et inférieur ou égal au solde est accepté.
- [ ] Un montant supérieur au solde ou invalide est refusé par le formulaire.
- [ ] Une simulation diminue le solde et ajoute une ligne à l'activité.
- [ ] La réinitialisation remet le solde à 250 et l'activité initiale.
- [ ] Les questions de la FAQ peuvent être ouvertes et refermées.
- [ ] La navigation et les boutons sont utilisables au clavier.
- [ ] La mise en page reste lisible sur mobile.

## Limites explicites

- Solde et profils entièrement fictifs ; état non sauvegardé après rechargement.
- Aucun portefeuille, aucune clé privée, aucun réseau blockchain, aucun paiement.
- Aucun droit, avantage commercial, conversion ou valeur monétaire n'est promis.
- Ne pas utiliser ce prototype pour vendre des tokens ou collecter des fonds.
- Toute version pilote doit d'abord définir les règles du programme, la protection des données, les conditions commerciales et l'analyse juridique applicable.

## Étape suivante

Valider cette maquette avec quelques utilisateurs, consigner leurs retours, puis décider du modèle fonctionnel avant d'ajouter un backend ou une connexion blockchain.


## Contrôle statique automatisé

Le script `check_prototype.py` vérifie la présence des sections principales, l'unicité des identifiants HTML, les liens de navigation internes, les messages de sécurité, l'absence de scripts JavaScript externes et quelques marqueurs de validation/accessibilité. Si Node.js est installé, il vérifie aussi la syntaxe du JavaScript intégré.

Pour le lancer localement avec Python 3 :

```sh
python prototype/check_prototype.py
```

GitHub Actions exécute ce contrôle sur les changements du dossier `prototype/`. Il s'agit d'un contrôle statique, pas d'un test complet dans un navigateur ni d'un audit de sécurité.
