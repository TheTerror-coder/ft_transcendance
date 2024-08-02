window.onload = function() {
    const socket = io('http://localhost:3000'); // Si vous accédez directement depuis votre machine

    let playerId = null;
    let gameStarted = false;
    let elementsPlaced = false; 

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
        ball.direction = data.ballDirection;
        console.log(`Player ID: ${playerId}`);
        console.log(`Player Role: ${playerRole}`);
        console.log(`Ball Direction: ${ball.direction}`);
    });

    // Recevoir la position de la balle du serveur
    socket.on('ballPosition', (data) => {
        ball.position.x = data.x;
        ball.position.y = data.y;
        ball.position.z = data.z;
        updateDirectionLine();
    });

    socket.on('ballDirection', (data) => {
        ball.direction.x = data.x;
        ball.direction.y = data.y;
        ball.direction.z = data.z;
    });

    // Recevoir la position des paddles du serveur
    socket.on('paddlePosition', (data) => {
        if (data.paddle === 'paddle1') {
            paddle1.position.x = data.x;
            cannon1.position.x = data.x;
        } else if (data.paddle === 'paddle2') {
            paddle2.position.x = data.x;
            cannon2.position.x = data.x;
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
    });

    // Initialiser Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const camera2 = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    document.getElementById('gameCanvas').appendChild(renderer.domElement);

    // Vérifie cette partie
    camera2.position.set(0, 0, 20);
    camera2.rotation.set(0, 0, 0);
    // Ajouter la camera2 à la scène
    scene.add(camera2);
    // Contrôles clavier de la camera2 avec les touches WASD
    const keys2 = {};
    window.addEventListener('keydown', (event) => {
        keys2[event.key] = true;
    });
    window.addEventListener('keyup', (event) => {
        keys2[event.key] = false;
    });
    setInterval(function() {
        if (keys2['w']) {
            camera2.position.x -= Math.sin(camera2.rotation.y) * 0.05;
            camera2.position.z -= Math.cos(camera2.rotation.y) * 0.05;
        }
        if (keys2['s']) {
            camera2.position.x += Math.sin(camera2.rotation.y) * 0.05;
            camera2.position.z += Math.cos(camera2.rotation.y) * 0.05;
        }
        if (keys2['ArrowUp']) {
            camera2.position.y += 0.05;
        }
        if (keys2['ArrowDown']) {
            camera2.position.y -= 0.05;
        }
        if (keys2['ArrowLeft']) {
            camera2.position.x -= 0.05;
        }
        if (keys2['ArrowRight']) {
            camera2.position.x += 0.05;
        }
        if (keys2['y']) {
            camera2.rotation.x += 0.05;
        }
        if (keys2['h']) {
            camera2.rotation.x -= 0.05;
        }
        if (keys2['g']) {
            camera2.rotation.y += 0.05;
        }
        if (keys2['j']) {
            camera2.rotation.y -= 0.05;
        }
        if (keys2['t']) {
            camera2.rotation.z += 0.05;
        }
        if (keys2['u']) {
            camera2.rotation.z -= 0.05;
        }
    }, 16);

    let activeCamera = camera; // Par défaut, la camera1 est active

    window.addEventListener('keydown', (event) => {
        if (event.key === 'c') { // Appuyer sur 'c' pour changer de caméra
            if (activeCamera === camera) {
                activeCamera = camera2;
            } else {
                activeCamera = camera;
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
    let mixer = null;
    const gltfLoader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('../static/pong/assets/textures/ocean_texture.jpg'); // Remplacez par le chemin de votre texture

    gltfLoader.load('../static/pong/assets/models/mar.glb', function (gltf) {
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

        mixer = new THREE.AnimationMixer(ocean); // Créer un mixer pour les animations
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play(); // Jouer chaque animation
        });
    }, undefined, function (error) {
        console.error('Une erreur est survenue lors du chargement du modèle GLB', error);
    });

    // Charger le modèle GLTF des bateau
    let bateau1 = null;
    let bateau2 = null;
    // const gltfLoader = new THREE.GLTFLoader();
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

    let cannon1 = null;
    let cannon2 = null;
    const MTLloader = new THREE.MTLLoader();
    MTLloader.setPath('../static/pong/assets/textures/');
    MTLloader.load('cannon.mtl', function(materials) {
        materials.preload();

        const OBJLoader = new THREE.OBJLoader();
        OBJLoader.setMaterials(materials);
        OBJLoader.setPath('../static/pong/assets/models/');
        OBJLoader.load('cannon.obj', function(object) {
            // cannon1
            cannon1 = object.clone();
            // cannon1.position.set(0, 20, -1);
            cannon1.scale.set(0.01, 0.03, 0.03);
            cannon1.rotation.set(0, 0, -(Math.PI / 2));

            // cannon2
            cannon2 = object.clone();
            // cannon2.position.set(6, -20, -1);
            cannon2.scale.set(0.01, 0.03, 0.03);
            cannon2.rotation.set(0, 0, Math.PI / 2);

            scene.add(cannon1);
            scene.add(cannon2);
        });
    });

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

    // Variables pour suivre les touches enfoncées
    const keys = {};

    // Écouteurs d'événements pour les touches
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    function PlaceElements() {
        if (bateau1 && bateau2 && !elementsPlaced) {
            if (playerRole === 'player1')
                socket.emit('bateauPosition', { playerId, x: bateau1.position.x, y: bateau1.position.y, z: bateau1.position.z, width: bateau1.scale.x, height: bateau1.scale.y });
            else if (playerRole === 'player2')
                socket.emit('bateauPosition', { playerId, x: bateau2.position.x, y: bateau2.position.y, z: bateau2.position.z, width: bateau2.scale.x, height: bateau2.scale.y });
            // Positionner les paddles légèrement au-dessus des bateaux
            paddle1.position.set(bateau1.position.x - (bateau1.scale.x / 2) + 2, bateau1.position.y - 3.2, bateau1.position.z * bateau1.scale.z + 9.9);
            paddle2.position.set(bateau2.position.x - (bateau2.scale.x / 2) + 2, bateau2.position.y + 5, bateau2.position.z * bateau2.scale.z + 9.9);
            cannon1.position.set(paddle1.position.x, paddle1.position.y + 1.02, paddle1.position.z - 1.8);
            cannon2.position.set(paddle2.position.x, paddle2.position.y - 1.02, paddle2.position.z - 1.8);

            // Appliquer une rotation à la caméra pour le joueur 2
            if (playerRole === 'player2') {
                camera.position.set(paddle2.position.x, paddle2.position.y - 2.9, paddle2.position.z + 2.5); // Derrière le paddle
                camera.lookAt(new THREE.Vector3(paddle2.position.x, paddle2.position.y, paddle2.position.z));
                camera.rotation.x = 60 * (Math.PI / 180);
            } else if (playerRole === 'player1') {
                camera.position.set(paddle1.position.x, paddle1.position.y + 2.9, paddle1.position.z + 2.5); // Derrière le paddle
                camera.lookAt(new THREE.Vector3(paddle1.position.x, paddle1.position.y, paddle1.position.z));
                camera.rotation.x = -60 * (Math.PI / 180);
                camera.rotation.z = 180 * (Math.PI / 180); // Rotation de 180 degrés

            }
            elementsPlaced = true; // Marquer les éléments comme placés
        }
    }

    // Fonction pour envoyer la position du paddle à des intervalles réguliers
    setInterval(() => {
        if (keys['a']) {
            if (playerRole === 'player1' && paddle1.position.x < -0.30)
                {
                    paddle1.position.x += 0.05;
                    cannon1.position.x += 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                }
            else if (playerRole === 'player2' && paddle2.position.x > -5.65)
                {
                    paddle2.position.x -= 0.05;
                    cannon2.position.x -= 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
                }
        }
        if (keys['d']) {
            if (playerRole === 'player1' && paddle1.position.x > -5.65)
                {
                    paddle1.position.x -= 0.05;
                    cannon1.position.x -= 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle1.position.x}, ${paddle1.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
                }
            else if (playerRole === 'player2' && paddle2.position.x < -0.30)
                {
                    paddle2.position.x += 0.05;
                    cannon2.position.x += 0.05;
                    console.log(`Paddle position updated for player ${playerId}: ${paddle2.position.x}, ${paddle2.position.y}`);
                    socket.emit('paddlePosition', { playerId, paddle: 'paddle2', x: paddle2.position.x, y: paddle2.position.y });
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
        createDirectionLine();

        if (mixer) {
            mixer.update(0.01); // Mettre à jour le mixer
        }
    
        // Mettre à jour les hitboxes
        paddle1Hitbox.update();
        paddle2Hitbox.update();
    
        renderer.render(scene, activeCamera);
    }

    animate();

    // Écouteur d'événements pour le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};