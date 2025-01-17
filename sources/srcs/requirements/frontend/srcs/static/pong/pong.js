import Team from './Team.js';
import Player from './Player.js';
import { initDebug, setupCameraControls } from './debug.js';
import { updateAndEmitBoatPositions, updateAndEmitCannonPositions, updateAndEmitCannonRotation } from './controls.js';
import * as render from './render.js';
import * as network from './network.js';
import * as THREE from 'three'; // TODO : remove for production
import { createHUD } from './HUD.js';

console.log("pong.js loaded");

let BOAT_MOVE_SPEED = 4;
let CANNON_MOVE_SPEED = 0.1;
let CANNON_ROTATION_SPEED = 0.1;
let FRAME_RATE = 80;

export async function main(gameCode, socket, currentLanguage) {
    console.log('socket : ', socket);
    
    socket.emit('GameStarted', gameCode);
    console.log("gameCode : ", gameCode);
    console.log("currentLanguage: ", currentLanguage);
    
    // Créer une Promise pour attendre les données initiales
    const gameInitData = await new Promise((resolve) => {
        const gameDataListener = async (gameData) => {
            console.log('Données de la partie:', gameData);
            if (gameData) {
                const initData = await initGame(gameData, socket.id);
                console.log('initGame done');
                console.log('Team1:', initData.Team1);
                console.log('Team2:', initData.Team2);
                console.log('currentPlayer:', initData.currentPlayer);
                console.log('currentPlayerTeam:', initData.currentPlayerTeam);
                // Désactiver le listener une fois les données reçues
                socket.off('gameData', gameDataListener);
                resolve(initData);
            } else {
                console.error('Aucune donnée de partie trouvée.');
                socket.off('gameData', gameDataListener);
                resolve(null);
            }
        };

        socket.on('gameData', gameDataListener);
    });

    if (!gameInitData) {
        console.error("Échec de l'initialisation du jeu");
        return false;
    }

    let Team1 = gameInitData.Team1;
    let Team2 = gameInitData.Team2;
    let currentPlayer = gameInitData.currentPlayer;
    let currentPlayerTeam = gameInitData.currentPlayerTeam;
    
    let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display } = await render.initScene(Team1, Team2, currentPlayerTeam);
    if (!scene || !cameraPlayer || !renderer || !boatGroup1 || !boatGroup2 || !ball || !display)
    {
        console.error('Error loading the scene');
        return (false);
    }
    let hud = await createHUD(renderer);
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
            currentPlayer.setCameraPlayer(cameraPlayer);
        } else {
            console.error('Boat or cannon is undefined');
        }
    } else {
        console.error('currentPlayerTeam or currentPlayer is undefined');
    }
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

    await waitForBoatGroup(currentPlayerTeam);
    if (currentPlayerTeam.getBoatSavedPos().x == 0 && currentPlayerTeam.getBoatSavedPos().y == 0 && currentPlayerTeam.getBoatSavedPos().z == 0)
        network.updateServerData(gameCode, socket, currentPlayerTeam);
    
    setupEventListeners(socket, keys);
    initDebug(BOAT_MOVE_SPEED, CANNON_MOVE_SPEED, FRAME_RATE, gameCode, socket, keys, currentPlayerTeam, currentPlayer);
    network.setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, hud.scoreText, hud, scene, currentLanguage, gameCode);
    socket.emit('playerReady', gameCode);
    console.log('Player ready sent');
    await waitForGameStarted(currentPlayer);
    setInterval(() => {
        updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, BOAT_MOVE_SPEED);
        updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED);
    }, FRAME_RATE);
    updateAndEmitCannonRotation(keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED, hud, scene, socket, gameCode);
    
    let animationComplete = false;
    const animationCompletePromise = new Promise((resolve) => {
        async function animate() {
            let requestAnimationFrameId = requestAnimationFrame(animate);
            
            if (currentPlayer.getGameStarted() === false) {
                cancelAnimationFrame(requestAnimationFrameId);
                console.log("Pass in ending clear");
                window.removeEventListener('keydown', keys);
                window.removeEventListener('keyup', keys);

                scene.remove(boatGroup1);
                scene.remove(boatGroup2);
                scene.remove(ball);
                scene.remove(display[0])
                
                // Rendre la scène noire
                scene.background = new THREE.Color(0x000000);
                
                // Continuer le rendu pendant 5 secondes pour afficher le texte de victoire/défaite
                const startTime = Date.now();
                function renderEndScreen() {
                    if (Date.now() - startTime < 5000) {
                        requestAnimationFrame(renderEndScreen);
                        renderer.render(scene, cameraPlayer);
                        renderer.autoClear = false;
                        renderer.render(hud.scene, hud.camera);
                        renderer.autoClear = true;
                    } else {
                        // Nettoyer complètement après 5 secondes
                        if (hud) {
                            hud.scene.clear();
                            if (hud.camera) hud.camera = null;
                        }
                        
                        // Nettoyer les éléments du DOM et déconnecter
                        if (displayInfo && displayInfo.parentNode) {
                            displayInfo.parentNode.removeChild(displayInfo);
                        }
                        if (ballPositionDisplay && ballPositionDisplay.parentNode) {
                            ballPositionDisplay.parentNode.removeChild(ballPositionDisplay);
                        }
                        
                        render.unloadScene(ball, scene, boatGroup1, boatGroup2, display, renderer);
                        
                        scene = null;
                        ball = null;
                        boatGroup1 = null;
                        boatGroup2 = null;
                        renderer = null;
                        cameraPlayer = null;
                        
                        if (gameCode.length == 4)
                            socket.disconnect();
                        animationComplete = true;
                        network.removeSocketListeners(socket);
                        resolve();
                        return (true);
                    }
                }
                
                renderEndScreen();
                return (true);
            }
            
            // Mise à jour des boîtes de collision
            boat1BoundingBox.setFromObject(boatGroup1);
            boat2BoundingBox.setFromObject(boatGroup2);

            boat1BoundingBox.min.x += 7;
            boat2BoundingBox.min.x += 7;
            boat1BoundingBox.max.x += 2;
            boat2BoundingBox.max.x -= 2;
            boat1BoundingBox.max.y -= 1;
            boat2BoundingBox.max.y -= 1;
            boat1BoundingBox.min.y += 1;
            boat2BoundingBox.min.y += 1;
            boat1BoundingBox.max.z /= 3;
            boat2BoundingBox.max.z /= 3;
            boat1Hitbox.updateMatrixWorld(true);
            boat2Hitbox.updateMatrixWorld(true);
            
            // Rendre la scène normale
            renderer.render(scene, cameraPlayer);

            // Rendre la scène HUD
            renderer.autoClear = false;
            renderer.render(hud.scene, hud.camera);
            renderer.autoClear = true;
        }

        animate();
    });

    socket.on('gameState', (data) => {
        updateBallPosition(data.ballPosition, ball);
        displayBallPosition(data.ballPosition, ballPositionDisplay);
    });
    await animationCompletePromise;
    return (true);
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
    const team1 = new Team(gameData.team1.Name, gameData.team1.MaxNbPlayer, gameData.team1.TeamId);
    const team2 = new Team(gameData.team2.Name, gameData.team2.MaxNbPlayer, gameData.team2.TeamId);

    console.log('team1 : ', team1);
    console.log('team2 : ', team2);

    console.log('gameData.team1.Boat : ', gameData.team1.Boat);
    console.log('gameData.team2.Boat : ', gameData.team2.Boat);
    console.log('gameData.team1.Cannon : ', gameData.team1.Cannon);
    console.log('gameData.team2.Cannon : ', gameData.team2.Cannon);

    console.log('team1.getBoatSavedPos() : ', team1.getBoatSavedPos());
    console.log('team2.getBoatSavedPos() : ', team2.getBoatSavedPos());
    console.log('===================team1.getCannonSavedPos() : ', team1.getCannonSavedPos());
    console.log('===================team2.getCannonSavedPos() : ', team2.getCannonSavedPos());

    team1.setBoatSavedPos(gameData.team1.Boat);
    team2.setBoatSavedPos(gameData.team2.Boat);
    team1.setCannonSavedPos(gameData.team1.Cannon);
    team2.setCannonSavedPos(gameData.team2.Cannon);

    if (gameData.team1.Score)
        team1.setScore(gameData.team1.Score);
    if (gameData.team2.Score)
        team2.setScore(gameData.team2.Score);
    if (gameData.ball)
    {
        team1.setBallSavedPos(gameData.ball);
        team2.setBallSavedPos(gameData.ball);
    }


    console.log('team1.getBoatSavedPos() : ', team1.getBoatSavedPos());
    console.log('team2.getBoatSavedPos() : ', team2.getBoatSavedPos());
    console.log('team1.getCannonSavedPos() : ', team1.getCannonSavedPos());
    console.log('team2.getCannonSavedPos() : ', team2.getCannonSavedPos());

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
    return cameraPlayer;
}

function setupEventListeners(socket, keys, cameraPlayer) {
    let lastKeyPressTime = 0;
    window.addEventListener('keydown', (event) => {
        if (!keys[event.key] || !keys[event.key].pressed)
        {
            keys[event.key] = {pressed: true, time: 0};
            lastKeyPressTime = Date.now();
        }
        else
        {
            keys[event.key].time = Date.now() - lastKeyPressTime;
        }
    });

    window.addEventListener('keyup', (event) => {
        if (keys[event.key] && keys[event.key].pressed)
        {
            const pressDuration = Date.now() - lastKeyPressTime;
            keys[event.key] = {pressed: false, time: pressDuration};
        }
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
