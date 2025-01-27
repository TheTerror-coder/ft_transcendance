Ingénierie Logiciel – Projet ft_transcendance

Janvier 2025 – Présent
Technologies utilisées : HTML, CSS, JavaScript, Ruby, Docker, PostgreSQL, Django, OAuth 2.0, WebSocket, WebGL, Three.js, Prometheus, Grafana, HashiCorp Vault, Elasticsearch, Logstash, Kibana, JWT, Git, GitHub
Résumé du projet :

Développement d’un site web de jeu en ligne interactif basé sur le classique Pong, intégrant des fonctionnalités avancées telles que les matchs en ligne en temps réel, des tournois multi-joueurs, une gestion complète des utilisateurs, une sécurité renforcée et un backend robuste.
Réalisations principales :

    Développement du Jeu Pong :
    Création d’un jeu Pong classique avec des fonctionnalités avancées, y compris la possibilité de jouer à distance, de personnaliser le jeu (avec des power-ups et des cartes différentes), et de gérer des parties avec plusieurs joueurs en simultané (jusqu’à 6 joueurs).

    Frontend et Interface Utilisateur :
    Développement d’une interface utilisateur intuitive et réactive en utilisant JavaScript pur et Bootstrap (pour le design), tout en respectant les standards de compatibilité avec Google Chrome et les bonnes pratiques d’accessibilité. Implémentation de la gestion de l’historique des matchs et des profils des utilisateurs.

    Gestion des Utilisateurs :
    Mise en place d’un système d’inscription et d’authentification sécurisé pour les utilisateurs avec gestion de leur profil, alias, avatars et historique de matchs. Utilisation de la bibliothèque OAuth 2.0 pour une authentification externe via 42 (en intégrant les flux de connexion sécurisés).

    Backend avec Ruby et Django :
    Conception d'un backend en Ruby, avec une base de données PostgreSQL. Développement d’une API pour la gestion du jeu et des utilisateurs. Mise en œuvre de la communication en temps réel via WebSocket pour les matchs multijoueurs en ligne.

    Sécurité du Site Web :
    Application des meilleures pratiques de sécurité, notamment la protection contre les injections SQL et les attaques XSS, le hachage des mots de passe, et l’activation de la connexion HTTPS pour toutes les interactions utilisateurs. Mise en place de JWT pour la gestion sécurisée des sessions et des accès.

    Infrastructure et DevOps :
    Déploiement de l’application en utilisant Docker pour la gestion des conteneurs et l'automatisation du déploiement avec docker-compose. Mise en place d’un système de gestion des logs via la stack ELK (Elasticsearch, Logstash, Kibana) et surveillance de l'application avec Prometheus/Grafana.

    Amélioration Continue et Scalabilité :
    Adoption d’une architecture microservices pour le backend, permettant une meilleure évolutivité et maintenance du projet à long terme. Intégration de solutions de gestion des secrets via HashiCorp Vault pour une gestion sécurisée des clés API et autres informations sensibles.

    Accessibilité et Multilinguisme :
    Ajout d’une fonctionnalité de support multilingue pour toucher un public international, avec la possibilité de changer la langue de l’interface (au moins 3 langues supportées).

    Tests et Validation :
    Tests unitaires et fonctionnels réalisés pour assurer la stabilité du code et la performance du jeu en temps réel. Mise en place d’un système de validation des formulaires côté serveur pour garantir l’intégrité des données.

Compétences acquises :

    Développement Backend : Ruby, Django, PostgreSQL
    Développement Frontend : HTML, CSS, JavaScript, Bootstrap, Three.js, WebGL
    Sécurité : Authentification OAuth 2.0, JWT, HTTPS, prévention des injections SQL et XSS
    DevOps et Infrastructure : Docker, ELK Stack, Prometheus, Grafana, HashiCorp Vault
    Gestion de Projet : Conception, architecture et mise en œuvre de fonctionnalités, gestion de versions avec Git
    Multijoueurs en Temps Réel : WebSocket, gestion des latences et déconnexions, API temps réel
