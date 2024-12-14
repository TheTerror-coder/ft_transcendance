import Team from './Team.js';
import Player from './Player.js';
import { initDebug, setupCameraControls } from './debug.js';
import { updateAndEmitBoatPositions, updateAndEmitCannonPositions, updateAndEmitCannonRotation } from './controls.js';
import * as render from './render.js';
import * as network from './network.js';
import * as THREE from 'three'; // TODO : remove for production
import { calculateCannonBallTrajectory, createTrajectoryLine } from './ballistic_cal.js';

console.log("pong.js loaded");

let BOAT_MOVE_SPEED = 1.5;
let CANNON_MOVE_SPEED = 0.1;
let CANNON_ROTATION_SPEED = 0.1;
let FRAME_RATE = 110;

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
    
    let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball } = await render.initScene();
    let boat1BoundingBox = new THREE.Box3().setFromObject(boatGroup1);
    let boat2BoundingBox = new THREE.Box3().setFromObject(boatGroup2);
    let boat1Hitbox = new THREE.Box3Helper(boat1BoundingBox, 0xffff00); // TODO : remove for production
    let boat2Hitbox = new THREE.Box3Helper(boat2BoundingBox, 0xff0000); // TODO : remove for production
    scene.add(boat1Hitbox); // TODO : remove for production
    scene.add(boat2Hitbox); // TODO : remove for production
    
    // Créer un élément pour afficher la rotation et la position
    const displayInfo = document.createElement('div');
    displayInfo.style.position = 'absolute';
    displayInfo.style.top = '10px';
    displayInfo.style.left = '10px';
    displayInfo.style.color = 'white';
    document.body.appendChild(displayInfo);
    
    // Créer un élément pour afficher la position de la balle
    const ballPositionDisplay = document.createElement('div');
    ballPositionDisplay.style.position = 'absolute';
    ballPositionDisplay.style.bottom = '10px';
    ballPositionDisplay.style.left = '10px';
    ballPositionDisplay.style.color = 'white';
    document.body.appendChild(ballPositionDisplay);
    
    // Cree un element pour afficher le score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    scoreDisplay.style.color = 'white';
    document.body.appendChild(scoreDisplay);
    
    // Créer une caméra contrôlable
    setupCameraControls(cameraPlayer, displayInfo); // Ajout de la ligne pour créer la caméra contrôlable
    
    const keys = {};
    Team1.setBoat(boatGroup1);
    Team2.setBoat(boatGroup2);
    Team1.setCannon(boatGroup1.getObjectByName(`cannonTeam1`));
    Team2.setCannon(boatGroup2.getObjectByName(`cannonTeam2`));
    
    if (currentPlayerTeam && currentPlayer) {
        let boat = currentPlayerTeam.getBoat();
        let cannonPosInTheWorld = currentPlayerTeam.getCannonPosInTheWorld();
        let cannon = currentPlayerTeam.getCannon();
        
        if (boat && cannon) {
            currentPlayer.setCameraPos(boat, cannon, cannonPosInTheWorld);
            cameraPlayer = initCamera(currentPlayer, cameraPlayer, cannon, boat);
        } else {
            console.error('Boat or cannon is undefined');
        }
    } else {
        console.error('currentPlayerTeam or currentPlayer is undefined');
    }
    console.log('cameraPlayer : ', cameraPlayer);
    
    // Paramètres
    const v0 = 27;  // Vitesse initiale en m/s
    let angle = -((currentPlayerTeam.getCannonTubeRotation().y * 180 / Math.PI));  // Angle de tir en degrés

    // Calculer et dessiner la trajectoire
    const cannonPos = currentPlayerTeam.getCannonTubeTipPosition();
    console.log('======== cannonPosTip ========= : ', cannonPos);
    const trajectory = await calculateCannonBallTrajectory(cannonPos.x, cannonPos.y, cannonPos.z, angle, v0, currentPlayerTeam.getTeamId());
    const trajectoryLine = await createTrajectoryLine(trajectory);
    scene.add(trajectoryLine);
    console.log('trajectory : ', trajectory);
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

    await waitForBoatGroup(currentPlayerTeam);
    network.updateServerData(gameCode, socket, currentPlayerTeam);
    
    setupEventListeners(socket, keys);
    initDebug(BOAT_MOVE_SPEED, CANNON_MOVE_SPEED, FRAME_RATE, gameCode, socket, keys, currentPlayerTeam, currentPlayer);
    network.setupSocketListeners(socket, Team1, Team2, currentPlayer, ball);
    await waitForGameStarted(currentPlayer);
    setInterval(() => {
        updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, BOAT_MOVE_SPEED);
        updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED);
    }, FRAME_RATE);
    updateAndEmitCannonRotation(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED, Team1, Team2);
    
    async function animate() {
        requestAnimationFrame(animate);
        const newCannonPos = currentPlayerTeam.getCannonTubeTipPosition();
        let newAngle = -((currentPlayerTeam.getCannonTubeRotation().y * 180 / Math.PI));  // Angle de tir en degrés
        // Vérifiez si la position du canon a changé
        if (!cannonPos.equals(newCannonPos) || angle != newAngle) {
            // console.log('currentPlayerTeam.getCannonTubeRotation().y : ', newAngle);
            // console.log('angle : ', angle);
            cannonPos.copy(newCannonPos);
            angle = newAngle;
            const trajectory = await calculateCannonBallTrajectory(cannonPos.x, cannonPos.y, cannonPos.z, angle, v0, currentPlayerTeam.getTeamId());
            trajectoryLine.geometry.setFromPoints(trajectory);
        }
        
        boat1BoundingBox.setFromObject(boatGroup1);
        boat2BoundingBox.setFromObject(boatGroup2);

        boat1BoundingBox.min.x += 7;
        boat2BoundingBox.min.x += 7;
        boat1BoundingBox.max.x += 2;
        boat2BoundingBox.max.x -= 2;
        
        boat1Hitbox.updateMatrixWorld(true);
        boat2Hitbox.updateMatrixWorld(true);
        
        // Rendre la scène
        renderer.render(scene, cameraPlayer);
    }

    animate();

    socket.on('gameState', (data) => {
        updateBallPosition(data.ballPosition, ball);
        displayBallPosition(data.ballPosition, ballPositionDisplay);
    });
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

async function waitForBoatGroup(currentPlayerTeam)
{
    while (!currentPlayerTeam.getBoatGroup())
    {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return currentPlayerTeam.getBoatGroup();
}

async function waitForGameStarted(currentPlayer)
{
    while (!currentPlayer.getGameStarted())
    {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return currentPlayer.getGameStarted();
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

// Fonction pour mettre à jour la position de la balle
function updateBallPosition(ballPosition, ball) {
    if (ball) {
        ball.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
    }
}

// Fonction pour afficher la position de la balle
function displayBallPosition(ballPosition, displayElement) {
    displayElement.innerText = `Ball Position - X: ${ballPosition.x.toFixed(2)}, Y: ${ballPosition.y.toFixed(2)}, Z: ${ballPosition.z.toFixed(2)}`;
}

// Fonction pour afficher la direction de la balle
function displayBallDirection(ballDirection, displayElement) {
    displayElement.innerText = `Ball Direction - X: ${ballDirection.x.toFixed(2)}, Y: ${ballDirection.y.toFixed(2)}, Z: ${ballDirection.z.toFixed(2)}`;
}
