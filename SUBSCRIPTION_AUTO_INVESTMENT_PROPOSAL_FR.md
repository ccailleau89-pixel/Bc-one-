# Proposition — Abonnement récurrent BC ONE (version française)

**Statut : proposition produit, non activée.** Aucun abonnement, paiement récurrent, achat de crypto-actif ou investissement ne doit être déclenché par ce document.

## Décision recommandée

Lancer d'abord un **Club BC ONE par abonnement** pour financer l'activité et fidéliser la communauté. L'abonnement automatise une contribution mensuelle au projet ; il ne doit pas être présenté comme un investissement financier ni promettre un rendement, une plus-value ou un prix futur du token.

Le token BCONE n'étant pas déployé ni négociable, ne pas acheter ni distribuer automatiquement de vrais tokens aujourd'hui. À la place, le membre reçoit des avantages clairement définis et, si cela est validé, des crédits de fidélité internes non transférables. Les crédits d'essai de 100 unités à l'inscription restent distincts de l'abonnement.

## Parcours recommandé

1. **Créer un Burger ID** (même identifiant pour BC ONE et Burger Crush).
2. **Recevoir 100 crédits BC ONE d'essai** après inscription ; crédits internes, non transférables et sans valeur monétaire.
3. **Découvrir le Club BC ONE** sur une page expliquant le montant, les avantages, le renouvellement, la date du prochain prélèvement, l'annulation et les conditions.
4. **Choisir une formule et confirmer explicitement** le prix récurrent et le moyen de paiement.
5. **Paiement récurrent via un prestataire de paiement** (par exemple Stripe Billing), après configuration et validation juridique. Aucun numéro de carte ne doit être stocké dans l'application.
6. **Afficher l'abonnement** : actif/en attente/annulé, montant, prochaine échéance, factures et bouton d'annulation.
7. **Attribuer les avantages** seulement après confirmation serveur du paiement par webhook vérifié ; ne jamais faire confiance au retour navigateur.
8. **Annulation simple** depuis le compte ; aucune nouvelle échéance après la date d'effet de l'annulation.

## Formules de départ à tester (hypothèses commerciales)

| Formule | Prix mensuel proposé | Promesse produit possible |
|---|---:|---|
| Supporter | 5 €/mois | Soutenir le projet, actualités et avantages communautaires définis |
| Club | 10 €/mois | Avantages partenaires ou offres régulières, uniquement lorsqu'ils sont réellement disponibles |
| Fondateur | 25 €/mois | Avantages renforcés et statut de soutien, avec nombre de places éventuellement limité si la limite est réelle |

Ces prix sont des hypothèses à tester, pas une décision finale. Le coût des avantages et la marge doivent être chiffrés avant commercialisation. Ne pas accorder des avantages qui coûtent plus cher que la marge nette générée.

## Et si l'objectif est un véritable investissement automatique ?

C'est un produit distinct de l'abonnement de fidélité. Une fois le token réellement lancé, une éventuelle fonction d'achat périodique devrait passer par un prestataire autorisé et un cadre juridique validé. Il faudrait afficher clairement le montant, la fréquence, les frais, les risques de perte, les conditions d'arrêt et la garde des actifs. Ne pas promettre de rendement ni laisser entendre que l'indice de croissance communautaire est le prix du token.

Avant tout achat automatique, faire examiner le montage au regard de MiCA et des règles applicables en France. L'émission, l'offre au public, l'intermédiation, la conservation et l'exécution d'ordres peuvent avoir des exigences différentes selon le rôle de BC ONE et du prestataire.

## Garde-fous techniques

- Le navigateur ne crée jamais de paiement, de solde ou de token de sa propre initiative.
- Les abonnements et les paiements sont enregistrés côté serveur.
- Le statut et les avantages sont mis à jour par webhooks signés et idempotents.
- Le serveur doit traiter les événements dupliqués, les paiements échoués, les remboursements et les annulations.
- Aucune clé secrète Stripe ou Supabase `service_role` dans le frontend.
- Les points Burger Crush restent séparés des crédits BC ONE ; aucune conversion automatique.
- Ne jamais nommer les crédits d'essai « investissement », « rendement » ou « valeur en euros ».

## Critères de validation avant lancement

1. Les trois formules ont une marge positive et des avantages réellement livrables.
2. Les conditions d'abonnement, de renouvellement, de rétractation/résiliation et de remboursement sont validées.
3. Les paiements test sont vérifiés par webhook ; aucune carte réelle n'est débitée en environnement de test.
4. Le membre peut consulter et annuler son abonnement.
5. Les tests couvrent paiement réussi/échoué, doublon webhook, remboursement, annulation et droits d'accès.
6. Aucun achat de token réel n'est activé sans décision et validation distinctes.

## Décision proposée

**Étape 1 :** tester le concept d'abonnement de soutien avec les trois prix hypothétiques, sans achat automatique de crypto.  
**Étape 2 :** mesurer les inscriptions, le taux de conversion, l'annulation et le coût des avantages.  
**Étape 3 :** étudier séparément l'investissement périodique en crypto avec un prestataire autorisé, uniquement après décision formelle.
