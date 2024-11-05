import Team from './Team.js';
import Player from './Player.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { TextureLoader } from 'three/addons/loaders/TextureLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

console.log("pong.js loaded");

let BOAT_MOVE_SPEED = 0.2;
let CANNON_MOVE_SPEED = 0.1;
let FRAME_RATE = 110;

let intervalId = null;
let gameCodeGlobal = null;
let socketGlobal = null;
let keysGlobal = null;
let currentPlayerTeamGlobal = null;
let currentPlayerGlobal = null;

// Fonction pour afficher les valeurs actuelles
function displayCurrentValues() {
    console.log(`BOAT_MOVE_SPEED: ${BOAT_MOVE_SPEED}, CANNON_MOVE_SPEED: ${CANNON_MOVE_SPEED}, FRAME_RATE: ${FRAME_RATE}`);
}

// Fonction pour ajuster les valeurs
function adjustValues(key) {
    switch (key) {
        case 'ArrowUp':
            BOAT_MOVE_SPEED += 0.1;
            break;
        case 'ArrowDown':
            BOAT_MOVE_SPEED = Math.max(0, BOAT_MOVE_SPEED - 0.1);
            break;
        case 'ArrowRight':
            CANNON_MOVE_SPEED += 0.01;
            break;
        case 'ArrowLeft':
            CANNON_MOVE_SPEED = Math.max(0, CANNON_MOVE_SPEED - 0.01);
            break;
        case '+':
            FRAME_RATE += 10;
            break;
        case '-':
            FRAME_RATE = Math.max(10, FRAME_RATE - 10);
            break;
        case 'p':
            restartInterval();
            break;
        default:
            return;
    }
    displayCurrentValues();
}

// Fonction pour redémarrer l'intervalle avec la nouvelle FRAME_RATE
function restartInterval() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    console.log('restartInterval : ', FRAME_RATE);
    intervalId = setInterval(() => {
        updateAndEmitBoatPositions(gameCodeGlobal, socketGlobal, keysGlobal, currentPlayerTeamGlobal, currentPlayerGlobal);
        updateAndEmitCannonPositions(gameCodeGlobal, socketGlobal, keysGlobal, currentPlayerTeamGlobal, currentPlayerGlobal);
    }, FRAME_RATE);
}

// Écouteur d'événements pour ajuster les valeurs en continu
window.addEventListener('keydown', (event) => {
    if (!intervalId) {
        adjustValues(event.key);
        intervalId = setInterval(() => adjustValues(event.key), 100);
    }
});

window.addEventListener('keyup', () => {
    clearInterval(intervalId);
    intervalId = null;
});

export async function main(gameCode, socket) {
    console.log('socket : ', socket);
    
    socket.emit('GameStarted', gameCode);

    console.log("gameCode : ", gameCode);

    let Team1 = null;
    let Team2 = null;
    let currentPlayer = null;
    let currentPlayerTeam = null;
    socket.on('gameData', async (gameData) => {
        console.log('Données de la partie:', gameData);
        if (gameData) {
            ({ Team1, Team2, currentPlayer, currentPlayerTeam } = await initGame(gameData, socket.id));
            console.log('initGame done');
            console.log('Team1:', Team1);
            console.log('Team2:', Team2);
            console.log('currentPlayer:', currentPlayer);
            console.log('currentPlayerTeam:', currentPlayerTeam);
        } else {
            console.error('Aucune donnée de partie trouvée.');
        }
    });

    let { scene, cameraPlayer, renderer, ambientLight, directionalLight1, directionalLight2 } = initScene();

    
    // Créer un élément pour afficher la rotation et la position
    const displayInfo = document.createElement('div');
    displayInfo.style.position = 'absolute';
    displayInfo.style.top = '10px';
    displayInfo.style.left = '10px';
    displayInfo.style.color = 'white';
    document.body.appendChild(displayInfo);
    
    // Créer une caméra contrôlable
    setupCameraControls(cameraPlayer, displayInfo); // Ajout de la ligne pour créer la caméra contrôlable
    
    const GLTFloader = new GLTFLoader();
    const keys = {};
    let bateau = await initBateaux(scene, GLTFloader);
    console.log('bateau:', bateau);
    let cannonGroup = await initCannons(scene);
    console.log('CannonGroup:', cannonGroup);
    let boatGroup1 = await CreateBoatGroup(scene, bateau.bateauTeam1, cannonGroup.get('cannonTeam1'), 1);
    let boatGroup2 = await CreateBoatGroup(scene, bateau.bateauTeam2, cannonGroup.get('cannonTeam2'), 2);
    Team1.setBoat(boatGroup1);
    Team2.setBoat(boatGroup2);
    Team1.setCannon(cannonGroup.get('cannonTeam1'));
    Team2.setCannon(cannonGroup.get('cannonTeam2'));
    console.log('Team1 boat:', Team1.getBoat());
    console.log('Team2 boat:', Team2.getBoat());
    console.log('Team1 cannon:', Team1.getCannon());
    console.log('Team2 cannon:', Team2.getCannon());
    let ocean = await initOceans(scene, new THREE.TextureLoader());
    let ball = await initBall();

    if (currentPlayerTeam && currentPlayer) {
        let boat = currentPlayerTeam.getBoat();
        let cannon = currentPlayerTeam.getCannon();

        if (boat && cannon) {
            currentPlayer.setCameraPos(boat, cannon);
            cameraPlayer = initCamera(currentPlayer, cameraPlayer, cannon, boat);
        } else {
            console.error('Boat or cannon is undefined');
        }
    } else {
        console.error('currentPlayerTeam or currentPlayer is undefined');
    }
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

    updateServerData(gameCode, socket, currentPlayerTeam);

    setupEventListeners(socket, keys);

    gameCodeGlobal = gameCode;
    socketGlobal = socket;
    keysGlobal = keys;
    currentPlayerTeamGlobal = currentPlayerTeam;
    currentPlayerGlobal = currentPlayer;
    setInterval(() => {
        updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer);
        updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer);
    }, FRAME_RATE);
    // periodicGameStateUpdate(socket);

    setupEventListeners(socket, keys);
    setInterval(() => {
        setupSocketListeners(socket, Team1, Team2, currentPlayer);
    }, 16);

    loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, Team1.getBoat(), Team2.getBoat());
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

function findTeam(Team1, Team2, teamID)
{
    if (teamID === Team1.getTeamId())
        return (Team1);
    else
        return (Team2);
}

async function CreateBoatGroup(scene, bateau, cannon, teamId)
{
    let boatGroup = new THREE.Group();
    bateau.name = `bateauTeam${teamId}`;
    bateau.rotation.set(Math.PI / 2, 0, 0);
    
    // Positionner et orienter le canon
    if (teamId === 1) {
        bateau.position.set(0, 20, -1);
        cannon.position.set(
            bateau.position.x - (bateau.scale.x / 2) + 2,
            bateau.position.y - 2.18,
            bateau.position.z * bateau.scale.z + 8.1
        );
        cannon.rotation.set(0, 0, -Math.PI / 2);
    } else if (teamId === 2) {
        bateau.position.set(0, -20, -1);
        cannon.position.set(
            bateau.position.x - (bateau.scale.x / 2) + 2,
            bateau.position.y + 3.98,
            bateau.position.z * bateau.scale.z + 8.1
        );
        cannon.rotation.set(0, 0, Math.PI / 2);
    }
    boatGroup.add(bateau);
    
    return boatGroup;
}

function updateServerData(gameCode, socket, currentPlayerTeam)
{
    if (!currentPlayerTeam) {
        console.error('currentPlayerTeam is undefined');
        return;
    }

    const boat = currentPlayerTeam.getBoat();
    const cannon = currentPlayerTeam.getCannon();

    if (!boat || !cannon) {
        console.error('Boat or cannon is undefined for team', currentPlayerTeam.getTeamId());
        return;
    }

    console.log('updateServerData : ', { 
        gameCode: gameCode, 
        TeamID: currentPlayerTeam.getTeamId(), 
        boat: boat.position, 
        cannon: cannon.position 
    });
    
    socket.emit('ClientData', { 
        gameCode: gameCode, 
        TeamID: currentPlayerTeam.getTeamId(), 
        boat: boat.position, 
        cannon: cannon.position 
    });
}

function loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2)
{
    scene.add(ball);
    scene.add(ocean);
    scene.add(ambientLight);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
    scene.add(bateau1);
    scene.add(bateau2);
    // scene.add(cannonTeam1);
    // scene.add(cannonTeam2);
}

async function initGame(gameData, socketID) {
    console.log('Initialisation du jeu avec les données : ', gameData);

    // Créer les équipes
    const team1 = new Team(gameData.team1.name, gameData.team1.maxNbPlayer, gameData.team1.TeamId);
    const team2 = new Team(gameData.team2.name, gameData.team2.maxNbPlayer, gameData.team2.TeamId);

    let currentPlayer = null;
    let currentPlayerTeam = null;

    // Accéder aux joueurs de l'équipe 1 et les ajouter à l'équipe
    const team1Promises = Object.keys(gameData.team1.Player).map(key => {
        return new Promise((resolve) => {
            const playerData = gameData.team1.Player[key];
            const player = new Player(playerData.id, playerData.role, playerData.name, team1.getTeamId());
            team1.setPlayer(player);
            console.log(`Joueur ${key} de l'équipe 1 :`, player);
            if (playerData.id === socketID) {
                currentPlayer = player;
                currentPlayerTeam = team1;
            }
            resolve();
        });
    });

    // Accéder aux joueurs de l'équipe 2 et les ajouter à l'équipe
    const team2Promises = Object.keys(gameData.team2.Player).map(key => {
        return new Promise((resolve) => {
            const playerData = gameData.team2.Player[key];
            const player = new Player(playerData.id, playerData.role, playerData.name, team2.getTeamId());
            team2.setPlayer(player);
            console.log(`Joueur ${key} de l'équipe 2 :`, player);
            if (playerData.id === socketID) {
                currentPlayer = player;
                currentPlayerTeam = team2;
            }
            resolve();
        });
    });

    // Attendre que tous les joueurs soient ajoutés aux équipes
    await Promise.all([...team1Promises, ...team2Promises]);

    // Afficher les équipes et leurs joueurs
    console.log('Équipe 1 :', team1);
    console.log('Équipe 2 :', team2);

    if (currentPlayer) {
        console.log('Joueur actuel :', currentPlayer);
        console.log('Équipe du joueur actuel :', currentPlayerTeam);
    } else {
        console.log('Joueur actuel non trouvé');
    }

    return { Team1: team1, Team2: team2, currentPlayer, currentPlayerTeam }; // Retourner les équipes, le joueur actuel et son équipe
}

function initCamera(player, cameraPlayer, cannon, bateau)
{
    cameraPlayer.position.copy(player.getCameraPos());
    console.log('player.getCameraRotation() : ', player.getCameraRotation());
    cameraPlayer.rotation.set(player.getCameraRotation().x, player.getCameraRotation().y, player.getCameraRotation().z);
    // if (player.getRole() === 'captain') {
    //     // Vue d'ensemble pour le capitaine
    //     // cameraPlayer.lookAt(bateau);
    // } else if (player.getRole() === 'Cannoneer') {
    //     // Vue depuis le canon pour le canonnier
    //     // cameraPlayer.lookAt(cannon);
    // }
    // player.setCamera(cameraPlayer);
    return cameraPlayer;
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
            const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
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
            // bateauTeam1.position.set(0, 20, -1);
            bateauTeam1.scale.set(10, 5, 5);
            // bateauTeam1.rotation.set(Math.PI / 2, 0, 0);

            const bateauTeam2 = gltf.scene.clone();
            bateauTeam2.position.set(0, -20, -1);
            bateauTeam2.scale.set(10, 5, 5);
            // bateauTeam2.rotation.set(Math.PI / 2, 0, 0);

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
                const oceanGeometry = new THREE.PlaneGeometry(5000, 5000);
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

        cannonSupport1.name = `cannonSupportTeam1`;
        cannonSupport2.name = `cannonSupportTeam2`;
        cannonTube1.name = `cannonTubeTeam1`;
        cannonTube2.name = `cannonTubeTeam2`;

        // Créer les groupes de canons pour chaque équipe
        let cannonTeam1 = new THREE.Group();
        let cannonTeam2 = new THREE.Group();
        let cannon1_tube_group = new THREE.Group();
        let cannon2_tube_group = new THREE.Group();

        cannonTeam1.name = `cannonTeam1`;
        cannonTeam2.name = `cannonTeam2`;
        cannon1_tube_group.name = `cannon1_tube_group`;
        cannon2_tube_group.name = `cannon2_tube_group`;

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

function updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer)
{
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();

        if (cannon) {
            if (keys && keys['d'] && cannon.position.x < 6) {
                cannon.position.x += CANNON_MOVE_SPEED * directionMove;
                emitCannonPosition(socket, gameCode, TeamID, cannon.position);
            }
            if (keys && keys['a'] && cannon.position.x > -6) {
                cannon.position.x -= CANNON_MOVE_SPEED * directionMove;
                emitCannonPosition(socket, gameCode, TeamID, cannon.position);
            }
        }
    }
}

function updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer) {
    if (currentPlayer.getRole() === 'captain') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let boatGroup = currentPlayerTeam.getBoat();
        let cannon = currentPlayerTeam.getCannon();

        let boatMoved = false;

        if (keys && keys['d'] && boatGroup.position.x < 40) {
            boatGroup.position.x += BOAT_MOVE_SPEED * directionMove;
            // cannon.position.x += 0.1;
            boatMoved = true;
        }
        if (keys && keys['a'] && boatGroup.position.x > -40) {
            boatGroup.position.x -= BOAT_MOVE_SPEED * directionMove;
            // cannon.position.x -= 0.1;
            boatMoved = true;
        }

        if (boatMoved) {
            emitBoatAndCannonPosition(socket, gameCode, TeamID, boatGroup, cannon);
        }
    }
}

function emitCannonPosition(socket, gameCode, TeamID, position) {
    socket.emit('cannonPosition', { 
        gameCode: gameCode, 
        team: TeamID, 
        x: position.x,
        y: position.y,
        z: position.z
    });
}

function emitBoatAndCannonPosition(socket, gameCode, TeamID, boatGroup, cannon) {
    socket.emit('boatAndCannonPosition', { 
        gameCode: gameCode, 
        team: TeamID, 
        boatX: boatGroup.position.x, 
        boatY: boatGroup.position.y,
        boatZ: boatGroup.position.z,
        cannonX: cannon.position.x,
        cannonY: cannon.position.y,
        cannonZ: cannon.position.z
    });
}

function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}

function setupSocketListeners(socket, Team1, Team2, currentPlayer)
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

    socket.on('gameState', (data) => {
        ball.position.x = data.ballPosition.x;
        ball.position.y = data.ballPosition.y;
        ball.position.z = data.ballPosition.z;
    });

    // socket.on('cannonPosition', (data) => {
    //     console.log("cannonPosition: " + data);
    //     let team = findTeam(Team1, Team2, data.team);
    //     if (team && team.getCannon()) {
    //         team.getCannon().position.x = data.x;
    //         team.getCannon().position.y = data.y;
    //         // team.getCannon().position.z = data.z;
    //     } else {
    //         console.error('Team or cannon not found for team', data.team);
    //     }
    // });

    // socket.on('boatPosition', (data) => {
    //     console.log("boatPosition: " + data);
    //     let team = findTeam(Team1, Team2, data.team);
    //     if (team && team.getBoat() && team.getCannon()) {
    //         team.getBoat().position.x = data.bx;
    //         team.getBoat().position.y = data.by;
    //         team.getCannon().position.x = data.cx;
    //         team.getCannon().position.y = data.cy;
    //         team.getCannon().position.z = data.cz;
    //     } else {
    //         console.error('Team, boat or cannon not found for team', data.team);
    //     }
    // });
    
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

    // socket.on('boatPosition', (data) => {
    //     let team = findTeam(Team1, Team2, data.team);
    //     if (team && team.getBoat()) {
    //         team.getBoat().position.set(data.x, data.y, data.z);
    //         // Si le joueur actuel est le canonnier de cette équipe, mettre à jour sa position
    //         if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamId() === data.team) {
    //             updateCannoneerCamera(team.getBoat(), currentPlayer);
    //         }
    //     }
    // });

    socket.on('cannonPosition', (data) => {
        let team = findTeam(Team1, Team2, data.team);
        if (team && team.getCannon()) {
            team.getCannon().position.set(data.x, data.y, data.z);
        }
    });

    socket.on('boatAndCannonPosition', (data) => {
        let team = findTeam(Team1, Team2, data.team);
        if (team && team.getBoat() && team.getCannon()) {
            team.getBoat().position.set(data.boatX, data.boatY, data.boatZ);
            team.getCannon().position.set(data.cannonX, data.cannonY, data.cannonZ);
            
            // Si le joueur actuel est le canonnier de cette équipe, mettre à jour sa position
            if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamId() === data.team) {
                updateCannoneerCamera(team.getBoat(), currentPlayer);
            }
        } else {
            console.error('Team, boat or cannon not found for team', data.team);
        }
    });

    // Autres écouteurs...
}

function setupCameraControls(cameraPlayer, displayInfo) {
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
            // Créer un vecteur de direction pour le mouvement
            const direction = new THREE.Vector3(); // Déclaration de la variable direction ici
            cameraPlayer.getWorldDirection(direction); // Obtenir la direction dans laquelle la caméra regarde

            // Normaliser le vecteur de direction pour éviter un mouvement plus rapide
            direction.y = 0; // Ignorer la direction verticale
            direction.normalize();

            // Déplacement de la caméra
            if (keys['w']) { // Avancer
                // cameraPlayer.position.add(direction.clone().multiplyScalar(0.1)); // Avancer dans la direction de la caméra
                cameraPlayer.position.y += 0.1;
            }
            if (keys['s']) { // Reculer
                // cameraPlayer.position.add(direction.clone().multiplyScalar(-0.1)); // Reculer dans la direction opposée
                cameraPlayer.position.y -= 0.1;
            }
            if (keys['ArrowUp']) {
                cameraPlayer.position.z += 0.1; // Avancer
            }
            if (keys['ArrowDown']) {
                cameraPlayer.position.z -= 0.1; // Reculer
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

        // Afficher les valeurs de position et de rotation en temps réel
        displayInfo.innerText = `Position - X: ${cameraPlayer.position.x.toFixed(2)}, Y: ${cameraPlayer.position.y.toFixed(2)}, Z: ${cameraPlayer.position.z.toFixed(2)}\n` +
                                 `Rotation - X: ${cameraPlayer.rotation.x.toFixed(2)}, Y: ${cameraPlayer.rotation.y.toFixed(2)}, Z: ${cameraPlayer.rotation.z.toFixed(2)}`;
    }

    setInterval(updateCameraPosition, 16); // Mettre à jour la position de la caméra à chaque intervalle
}

function updateCannoneerCamera(boatGroup, player) {
    // Mettre à jour la position de la caméra du canonnier en fonction de la position du bateau
    let cannoneerCamera = player.getCamera();
    if (cannoneerCamera) {
        // Ajuster ces valeurs selon vos besoins
        cannoneerCamera.position.set(
            boatGroup.position.x,
            boatGroup.position.y + 5,  // Légèrement au-dessus du bateau
            boatGroup.position.z - 10  // Derrière le bateau
        );
        cannoneerCamera.lookAt(boatGroup.position);
    }
}

