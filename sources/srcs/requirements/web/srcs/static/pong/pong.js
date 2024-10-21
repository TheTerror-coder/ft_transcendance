import Team from './Team.js';
import Player from './Player.js';
// import socket from './socket.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { TextureLoader } from 'three/addons/loaders/TextureLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

console.log("pong.js loaded");

export async function main(gameCode, socket) {
    // const socket = io('http://localhost:3000');
    console.log('socket : ', socket);
    
    socket.emit('GameStarted', gameCode);

    console.log("gameCode : ", gameCode);

    let Team1 = null;
    let Team2 = null;

    socket.on('gameData', (gameData) => {
        console.log('Données de la partie:', gameData);
        if (gameData) {
            ({ Team1, Team2 } = initGame(gameData));
            console.log('Team1:', Team1);
            console.log('Team2:', Team2);
        } else {
            console.error('Aucune donnée de partie trouvée.');
        }
    });

    let { scene, cameraPlayer, renderer, ambientLight, directionalLight1, directionalLight2 } = initScene();

    
    // Créer un élément pour afficher la rotation
    const rotationDisplay = document.createElement('div');
    rotationDisplay.style.position = 'absolute';
    rotationDisplay.style.top = '10px';
    rotationDisplay.style.left = '10px';
    rotationDisplay.style.color = 'white';
    document.body.appendChild(rotationDisplay);
    setupCameraControls(cameraPlayer, rotationDisplay); // Ajout de la ligne pour créer la caméra contrôlable

    const GLTFloader = new GLTFLoader();
    const keys = {};
    // let paddle1 = initPaddle();
    // let paddle2 = initPaddle();
    let cannonGroup = await initCannons(scene);
    console.log('CannonGroup:', cannonGroup);
    console.log('Team1 cannon:', Team1.getCannon());
    console.log('Team2 cannon:', Team2.getCannon());
    let bateau = await initBateaux(scene, GLTFloader);
    console.log('bateau:', bateau);
    Team1.setBoat(bateau.bateauTeam1);
    Team2.setBoat(bateau.bateauTeam2);
    Team1.setCannon(cannonGroup.get('cannonTeam1'));
    Team2.setCannon(cannonGroup.get('cannonTeam2'));
    console.log('Team1 boat:', Team1.getBoat());
    console.log('Team2 boat:', Team2.getBoat());
    let ocean = await initOceans(scene, new THREE.TextureLoader());
    let ball = await initBall();
    // let Team1 = initTeam1(scene, paddle1, cannonGroup, bateau);
    // let Team2 = initTeam2(scene, paddle2, cannonGroup, bateau);

    // Team1.setCameraPosForAllPlayers(Team2.getBoat().position.x, Team2.getBoat().position.y, Team2.getBoat().position.z);
    // Team2.setCameraPosForAllPlayers(Team1.getBoat().position.x, Team1.getBoat().position.y, Team1.getBoat().position.z);
    let player = null;
    let playerTeam = null;
    if (Team1.getPlayerById(socket.id))
    {
        player = Team1.getPlayerById(socket.id);
        playerTeam = Team1;
    }
    else if (Team2.getPlayerById(socket.id))
    {
        player = Team2.getPlayerById(socket.id);
        playerTeam = Team2;
    }
    console.log('player : ', player);
    console.log('playerTeam : ', playerTeam);
    player.setCameraPos(playerTeam.getBoat(), playerTeam.getCannon());
    cameraPlayer = initCamera(player, cameraPlayer);
    // cameraPlayer.position.set(0, 20, 70);
    // cameraPlayer.rotation.set(0, 0, 0);
    console.log('cameraPlayer : ', cameraPlayer);

    for (const player of Team1.getPlayerMap().values())
    {
        console.log('Player Team1 : ', player);
        console.log('Player Team1 camera pos : ', player.getCameraPos());
    }
    for (const player of Team2.getPlayerMap().values())
    {
        console.log('Player Team2 : ', player);
        console.log('Player Team2 camera pos : ', player.getCameraPos());
    }

    socket.on('test', (data) => {
        console.log('test OK : ', data);
    });

    setupEventListeners(socket, keys);

    setInterval(() => {
        updateAndEmitBoatPositions(socket, Team1, Team2, keys);
        updateAndEmitCannonPositions(socket, Team1, Team2, keys);
    }, 16);
    periodicGameStateUpdate(socket);

    setupEventListeners(socket, keys);
    setInterval(() => {
        setupSocketListeners(socket, Team1, Team2);
    }, 16);

    loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, Team1.getBoat(), Team2.getBoat(), Team1.getCannon(), Team2.getCannon());
    function animate() {
        // if (!gameStarted) {
        //     return;
        // }
        requestAnimationFrame(animate);
        renderer.render(scene, cameraPlayer);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', function() {
    window.onload = async function() {
        if (localStorage.getItem('redirectAfterReload')) {
            localStorage.removeItem('redirectAfterReload');
            // window.location.href = '/lobby';
            return;
        }

        await main();
    };
});

function loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2, cannonTeam1, cannonTeam2)
{
    scene.add(ball);
    scene.add(ocean);
    scene.add(ambientLight);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
    scene.add(bateau1);
    scene.add(bateau2);
    scene.add(cannonTeam1);
    scene.add(cannonTeam2);
}

function initGame(gameData)
{
    console.log('Initialisation du jeu avec les données : ', gameData);

    // Créer les équipes
    const team1 = new Team(gameData.team1.name, gameData.team1.maxNbPlayer, gameData.team1.TeamId);
    const team2 = new Team(gameData.team2.name, gameData.team2.maxNbPlayer, gameData.team2.TeamId);

    // Accéder aux joueurs de l'équipe 1 et les ajouter à l'équipe
    Object.keys(gameData.team1.Player).forEach(key => {
        const playerData = gameData.team1.Player[key];
        const player = new Player(playerData.id, playerData.role, playerData.name, team1.getTeamId());
        team1.setPlayer(player);
        console.log(`Joueur ${key} de l'équipe 1 :`, player);
    });

    // Accéder aux joueurs de l'équipe 2 et les ajouter à l'équipe
    Object.keys(gameData.team2.Player).forEach(key => {
        const playerData = gameData.team2.Player[key];
        const player = new Player(playerData.id, playerData.role, playerData.name, team2.getTeamId());
        team2.setPlayer(player);
        console.log(`Joueur ${key} de l'équipe 2 :`, player);
    });

    // Afficher les équipes et leurs joueurs
    console.log('Équipe 1 :', team1);
    console.log('Équipe 2 :', team2);

    return { Team1: team1, Team2: team2 }; // Assurez-vous de retourner les équipes correctement
}

function initCamera(player, cameraPlayer)
{
    cameraPlayer.position.copy(player.getCameraPos());
    console.log('player.getCameraRotation() : ', player.getCameraRotation());
    cameraPlayer.rotation.set(player.getCameraRotation().x, player.getCameraRotation().y, player.getCameraRotation().z);
    return (cameraPlayer);
}

function initScene() {
    const scene = new THREE.Scene();
    const cameraPlayer = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lumière ambiante

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1); // Lumière directionnelle pour bateau1
    directionalLight1.position.set(0, 20, 10);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1); // Lumière directionnelle pour bateau2
    directionalLight2.position.set(0, -20, 10);
    // Ajouter un fond bleu plus océan
    const oceanColor = 0x1E90FF; // Couleur bleu océan
    scene.background = new THREE.Color(oceanColor);
    return { scene, cameraPlayer, renderer, ambientLight, directionalLight1, directionalLight2 };
}

function setupEventListeners(socket, keys, cameraPlayer) {
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    window.addEventListener('resize', function () {
        if (cameraPlayer) {
            cameraPlayer.aspect = window.innerWidth / window.innerHeight;
            cameraPlayer.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    window.addEventListener('beforeunload', function (event) {
        localStorage.setItem('redirectAfterReload', 'true');
        socket.disconnect();
    });
}

function initBall() {
    return new Promise((resolve, reject) => {
        try {
            const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
            const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            console.log('Ball initialized successfully');
            resolve(ball);
        } catch (error) {
            console.error('Error initializing ball:', error);
            reject(error);
        }
    });
}

function initBateaux(scene, gltfLoader) {
    return new Promise((resolve, reject) => {
        // Charger les modèles GLTF des bateaux
        gltfLoader.load('../../static/pong/assets/models/onepiece.gltf', function (gltf) {
            const texture = new THREE.TextureLoader().load('../../static/pong/assets/textures/bateau_texture.png');
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
            const bateauTeam1 = gltf.scene.clone();
            bateauTeam1.position.set(0, 20, -1);
            bateauTeam1.scale.set(10, 5, 5);
            bateauTeam1.rotation.set(Math.PI / 2, 0, 0);

            const bateauTeam2 = gltf.scene.clone();
            bateauTeam2.position.set(0, -20, -1);
            bateauTeam2.scale.set(10, 5, 5);
            bateauTeam2.rotation.set(Math.PI / 2, 0, 0);

            console.log('Boat models loaded successfully');
            resolve({ bateauTeam1, bateauTeam2 });
        }, undefined, function (error) {
            console.error('Error loading the boat models:', error);
            reject(error);
        });
    });
}

function initOceans(scene, textureLoader) {
    return new Promise((resolve, reject) => {
        // Charger la texture de l'océan
        const oceanTexture = textureLoader.load('../../static/pong/assets/textures/ocean_texture.jpg', 
            // Fonction de succès
            function(texture) {
                // Créer un plan rectangulaire pour représenter l'océan
                const oceanGeometry = new THREE.PlaneGeometry(10000, 10000);
                const oceanMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    side: THREE.FrontSide // Rendre le plan visible d'un seul côté
                });
                
                const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
                
                // Positionner et orienter l'océan
                // ocean.rotation.x = -Math.PI / 2; // Rotation pour que le plan soit horizontal
                ocean.position.y = -1; // Légèrement en dessous du niveau 0 pour éviter les conflits avec d'autres objets

                // Étirer la texture pour couvrir toute la surface sans répétition
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.repeat.set(1, 1);

                console.log('Plan océanique créé avec succès');
                resolve(ocean);
            },
            // Fonction de progression (optionnelle)
            undefined,
            // Fonction d'erreur
            function(error) {
                console.error('Error loading the ocean texture:', error);
                reject(error);
            }
        );
    });
}

function loadCannons_Support(MTLloader, OBJLoader) {
    return new Promise((resolve, reject) => {
        MTLloader.setPath('../../static/pong/assets/textures/');
        MTLloader.load('Juste_Support.mtl', function(materials) {
            materials.preload();
            OBJLoader.setMaterials(materials);
            OBJLoader.setPath('../../static/pong/assets/models/');
            OBJLoader.load('Juste_Support.obj', function(object) {
                const cannonSupport1 = object.clone();
                const cannonSupport2 = object.clone();
                console.log('Cannon supports loaded successfully');
                console.log('Cannon support 1 :', cannonSupport1);
                console.log('Cannon support 2 :', cannonSupport2);
                resolve({ cannonSupport1, cannonSupport2 });
            }, undefined, function (error) {
                console.error('Error loading the cannon support model:', error);
                reject(error);
            });
        }, undefined, function (error) {
            console.error('Error loading the materials:', error);
            reject(error);
        });
    });
}

function loadCannons_Tube(MTLloader, OBJLoader) {
    return new Promise((resolve, reject) => {
        // Charger les tubes de canon
        MTLloader.load('Juste_Cannon.mtl', function(materials) {
            materials.preload();
            OBJLoader.setMaterials(materials);
            OBJLoader.load('Juste_Cannon.obj', function(object) {
                const cannonTube1 = object.clone();
                const cannonTube2 = object.clone();
                console.log('Cannon tubes loaded successfully');
                resolve({ cannonTube1, cannonTube2 });
            }, undefined, function (error) {
                console.error('Error loading the cannon tube model:', error);
                reject(error);
            });
        });
    });
}

async function initCannons(scene) {
    const MTLloader = new MTLLoader();
    const objLoader = new OBJLoader(); // Assurez-vous d'utiliser une minuscule pour l'instance
    let cannonGroup = new Map();

    try {
        const { cannonSupport1, cannonSupport2 } = await loadCannons_Support(MTLloader, objLoader);
        const { cannonTube1, cannonTube2 } = await loadCannons_Tube(MTLloader, objLoader);

        // Créer les groupes de canons pour chaque équipe
        let cannonTeam1 = new THREE.Group();
        let cannonTeam2 = new THREE.Group();
        let cannon1_tube_group = new THREE.Group();
        let cannon2_tube_group = new THREE.Group();

        // Ajouter les tubes de canon dans leurs groupes respectifs
        cannon1_tube_group.add(cannonTube1);
        cannon2_tube_group.add(cannonTube2);

        // Ajouter les groupes de tubes de canon aux groupes de canons
        cannonTeam1.add(cannon1_tube_group);
        cannonTeam2.add(cannon2_tube_group);

        // Ajouter les supports de canon aux groupes de canons
        cannonTeam1.add(cannonSupport1);
        cannonTeam2.add(cannonSupport2);

        // cannonTeam1.position.set(bateau1.position.x - (bateau1.scale.x / 2) + 2, 20, 60);
        // cannonTeam2.position.set(bateau2.position.x - (bateau2.scale.x / 2) + 2, -20, 60);
        cannonTeam1.scale.set(0.01, 0.03, 0.03);
        cannonTeam2.scale.set(0.01, 0.03, 0.03);

        // Ajouter les groupes de canons à la Map
        cannonGroup.set('cannonTeam1', cannonTeam1);
        cannonGroup.set('cannonTeam2', cannonTeam2);

        return cannonGroup;
    } catch (error) {
        console.error('Error initializing cannons:', error);
    }
}

function findPlayer(Team1, Team2, socket)
{
    let playerTeamID = null;
    let playerRole = null;
    let player = Team1.getPlayerById(socket.id);
    if (player) 
    {
        playerTeamID = player.getTeamID();
        playerRole = player.getRole();
    }
    else
    {
        player = Team2.getPlayerById(socket.id);
        playerTeamID = player.getTeamID();
        playerRole = player.getRole();
    }
    return ({ playerTeamID, playerRole });
}

function updateAndEmitCannonPositions(socket, Team1, Team2, keys)
{
    const {playerTeamID, playerRole} = findPlayer(Team1, Team2, socket);
    if (playerTeamID === Team1.getTeamId())
    {
        if (playerRole === 'cannoneer')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team1 Cannoneer d');
                // Team1.getBoat().position.x += 0.1;
                Team1.getCannon().position.x -= 0.1;
                socket.emit('cannonPosition', { playerId: socket.id, cannon: 'cannonTeam1', x: Team1.getCannon().position.x, y: Team1.getCannon().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team1 Cannoneer a');
                // Team1.getBoat().position.x -= 0.1;
                Team1.getCannon().position.x += 0.1;
                socket.emit('cannonPosition', { playerId: socket.id, cannon: 'cannonTeam1', x: Team1.getCannon().position.x, y: Team1.getCannon().position.y });
            }
        }
    }
    else if (playerTeamID === Team2.getTeamId())
    {
        if (playerRole === 'cannoneer')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team2 Cannoneer d');
                // Team2.getBoat().position.x += 0.1;
                Team2.getCannon().position.x += 0.1;
                socket.emit('cannonPosition', { playerId: socket.id, cannon: 'cannonTeam2', x: Team2.getCannon().position.x, y: Team2.getCannon().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team2 Cannoneer a');
                // Team2.getBoat().position.x -= 0.1;
                Team2.getCannon().position.x -= 0.1;
                socket.emit('cannonPosition', { playerId: socket.id, cannon: 'cannonTeam2', x: Team2.getCannon().position.x, y: Team2.getCannon().position.y });
            }
        }
    }
}

function updateAndEmitBoatPositions(socket, Team1, Team2, keys)
{
    const {playerTeamID, playerRole} = findPlayer(Team1, Team2, socket);
    if (playerTeamID === Team1.getTeamId())
    {
        if (playerRole === 'captain')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team1 Captain d');
                Team1.getBoat().position.x -= 0.1;
                Team1.getCannon().position.x -= 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam1', x: Team1.getBoat().position.x, y: Team1.getBoat().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team1 Captain a');
                Team1.getBoat().position.x += 0.1;
                Team1.getCannon().position.x += 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam1', x: Team1.getBoat().position.x, y: Team1.getBoat().position.y });
            }
        } 
    }
    else if (playerTeamID === Team2.getTeamId())
    {
        if (playerRole === 'captain')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team2 Captain d');
                Team2.getBoat().position.x += 0.1;
                Team2.getCannon().position.x += 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam2', x: Team2.getBoat().position.x, y: Team2.getBoat().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team2 Captain a');
                Team2.getBoat().position.x -= 0.1;
                Team2.getCannon().position.x -= 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam2', x: Team2.getBoat().position.x, y: Team2.getBoat().position.y });
            }
        }
    }
}

function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}

function adjustCamera(cameraPlayer, playerRole, Team1, Team2) {
    if (playerRole === 'player2') {
        cameraPlayer.position.set(Team2.getBoat().position.x, Team2.getBoat().position.y - 2.9, Team2.getBoat().position.z + 2.5);
        cameraPlayer.lookAt(new THREE.Vector3(Team2.getBoat().position.x, Team2.getBoat().position.y, Team2.getBoat().position.z));
        cameraPlayer.rotation.x = 60 * (Math.PI / 180);
    } else if (playerRole === 'player1') {
        cameraPlayer.position.set(Team1.getBoat().position.x, Team1.getBoat().position.y + 2.9, Team1.getBoat().position.z + 2.5);
        cameraPlayer.lookAt(new THREE.Vector3(Team1.getBoat().position.x, Team1.getBoat().position.y, Team1.getBoat().position.z));
        cameraPlayer.rotation.x = -60 * (Math.PI / 180);
    }
    // Ajouter des ajustements pour player3 et player4 si nécessaire
}

function setupSocketListeners(socket, Team1, Team2)
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
        adjustCamera(cameraPlayer, playerRole, paddle1, paddle2);
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

function setupCameraControls(cameraPlayer, rotationDisplay) {
    const keys = {};
    let isCameraControlActive = false;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'c') {
            isCameraControlActive = !isCameraControlActive; // Activer ou désactiver le contrôle de la caméra
        }
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    function updateCameraPosition() {
        if (isCameraControlActive) {
            if (keys['ArrowUp']) {
                cameraPlayer.position.z -= 0.1; // Avancer
            }
            if (keys['ArrowDown']) {
                cameraPlayer.position.z += 0.1; // Reculer
            }
            if (keys['ArrowLeft']) {
                cameraPlayer.position.x -= 0.1; // Déplacer à gauche
            }
            if (keys['ArrowRight']) {
                cameraPlayer.position.x += 0.1; // Déplacer à droite
            }
            if (keys['q']) { // Rotation à gauche
                cameraPlayer.rotation.y -= 0.01;
            }
            if (keys['e']) { // Rotation à droite
                cameraPlayer.rotation.y += 0.01;
            }
            if (keys['r']) { // Rotation vers le haut
                cameraPlayer.rotation.x -= 0.01;
            }
            if (keys['f']) { // Rotation vers le bas
                cameraPlayer.rotation.x += 0.01;
            }
            if (keys['t']) { // Rotation vers le haut
                cameraPlayer.rotation.z += 0.01;
            }
            if (keys['g']) { // Rotation vers le bas
                cameraPlayer.rotation.z -= 0.01;
            }
        }

        // Afficher les valeurs de rotation en temps réel
        rotationDisplay.innerText = `Rotation - X: ${cameraPlayer.rotation.x.toFixed(2)}, Y: ${cameraPlayer.rotation.y.toFixed(2)}, Z: ${cameraPlayer.rotation.z.toFixed(2)}`;
    }

    setInterval(updateCameraPosition, 16); // Mettre à jour la position de la caméra à chaque intervalle
}
