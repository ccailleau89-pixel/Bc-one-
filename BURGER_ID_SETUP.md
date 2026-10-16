# Burger ID commun — préparation de l'authentification

## Objectif

Utiliser une identité commune pour BC ONE et Burger Crush, avec connexion,
déconnexion et récupération de compte partagées. Les profils, scores et données
métier restent séparés par application.

## État actuel

- La maquette BC ONE contient un Burger ID fictif et un mini-challenge local.
- `prototype/burger-id.js` définit un adaptateur d'authentification qui attend
  un client Supabase configuré.
- Aucun projet Supabase n'est connecté ; le module n'est pas encore câblé à
  l'interface.
- Aucun compte réel n'est créé et aucun mot de passe n'est collecté par la
  maquette actuelle.

## Configuration nécessaire

1. Créer ou sélectionner un projet Supabase unique destiné aux deux applications.
2. Configurer les URL autorisées, les URL de redirection de récupération et
   les paramètres de confirmation d'e-mail.
3. Configurer l'URL du projet et la clé **publishable/anon** dans la configuration
   frontend de déploiement. Ces valeurs publiques ne remplacent pas les règles
   de sécurité de la base.
4. Ne jamais placer une clé `service_role`, une clé privée ou un secret serveur
   dans le navigateur, le dépôt Git ou une variable frontend.
5. Définir des règles RLS restrictives pour que chaque utilisateur ne puisse
   lire ou modifier que ses propres données et que les données d'une application
   ne donnent pas accès aux données privées de l'autre.
6. Côté backend, vérifier le jeton de session reçu et les droits de l'utilisateur
   avant toute action sensible. Ne jamais faire confiance à un identifiant de
   membre envoyé seul par le navigateur.

## Contrat de données recommandé

- **Identité partagée** : identifiant utilisateur fourni par le fournisseur
  d'authentification, e-mail vérifié et préférences minimales.
- **Burger Crush** : profil joueur, défis, scores et points Crush.
- **BC ONE** : avantages, historique et éventuels soldes BC ONE.
- Les points Crush ne sont pas des BCONE ; aucun transfert ou crédit automatique
  entre les deux systèmes.
- Les scores du jeu ne doivent jamais pouvoir modifier un solde financier ou
  token sans un mécanisme serveur séparé, autorisé et audité.

## Tests obligatoires avant activation

- inscription, confirmation d'e-mail, connexion, déconnexion et récupération ;
- session expirée, jeton invalide et accès non autorisé ;
- isolation des données entre utilisateurs et entre domaines applicatifs ;
- test mobile et multi-navigateurs ;
- vérification que les scores Crush ne peuvent pas créditer BC ONE ;
- revue des mentions de confidentialité, des conditions et des règles de conservation.

## Prochaine étape

Après configuration du projet Supabase, connecter l'adaptateur à l'interface,
ajouter les tests automatisés et protéger les routes backend. Garder le prototype
en mode démonstration jusqu'à ce que les contrôles passent. Aucun déploiement
de production ni collecte de paiement n'est autorisé par cette préparation.
