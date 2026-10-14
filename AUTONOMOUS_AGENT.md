# Agent autonome BC ONE

## Fonctionnement

Le workflow `.github/workflows/issue-agent.yml` peut démarrer de deux façons : le propriétaire du dépôt ouvre une issue avec le formulaire « Tâche pour l’agent BC ONE » (titre commençant par `[Agent]`), ou un mainteneur applique le label exact `agent-run` à une issue existante. Codex lit les consignes du dépôt, travaille sur une copie de la branche par défaut et prépare un patch. Un second job, avec des droits GitHub distincts, applique le patch et ouvre ou met à jour une pull request en brouillon dédiée à l’issue.

L’agent ne fusionne pas les pull requests et ne déploie rien. Il ne dispose d’aucune permission pour écrire dans GitHub pendant son travail; seul le job séparé de proposition reçoit les permissions minimales nécessaires pour créer une branche et une PR. Les workflows et les fichiers de consignes sont protégés contre les modifications de l’agent. Le patch passe entre les deux jobs comme donnée et n’est pas exécuté par le job de proposition.

## Activation requise

Après fusion manuelle du PR qui ajoute ce workflow :

1. Dans les paramètres Actions du dépôt, autoriser GitHub Actions à créer des pull requests.
2. Ajouter un secret Actions nommé `OPENAI_API_KEY` contenant une clé de l’API OpenAI. Ne jamais la mettre dans un fichier du dépôt, une issue ou un commentaire.
3. Pour lancer une tâche, le propriétaire du dépôt ouvre une nouvelle issue avec le formulaire « Tâche pour l’agent BC ONE ». Cela démarre automatiquement le workflow; aucun label n’est nécessaire. Pour lancer l’agent sur une issue déjà ouverte, appliquer le label `agent-run`.

L’exécution utilise l’API OpenAI et peut entraîner des coûts selon l’usage et la configuration du compte. Le workflow ne sera pas opérationnel avant ces réglages. L’auteur qui déclenche Codex doit avoir les droits d’écriture du dépôt; la Codex Action conserve sa restriction par défaut et n’autorise pas les utilisateurs arbitraires.

## Limites de sécurité

Le contenu des issues est considéré comme non fiable. L’agent a un profil d’accès limité à l’espace de travail et l’action utilise `drop-sudo`. Aucun secret GitHub en écriture n’est fourni au job Codex. Le job qui ouvre la PR ne fait qu’appliquer un patch et appeler une action de création de PR; il n’exécute pas les fichiers proposés.

L’agent ne peut pas effectuer de déploiement, signer des transactions, manipuler des fonds, émettre un jeton ni contacter des prospects. Toute modification nécessite une revue humaine et une fusion humaine.

## Contrôle

Le dépôt ne dispose pas d’une configuration CI pour ce workflow. Vérifier chaque PR proposée et lancer les contrôles pertinents avant fusion. Les workflows générés par `GITHUB_TOKEN` peuvent ne pas déclencher d’autres workflows sur la branche ou la PR; les vérifications automatiques doivent être configurées séparément selon les permissions GitHub du dépôt.
