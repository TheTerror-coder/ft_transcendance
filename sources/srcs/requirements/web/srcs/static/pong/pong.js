import Team from './Team.js';
import Player from './Player.js';
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

    const { scene, cameraPlayer, renderer } = initScene();

    const GLTFloader = new GLTFLoader();
    const keys = {};
    // let paddle1 = initPaddle();
    // let paddle2 = initPaddle();
    let cannonGroup = await initCannons(scene);
    console.log('CannonGroup:', cannonGroup);
    Team1.setCannon(cannonGroup.get('cannonTeam1'));
    Team2.setCannon(cannonGroup.get('cannonTeam2'));
    console.log('Team1 cannon:', Team1.getCannon());
    console.log('Team2 cannon:', Team2.getCannon());
    let bateau = await initBateaux(scene, GLTFloader);
    console.log('bateau:', bateau);
    Team1.setBoat(bateau.bateauTeam1);
    Team2.setBoat(bateau.bateauTeam2);
    console.log('Team1 boat:', Team1.getBoat());
    console.log('Team2 boat:', Team2.getBoat());
    let ocean = await initOceans(scene, GLTFloader, new THREE.TextureLoader());
    let ball = initBall(scene);
    // let Team1 = initTeam1(scene, paddle1, cannonGroup, bateau);
    // let Team2 = initTeam2(scene, paddle2, cannonGroup, bateau);

    Team1.setCameraPosForAllPlayers(Team2.getBoat().position.x, Team2.getBoat().position.y, Team2.getBoat().position.z);
    Team2.setCameraPosForAllPlayers(Team1.getBoat().position.x, Team1.getBoat().position.y, Team1.getBoat().position.z);

    for (const player of Team1.getPlayerMap().values())
    {
        console.log('Player Team1 camera pos : ', player.getCameraPos());
    }
    for (const player of Team2.getPlayerMap().values())
    {
        console.log('Player Team2 camera pos : ', player.getCameraPos());
    }

    socket.on('test', (data) => {
        console.log('test OK : ', data);
    });

    setupEventListeners(socket, keys);

    updateAndEmitBoatPositions(socket, Team1.getBoat(), Team2.getBoat(), keys);
    periodicGameStateUpdate(socket);

    setupEventListeners(socket, keys);
    setInterval(() => {
        setupSocketListeners(socket, Team1, Team2);
    }, 16);

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

function initScene() {
    const scene = new THREE.Scene();
    const cameraPlayer = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return { scene, cameraPlayer, renderer };
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

function findPlayer(Team1, Team2, socket)
{
    console.log('findPlayer : ', socket.id);
    let playerTeamID = null;
    let playerRole = null;
    const player = Team1.getPlayerById(socket.id);
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

function updateAndEmitCannonPositions(socket, Team1, Team2, keys, playerId)
{
    const {playerTeamID, playerRole} = findPlayer(Team1, Team2, socket);
    if (playerTeamID === Team1.getTeamId())
    {
        if (playerRole === 'Cannoneer')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team1 Cannoneer d');
                // Team1.getBoat().position.x += 0.1;
                Team1.getCannon().position.x += 0.1;
                socket.emit('cannonPosition', { playerId, cannon: 'cannonTeam1', x: Team1.getCannon().position.x, y: Team1.getCannon().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team1 Cannoneer a');
                // Team1.getBoat().position.x -= 0.1;
                Team1.getCannon().position.x -= 0.1;
                socket.emit('cannonPosition', { playerId, cannon: 'cannonTeam1', x: Team1.getCannon().position.x, y: Team1.getCannon().position.y });
            }
        }
    }
    else if (playerTeamID === Team2.getTeamId())
    {
        if (playerRole === 'Cannoneer')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team2 Cannoneer d');
                // Team2.getBoat().position.x += 0.1;
                Team2.getCannon().position.x += 0.1;
                socket.emit('cannonPosition', { playerId, cannon: 'cannonTeam2', x: Team2.getCannon().position.x, y: Team2.getCannon().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team2 Cannoneer a');
                // Team2.getBoat().position.x -= 0.1;
                Team2.getCannon().position.x -= 0.1;
                socket.emit('cannonPosition', { playerId, cannon: 'cannonTeam2', x: Team2.getCannon().position.x, y: Team2.getCannon().position.y });
            }
        }
    }
}

function updateAndEmitBoatPositions(socket, Team1, Team2, keys)
{
    const {playerTeamID, playerRole} = findPlayer(Team1, Team2, socket);
    if (playerTeamID === Team1.getTeamId())
    {
        if (playerRole === 'Captain')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team1 Captain d');
                Team1.getBoat().position.x += 0.1;
                Team1.getCannon().position.x += 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam1', x: Team1.getBoat().position.x, y: Team1.getBoat().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team1 Captain a');
                Team1.getBoat().position.x -= 0.1;
                Team1.getCannon().position.x -= 0.1;
                socket.emit('boatPosition', { playerId: socket.id, boat: 'boatTeam1', x: Team1.getBoat().position.x, y: Team1.getBoat().position.y });
            }
        } 
    }
    else if (playerTeamID === Team2.getTeamId())
    {
        if (playerRole === 'Captain')
        {
            if (keys && keys['d'])
            {
                console.log('key : Team2 Captain d');
                Team2.getBoat().position.x += 0.1;
                Team2.getCannon().position.x += 0.1;
                socket.emit('boatPosition', { playerId, boat: 'boatTeam2', x: Team2.getBoat().position.x, y: Team2.getBoat().position.y });
            }
            if (keys && keys['a'])
            {
                console.log('key : Team2 Captain a');
                Team2.getBoat().position.x -= 0.1;
                Team2.getCannon().position.x -= 0.1;
                socket.emit('boatPosition', { playerId, boat: 'boatTeam2', x: Team2.getBoat().position.x, y: Team2.getBoat().position.y });
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
