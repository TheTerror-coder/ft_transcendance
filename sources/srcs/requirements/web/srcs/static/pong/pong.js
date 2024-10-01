// import { Team } from './Team.js';

const Team = require('./Team.js');
const Player = require('./Player.js');

window.onload = function() {
    if (localStorage.getItem('redirectAfterReload')) {
        localStorage.removeItem('redirectAfterReload');
        window.location.href = '/lobby';
        return;
    }
    main();
};

function main() {
    const { scene, cameraPlayer1, renderer } = initScene();
    const socket = io('http://localhost:3000');
    const keys = {};
    let playerId = null;
    let paddle1 = initPaddle();
    let paddle2 = initPaddle();
    let cannonGroup = initCannons(scene);
    let bateau = initBateaux(scene);
    let ocean = initOceans(scene);
    let ball = initBall(scene);
    let Team1 = initTeam1(scene, paddle1, cannonGroup, bateau);
    let Team2 = initTeam2(scene, paddle2, cannonGroup, bateau);
    let PlayerRole = initRole();

    setupEventListeners(socket, keys);

    updateAndEmitPaddlePositions(socket, Team1, Team2, keys, playerId);
    periodicGameStateUpdate(socket);

    setupEventListeners(socket, keys);
    setupSocketListeners(socket, playerId, PlayerRole, Team1, Team2, cameraPlayer1, null);

    function animate() {
        if (!gameStarted) {
            return;
        }
        requestAnimationFrame(animate);
        renderer.render(scene, cameraPlayer1);
    }

    animate();
}

// function loadScreen(scene, paddle1, paddle2, cannonGroup, bateau)
// {

// }

function initRole()
{
    let random;
    for (let i = 0; i < 2; i++)
    {
        random = Math.floor(Math.random() * 2);
        if (random == 0)
            return 'Captain';
        else if (random == 1)
            return 'Cannoneer';
    }
}

function initTeam1(scene, paddle1, cannonGroup, bateau)
{
    let Team1 = {paddle1, cannonGroup : cannonGroup.cannonTeam1, bateau : bateau.bateauTeam1};
    return Team1;
}

function initTeam2(scene, paddle2, cannonGroup, bateau)
{
    let Team2 = {paddle2, cannonGroup : cannonGroup.cannonTeam2, bateau : bateau.bateauTeam2};
    return Team2;
}

function initScene() {
    const scene = new THREE.Scene();
    const cameraPlayer1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return { scene, cameraPlayer1, renderer };
}

function setupEventListeners(socket, keys) {
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    window.addEventListener('resize', function () {
        cameraPlayer1.aspect = window.innerWidth / window.innerHeight;
        cameraPlayer1.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('beforeunload', function (event) {
        localStorage.setItem('redirectAfterReload', 'true');
        socket.disconnect();
    });
}

function initPaddle() {
    const paddleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    return paddle;
}

function initBall() {
    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    return { ball };
}

function initBateaux(scene) {
    const gltfLoader = new THREE.GLTFLoader();
    // Charger les modèles GLTF des bateaux
    gltfLoader.load('../../static/pong/assets/models/onepiece.gltf', function (gltf) {
        const bateauTeam1 = gltf.scene.clone();
        bateauTeam1.position.set(0, 20, -1);
        bateauTeam1.scale.set(10, 5, 5);
        bateauTeam1.rotation.set(Math.PI / 2, 0, 0);

        const bateauTeam2 = gltf.scene.clone();
        bateauTeam2.position.set(0, -20, -1);
        bateauTeam2.scale.set(10, 5, 5);
        bateauTeam2.rotation.set(Math.PI / 2, 0, 0);

        console.log('Boat models loaded successfully');
    }, undefined, function (error) {
        console.error('Error loading the boat models:', error);
    });
    return { bateauTeam1, bateauTeam2 };
}

function initOceans(scene) {
    const gltfLoader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    // Charger la texture de l'océan
    const oceanTexture = textureLoader.load('../../static/pong/assets/textures/ocean_texture.jpg');

    // Charger le modèle GLB de l'océan
    gltfLoader.load('../../static/pong/assets/models/mar.glb', function (gltf) {
        const ocean = gltf.scene.clone();
        ocean.scale.set(5000, 5, 5000);
        ocean.position.set(0, 0, 1);
        ocean.rotation.set(Math.PI / 2, 0, 0);
        ocean.traverse((child) => {
            if (child.isMesh) {
                child.material.map = oceanTexture;
                child.material.needsUpdate = true;
            }
        });
        console.log('Ocean model loaded successfully');
    }, undefined, function (error) {
        console.error('Error loading the ocean model:', error);
    });
    return ocean;
}

function loadCanons_Support() {
    const MTLloader = new THREE.MTLLoader();
    const OBJLoader = new THREE.OBJLoader();

    // Charger les supports de canon
    MTLloader.setPath('../../static/pong/assets/textures/');
    MTLloader.load('Juste_Support.mtl', function(materials) {
        materials.preload();
        OBJLoader.setMaterials(materials);
        OBJLoader.setPath('../../static/pong/assets/models/');
        OBJLoader.load('Juste_Support.obj', function(object) {
            const cannonSupport1 = object.clone();
            const cannonSupport2 = object.clone();
            console.log('Cannon supports loaded successfully');
        });
    });
    return { cannonSupport1, cannonSupport2 };
}

function loadCanons_Tube() {
    // Charger les tubes de canon
    MTLloader.load('Juste_Cannon.mtl', function(materials) {
        materials.preload();
        OBJLoader.setMaterials(materials);
        OBJLoader.load('Juste_Cannon.obj', function(object) {
            const cannonTube1 = object.clone();
            const cannonTube2 = object.clone();
            console.log('Cannon tubes loaded successfully');
        });
    });
    return { cannonTube1, cannonTube2 };
}

function initCanons(scene)
{
    let cannonTeam1 = new THREE.Group();
    let cannonTeam2 = new THREE.Group();
    let cannon1_tube_group = new THREE.Group();
    let cannon2_tube_group = new THREE.Group();
    const cannon1_support = loadCanons_Support(scene);
    const cannon1_tube = loadCanons_Tube(scene);
    const cannon2_support = loadCanons_Support(scene);
    const cannon2_tube = loadCanons_Tube(scene);

    // Ajouter les tubes de canon dans leurs groupes respectifs
    cannon1_tube_group.add(cannon1_tube);
    cannon2_tube_group.add(cannon2_tube);

    // Ajouter les groupes de tubes de canon aux groupes de canons
    cannonTeam1.add(cannon1_tube_group);
    cannonTeam2.add(cannon2_tube_group);

    // Ajouter les supports de canon aux groupes de canons
    cannonTeam1.add(cannon1_support);
    cannonTeam2.add(cannon2_support);

    return { cannonTeam1, cannonTeam2 };
}

function updateAndEmitPaddlePositions(socket, paddle1, paddle2, cannon1Group, cannon2Group, keys, playerId) {
    setInterval(() => {
        if (keys['ArrowRight']) {
            paddle1.position.x += 0.1;
            cannon1Group.position.x += 0.1;
            socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
        }
        // Add other key checks and updates for paddle2
    }, 100);
}

function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}

function adjustCamera(cameraPlayer1, cameraPlayer2, playerRole, paddle1, paddle2) {
    if (playerRole === 'player2') {
        cameraPlayer1.position.set(paddle2.position.x, paddle2.position.y - 2.9, paddle2.position.z + 2.5);
        cameraPlayer1.lookAt(new THREE.Vector3(paddle2.position.x, paddle2.position.y, paddle2.position.z));
        cameraPlayer1.rotation.x = 60 * (Math.PI / 180);
    } else if (playerRole === 'player1') {
        cameraPlayer1.position.set(paddle1.position.x, paddle1.position.y + 2.9, paddle1.position.z + 2.5);
        cameraPlayer1.lookAt(new THREE.Vector3(paddle1.position.x, paddle1.position.y, paddle1.position.z));
        cameraPlayer1.rotation.x = -60 * (Math.PI / 180);
    }
    // Ajouter des ajustements pour player3 et player4 si nécessaire
}

function setupSocketListeners(socket, playerId, playerRole, paddle1, paddle2, cameraPlayer1, cameraPlayer2)
{
    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        socket.emit('stopGame');
        window.location.href = '/lobby';
        console.log('Disconnected from the server');
    });

    socket.on('playerInfo', (data) => {
        playerId = data.playerId;
        playerRole = data.playerRole;
        ball.direction = data.ballDirection;
        adjustCamera(cameraPlayer1, cameraPlayer2, playerRole, paddle1, paddle2);
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

    socket.on('paddlePosition', (data) => {
        if (data.paddle === 'paddle1') {
            paddle1.position.x = data.x;
        } else if (data.paddle === 'paddle2') {
            paddle2.position.x = data.x;
        }
    });

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
        window.location.href = '/lobby';
    });

    // Autres écouteurs...
}