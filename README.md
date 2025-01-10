# ft_transcendance

Overview

The Pong Platform is an innovative web-based game platform designed to provide an immersive and engaging gaming experience. It is centered around the classic Pong game, but with multiple enhancements such as multiplayer functionality, customization options, AI opponents, and more. The platform also introduces a variety of additional games, robust user features (like history tracking and matchmaking), and several infrastructure and security improvements.

The project is designed to be scalable, accessible, and user-friendly, supporting a wide range of devices, browsers, and user preferences. It also incorporates a modern architecture using microservices and DevOps tools to ensure high performance and maintainability.
Key Features
1. Multiplayer Modes

    Remote Players: Play the classic Pong game with friends across different devices, maintaining an optimized user experience despite potential network issues (lag, disconnection, etc.).
    Multiple Players: Supports games with more than two players. Customizable modes allow for dynamic gameplay (e.g., a 4-player game on a square board).

2. AI Opponent

    Challenging AI: Play against an AI opponent designed to replicate human-like behavior, providing a competitive challenge without relying on traditional algorithms like A*. The AI also adapts to different gameplay styles and utilizes power-ups if available.

3. Customization Options

    Power-ups & Custom Maps: Customize gameplay with power-ups, special abilities, and different game maps to enhance the gaming experience.
    Default Simpler Version: For those who prefer a straightforward experience, players can select a basic version of any game.

4. Matchmaking & User History

    Game History: Track and display your gameplay stats and progress, including win/loss records and performance metrics.
    Matchmaking System: Find opponents for fair and balanced matches, ensuring everyone has a competitive gaming experience.

5. Live Chat

    Direct Messaging: Send messages, invite players to games, and block unwanted contacts.
    Player Profiles: Access player profiles and interact with others through the chat interface.
    Tournament Notifications: Get real-time notifications about upcoming matches in tournaments.

6. Robust Security

    Web Application Firewall (WAF) and ModSecurity: Secure the platform against web-based attacks and threats.
    Two-Factor Authentication (2FA) and JWT: Secure user accounts with an added layer of security through 2FA, and manage user authentication and sessions using JWT.

7. Infrastructure and DevOps

    ELK Stack for Logging: Efficiently manage and analyze log data using Elasticsearch, Logstash, and Kibana (ELK).
    Microservices Architecture: The backend is designed with microservices, enabling flexibility, scalability, and easy maintenance.
    Prometheus/Grafana Monitoring: Comprehensive system monitoring to ensure uptime and performance.

8. Advanced Graphics

    3D Visuals with Three.js/WebGL: Enhance the visual experience of the Pong game by introducing advanced 3D techniques, immersing players in the game environment.

9. Accessibility

    Responsive Design: Ensure seamless gameplay experience across desktops, tablets, and smartphones.
    Browser and Language Support: The platform is compatible with multiple browsers and offers multilingual support for a broader international audience.
    Accessibility for Visually Impaired Users: Built with screen reader support, high-contrast themes, and keyboard navigation.

10. Server-Side Pong

    Server-Side Logic: Move the core gameplay mechanics (like ball movement and player actions) to the server, ensuring smoother experiences, faster responses, and better scalability.
    API Integration: Expose game logic via a well-documented API for programmatic interaction with the game.

Skills and Technologies

This project requires a broad range of skills across various domains. The key technologies and tools involved in its development include:
Frontend Development

    HTML/CSS/JavaScript: Building the core web interface, ensuring responsive design and user-friendly gameplay.
    Three.js/WebGL: Implementing advanced 3D graphics to enhance the visuals of the Pong game.
    React (Optional): For building a dynamic and interactive user interface.

Backend Development

    Node.js/Express: Implementing server-side logic for multiplayer support, AI opponent behavior, and game state management.
    RESTful APIs: Designing APIs to allow interaction with the Pong game and additional games.
    WebSocket: For real-time multiplayer interactions, enabling seamless communication between remote players.

AI and Algorithms

    Custom AI Logic: Designing an AI opponent that mimics human behavior, implementing algorithms for strategic decision-making and power-up usage without relying on A*.

Database and Data Storage

    MongoDB: Storing user profiles, game history, and matchmaking data securely.
    Redis: For fast, in-memory data storage, especially for real-time game state synchronization.

DevOps and Infrastructure

    Docker: Containerizing microservices for easy deployment and scalability.
    Kubernetes: Orchestrating containers for high availability and efficient scaling.
    ELK Stack: Using Elasticsearch, Logstash, and Kibana for logging and real-time data analysis.
    Prometheus/Grafana: Monitoring the health and performance of services.

Security

    HashiCorp Vault: Secure storage of sensitive information (e.g., API keys, database credentials).
    OAuth, JWT: For managing user authentication and authorization.
    Two-Factor Authentication (2FA): Enhancing security by requiring multiple verification methods.

Testing and Quality Assurance

    Jest: Writing unit and integration tests to ensure that each module and feature performs as expected.
    Mocha/Chai: Used for API testing and server-side verification.
    Cypress: End-to-end testing to ensure the entire platform works seamlessly.

Accessibility and SEO

    WAI-ARIA: Ensuring accessibility for visually impaired users by using ARIA roles and attributes.
    Server-Side Rendering (SSR): Using SSR for faster page load times, improved SEO, and better performance.

How to Run the Project
1. Clone the Repository

git clone https://github.com/your-username/pong-platform.git

2. Install Dependencies

cd pong-platform
npm install

3. Start the Development Server

npm start

This will launch the web application on http://localhost:3000.
4. Run the Tests

To run tests:

npm run test

5. Deploying to Production

Follow the instructions in the Deployment section of the documentation for detailed steps on deploying the application using Docker, Kubernetes, or your preferred cloud service.
Contributing

We welcome contributions! Please fork the repository, create a branch, and submit a pull request with your changes. If you're new to the project, feel free to open an issue if you have any questions or suggestions.
License

This project is licensed under the MIT License - see the LICENSE file for details.


# Modules

## • [Web](about/WEB.md/#web)

  - [x] [Major module: Use a Framework as backend.](about/WEB.md/#-major-module-use-a-framework-as-backend)
  
  - [x] [Minor module: Use a front-end framework or toolkit.](about/WEB.md/#-minor-module-use-a-front-end-framework-or-toolkit)
  
  - [x] [Minor module: Use a database for the backend.](about/WEB.md/#-minor-module-use-a-database-for-the-backend--and-more)
  
  - [x] [Major module: Store the score of a tournament in the Blockchain.](about/WEB.md/#-major-module-store-the-score-of-a-tournament-in-the-blockchain)

## • [User Management](about/USERMANAG.md/#user-management)

  - [x] [Major module: Standard user management, authentication, users across tournaments.](about/USERMANAG.md/#-major-module-standard-user-management-authentication-users-across-tournaments)

  - [x] [Major module: Implementing a remote authentication.](about/USERMANAG.md/#-major-module-implementing-a-remote-authentication)

## • [Gameplay and user experience](about/GAME&USEREXP.md/#gameplay-and-user-experience)

  - [x] [Major module: Remote players](about/GAME&USEREXP.md/#-major-module-remote-players)

  - [x] [Major module: Multiplayers (more than 2 in the same game).](about/GAME&USEREXP.md/#-major-module-multiple-players)

  - [x] [Minor module: Game Customization Options.](about/GAME&USEREXP.md/#-minor-module-game-customization-options)
  
  - [x] [Major module: Live chat.](about/GAME&USEREXP.md/#-major-module-live-chat)
  
  - [ ] [~~Major module: Add Another Game with User History and Matchmaking.~~](about/GAME&USEREXP.md/#-major-module-add-another-game-with-user-history-and-matchmaking)

## • [AI-Algo](about/AIALGO.md/#ai-algo)

  - [x] [Major module: Introduce an AI Opponent.](about/AIALGO.md/#-major-module-introduce-an-ai-opponent)
  
  - [x] [Minor module: User and Game Stats Dashboards](about/AIALGO.md/#-minor-module-user-and-game-stats-dashboards)
  
## • [Cybersecurity](about/CYBERSECU.md/#cybersecurity)

  - [x] [Major module: Implement WAF/ModSecurity with Hardened Configuration and HashiCorp Vault for Secrets Management.](about/CYBERSECU.md/#-major-module-implement-wafmodsecurity-with-hardened-configuration-and-hashicorp-vault-for-secrets-management)

  - [x] [Minor module: GDPR Compliance Options with User Anonymization, Local Data Management, and Account Deletion.](about/CYBERSECU.md/#-minor-module-gdpr-compliance-options-with-user-anonymization-local-data-management-and-account-deletion)

  - [x] [Major module: Implement Two-Factor Authentication (2FA) and JWT.](about/CYBERSECU.md/#-major-module-implement-two-factor-authentication-2fa-and-jwt)

## • [Devops](about/DEVOPS.md/#devops)

  - [x] [Major module: Infrastructure Setup for Log Management.](about/DEVOPS.md/#-major-module-infrastructure-setup-with-elk-elasticsearch-logstash-kibana-for-log-management)

  - [ ] [~~Minor module: Monitoring system.~~](about/DEVOPS.md/#-minor-module-monitoring-system)

  - [ ] [~~Major module: Designing the Backend as Microservices.~~](about/DEVOPS.md/#-major-module-designing-the-backend-as-microservices)

## • [Graphics](about/GRAPHICS.md/#graphics)

  - [x] [Major module: Use of advanced 3D techniques.](about/GRAPHICS.md/#-major-module-implementing-advanced-3d-techniques)
  
## • [Accessibility](about/ACCESSBTY.md/#accessibility)
  
  - [x] [Minor module: Expanding Browser Compatibility.](about/ACCESSBTY.md/#-minor-module-expanding-browser-compatibility)
  
  - [x] [Minor module: Multiple language supports.](about/ACCESSBTY.md/#-minor-module-multiple-language-supports)

  - [ ] [~~Minor module: Support on all devices.~~](about/ACCESSBTY.md/#-minor-module-support-on-all-devices)

  - [ ] [~~Minor module: Add accessibility for Visually Impaired Users.~~](about/ACCESSBTY.md/#-minor-module-add-accessibility-for-visually-impaired-users)

  - [ ] [~~Minor module: Server-Side Rendering (SSR) Integration.~~](about/ACCESSBTY.md/#-minor-module-server-side-rendering-ssr-integration)

## • [Server-Side Pong](about/SERVERSIDEPONG.md/#server-side-pong)

  - [x] [Major module: Replacing Basic Pong with Server-Side Pong and Implementing an API.](about/SERVERSIDEPONG.md/#-major-module-replacing-basic-pong-with-server-side-pong-and-implementing-an-api)

  - [ ] [~~Major module: Enabling Pong Gameplay via CLI against Web Users with API Integration.~~](about/SERVERSIDEPONG.md/#-major-module-enabling-pong-gameplay-via-cli-against-web-users-with-api-integration)
  
