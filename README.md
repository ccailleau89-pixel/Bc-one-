# BC ONE — The Burger Currency

Projet food-tech en préparation. Le site public présente le projet ; les fonctions de compte et de fidélité restent à valider.

## Liens
- [Site BC ONE](https://ccailleau89-pixel.github.io/Bc-one-/)
- [Burger ID — maquette](https://ccailleau89-pixel.github.io/Bc-one-/burger-id.html)
- [Parcours fidélité](https://ccailleau89-pixel.github.io/Bc-one-/fidelite.html) — aucune récompense active annoncée
- [Démo Crush Burger](https://ccailleau89-pixel.github.io/crush-burger-demo/)
- [Feuille de route](ROADMAP_MVP.md)
- [État technique](PROJECT_STATUS.md)
- [Garde-fous de sécurité](SECURITY_AND_RELEASE_GATES.md)

## Statut
La vitrine est publiée. Le portail Burger ID est une maquette. Le programme de fidélité est en conception ; aucune récompense commerciale active n'est annoncée. Les paiements et comptes clients de production ne sont pas actifs.

## Développement
Node.js 20 ou 22 : `npm install`, `npm run check`, `npm test`, `npm run build`.

## Référencement
- Chaque page publique a un titre, une description, une URL canonique, des balises Open Graph / Twitter et l'image de partage `og-image.png`. La page d'accueil porte les données structurées `Organization` et `WebSite`.
- `sitemap.xml` liste les pages publiques. Le site est un site de projet GitHub Pages : Google ne lit `robots.txt` qu'à la racine du domaine (`ccailleau89-pixel.github.io/robots.txt`), donc **soumettre le sitemap dans Google Search Console** (propriété préfixe d'URL `https://ccailleau89-pixel.github.io/Bc-one-/`, validation par balise meta ou fichier HTML).
- Les contrôles `prototype/check_public_site.py` vérifient ces balises à chaque modification.
