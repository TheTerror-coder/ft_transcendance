import Team from './Team.js';
import Player from './Player.js';
import { updateAndEmitBoatPositions, updateAndEmitCannonPositions, updateAndEmitCannonRotation } from './controls.js';
import * as render from './render.js';
import * as network from './network.js';
import * as THREE from 'three';
import { createHUD } from './HUD.js';
import { updateBoatPositions, initializeInterpolators } from './network.js';

let BOAT_MOVE_SPEED = 2.5;
let CANNON_MOVE_SPEED = 0.1;
let CANNON_ROTATION_SPEED = 0.1;
let FRAME_RATE = 50;

export async function main(gameCode, socket, currentLanguage) {

	socket.emit('GameStarted', gameCode);
    socket.on('disconnect', () => {
        socket.off('disconnect');
    });
    
    const gameInitData = await new Promise((resolve) => {
        const gameDataListener = async (gameData) => {
            if (gameData) {
                try {
                    const initData = await initGame(gameData, socket.id);
                    
                    if (!initData.currentPlayerTeam) {
                        console.error('currentPlayerTeam not initialized');
                        resolve(null);
                        return;
                    }
                    
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display } = await render.initScene(Team1, Team2, currentPlayerTeam);
        if (!scene || !cameraPlayer || !renderer || !boatGroup1 || !boatGroup2 || !ball || !display) {
            console.error('Error loading the scene');
            return false;
        }
        let hud = await createHUD(renderer);
        
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

        await waitForBoatGroup(currentPlayerTeam);
        if (currentPlayerTeam.getBoatSavedPos().x == 0 && currentPlayerTeam.getBoatSavedPos().y == 0 && currentPlayerTeam.getBoatSavedPos().z == 0)
            network.updateServerData(gameCode, socket, currentPlayerTeam);
        
        setupEventListeners(socket, keys, cameraPlayer, renderer);
        setupControls(keys);
        network.setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, hud, scene, currentLanguage, gameCode, currentPlayerTeam);
        socket.emit('playerReady', gameCode);
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

                    removeControls();

                    scene.remove(boatGroup1);
                    scene.remove(boatGroup2);
                    scene.remove(ball);
                    scene.remove(display[0])
                    
                    scene.background = new THREE.Color(0x000000);
                    
                    const startTime = Date.now();
                    async function renderEndScreen() {
                        if (Date.now() - startTime < 5000) {
                            requestAnimationFrame(renderEndScreen);
                            renderer.render(scene, cameraPlayer);
                            renderer.autoClear = false;
                            renderer.render(hud.scene, hud.camera);
                            renderer.autoClear = true;
                        } else {
                            if (hud) {
                                hud.scene.clear();
                                if (hud.camera) hud.camera = null;
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

                            if (gameCode.length == 4 || (gameCode.length == 5 && currentPlayerTeam.getWinner() === false))
                            {
                                animationComplete = true;
                                network.removeSocketListeners(socket);
                                resolve();
                                savedGameCode.code = null;
                                ELEMENTs.allPage().innerHTML = resetBaseHtmlVAR;
                                replace_location(URLs.VIEWS.HOME);
                                socket.disconnect();
                                return (true);
                            }
                            else if (gameCode.length == 5 && currentPlayerTeam.getWinner() === true)
                            {
                                animationComplete = true;
                                network.removeSocketListeners(socket);
                                resolve();
                                savedGameCode.code = null;
                                ELEMENTs.allPage().innerHTML = resetBaseHtmlVAR;
                                if (currentPlayerTeam.getTournamentEnded() === true)
                                {
                                    replace_location(URLs.VIEWS.TOURNAMENT_TREE);
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
                
                updateBoatPositions(Team1, Team2);

                renderer.render(scene, cameraPlayer);

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

    const team1 = new Team(gameData.team1.Name, gameData.team1.MaxNbPlayer, gameData.team1.TeamId);
    const team2 = new Team(gameData.team2.Name, gameData.team2.MaxNbPlayer, gameData.team2.TeamId);

    let currentPlayer = null;
    let currentPlayerTeam = null;

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
    const initializePlayer = (playerData, team) => {
        if (!playerData) {
            console.error('Données de joueur invalides:', playerData);
            return null;
        }

        try {
            const player = new Player(
                playerData.id,
                playerData.role,
                playerData.name,
                team.getTeamId()
            );

            team.setPlayer(player);

            if (playerData.id === socketID) {
                currentPlayer = player;
                currentPlayerTeam = team;
            }

            return player;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du joueur:', error);
            console.error('playerData:', playerData);
            console.error('team:', team);
            return null;
        }
    };

    const team1Players = gameData.team1.Player;
    if (team1Players) {
        if (Array.isArray(team1Players)) {
            await Promise.all(team1Players.map(playerData => initializePlayer(playerData, team1)));
        } else if (typeof team1Players === 'object') {
            await Promise.all(Object.values(team1Players).map(playerData => initializePlayer(playerData, team1)));
        }
    }

    const team2Players = gameData.team2.Player;
    if (team2Players) {
        if (Array.isArray(team2Players)) {
            await Promise.all(team2Players.map(playerData => initializePlayer(playerData, team2)));
        } else if (typeof team2Players === 'object') {
            await Promise.all(Object.values(team2Players).map(playerData => initializePlayer(playerData, team2)));
        }
    }

    if (!currentPlayer || !currentPlayerTeam) {
        console.error('Joueur courant non trouvé après initialisation');
        throw new Error('Joueur courant non trouvé');
    }

    return { Team1: team1, Team2: team2, currentPlayer, currentPlayerTeam };
}

function initCamera(player, cameraPlayer, cannon, bateau)
{
    cameraPlayer.position.copy(player.getCameraPos());
    cameraPlayer.rotation.set(player.getCameraRotation().x, player.getCameraRotation().y, player.getCameraRotation().z);
    return cameraPlayer;
}

let keyDownHandler = null;
let keyUpHandler = null;

function setupControls(keys) {
    let lastKeyPressTime = 0;
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

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function removeControls() {
    if (keyDownHandler) {
        document.removeEventListener('keydown', keyDownHandler);
        keyDownHandler = null;
    }
    if (keyUpHandler) {
        document.removeEventListener('keyup', keyUpHandler);
        keyUpHandler = null;
    }
}

function setupEventListeners(socket, keys, cameraPlayer, renderer) {
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

    const maxDeltaTime = 0.05;
    deltaTime = Math.min(deltaTime, maxDeltaTime);

    const dampingFactor = 0.95;
    const predictedPosition = {
        x: ball.position.x + velocity.x * deltaTime * dampingFactor,
        y: ball.position.y + velocity.y * deltaTime * dampingFactor,
        z: ball.position.z
    };

    const predictionLerpFactor = 0.4;
    ball.position.x += (predictedPosition.x - ball.position.x) * predictionLerpFactor;
    ball.position.y += (predictedPosition.y - ball.position.y) * predictionLerpFactor;
    ball.position.z = predictedPosition.z;
}
