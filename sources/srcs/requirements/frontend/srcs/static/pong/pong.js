import Team from './Team.js';
import Player from './Player.js';
import { initDebug, setupCameraControls } from './debug.js';
import { updateAndEmitBoatPositions, updateAndEmitCannonPositions, updateAndEmitCannonRotation } from './controls.js';
import * as render from './render.js';
import * as network from './network.js';
import * as THREE from 'three'; // TODO : remove for production
import { createHUD } from './HUD.js';
import { updateBoatPositions, initializeInterpolators } from './network.js';

console.log("pong.js loaded");

let BOAT_MOVE_SPEED = 2.5;
let CANNON_MOVE_SPEED = 0.1;
let CANNON_ROTATION_SPEED = 0.1;
let FRAME_RATE = 50;

export async function main(gameCode, socket, currentLanguage) {
    console.log('socket : ', socket);
    
    socket.emit('GameStarted', gameCode);
    console.log("gameCode : ", gameCode);
    console.log("currentLanguage: ", currentLanguage);

    socket.on('disconnect', () => {
        console.log('Disconnected from the server');
        // ELEMENTs.background().innerHTML = resetBaseHtmlVAR;
        socket.off('disconnect');
    });
    
    // Créer une Promise pour attendre les données initiales
    const gameInitData = await new Promise((resolve) => {
        const gameDataListener = async (gameData) => {
            console.log('Données de la partie:', gameData);
            if (gameData) {
                try {
                    const initData = await initGame(gameData, socket.id);
                    console.log('initGame done');
                    console.log('Team1:', initData.Team1);
                    console.log('Team2:', initData.Team2);
                    console.log('currentPlayer:', initData.currentPlayer);
                    console.log('currentPlayerTeam:', initData.currentPlayerTeam);
                    
                    // Vérifier que currentPlayerTeam est bien initialisé
                    if (!initData.currentPlayerTeam) {
                        console.error('currentPlayerTeam not initialized');
                        resolve(null);
                        return;
                    }
                    
                    // Désactiver le listener une fois les données reçues
                    socket.off('gameData', gameDataListener);
                    resolve(initData);
                } catch (error) {
                    console.error('Error in initGame:', error);
                    resolve(null);
                }
            } else {
                console.error('Aucune donnée de partie trouvée.');
                socket.off('gameData', gameDataListener);
                resolve(null);
            }
        };

        socket.on('gameData', gameDataListener);
    });

    if (!gameInitData || !gameInitData.currentPlayerTeam) {
        console.error("Échec de l'initialisation du jeu ou currentPlayerTeam non initialisé");
        return false;
    }

    let Team1 = gameInitData.Team1;
    let Team2 = gameInitData.Team2;
    let currentPlayer = gameInitData.currentPlayer;
    let currentPlayerTeam = gameInitData.currentPlayerTeam;

    console.log('gameInitData : ', gameInitData);
    console.log('currentPlayer : ', currentPlayer);
    console.log('currentPlayerTeam : ', currentPlayerTeam);
    
    // Attendre un court instant pour s'assurer que tout est bien initialisé
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display } = await render.initScene(Team1, Team2, currentPlayerTeam);
        if (!scene || !cameraPlayer || !renderer || !boatGroup1 || !boatGroup2 || !ball || !display) {
            console.error('Error loading the scene');
            return false;
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

        initializeInterpolators(Team1, Team2, currentPlayerTeam);
        
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
        
        setupEventListeners(socket, keys, cameraPlayer, renderer);
        setupControls(keys);
        initDebug(BOAT_MOVE_SPEED, CANNON_MOVE_SPEED, FRAME_RATE, gameCode, socket, keys, currentPlayerTeam, currentPlayer);
        network.setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, hud.scoreText, hud, scene, currentLanguage, gameCode, currentPlayerTeam);
        console.log("Game code : ", gameCode);
        socket.emit('playerReady', gameCode);
        console.log('Player ready sent');
        await waitForGameStarted(currentPlayer);
        setInterval(() => {
            updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, BOAT_MOVE_SPEED);
            updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED);
        }, FRAME_RATE);
        updateAndEmitCannonRotation(keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED, hud, scene, socket, gameCode);
        
        let animationComplete = false;
        const animationCompletePromise = new Promise(async (resolve) => {
            async function animate() {
                let requestAnimationFrameId = requestAnimationFrame(animate);
                
                if (currentPlayer.getGameStarted() === false) {
                    cancelAnimationFrame(requestAnimationFrameId);
                    console.log("Pass in ending clear");

                    removeControls();

                    scene.remove(boatGroup1);
                    scene.remove(boatGroup2);
                    scene.remove(ball);
                    scene.remove(display[0])
                    
                    // Rendre la scène noire
                    scene.background = new THREE.Color(0x000000);
                    
                    // Continuer le rendu pendant 5 secondes pour afficher le texte de victoire/défaite
                    const startTime = Date.now();
                    async function renderEndScreen() {
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
                            
                            console.log("currentPlayerTeam.getWinner() : ", currentPlayerTeam.getWinner());
                            console.log("gameCode.length : ", gameCode.length);
                            console.log("gameCode : ", gameCode);
                            if (gameCode.length == 4 || (gameCode.length == 5 && currentPlayerTeam.getWinner() === false))
                            {
                                console.log("currentPlayer.getName() : ", currentPlayer.getName());
                                console.log("socket.id : ", socket.id);
                                animationComplete = true;
                                network.removeSocketListeners(socket);
                                resolve();
                                savedGameCode.code = null;
                                ELEMENTs.background().innerHTML = resetBaseHtmlVAR;
                                replace_location(URLs.VIEWS.HOME);
                                // await new Promise(resolve => setTimeout(resolve, 200));
                                socket.disconnect();
                                return (true);
                            }
                            else if (gameCode.length == 5 && currentPlayerTeam.getWinner() === true)
                            {
                                animationComplete = true;
                                network.removeSocketListeners(socket);
                                resolve();
                                savedGameCode.code = null;
                                ELEMENTs.background().innerHTML = resetBaseHtmlVAR;
                                if (currentPlayerTeam.getTournamentEnded() === true)
                                {
                                    replace_location(URLs.VIEWS.TOURNAMENT_TREE);
                                    // await new Promise(resolve => setTimeout(resolve, 10000));
                                    socket.disconnect();
                                    return (true);
                                }
                                replace_location(URLs.VIEWS.TOURNAMENT_TREE);
                                return (true);
                            }
                        }
                    }
                    
                    renderEndScreen();
                    return (true);
                }
                
                if (ball && ball.userData.lastServerPosition && ball.userData.velocity) {
                    const now = Date.now();
                    const deltaTime = (now - ball.userData.lastServerPosition.timestamp) / 1000;
                    
                    if (deltaTime < 1.0) {
                        predictBallPosition(ball, ball.userData.velocity, deltaTime);
                    }
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
                
                // Mettre à jour les positions des bateaux avec interpolation
                updateBoatPositions(Team1, Team2);

                // Rendre la scène normale
                renderer.render(scene, cameraPlayer);

                // Rendre la scène HUD
                renderer.autoClear = false;
                renderer.render(hud.scene, hud.camera);
                renderer.autoClear = true;
            }

            animate();
        });

        await animationCompletePromise;
        return (true);
    } catch (error) {
        console.error('Error initializing scene:', error);
        return false;
    }
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

    let currentPlayer = null;
    let currentPlayerTeam = null;

    team1.setBoatSavedPos(gameData.team1.Boat);
    team2.setBoatSavedPos(gameData.team2.Boat);
    team1.setCannonSavedPos(gameData.team1.Cannon);
    team2.setCannonSavedPos(gameData.team2.Cannon);

    console.log('team1.getCannonSavedPos() : ', team1.getCannonSavedPos());
    console.log('team2.getCannonSavedPos() : ', team2.getCannonSavedPos());

    if (gameData.team1.Score)
        team1.setScore(gameData.team1.Score);
    if (gameData.team2.Score)
        team2.setScore(gameData.team2.Score);
    if (gameData.ball)
    {
        team1.setBallSavedPos(gameData.ball);
        team2.setBallSavedPos(gameData.ball);
    }
    // Fonction helper pour initialiser un joueur
    const initializePlayer = (playerData, team) => {
        if (!playerData) {
            console.error('Données de joueur invalides:', playerData);
            return null;
        }

        try {
            // Les données sont déjà dans le bon format, pas besoin de getters
            const player = new Player(
                playerData.id,
                playerData.role,
                playerData.name,
                team.getTeamId()
            );

            team.setPlayer(player);
            console.log(`Joueur initialisé:`, player);

            if (playerData.id === socketID) {
                currentPlayer = player;
                currentPlayerTeam = team;
                console.log('Joueur courant trouvé:', player);
            }

            return player;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du joueur:', error);
            console.error('playerData:', playerData);
            console.error('team:', team);
            return null;
        }
    };

    // Initialiser les joueurs de l'équipe 1
    const team1Players = gameData.team1.Player;
    if (team1Players) {
        if (Array.isArray(team1Players)) {
            // Si c'est un tableau
            await Promise.all(team1Players.map(playerData => initializePlayer(playerData, team1)));
        } else if (typeof team1Players === 'object') {
            // Si c'est un objet avec des clés
            await Promise.all(Object.values(team1Players).map(playerData => initializePlayer(playerData, team1)));
        }
    }

    // Initialiser les joueurs de l'équipe 2
    const team2Players = gameData.team2.Player;
    if (team2Players) {
        if (Array.isArray(team2Players)) {
            // Si c'est un tableau
            await Promise.all(team2Players.map(playerData => initializePlayer(playerData, team2)));
        } else if (typeof team2Players === 'object') {
            // Si c'est un objet avec des clés
            await Promise.all(Object.values(team2Players).map(playerData => initializePlayer(playerData, team2)));
        }
    }

    // Vérifications finales
    if (!currentPlayer || !currentPlayerTeam) {
        console.error('Joueur courant non trouvé après initialisation');
        console.log('Équipe 1:', team1);
        console.log('Équipe 2:', team2);
        throw new Error('Joueur courant non trouvé');
    }

    return { Team1: team1, Team2: team2, currentPlayer, currentPlayerTeam };
}

function initCamera(player, cameraPlayer, cannon, bateau)
{
    cameraPlayer.position.copy(player.getCameraPos());
    console.log('player.getCameraRotation() : ', player.getCameraRotation());
    cameraPlayer.rotation.set(player.getCameraRotation().x, player.getCameraRotation().y, player.getCameraRotation().z);
    return cameraPlayer;
}

let keyDownHandler = null;
let keyUpHandler = null;

function setupControls(keys) {
    let lastKeyPressTime = 0;
    // Créer les fonctions de callback
    keyDownHandler = (event) => {
        if (!keys[event.key] || !keys[event.key].pressed) {
            keys[event.key] = {pressed: true, time: 0};
            lastKeyPressTime = Date.now();
        } else {
            keys[event.key].time = Date.now() - lastKeyPressTime;
        }
    };
    
    keyUpHandler = (event) => {
        if (keys[event.key] && keys[event.key].pressed) {
            const pressDuration = Date.now() - lastKeyPressTime;
            keys[event.key] = {pressed: false, time: pressDuration};
        }
    };

    // Ajouter les event listeners
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function removeControls() {
    // Vérifier si les handlers existent avant de les supprimer
    if (keyDownHandler) {
        document.removeEventListener('keydown', keyDownHandler);
        keyDownHandler = null;
    }
    if (keyUpHandler) {
        document.removeEventListener('keyup', keyUpHandler);
        keyUpHandler = null;
    }
    console.log("Controls removed");
}

function setupEventListeners(socket, keys, cameraPlayer, renderer) {
    // let lastKeyPressTime = 0;
    // window.addEventListener('keydown', (event) => {
    //     if (!keys[event.key] || !keys[event.key].pressed)
    //     {
    //         keys[event.key] = {pressed: true, time: 0};
    //         lastKeyPressTime = Date.now();
    //     }
    //     else
    //     {
    //         keys[event.key].time = Date.now() - lastKeyPressTime;
    //     }
    // });

    // window.addEventListener('keyup', (event) => {
    //     if (keys[event.key] && keys[event.key].pressed)
    //     {
    //         const pressDuration = Date.now() - lastKeyPressTime;
    //         keys[event.key] = {pressed: false, time: pressDuration};
    //     }
    // });

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

function predictBallPosition(ball, velocity, deltaTime) {
    if (!ball.userData.lastServerPosition) {
        ball.userData.lastServerPosition = {
            x: ball.position.x,
            y: ball.position.y,
            z: ball.position.z,
            timestamp: Date.now()
        };
        return;
    }

    // Limiter le deltaTime pour éviter les prédictions trop lointaines
    const maxDeltaTime = 0.1; // 100ms maximum
    deltaTime = Math.min(deltaTime, maxDeltaTime);

    // Calculer la position prédite avec amortissement
    const dampingFactor = 0.9; // Réduire légèrement l'effet de la vélocité
    const predictedPosition = {
        x: ball.position.x + velocity.x * deltaTime * dampingFactor,
        y: ball.position.y + velocity.y * deltaTime * dampingFactor,
        z: ball.position.z
    };

    // Appliquer la position prédite avec une interpolation douce
    const predictionLerpFactor = 0.3;
    ball.position.x += (predictedPosition.x - ball.position.x) * predictionLerpFactor;
    ball.position.y += (predictedPosition.y - ball.position.y) * predictionLerpFactor;
    ball.position.z = predictedPosition.z; // Hauteur fixe
}
