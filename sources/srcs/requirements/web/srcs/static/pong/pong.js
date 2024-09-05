
window.onload = function() {
    // Vérifier si l'utilisateur doit être redirigé vers le lobby après un rechargement
    const shouldRedirect = localStorage.getItem('redirectAfterReload');
    if (shouldRedirect) {
        localStorage.removeItem('redirectAfterReload');
        window.location.href = '/lobby';
        return; // Arrêter l'exécution supplémentaire pour éviter de reconnecter le socket
    }
    const socket = io('http://localhost:3000'); // Si vous accédez directement depuis votre machine
    console.log("Loading game script...");
    
    let playerId = null;
    let gameStarted = false;
    let elementsPlaced = false; 
    let playerCount = 0;
    let cannon1;
    let cannon2;

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

    window.addEventListener('beforeunload', function(event) {
        console.log('Page is being reloaded');
        localStorage.setItem('redirectAfterReload', 'true'); // Définir l'indicateur pour la redirection après rechargement
        socket.disconnect();
        event.preventDefault(); // Utiliser preventDefault pour déclencher la boîte de dialogue de confirmation standard
    });
    
    socket.on('connect', () => {
        console.log('Connected to the server');
    });
    
    socket.on('disconnect', () => {
        socket.emit('stopGame');
        window.location.href = '/lobby';
        console.log('Disconnected from the server');
    });

    // Recevoir l'identifiant unique du joueur
    socket.on('playerInfo', (data) => {
        playerId = data.playerId;
        playerRole = data.playerRole;
        ball.direction = data.ballDirection;
        console.log(`Player ID: ${playerId}`);
        console.log(`Player Role: ${playerRole}`);
        console.log(`Ball Direction: ${ball.direction.x}, ${ball.direction.y}, ${ball.direction.z}`);
    });

    socket.on('playerCount', (data) => {
        playerCount = data;
        console.log(`Player count: ${playerCount}`);
    });

    socket.on('gameState', (data) => {
        ball.position.x = data.ballPosition.x;
        ball.position.y = data.ballPosition.y;
        ball.position.z = data.ballPosition.z;
    });

    // Recevoir la position des paddles du serveur
    socket.on('paddlePosition', (data) => {
        if (data.paddle === 'paddle1') {
            paddle1.position.x = data.x;
            cannon1_support.position.x = data.x;
            cannon1_tube.position.x = data.x;
        } else if (data.paddle === 'paddle2') {
            paddle2.position.x = data.x;
            cannon2_support.position.x = data.x;
            cannon2_tube.position.x = data.x;
        }
    });

    // Recevoir le signal de démarrage du jeu
    socket.on('startGame', () => {
        if (playerRole != null){
            gameStarted = true;
            waitingMessage.style.display = 'none';
            console.log('Game started');
        }
        else {
            waitingMessage.style.display = 'block';
            console.log('Game not started');
            socket.emit('playerInfo unknown');
        }
    });

    // Recevoir le signal d'arrêt du jeu
    socket.on('stopGame', () => {
        gameStarted = false;
        waitingMessage.style.display = 'block';
        console.log('Game stopped');
        window.location.href = '/lobby';
    });

    socket.on('winner', (winner) => {
        console.log(`Le joueur ${winner} a gagné !`);
        waitingMessage.style.display = 'block';
        waitingMessage.innerText = `Le joueur ${winner} a gagné !`;
        // document.getElementById('PartieFinie').style.display = 'block';
        window.location.href = '/lobby';
        // window.location.reload();
    });

    // Initialiser Three.js
    const scene = new THREE.Scene();
    const cameraPlayer1 = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const cameraSpectateur = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const cameraPlayer2 = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    document.getElementById('gameCanvas').appendChild(renderer.domElement);

    // Créer un rectangle vert
    const rectangleGeometry = new THREE.PlaneGeometry(2, 1);
    const rectangleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
    
    // Positionner le rectangle au centre de la scène
    rectangle.position.set(0, 0, 0);
    
    // Ajouter le rectangle à la scène
    scene.add(rectangle);

    // Vérifie cette partie
    cameraSpectateur.position.set(0, 0, 20);
    cameraSpectateur.rotation.set(0, 0, 0);
    // Ajouter la cameraSpectateur à la scène
    scene.add(cameraSpectateur);
    // Contrôles clavier de la cameraSpectateur avec les touches WASD
    const keys2 = {};
    window.addEventListener('keydown', (event) => {
        keys2[event.key] = true;
    });
    window.addEventListener('keyup', (event) => {
        keys2[event.key] = false;
    });
    setInterval(function() {
        if (keys2['w']) {
            cameraSpectateur.position.x -= Math.sin(cameraSpectateur.rotation.y) * 0.05;
            cameraSpectateur.position.z -= Math.cos(cameraSpectateur.rotation.y) * 0.05;
        }
        if (keys2['s']) {
            cameraSpectateur.position.x += Math.sin(cameraSpectateur.rotation.y) * 0.05;
            cameraSpectateur.position.z += Math.cos(cameraSpectateur.rotation.y) * 0.05;
        }
        if (keys2['ArrowUp']) {
            cameraSpectateur.position.y += 0.05;
        }
        if (keys2['ArrowDown']) {
            cameraSpectateur.position.y -= 0.05;
        }
        if (keys2['ArrowLeft']) {
            cameraSpectateur.position.x -= 0.05;
        }
        if (keys2['ArrowRight']) {
            cameraSpectateur.position.x += 0.05;
        }
        if (keys2['y']) {
            cameraSpectateur.rotation.x += 0.05;
        }
        if (keys2['h']) {
            cameraSpectateur.rotation.x -= 0.05;
        }
        if (keys2['g']) {
            cameraSpectateur.rotation.y += 0.05;
        }
        if (keys2['j']) {
            cameraSpectateur.rotation.y -= 0.05;
        }
        if (keys2['t']) {
            cameraSpectateur.rotation.z += 0.05;
        }
        if (keys2['u']) {
            cameraSpectateur.rotation.z -= 0.05;
        }
    }, 16);

    let activeCamera = cameraPlayer1; // Par défaut, la camera1 est active

    window.addEventListener('keydown', (event) => {
        if (event.key === 'p') { // Appuyer sur 'p' pour changer de caméra
            if (activeCamera != cameraSpectateur) {
                activeCamera = cameraSpectateur;
            } else {
                activeCamera = cameraPlayer1;
            }
        }
        // console.log(`Active camera: ${activeCamera}`);
        console.log(`PlayerCount: ${playerCount}`);
        if (playerCount === 2)
        {
            if (event.key === 'c')
            {
                if (activeCamera != cameraPlayer2)
                    activeCamera = cameraPlayer2;
                else
                    activeCamera = cameraPlayer1;
            }
        }
    });

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

    // Charge le modèle GLB de l'ocean
    let ocean = null;
    // let mixer = null;
    const gltfLoader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('../../static/pong/assets/textures/ocean_texture.jpg'); // Remplacez par le chemin de votre texture

    gltfLoader.load('../../static/pong/assets/models/mar.glb', function (gltf) {
        ocean = gltf.scene.clone();
        ocean.scale.set(5000, 5, 5000);
        ocean.position.set(0, 0, 1);
        ocean.rotation.set(Math.PI / 2, 0, 0);

        // Appliquer la texture à tous les matériaux du modèle
        ocean.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture; // Appliquer la texture
                child.material.needsUpdate = true; // Indiquer que le matériau a besoin d'être mis à jour
            }
        });

        scene.add(ocean);

    }, undefined, function (error) {
        console.error('Une erreur est survenue lors du chargement du modèle GLB', error);
    });

    // Charger le modèle GLTF des bateau
    let bateau1 = null;
    let bateau2 = null;
    gltfLoader.load('../../static/pong/assets/models/onepiece.gltf', function (gltf) {
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

    const MTLloader = new THREE.MTLLoader();
    MTLloader.setPath('../../static/pong/assets/textures/');
    MTLloader.load('cannon.mtl', function(materials) {
        materials.preload();

        const OBJLoader = new THREE.OBJLoader();
        OBJLoader.setMaterials(materials);
        OBJLoader.setPath('../../static/pong/assets/models/');
        OBJLoader.load('cannon.obj', function(object) {
            // cannon1
            cannon1 = object.clone();
            cannon1.scale.set(0.01, 0.03, 0.03);
            cannon1.rotation.set(0, 0, -(Math.PI / 2));

            // cannon2
            cannon2 = object.clone();
            cannon2.scale.set(0.01, 0.03, 0.03);
            cannon2.rotation.set(0, 0, Math.PI / 2);

            scene.add(cannon1);
            scene.add(cannon2);
        });
    });

    let cannon1_support = null;
    let cannon2_support = null;
    MTLloader.load('Juste_Support.mtl', function(materials) {
        materials.preload();

        const OBJLoader = new THREE.OBJLoader();
        OBJLoader.setMaterials(materials);
        OBJLoader.setPath('../../static/pong/assets/models/');
        OBJLoader.load('Juste_Support.obj', function(object) {
            cannon1_support = object.clone();
            cannon1_support.scale.set(0.01, 0.03, 0.03);
            cannon1_support.rotation.set(0, 0, -(Math.PI / 2));

            cannon2_support = object.clone();
            cannon2_support.scale.set(0.01, 0.03, 0.03);
            cannon2_support.rotation.set(0, 0, Math.PI / 2);

            // scene.add(cannon1_support);
            // scene.add(cannon2_support);
        });
    });

    let cannon1_tube = null;
    let cannon2_tube = null;
    MTLloader.load('Juste_Cannon.mtl', function(materials) {
        materials.preload();

        const OBJLoader = new THREE.OBJLoader();
        OBJLoader.setMaterials(materials);
        OBJLoader.setPath('../../static/pong/assets/models/');
        OBJLoader.load('Juste_Cannon.obj', function(object) {
            cannon1_tube = object.clone();
            cannon1_tube.scale.set(0.01, 0.03, 0.03);
            cannon1_tube.rotation.set(0, 0, -(Math.PI / 2));
            cannon1_tube.position.set(0, 0, 3);

            cannon2_tube = object.clone();
            cannon2_tube.scale.set(0.01, 0.03, 0.03);
            cannon2_tube.rotation.set(0, 0, Math.PI / 2);

            // scene.add(cannon1_tube);
            // scene.add(cannon2_tube);
        });
    });

    // Transformer en groupe pour pouvoir les déplacer en bloc
    const cannon1TubeGroup = new THREE.Group();
    cannon1TubeGroup.add(cannon1_tube);
    cannon1TubeGroup.position.set(-0.5, 0, 0);
    scene.add(cannon1TubeGroup);

    const cannon2TubeGroup = new THREE.Group();
    cannon2TubeGroup.add(cannon2_tube);
    cannon2TubeGroup.position.set(-0.5, 0, 0);
    scene.add(cannon2TubeGroup);

    const cannon1Group = new THREE.Group();
    cannon1Group.add(cannon1_support);
    cannon1Group.add(cannon1TubeGroup);
    scene.add(cannon1Group);

    const cannon2Group = new THREE.Group();
    cannon2Group.add(cannon2_support);
    cannon2Group.add(cannon2TubeGroup);
    scene.add(cannon2Group);

    function PlaceCannons1(x, y, z)
    {
        cannon1_support.position.set(x, y + 1.02, z - 1.8);
        cannon1_tube.position.set(x, y + 1.02, z - 1.8);
    }

    function PlaceCannons2(x, y, z)
    {
        cannon2_support.position.set(x, y - 1.02, z - 1.8);
        cannon2_tube.position.set(x, y - 1.02, z - 1.8);
    }

    function MoveCannons1X(x)
    {
        cannon1_support.position.x += x;
        cannon1_tube.position.x += x;
    }

    function MoveCannons2X(x)
    {
        cannon2_support.position.x += x;
        cannon2_tube.position.x += x;
    }

    // Créer les objets du jeu Pong
    const paddleGeometry = new THREE.BoxGeometry(0.7, 0.2, 0.6);
    const paddle1Material = new THREE.MeshBasicMaterial({ color: 0x800080 });
    const paddle2Material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material);
    // scene.add(paddle1);
    // scene.add(paddle2);

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

    const playerZoneGeometry = new THREE.BoxGeometry(5.75, 1.5, 0.1);
    const playerZoneMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Couleur marron
    const Player1Zone = new THREE.Mesh(playerZoneGeometry, playerZoneMaterial);
    const Player2Zone = new THREE.Mesh(playerZoneGeometry, playerZoneMaterial);
    // scene.add(Player1Zone);
    // scene.add(Player2Zone);

    const Player1ZoneHitbox = new THREE.BoxHelper(Player1Zone, 0xff0000);
    const Player2ZoneHitbox = new THREE.BoxHelper(Player2Zone, 0xff0000);

    // Variables pour suivre les touches enfoncées
    const keys = {};

    // Écouteurs d'événements pour les touches
    window.addEventListener('keydown', (event) => {
        console.log(`Key pressed: ${event.key}`);
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        console.log(`Key released : ${event.key}`);
        keys[event.key] = false;
    });

    function PlaceElements() {
        if (bateau1 && bateau2 && cannon1 && cannon2 && !elementsPlaced) {
            if (playerRole === 'player1')
                socket.emit('bateauPosition', { playerId, x: bateau1.position.x, y: bateau1.position.y, z: bateau1.position.z, width: bateau1.scale.x, height: bateau1.scale.y });
            else if (playerRole === 'player2')
                socket.emit('bateauPosition', { playerId, x: bateau2.position.x, y: bateau2.position.y, z: bateau2.position.z, width: bateau2.scale.x, height: bateau2.scale.y });
            // Positionner les paddles légèrement au-dessus des bateaux
            paddle1.position.set(bateau1.position.x - (bateau1.scale.x / 2) + 2, bateau1.position.y - 3.2, bateau1.position.z * bateau1.scale.z + 9.9);
            paddle2.position.set(bateau2.position.x - (bateau2.scale.x / 2) + 2, bateau2.position.y + 5, bateau2.position.z * bateau2.scale.z + 9.9);
            socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
            socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
            PlaceCannons1(paddle1.position.x, paddle1.position.y, paddle1.position.z);
            PlaceCannons2(paddle2.position.x, paddle2.position.y, paddle2.position.z);
            Player1Zone.position.set(paddle1.position.x, paddle1.position.y + 0.5, paddle1.position.z);
            Player2Zone.position.set(paddle2.position.x, paddle2.position.y - 0.5, paddle2.position.z);
            Player1Zone.rotation.set(90 * (Math.PI / 180), 180 * (Math.PI / 180), 0);
            Player2Zone.rotation.set(-90 * (Math.PI / 180), 180 * (Math.PI / 180), 0);
            scene.add(Player1ZoneHitbox);
            scene.add(Player2ZoneHitbox);
            Player1ZoneHitbox.update();
            Player2ZoneHitbox.update();

            // Appliquer une rotation à la caméra pour le joueur 2
            if (playerRole === 'player2') {
                cameraPlayer1.position.set(paddle2.position.x, paddle2.position.y - 2.9, paddle2.position.z + 2.5); // Derrière le paddle
                cameraPlayer1.lookAt(new THREE.Vector3(paddle2.position.x, paddle2.position.y, paddle2.position.z));
                cameraPlayer1.rotation.x = 60 * (Math.PI / 180);
                if (playerCount === 2)
                {
                    cameraPlayer2.position.set(0, -5, 40);
                    cameraPlayer2.rotation.set(0, 0, 0);
                }
            } else if (playerRole === 'player1') {
                cameraPlayer1.position.set(paddle1.position.x, paddle1.position.y + 2.9, paddle1.position.z + 2.5); // Derrière le paddle
                cameraPlayer1.lookAt(new THREE.Vector3(paddle1.position.x, paddle1.position.y, paddle1.position.z));
                cameraPlayer1.rotation.x = -60 * (Math.PI / 180);
                cameraPlayer1.rotation.z = 180 * (Math.PI / 180); // Rotation de 180 degrés
                if (playerCount === 2)
                {
                    cameraPlayer2.position.set(0, 5, 40);
                    cameraPlayer2.rotation.set(0, 0, 0);
                    cameraPlayer2.rotation.z = 180 * (Math.PI / 180);
                }
            }
            else if (playerRole === 'player3')
            {
                cameraPlayer1.position.set(0, 0, 20);
                cameraPlayer1.rotation.set(0, 0, 0);
            }
            else if (playerRole === 'player4')
            {
                cameraPlayer2.position.set(0, 0, 20);
                cameraPlayer2.rotation.set(0, 0, 0);
            }
            elementsPlaced = true; // Marquer les éléments comme placés
        }
    }

    // global.MaxPosPaddle = -0.30;
    // global.MinPosPaddle = -5.65;

    function getXMinMax(mesh)
    {
        const box = new THREE.Box3().setFromObject(mesh);
        return {
            xMin: box.min.x,
            xMax: box.max.x
        };
    }

    // Fonction pour envoyer la position du paddle à des intervalles réguliers
    setInterval(() => {
        if (activeCamera === cameraPlayer1)
        {
            // console.log("True");
            if (keys['a']) {
                if (playerRole === 'player1' && paddle1.position.x < getXMinMax(Player1Zone).xMax)
                    {
                        paddle1.position.x += 0.05;
                        MoveCannons1X(0.05);
                        console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                    }
                else if (playerRole === 'player2' && paddle2.position.x > getXMinMax(Player2Zone).xMin)
                    {
                        paddle2.position.x -= 0.05;
                        MoveCannons2X(-0.05);
                        console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                    }
            }
            if (keys['d']) {
                if (playerRole === 'player1' && paddle1.position.x > getXMinMax(Player1Zone).xMin)
                    {
                        paddle1.position.x -= 0.05;
                        MoveCannons1X(-0.05);
                        console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                    }
                else if (playerRole === 'player2' && paddle2.position.x < getXMinMax(Player2Zone).xMax)
                    {
                        paddle2.position.x += 0.05;
                        MoveCannons2X(0.05);
                        console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                    }
            }
            if (keys['w'])
            {
                if (playerRole === 'player1' && cannon1_tube.rotation.x < 2.5)
                {
                    // cannon1_support.rotation.y += 0.05;
                    cannon1_tube.rotation.x += 0.05;
                }
            }
            if (keys['s'])
            {
                if (playerRole === 'player1' && cannon1_tube.rotation.x > -2.5)
                {
                    // cannon1_support.rotation.y += 0.05;
                    cannon1_tube.rotation.x -= 0.05;
                }
            }
        }
        if (activeCamera === cameraPlayer2)
        {
            if (keys['a'])
            {
                console.log(`Bateau position updated for player ${playerId}: ${bateau1.position.x}, ${bateau1.position.y}`);
                if (playerRole === 'player1' && bateau1.position.x < 20)
                    {
                        bateau1.position.x += 0.5;
                        MoveCannons1X(0.5);
                        paddle1.position.x += 0.5;
                        Player1Zone.position.x += 0.5;
                        Player1ZoneHitbox.update();
                        cameraPlayer1.position.x += 0.5;
                        console.log(`Bateau position updated for player ${playerId}: ${bateau1.position.x}, ${bateau1.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                    }
                else if (playerRole === 'player2' && bateau2.position.x > -20)
                    {
                        bateau2.position.x -= 0.5;
                        MoveCannons2X(-0.5);
                        paddle2.position.x -= 0.5;
                        Player2Zone.position.x -= 0.5;
                        Player2ZoneHitbox.update();
                        cameraPlayer1.position.x -= 0.5;
                        console.log(`Bateau position updated for player ${playerId}: ${bateau2.position.x}, ${bateau2.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                    }
            }
            if (keys['d'])
            {
                console.log(`Bateau position updated for player ${playerId}: ${bateau1.position.x}, ${bateau1.position.y}`);
                if (playerRole === 'player1' && bateau1.position.x > -20)
                    {
                        bateau1.position.x -= 0.5;
                        MoveCannons1X(-0.5);
                        paddle1.position.x -= 0.5; 
                        Player1Zone.position.x -= 0.5;
                        Player1ZoneHitbox.update();
                        cameraPlayer1.position.x -= 0.5;
                        console.log(`Bateau position updated for player ${playerId}: ${bateau1.position.x}, ${bateau1.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                    }
                else if (playerRole === 'player2' && bateau2.position.x < 20)
                    {
                        bateau2.position.x += 0.5;
                        MoveCannons2X(0.5);
                        paddle2.position.x += 0.5;
                        Player2Zone.position.x += 0.5;
                        Player2ZoneHitbox.update();
                        cameraPlayer1.position.x += 0.5;
                        console.log(`Bateau position updated for player ${playerId}: ${bateau2.position.x}, ${bateau2.position.y}`);
                        socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                    }
            }
        }
    }, 16); // Envoyer la position toutes les 100ms

    let directionLine; // Déclaration de la ligne de direction

    function createDirectionLine() {
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Couleur de la ligne
        const points = [];
        points.push(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z)); // Position de la balle
        points.push(new THREE.Vector3(ball.position.x + ball.direction.x * 10, ball.position.y + ball.direction.y * 10, ball.position.z)); // Point de direction

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        directionLine = new THREE.Line(geometry, material);
        scene.add(directionLine); // Ajouter la ligne à la scène
    }

    function updateDirectionLine() {
        if (directionLine) {
            // Mettre à jour les points de la ligne
            const points = directionLine.geometry.attributes.position.array;
            points[0] = ball.position.x;
            points[1] = ball.position.y;
            points[2] = ball.position.z;

            points[3] = ball.position.x + ball.direction.x * 10; // Point de direction
            points[4] = ball.position.y + ball.direction.y * 10; // Point de direction
            points[5] = ball.position.z;

            directionLine.geometry.attributes.position.needsUpdate = true; // Indiquer que la géométrie a besoin d'être mise à jour
        }
    }

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);

    
        if (!gameStarted) {
            return;
        }

        PlaceElements();
        // Appeler createDirectionLine() une fois pour créer la ligne
        // createDirectionLine();
    
        // Mettre à jour les hitboxes
        paddle1Hitbox.update();
        paddle2Hitbox.update();
    
        renderer.render(scene, activeCamera);
    }

    animate();

    // Écouteur d'événements pour le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        cameraPlayer1.aspect = window.innerWidth / window.innerHeight;
        cameraPlayer1.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};