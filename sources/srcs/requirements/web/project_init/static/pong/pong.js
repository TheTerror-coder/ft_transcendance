window.onload = function() {
    const socket = io('http://localhost:3000'); // Si vous accédez directement depuis votre machine

    let playerId = null;
    let gameStarted = false;

    const waitingMessage = document.createElement('div');
    waitingMessage.id = 'waitingMessage';
    waitingMessage.style.position = 'absolute';
    waitingMessage.style.top = '50%';
    waitingMessage.style.left = '50%';
    waitingMessage.style.transform = 'translate(-50%, -50%)';
    waitingMessage.style.fontSize = '24px';
    waitingMessage.style.color = 'white';
    waitingMessage.innerText = 'En attente d\'un autre joueur...';
    document.body.appendChild(waitingMessage);

    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the server');
    });

    // Recevoir l'identifiant unique du joueur
    socket.on('playerInfo', (data) => {
        playerId = data.playerId;
        playerRole = data.playerRole;
        console.log(`Player ID: ${playerId}`);
        console.log(`Player Role: ${playerRole}`);
    });

    // Recevoir la position de la balle du serveur
    socket.on('ballPosition', (data) => {
        ball.position.x = data.x;
        ball.position.y = data.y;
    });

    // Recevoir la position des paddles du serveur
    socket.on('paddlePosition', (data) => {
        if (data.paddle === 'paddle1') {
            paddle1.position.x = data.x;
        } else if (data.paddle === 'paddle2') {
            paddle2.position.x = data.x;
        }
    });

    // Recevoir le signal de démarrage du jeu
    socket.on('startGame', () => {
        gameStarted = true;
        waitingMessage.style.display = 'none';
        console.log('Game started');
    });

    // Recevoir le signal d'arrêt du jeu
    socket.on('stopGame', () => {
        gameStarted = false;
        waitingMessage.style.display = 'block';
        console.log('Game stopped');
    });

    // Initialiser Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameCanvas').appendChild(renderer.domElement);

    // Créer les objets du jeu Pong
    const paddleGeometry = new THREE.BoxGeometry(1, 0.2, 0.1);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    scene.add(paddle1);
    scene.add(paddle2);

    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    camera.position.z = 5;

    // Positionner les objets
    paddle1.position.y = -2;
    paddle2.position.y = 2;

    // Variables pour suivre les touches enfoncées
    const keys = {};

    // Écouteurs d'événements pour les touches
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    // Fonction pour envoyer la position du paddle à des intervalles réguliers
    setInterval(() => {
        if (keys['a']) {
            if (playerRole === 'player1')
                {
                    paddle1.position.x -= 0.05;
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x });
                }
            else if (playerRole === 'player2')
                {
                    paddle2.position.x -= 0.05;
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x });
                }
        }
        if (keys['d']) {
            if (playerRole === 'player1')
                {
                    paddle1.position.x += 0.05;
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x });
                }
            else if (playerRole === 'player2')
                {
                    paddle2.position.x += 0.05;
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x });
                }
        }
    }, 100); // Envoyer la position toutes les 100ms

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);

        if (!gameStarted) {
            return;
        }

        renderer.render(scene, camera);
    }

    animate();
};