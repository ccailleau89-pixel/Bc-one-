# Lancement BC ONE — Noël 2026

## Date cible
Jeudi 24 décembre 2026 au soir. Date cible de campagne, pas une promesse de disponibilité en production : la publication dépend des tests de sécurité, de la configuration Supabase et de la validation juridique des récompenses.

## Promesse de campagne
« Pour Noël, rejoins la communauté BC ONE. Crée ton Burger ID, découvre le projet et récupère ton cadeau de bienvenue dans l'application. »

Tant que le token ERC-20 n'est pas déployé et vérifié, décrire le cadeau uniquement comme des **crédits d'essai internes, non transférables, sans valeur monétaire**. Ne pas promettre de valeur future, rendement, cotation, conversion ou distribution de crypto-actifs.

## Acquisition email — consentement requis
Ne pas acheter, louer, aspirer ou utiliser une base d'adresses sans preuve d'une permission valable pour cette campagne. Une base vendue par un tiers n'est pas automatiquement conforme et peut endommager la réputation du domaine.

Canaux recommandés :
1. Formulaire d'inscription sur le site avec une case newsletter facultative, décochée par défaut.
2. QR code sur les comptoirs, emballages, affiches et événements partenaires.
3. Publications Instagram/TikTok et lien en bio.
4. Message aux clients existants uniquement si la base légale applicable le permet ; séparer la prospection commerciale de la création du Burger ID.
5. Partenaires food qui partagent leur propre invitation ou utilisent une collecte avec consentement documenté — ne pas échanger les fichiers clients.

## Données à enregistrer
- Adresse email et date/heure d'inscription.
- Texte/version de la notice et du consentement présentés.
- Source du consentement (formulaire, QR, partenaire).
- Date et preuve d'un éventuel retrait.
- Ne demander que les informations nécessaires ; ne pas collecter de données sensibles.

Prévoir une désinscription simple dans chaque email, une liste d'opposition respectée, une politique de confidentialité accessible, une durée de conservation documentée et un outil d'envoi qui gère les désinscriptions. Vérifier les exigences CNIL/RGPD avant le lancement.

## Calendrier suggéré
- 19 octobre–1 novembre : finaliser l'offre de Noël, la notice de confidentialité et le formulaire d'inscription.
- 2–15 novembre : mettre en place les QR codes et la page de préinscription ; tester le consentement et la désinscription.
- 16–30 novembre : premiers contenus de présentation, sans promesse de valeur financière.
- 1–10 décembre : démonstration du parcours, FAQ et annonce de la date sous réserve des validations.
- 11–20 décembre : rappels aux seuls contacts consentants ; vérifier la délivrabilité et les liens.
- 21–23 décembre : test final de l'inscription, du cadeau, du support et des messages.
- 24 décembre : lancement uniquement si la checklist de mise en production est validée ; sinon annoncer clairement un report.

## Email de préinscription — brouillon
Objet : Un cadeau de bienvenue arrive chez BC ONE 🎁

Bonjour,

Pour Noël, nous préparons le lancement de BC ONE : un espace simple pour rejoindre notre communauté food, découvrir les avantages partenaires et suivre l'évolution du projet.

Inscris-toi sur la liste de lancement pour recevoir les nouvelles et le lien d'accès le soir du lancement.

Le cadeau de bienvenue sera présenté clairement dans l'application. Tant que le token blockchain n'est pas officiellement lancé, il s'agit de crédits d'essai internes, sans valeur monétaire et non transférables.

[Je rejoins la liste de lancement]

Tu reçois ce message parce que tu as demandé des nouvelles de BC ONE. Tu peux te désinscrire à tout moment.

## Go/no-go avant le 24 décembre
- [ ] Tests automatiques verts et revue des alertes de dépendances.
- [ ] Test réel d'isolation RLS avec deux comptes distincts.
- [ ] Authentification, récupération de compte et désinscription testées.
- [ ] Aucune clé serveur dans le dépôt ou le bundle navigateur.
- [ ] Cadeau de bienvenue expliqué sans ambiguïté.
- [ ] Mentions légales, confidentialité, conditions et support disponibles.
- [ ] Envoi email testé sur une petite liste consentante.
- [ ] Revue juridique si le message mentionne un token crypto, une participation au capital ou une collecte de fonds.
- [ ] Sauvegarde et procédure de retour arrière vérifiées.
