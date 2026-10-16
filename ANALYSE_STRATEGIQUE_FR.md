# BC ONE + Crush Burger — analyse stratégique
Date : 17 octobre 2026
Périmètre : dépôts GitHub publics/accessible examinés, notamment BC ONE, Burger ID et Crush Burger Demo.

## 1. Résumé exécutif
Le projet possède déjà une identité visuelle cohérente, plusieurs parcours HTML interactifs, une démo Crush Burger et une base de code qui prépare une identité partagée Burger ID. C'est une bonne base de prototype. Ce n'est pas encore un produit commercial opérationnel : la documentation indique qu'aucun projet Supabase n'est raccordé, que les parcours de démo utilisent des données locales/fictives et que les fonctions financières/crypto ne sont pas activées.

**Recommandation :** ne pas lancer un token ni un système de paiement/solde échangeable maintenant. Lancer d'abord un pilote de fidélité communautaire, simple et mesurable, lié à des avantages réels chez des commerçants partenaires, avec des points non transférables et sans valeur monétaire. Valider ensuite l'usage et l'économie avant d'élargir.

## 2. État observé
- **Crush Burger Demo** : interface responsive, profils fictifs, likes/matchs simulés et stockage dans le navigateur. Utile pour tester le design, pas pour une vraie communauté.
- **BC ONE** : site vitrine et prototypes d'expérience membre. Les documents précisent que les soldes/transactions de démonstration sont fictifs, locaux et sans blockchain.
- **Burger ID** : page et code préparés pour une identité partagée. La configuration Supabase est vide/non raccordée selon la documentation ; aucun compte réel ne doit être considéré comme fonctionnel.
- **Base technique** : migrations SQL préparées pour les profils et un crédit de bienvenue de démonstration. Elles doivent être relues et testées sur un projet de test avant application ; leur présence dans GitHub ne prouve pas qu'elles sont déployées.
- **Backend / paiements** : présence de code de fondation et de tests autour des achats/Stripe, mais aucune preuve vérifiée ici d'un déploiement de production ou de paiements réellement activés.
- **Déploiement** : les URL GitHub Pages sont configurées dans les pages. Une vérification complète du rendu live et des workflows de build n'a pas été établie par cette inspection.

## 3. Valeur potentielle
1. **Acquisition locale** : les clients de la restauration découvrent un programme d'avantages via QR code, comptoir, événements et réseaux sociaux.
2. **Fidélisation** : récompenses simples et compréhensibles pour les achats ou actions communautaires.
3. **Réseau de commerçants** : partenaires qui apportent des avantages croisés et une raison de revenir.
4. **Couche ludique** : défis et mini-jeux peuvent soutenir l'engagement, à condition de ne pas compliquer le parcours d'achat.
5. **Crush Burger** : potentiel de marque et de contenu communautaire, mais une application de rencontre est un produit distinct, avec des enjeux de modération, sécurité et acquisition beaucoup plus lourds. Il ne faut pas la laisser ralentir le pilote fidélité.

## 4. Risques majeurs
- **Proposition trop large** : crypto + fidélité + jeu + rencontre + compte partagé risquent de brouiller le message et d'augmenter le coût de développement.
- **Absence de preuve d'usage** : pas encore de métriques validées sur les inscriptions, réachats, utilisation d'avantages ou coût d'acquisition.
- **Données personnelles** : un compte partagé entre applications exige minimisation des données, information claire, consentement adapté, politique de confidentialité, suppression/export et séparation des données par service.
- **Sécurité** : RLS, droits SQL, flux de récupération e-mail, contrôle serveur et tests avec deux utilisateurs doivent être validés. Aucune clé serveur ne doit être publiée côté navigateur.
- **Économie des récompenses** : chaque avantage doit avoir un coût, une règle de financement, une limite d'utilisation et une prévention de fraude.
- **Crypto/réglementaire** : un token échangeable, vendu ou présenté comme ayant une valeur peut déclencher des obligations juridiques et réglementaires. Ne pas commercialiser ni collecter des fonds avant avis spécialisé et analyse de conformité.
- **Paiements** : ne pas accepter d'argent tant que les parcours, remboursements, webhooks, idempotence, rapprochement et conditions de vente n'ont pas été testés en environnement de test.
- **Modération** : si Crush Burger devient une vraie application de rencontre, il faudra signalement, blocage, prévention des abus, protection des données et procédures de modération.

## 5. Positionnement recommandé
**BC ONE :** « Le programme d'avantages qui connecte les bons plans food et les commerçants locaux. »
**Burger ID :** compte commun facultatif, uniquement quand l'authentification est fiable et que les règles de partage sont transparentes.
**Crush Burger :** marque/expérience communautaire séparée à tester indépendamment ; ne pas promettre de vraies rencontres tant que les fonctions sociales et la modération ne sont pas prêtes.

Éviter au lancement le terme « crypto » si aucun actif blockchain n'existe. Nommer les unités de la démo « points test » ou « crédits de démonstration », explicitement non monétaires, non transférables et non achetables.

## 6. Feuille de route pragmatique
### Phase 0 — cadrage et fiabilité (1 semaine)
- Choisir le cas d'usage pilote et le public cible.
- Définir les règles : inscription, gain, utilisation, expiration, limites et coût maximum par récompense.
- Définir 3 KPI : taux d'inscription, taux de deuxième achat à 30 jours, taux d'utilisation des récompenses.
- Cartographier les données et les rôles d'accès ; confirmer la propriété et les accès aux comptes/outils.
- Exécuter les tests automatisés et consigner les résultats avant tout déploiement.

### Phase 1 — pilote fidélité sans token (2 à 4 semaines après configuration)
- Un compte facultatif ou un identifiant simple ; éviter les frictions.
- Une seule récompense concrète, plafonnée et financée.
- QR code ou code promo contrôlé côté serveur ; pas de solde modifiable dans le navigateur.
- Test fermé avec 20 à 50 utilisateurs volontaires et un petit nombre de commerçants.
- Mesurer activation, réachat, coût de récompense, incidents et retours qualitatifs.

### Phase 2 — décision d'investissement
- Comparer les KPI à une période témoin.
- Continuer uniquement si le réachat ou la fréquence progresse assez pour couvrir le coût des avantages et de l'exploitation.
- Étendre à des partenaires seulement après validation opérationnelle.

### Phase 3 — fonctionnalités avancées
- Ajouter le compte partagé et les intégrations après tests de sécurité et confidentialité.
- Développer les fonctions communautaires/Crush Burger séparément avec modération.
- Réexaminer une éventuelle couche blockchain uniquement si elle résout un problème démontré que des points classiques ne résolvent pas, après analyse juridique, fiscale, sécurité et économique.

## 7. Critères de feu vert avant un pilote public
- [ ] Application de test distincte de la production.
- [ ] Build et tests automatisés verts, résultats archivés.
- [ ] Authentification, confirmation e-mail, récupération et déconnexion testées.
- [ ] Tests d'accès négatifs avec deux comptes : aucune lecture/écriture croisée.
- [ ] Sauvegarde, journalisation sans secrets et procédure de restauration.
- [ ] Conditions d'utilisation et politique de confidentialité adaptées.
- [ ] Récompenses, coûts, limites et règles anti-fraude documentés.
- [ ] Parcours de suppression de compte/données vérifié.
- [ ] Aucun token, solde monétaire ou rendement présenté comme réel sans cadre validé.
- [ ] Plan de support, signalement d'incident et responsable désigné.

## 8. Décision
**GO** pour améliorer les prototypes, configurer un environnement de test et valider un pilote de fidélité très limité.
**NO-GO pour le moment** sur la vente d'un token, la promesse de valeur financière, la collecte de fonds, les paiements de production ou l'ouverture d'une application de rencontre à grande échelle.

Le prochain jalon n'est pas « ajouter plus de fonctionnalités » : c'est obtenir une première preuve que des clients utilisent réellement le programme, reviennent et que l'économie des récompenses tient debout.
