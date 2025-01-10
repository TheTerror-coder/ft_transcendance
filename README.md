# ft_transcendance


Gameplay and User Experience

    Remote Players: Enable remote play with two users on separate computers with a robust experience, addressing network issues like lag or disconnection.
    Multiple Players: Support games with more than two players. Custom game modes (e.g., 4-player on a square board) are encouraged, allowing for dynamic multiplayer options.
    Another Game with User History and Matchmaking: Develop a new game besides Pong, with a matchmaking system, user history tracking, and secure data storage.
    Game Customization Options: Provide customization features for all games (e.g., power-ups, different maps) while maintaining an option for a simpler gameplay version.
    Live Chat: Allow players to send direct messages, block users, invite others to games, view profiles, and manage tournament notifications.

AI and Algorithms

    AI Opponent: Implement a challenging AI without using A* algorithm, replicating human-like behavior. It should adapt to gameplay and utilize power-ups.
    User and Game Stats Dashboards: Create dashboards for players and game sessions displaying insightful stats, with user-friendly visuals like graphs and charts.

Cybersecurity

    WAF/ModSecurity and HashiCorp Vault: Protect the platform from web attacks and securely manage sensitive information (e.g., API keys, credentials).
    Two-Factor Authentication (2FA) and JWT: Enhance security with 2FA and use JSON Web Tokens (JWT) for user authentication and session management.

DevOps

    Log Management with ELK: Implement Elasticsearch, Logstash, and Kibana (ELK stack) for effective log management, troubleshooting, and performance analysis.
    Microservices: Design the backend with microservices for scalability, flexibility, and independent development of different components.

Gaming Enhancements

    Add Another Game with Matchmaking: Expand the platform by adding a new game with history tracking and matchmaking.
    Game Customization Options: Allow customization across games (e.g., power-ups, attacks, maps) and provide a simple default game version.

Graphics

    3D Techniques for Pong: Use ThreeJS/WebGL to implement advanced 3D techniques to enhance the visual appeal of Pong and create an immersive experience.

Accessibility

    Device Compatibility: Ensure the platform is responsive, functioning on desktops, tablets, and smartphones.
    Browser Compatibility: Extend support to additional web browsers.
    Multiple Language Support: Implement multilingual support (at least 3 languages) with a language switcher.
    Accessibility for Visually Impaired Users: Improve accessibility for users with visual impairments by supporting screen readers, high-contrast themes, and keyboard navigation.
    Server-Side Rendering (SSR): Implement SSR for improved performance, faster page loading, and better SEO.

Server-Side Pong

    Server-Side Pong and API: Replace the basic Pong game with server-side logic, and provide an API to interact with the game. The API should handle game initialization, player controls, and game state updates.

    

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
  
