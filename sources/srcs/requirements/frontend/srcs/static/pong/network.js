import { fireEnnemieCannonBall } from './ballistic_cal.js';
import { unloadScene } from './render.js';

// Ajouter un système d'interpolation pour les positions
class PositionInterpolator {
    constructor() {
        this.targetPosition = { x: 0, y: 0, z: 0 };
        this.currentPosition = { x: 0, y: 0, z: 0 };
        this.lerpFactor = 0.1; // Facteur de lissage (0.1 = 10% de la distance par frame)
        this.isLocalPlayer = false;
    }

    setIsLocalPlayer(isLocal) {
        this.isLocalPlayer = isLocal;
    }

    setTarget(x, y, z) {
        if (!this.isLocalPlayer) {
            this.targetPosition = { x, y, z };
        }
    }

    update(object) {
        if (!this.isLocalPlayer) {
            // Interpolation linéaire entre la position actuelle et la position cible
            this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * this.lerpFactor;
            this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * this.lerpFactor;
            this.currentPosition.z += (this.targetPosition.z - this.currentPosition.z) * this.lerpFactor;

            // Mise à jour de la position de l'objet
            object.position.set(
                this.currentPosition.x,
                this.currentPosition.y,
                this.currentPosition.z
            );
        }
    }

    setInitialPosition(x, y, z) {
        this.currentPosition = { x, y, z };
        this.targetPosition = { x, y, z };
    }
}

// Créer des interpolateurs pour chaque bateau
const boat1Interpolator = new PositionInterpolator();
const boat2Interpolator = new PositionInterpolator();

function findTeam(Team1, Team2, teamID)
{
    if (teamID === Team1.getTeamId())
        return (Team1);
    else
        return (Team2);
}

const createGamePausedEvent = (currentPlayer) => () => {
    console.log('Game Paused');
    currentPlayer.setIsPaused(true);
    console.log('currentPlayer IsPaused : ', currentPlayer.getIsPaused());
}

const createGameUnpausedEvent = (currentPlayer) => () => {
    console.log('Game Unpaused');
    currentPlayer.setIsPaused(false);
    console.log('currentPlayer IsPaused : ', currentPlayer.getIsPaused());
}

const createGameStartedEvent = (currentPlayer) => () => {
    console.log('Game Started');
    currentPlayer.setGameStarted(true);
    console.log('currentPlayer GameStarted : ', currentPlayer.getGameStarted());
}

const createStopGameEvent = (currentPlayer) => () => {
    console.log('Game stopped');
    currentPlayer.setGameStarted(false);
}

const createWinnerEvent = (Team1, Team2, currentPlayer, hud, currentLanguage) => async (winner) => {
    console.log(`L'équipe ${winner} a gagné !`);
    const TeamID = currentPlayer.getTeamID();
    const currentTeam = findTeam(Team1, Team2, TeamID);
    const teamName = currentTeam.getTeamName();
    console.log("currentLanguage dans winner", currentLanguage);
    if (winner === teamName) {
        await hud.showEndGameText(true, currentLanguage);
        currentTeam.setWinner(true);
    } else {
        await hud.showEndGameText(false, currentLanguage);
        currentTeam.setWinner(false);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    currentPlayer.setGameStarted(false);
}

const createCannonPositionEvent = (Team1, Team2) => (data) => {
    const {teamID, cannonPosition} = data;
    let team = findTeam(Team1, Team2, teamID);
    if (team && team.getCannon()) {
        team.getCannon().position.x = cannonPosition.x;
    }
}

const createBallFiredEvent = (scene) => (data) => {
    const trajectory = data;
    console.log('trajectory : ', trajectory);
    fireEnnemieCannonBall(scene, trajectory);
}

const createUpdateHealthEvent = (Team1, Team2, currentPlayer, hud) => (data) => {
    const {teamID, health} = data;
    let team = findTeam(Team1, Team2, teamID);
    if (team = currentPlayer.getTeamID())
        hud.updateHealth(health);
    else
        hud.updateHealth2(health);
}

const createBoatPositionEvent = (Team1, Team2, currentPlayer) => (data) => {
    const {teamID, boatPosition} = data;
    let team = findTeam(Team1, Team2, teamID);
    if (team && team.getBoatGroup()) {
        let boatFormerPosition = team.getBoatGroup().position.x;
        team.getBoatGroup().position.x = boatPosition.x;
        
        if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamID() === teamID) {
            currentPlayer.updateCannoneerCameraPos(boatFormerPosition, boatPosition.x);
        }
    } else {
        console.error('Team, boat or cannon not found for team', teamID);
    }
}

const createScoreUpdateEvent = (Team1, Team2, scoreText, currentLanguage) => (data) => {
    const {team1, team2, gameCode} = data;
    Team1.setScore(team1);
    Team2.setScore(team2);
    console.log('Score updated for gameCode: ', gameCode, ' - Team 1: ', team1, 'Team 2: ', team2);
    scoreText.updateHUDText(`${team1} - ${team2}`, currentLanguage);
}

// Ajouter une constante pour la fréquence de mise à jour
const BALL_UPDATE_INTERVAL = 50; // 50ms = 20fps, ajustable selon les besoins

// Modifier la fonction de mise à jour de la balle pour utiliser l'interpolation
function updateBallPosition(ballPosition, ball, lastBallPosition) {
    if (!ball || !ballPosition) return;
    
    // Réduire le facteur d'interpolation pour un mouvement plus fluide
    const lerpFactor = 0.15;  // Réduit de 0.3 à 0.15
    
    // Calculer la distance entre la position actuelle et la position cible
    const distance = {
        x: ballPosition.x - ball.position.x,
        y: ballPosition.y - ball.position.y,
        z: ballPosition.z - ball.position.z
    };
    
    // Si la distance est trop grande, téléporter directement
    const maxDistance = 10;  // Seuil de téléportation
    if (Math.abs(distance.x) > maxDistance || 
        Math.abs(distance.y) > maxDistance || 
        Math.abs(distance.z) > maxDistance) {
        ball.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
        return;
    }
    
    // Interpolation linéaire plus douce
    ball.position.x += distance.x * lerpFactor;
    ball.position.y += distance.y * lerpFactor;
    ball.position.z += distance.z * lerpFactor;
}

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, scoreText, hud, scene, currentLanguage, gameCode) {
    console.log("currentLanguage dans setupSocketListeners", currentLanguage);

    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        // window.location.href = '/home';
        ELEMENTs.background().innerHTML = resetBaseHtmlVAR;
        replace_location(URLs.VIEWS.HOME);
        console.log('Disconnected from the server');
    });

    socket.on('gamePaused', createGamePausedEvent(currentPlayer));
    socket.on('gameUnpaused', createGameUnpausedEvent(currentPlayer));
    socket.on('gameStarted', createGameStartedEvent(currentPlayer));
    socket.on('stopGame', createStopGameEvent(currentPlayer));
    socket.on('winner', createWinnerEvent(Team1, Team2, currentPlayer, hud, currentLanguage));
    socket.on('cannonPosition', createCannonPositionEvent(Team1, Team2));
    socket.on('ballFired', createBallFiredEvent(scene));
    socket.on('updateHealth', createUpdateHealthEvent(Team1, Team2, currentPlayer, hud));
    socket.on('boatPosition', createBoatPositionEvent(Team1, Team2, currentPlayer));
    socket.on('scoreUpdate', createScoreUpdateEvent(Team1, Team2, scoreText, currentLanguage));

    socket.on('gameState', (data) => {
        if (ball && data.ballPosition) {
            // Stocker la dernière position reçue du serveur
            ball.userData.lastServerPosition = {
                x: data.ballPosition.x,
                y: data.ballPosition.y,
                z: data.ballPosition.z,
                timestamp: Date.now()
            };
            
            // Stocker la vélocité pour la prédiction
            ball.userData.velocity = data.ballVelocity;
            
            // Mettre à jour la position avec interpolation
            updateBallPosition(data.ballPosition, ball, ball.userData.lastServerPosition);
        }
    });
}

export function removeSocketListeners(socket) {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('gamePaused');
    socket.off('gameUnpaused');
    socket.off('gameStarted');
    socket.off('stopGame');
    socket.off('winner');
    socket.off('cannonPosition');
    socket.off('ballFired');
    socket.off('updateHealth');
    socket.off('boatPosition');
    socket.off('scoreUpdate');
}

export function updateServerData(gameCode, socket, currentPlayerTeam) {
    if (!currentPlayerTeam) {
        console.error('currentPlayerTeam is undefined');
        return;
    }

    // const boat = currentPlayerTeam.getBoat();
    const boatGroup = currentPlayerTeam.getBoatGroup();
    if (!boatGroup) {
        console.error('Boat or boatGroup is undefined for team', currentPlayerTeam.getTeamId());
        return;
    }

    console.log('boatGroup.userData.hitbox', boatGroup.userData.hitbox);

    socket.emit('ClientData', {
        gameCode: gameCode, 
        team: currentPlayerTeam.getTeamId(), 
        boat: boatGroup.position,
        cannon: currentPlayerTeam.getCannonPosInTheWorld(),
        boatHitbox: boatGroup.userData.hitbox
    });
}

export function setupNetworkHandlers(socket, gameCode, Team1, Team2, scene, currentTeam) {
    socket.on('boatPosition', (data) => {
        const team = data.team === Team1.getTeamId() ? Team1 : Team2;
        const interpolator = data.team === Team1.getTeamId() ? boat1Interpolator : boat2Interpolator;
        
        // Ne pas interpoler si c'est le joueur local
        if (team !== currentTeam) {
            interpolator.setTarget(
                data.boatPosition.x,
                team.getBoat().position.y,
                team.getBoat().position.z
            );
        }
    });

    // ... autres gestionnaires d'événements existants ...
}

// Fonction d'animation pour mettre à jour les positions
export function updateBoatPositions(Team1, Team2) {
    if (!Team1 || !Team2) return;

    const boat1 = Team1.getBoat();
    const boat2 = Team2.getBoat();

    if (!boat1 || !boat2) return;

    boat1Interpolator.update(boat1);
    boat2Interpolator.update(boat2);
}

// Initialiser les positions des interpolateurs
export function initializeInterpolators(Team1, Team2, currentTeam) {
    if (!Team1 || !Team2) {
        console.error('Teams not initialized');
        return;
    }

    const boat1 = Team1.getBoat();
    const boat2 = Team2.getBoat();

    if (!boat1 || !boat2) {
        console.error('Boats not initialized');
        return;
    }

    // Configurer quel bateau est le joueur local
    boat1Interpolator.setIsLocalPlayer(Team1 === currentTeam);
    boat2Interpolator.setIsLocalPlayer(Team2 === currentTeam);

    boat1Interpolator.setInitialPosition(boat1.position.x, boat1.position.y, boat1.position.z);
    boat2Interpolator.setInitialPosition(boat2.position.x, boat2.position.y, boat2.position.z);
}

export function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}
