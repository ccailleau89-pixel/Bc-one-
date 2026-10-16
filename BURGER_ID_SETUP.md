# Burger ID commun — préparation de l'authentification

## Objectif

Utiliser une identité commune pour BC ONE et Burger Crush, avec connexion,
déconnexion et récupération de compte partagées. Les profils, scores et données
métier restent séparés par application.

## État actuel

- La maquette BC ONE contient un Burger ID fictif et un mini-challenge local.
- `prototype/burger-id.js` définit l'adaptateur d'authentification.
- `prototype/burger-id-ui.js` relie la modale de connexion à l'adaptateur et gère
  l'inscription, la connexion, la déconnexion et la récupération du mot de passe.
- `prototype/burger-id-config.js` lit les variables publiques Vite `VITE_SUPABASE_URL`
  et `VITE_SUPABASE_ANON_KEY` au moment du build.
- Aucun projet Supabase n'est connecté dans cet environnement : la modale et le
  client compilé sont intégrés, mais la connexion réelle reste désactivée tant que
  les variables ne sont pas configurées.
- Aucun compte réel n'est créé et aucun mot de passe n'est envoyé tant que la
  configuration Supabase n'est pas valide.

## Configuration nécessaire

1. Créer ou sélectionner un projet Supabase unique destiné aux deux applications.
2. Configurer les URL autorisées, les URL de redirection de récupération et
   les paramètres de confirmation d'e-mail.
3. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans le fichier
   `.env` local (à partir de `.env.example`) ou dans les variables du système de
   build. Utiliser uniquement la clé **publishable/anon** destinée au navigateur.
   Ces valeurs publiques ne remplacent pas les règles de sécurité de la base.
4. Ajouter l'URL exacte de l'aperçu dans les URL de redirection autorisées de
   Supabase ; le flux d'inscription et de récupération y revient après validation.
5. Ne jamais placer une clé `service_role`, une clé privée ou un secret serveur
   dans le navigateur, le dépôt Git ou une variable frontend.
6. Définir des règles RLS restrictives pour que chaque utilisateur ne puisse
   lire ou modifier que ses propres données et que les données d'une application
   ne donnent pas accès aux données privées de l'autre.
7. Côté backend, vérifier le jeton de session reçu et les droits de l'utilisateur
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

Après configuration des variables publiques Supabase, lancer `npm install`, puis
`npm run dev` pour tester localement ou `npm run build` pour créer le bundle. Le
client est intégré à la modale ; sans variables valides, le compte reste désactivé.
Les routes backend sensibles doivent aussi vérifier la session et les droits. Garder le prototype
en mode démonstration jusqu'à ce que les contrôles passent. Aucun déploiement
de production ni collecte de paiement n'est autorisé par cette préparation.
