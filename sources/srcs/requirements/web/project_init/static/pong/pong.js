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

    // Ajouter un fond bleu plus océan
    const oceanColor = 0x1E90FF; // Couleur bleu océan
    scene.background = new THREE.Color(oceanColor);

    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lumière ambiante
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1); // Lumière directionnelle pour bateau1
    directionalLight1.position.set(0, 20, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1); // Lumière directionnelle pour bateau2
    directionalLight2.position.set(0, -20, 10);
    scene.add(directionalLight2);

    // Charger le modèle GLTF
    let bateau1 = null;
    let bateau2 = null;
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('../static/pong/assets/models/onepiece.gltf', function (gltf) {
        // Paddle 1
        bateau1 = gltf.scene.clone();
        bateau1.position.set(0, 20, -1);
        bateau1.scale.set(10, 5, 5);
        bateau1.rotation.set(Math.PI / 2, 0, 0);

        // Paddle 2
        bateau2 = gltf.scene.clone();
        bateau2.position.set(0, -20, -1);
        bateau2.scale.set(10, 5, 5);
        bateau2.rotation.set(Math.PI / 2, 0, 0);

        scene.add(bateau1);
        scene.add(bateau2);
        console.log('Model loaded successfully');
    }, undefined, function (error) {
        console.error('An error occurred while loading the GLTF file', error);
    });

    // Créer les objets du jeu Pong
    const paddleGeometry = new THREE.BoxGeometry(1, 0.2, 0.5);
    const paddle1Material = new THREE.MeshBasicMaterial({ color: 0x800080 });
    const paddle2Material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material);
    scene.add(paddle1);
    scene.add(paddle2);

    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Créer les bordures marron
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Couleur marron
    const borderMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Couleur noir
    const borderGeometryV = new THREE.BoxGeometry(5.5, 0.1, 0.5);
    const borderGeometryH = new THREE.BoxGeometry(0.1, 5.5, 0.5);

    // Bordure supérieure
    const topBorder = new THREE.Mesh(borderGeometryV, borderMaterial2);
    topBorder.position.set(0, 2.65, 0);
    // scene.add(topBorder);

    // Bordure inférieure
    const bottomBorder = new THREE.Mesh(borderGeometryV, borderMaterial);
    bottomBorder.position.set(0, -2.65, 0);
    // scene.add(bottomBorder);

    // Bordure gauche
    const leftBorder = new THREE.Mesh(borderGeometryH, borderMaterial);
    leftBorder.position.set(-2.65, 0, 0);
    // scene.add(leftBorder);

    // Bordure droite
    const rightBorder = new THREE.Mesh(borderGeometryH, borderMaterial);
    rightBorder.position.set(2.65, 0, 0);
    // scene.add(rightBorder);

    // Ajouter les hitboxes autour des paddles
    const paddle1Hitbox = new THREE.BoxHelper(paddle1, 0xff0000); // Couleur rouge pour la hitbox
    const paddle2Hitbox = new THREE.BoxHelper(paddle2, 0xff0000); // Couleur rouge pour la hitbox
    scene.add(paddle1Hitbox);
    scene.add(paddle2Hitbox);

    // camera.position.z = 5;

    // Positionner les objets
    // paddle1.position.y = -2;
    // paddle2.position.y = 2;

    // paddle1.position.set(0, -2, bateau1.position.z);
    // paddle2.position.set(0, 2, bateau2.position.z);

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
            if (playerRole === 'player1' && paddle1.position.x > -2)
                {
                    paddle1.position.x -= 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                }
            else if (playerRole === 'player2' && paddle2.position.x < 2)
                {
                    paddle2.position.x += 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                }
        }
        if (keys['d']) {
            if (playerRole === 'player1' && paddle1.position.x < 2)
                {
                    paddle1.position.x += 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                }
            else if (playerRole === 'player2' && paddle2.position.x > -2)
                {
                    paddle2.position.x -= 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                }
        }
    }, 16); // Envoyer la position toutes les 100ms

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);
    
        if (!gameStarted) {
            return;
        }
    
        // Vérifier que les bateaux existent avant d'accéder à leurs propriétés
        if (bateau1 && bateau2) {
            // Positionner les paddles légèrement au-dessus des bateaux
            paddle1.position.set(bateau1.position.x - (bateau1.scale.x / 2) + 2, bateau1.position.y - 2.5, bateau1.position.z * bateau1.scale.z + 9.7);
            paddle2.position.set(bateau2.position.x - (bateau2.scale.x / 2) + 2, bateau2.position.y + 4.28, bateau2.position.z * bateau2.scale.z + 9.7);

            // Appliquer une rotation à la caméra pour le joueur 2
            if (playerRole === 'player2') {
                camera.position.set(paddle2.position.x, paddle2.position.y - 2.8, paddle2.position.z + 0.5); // Derrière le paddle
                camera.lookAt(new THREE.Vector3(paddle2.position.x, paddle2.position.y, paddle2.position.z));
                // camera.rotation.z = Math.PI; // Rotation de 180 degrés
                camera.rotation.x = 90 * (Math.PI / 180);
            }
            else if (playerRole === 'player1') {
                camera.position.set(paddle1.position.x, paddle1.position.y + 2.8, paddle1.position.z + 0.5); // Derrière le paddle
                camera.lookAt(new THREE.Vector3(paddle1.position.x, paddle1.position.y, paddle1.position.z));
                camera.rotation.x = -90 * (Math.PI / 180);
                camera.rotation.z = Math.PI; // Rotation de 180 degrés
                // camera.rotation.y = Math.PI;
                // camera.rotation.y = 180 * (Math.PI / 180);
            }
        }
    
        // Mettre à jour les hitboxes
        paddle1Hitbox.update();
        paddle2Hitbox.update();
    
        renderer.render(scene, camera);
    }
    
    animate();
};