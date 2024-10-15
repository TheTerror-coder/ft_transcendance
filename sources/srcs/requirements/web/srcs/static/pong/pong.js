// import Game from './Game.js'
import socket from './socket.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { TextureLoader } from 'three/addons/loaders/TextureLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

console.log("pong.js loaded");

export async function main(gameCode) {
    // const socket = io('http://localhost:3000');
    console.log('socket : ', socket);


    socket.emit('GameStarted', (gameCode) => {
        console.log('GameStarted with gameCode : ', gameCode);
    });

    console.log("gameCode : ", gameCode);

    socket.on('sendGameData', (gameData) => {
        console.log('Données de la partie:', gameData);
        if (gameData) {
            initGame(gameData);
        } else {
            console.error('Aucune donnée de partie trouvée.');
        }
    });

    const { scene, cameraPlayer1, renderer } = initScene();

    // const gameData = JSON.parse(localStorage.getItem('gameData'));
    // console.log('Données de la partie:', gameData);
    // if (gameData) {
    //     initGame(gameData);
    // } else {
    //     console.error('Aucune donnée de partie trouvée.');
    // }

    const keys = {}; // Initialiser l'objet keys
    let playerId = null;
    let paddle1 = initPaddle();
    let paddle2 = initPaddle();
    let cannonGroup = await initCannons(scene); // Utiliser await ici
    let bateau = await initBateaux(scene, new GLTFLoader());
    let ocean = await initOceans(scene, new GLTFLoader(), new THREE.TextureLoader());
    let ball = initBall(scene);
    let Team1 = initTeam1(scene, paddle1, cannonGroup, bateau);
    let Team2 = initTeam2(scene, paddle2, cannonGroup, bateau);
    let PlayerRole = initRole();

    console.log('CannonGroup:', cannonGroup);
    console.log('Team1:', Team1);
    console.log('Team2:', Team2);

    socket.on('test', (data) => {
        console.log('test OK : ', data);
    });

    setupEventListeners(socket, keys);

    updateAndEmitPaddlePositions(socket, Team1.paddle1, Team2.paddle2, cannonGroup.get('cannonTeam1'), cannonGroup.get('cannonTeam2'), keys, playerId);
    periodicGameStateUpdate(socket);

    setupEventListeners(socket, keys);
    setInterval(() => {
        setupSocketListeners(socket, playerId, PlayerRole, Team1, Team2, cameraPlayer1, null);
    }, 16);

    function animate() {
        // if (!gameStarted) {
        //     return;
        // }
        requestAnimationFrame(animate);
        renderer.render(scene, cameraPlayer1);
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

function initGame(gameData)
{
    console.log('Initialisation du jeu avec les donnee : ', gameData);
    let teams = gameData.teams;
    console.log('Donnee initialise dans teams : ', teams);
    console.log('teams.team1 : ', teams.team1);
    console.log('teams.team2 : ', teams.team2);

    // Accéder aux joueurs
    Object.keys(teams.team1.Player).forEach(key => {
        const player = teams.team1.Player[key];
        console.log(`Joueur ${key} de l'équipe 1 :`, player);
    });

    Object.keys(teams.team2.Player).forEach(key => {
        const player = teams.team2.Player[key];
        console.log(`Joueur ${key} de l'équipe 2 :`, player);
    });
}

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
    let Team1 = {paddle1, cannonGroup : cannonGroup.get('cannonTeam1'), bateau : bateau.bateauTeam1};
    return Team1;
}

function initTeam2(scene, paddle2, cannonGroup, bateau)
{
    let Team2 = {paddle2, cannonGroup : cannonGroup.get('cannonTeam2'), bateau : bateau.bateauTeam2};
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

function setupEventListeners(socket, keys, cameraPlayer) {
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    window.addEventListener('resize', function () {
        cameraPlayer.aspect = window.innerWidth / window.innerHeight;
        cameraPlayer.updateProjectionMatrix();
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

function initBateaux(scene, gltfLoader) {
    return new Promise((resolve, reject) => {
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
            resolve({ bateauTeam1, bateauTeam2 });
        }, undefined, function (error) {
            console.error('Error loading the boat models:', error);
            reject(error);
        });
    });
}

function initOceans(scene, gltfLoader, textureLoader) {
    return new Promise((resolve, reject) => {
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
            resolve(ocean);
        }, undefined, function (error) {
            console.error('Error loading the ocean model:', error);
            reject(error);
        });
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

        // Ajouter les groupes de canons à la Map
        cannonGroup.set('cannonTeam1', cannonTeam1);
        cannonGroup.set('cannonTeam2', cannonTeam2);

        return cannonGroup;
    } catch (error) {
        console.error('Error initializing cannons:', error);
    }
}

function updateAndEmitPaddlePositions(socket, paddle1, paddle2, cannon1Group, cannon2Group, keys, playerId) {
    setInterval(() => {
        // console.log('Keys:', keys);
        // console.log('Paddle1:', paddle1);
        // console.log('Cannon1Group:', cannon1Group);

        if (keys && keys['d']) {
            console.log('key : d');
            paddle1.position.x += 0.1;
            cannon1Group.position.x += 0.1;
            socket.emit('paddlePosition', { playerId, paddle: 'paddle1', x: paddle1.position.x, y: paddle1.position.y });
        }
        if (keys && keys['a']) {
            console.log('key : a');
            paddle1.position.x -= 0.1;
            cannon1Group.position.x -= 0.1;
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

function adjustCamera(cameraPlayer, playerRole, paddle1, paddle2) {
    if (playerRole === 'player2') {
        cameraPlayer.position.set(paddle2.position.x, paddle2.position.y - 2.9, paddle2.position.z + 2.5);
        cameraPlayer.lookAt(new THREE.Vector3(paddle2.position.x, paddle2.position.y, paddle2.position.z));
        cameraPlayer.rotation.x = 60 * (Math.PI / 180);
    } else if (playerRole === 'player1') {
        cameraPlayer.position.set(paddle1.position.x, paddle1.position.y + 2.9, paddle1.position.z + 2.5);
        cameraPlayer.lookAt(new THREE.Vector3(paddle1.position.x, paddle1.position.y, paddle1.position.z));
        cameraPlayer.rotation.x = -60 * (Math.PI / 180);
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