# Simulation crypto BC ONE

Moteur JavaScript hors ligne : croisement de moyennes mobiles simples sur bougies `open,close` que l’utilisateur fournit. Les signaux calculés à la clôture sont exécutés à l’ouverture suivante. Une seule position longue, sans vente à découvert. Frais et glissement réglables en points de base.

Dans `index.html`, ouvrir « Le projet », puis « Ouvrir la simulation ». Coller un CSV chronologique. Les données restent dans le navigateur; aucune clé API ou source externe n’est utilisée.

Contrôles Node.js prévus : `node tests/crypto-simulator-check.mjs`.

Ce code est une démonstration, pas un conseil financier. Les risques de marché, de liquidité, de disponibilité, les taxes et les conditions réelles d’exécution ne sont pas modélisés. Aucun compte, échange, portefeuille ou ordre réel n’est connecté.

Aucun contrat Solidity n’est inclus à ce stade. Les paramètres du jeton restent à valider; voir `docs/BLOCKCHAIN-DECISIONS.md`. Aucun token ou déploiement n’est revendiqué.
