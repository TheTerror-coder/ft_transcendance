import { fireEnnemieCannonBall } from './ballistic_cal.js';

class PositionInterpolator {
    constructor() {
        this.targetPosition = { x: 0, y: 0, z: 0 };
        this.currentPosition = { x: 0, y: 0, z: 0 };
        this.lerpFactor = 0.2;
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
        if (!this.isLocalPlayer && object) {
            object.position.x += (this.targetPosition.x - object.position.x) * this.lerpFactor;
            object.position.y += (this.targetPosition.y - object.position.y) * this.lerpFactor;
            object.position.z += (this.targetPosition.z - object.position.z) * this.lerpFactor;
        }
    }

    setInitialPosition(x, y, z) {
        this.currentPosition = { x, y, z };
        this.targetPosition = { x, y, z };
    }
}

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
    currentPlayer.setIsPaused(true);
}

const createGameUnpausedEvent = (currentPlayer) => () => {
    currentPlayer.setIsPaused(false);
}

const createGameStartedEvent = (currentPlayer) => () => {
    currentPlayer.setGameStarted(true);
}

const createStopGameEvent = (currentPlayer) => () => {
    currentPlayer.setGameStarted(false);
}

const createWinnerEvent = (Team1, Team2, currentPlayer, hud, currentLanguage) => async (winner) => {
    const TeamID = currentPlayer.getTeamID();
    const currentTeam = findTeam(Team1, Team2, TeamID);
    const teamName = currentTeam.getTeamName();
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
    // Vérifier que les données sont valides
    if (!data || !Array.isArray(data)) {
        console.error('Invalid trajectory data received:', data);
        return;
    }
    fireEnnemieCannonBall(scene, data);
}

const createDamageAppliedEvent = (Team1, Team2, currentPlayer, hud) => (data) => {
    const {teamId, health, damage} = data;
    let team = findTeam(Team1, Team2, teamId);
    
    if (teamId === currentPlayer.getTeamID()) {
        hud.updateYourTeamHealth(health);
    } else {
        hud.updateOpponentTeamHealth(health);
    }
}

// Ajouter un système de validation des mises à jour
const lastUpdateTime = new Map();
const UPDATE_THRESHOLD = 50; // ms

function isValidUpdate(teamId) {
    const now = Date.now();
    const lastUpdate = lastUpdateTime.get(teamId) || 0;
    
    if (now - lastUpdate < UPDATE_THRESHOLD) {
        return false;
    }
    
    lastUpdateTime.set(teamId, now);
    return true;
}

// Modifier la fonction createBoatPositionEvent
const createBoatPositionEvent = (Team1, Team2, currentPlayer, currentPlayerTeam) => (data) => {
    const {teamID, boatPosition, sid} = data;
    
    if (!isValidUpdate(teamID)) {
        return;
    }
    
    let team = findTeam(Team1, Team2, teamID);
    if (!team || !team.getBoatGroup()) {
        return;
    }

    // Sauvegarder la position précédente pour la caméra du canonnier
    let boatFormerPosition = team.getBoatGroup().position.x;
    
    // Pour tous les cas, utiliser l'interpolation
    const interpolator = teamID === Team1.getTeamId() ? boat1Interpolator : boat2Interpolator;
    interpolator.setTarget(
        boatPosition.x,
        team.getBoatGroup().position.y,
        team.getBoatGroup().position.z
    );

    // Mise à jour directe de la position du bateau pour les canonniers
    if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamID() === teamID) {
        team.getBoatGroup().position.x = boatPosition.x;
        currentPlayer.updateCannoneerCameraPos(boatFormerPosition, boatPosition.x);
    }
};

const createScoreUpdateEvent = (Team1, Team2, hud, currentLanguage) => (data) => {
    const {team1, team2, gameCode} = data;
    Team1.setScore(team1);
    Team2.setScore(team2);
    hud.updateScore(team1, team2);
}

const gameStateEvent = (ball) => (data) => {
    if (ball && data.ballPosition) {
        const currentTime = Date.now();
        ball.userData.lastServerPosition = {
            x: data.ballPosition.x,
            y: data.ballPosition.y,
            z: data.ballPosition.z,
            timestamp: currentTime
        };
        
        ball.userData.velocity = data.ballVelocity;
        
        updateBallPosition(data.ballPosition, ball);
    }
}

const BALL_UPDATE_INTERVAL = 33;

function updateBallPosition(ballPosition, ball) {
    if (!ball || !ballPosition) return;
    
    const lerpFactor = 0.3;
    
    const distance = {
        x: ballPosition.x - ball.position.x,
        y: ballPosition.y - ball.position.y,
        z: ballPosition.z - ball.position.z
    };
    
    const isRebound = ball.userData.lastPosition && (
        Math.sign(ball.userData.lastPosition.x - ball.position.x) !== Math.sign(ballPosition.x - ball.position.x) ||
        Math.sign(ball.userData.lastPosition.y - ball.position.y) !== Math.sign(ballPosition.y - ball.position.y)
    );
    
    const maxDistance = 10;
    if (isRebound || 
        Math.abs(distance.x) > maxDistance || 
        Math.abs(distance.y) > maxDistance || 
        Math.abs(distance.z) > maxDistance) {
        ball.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
    } else {
        ball.position.x += distance.x * lerpFactor;
        ball.position.y += distance.y * lerpFactor;
        ball.position.z += distance.z * lerpFactor;
    }
    
    ball.userData.lastPosition = {
        x: ball.position.x,
        y: ball.position.y,
        z: ball.position.z
    };
}

const createTournamentEndedEvent = (currentPlayerTeam) => () => {
    currentPlayerTeam.setTournamentEnded(true);
}

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, hud, scene, currentLanguage, gameCode, currentPlayerTeam) {
    socket.on('gamePaused', createGamePausedEvent(currentPlayer));
    socket.on('gameUnpaused', createGameUnpausedEvent(currentPlayer));
    socket.on('gameStarted', createGameStartedEvent(currentPlayer));
    socket.on('stopGame', createStopGameEvent(currentPlayer));
    socket.on('winner', createWinnerEvent(Team1, Team2, currentPlayer, hud, currentLanguage));
    socket.on('cannonPosition', createCannonPositionEvent(Team1, Team2));
    socket.on('ballFired', createBallFiredEvent(scene));
    socket.on('damageApplied', createDamageAppliedEvent(Team1, Team2, currentPlayer, hud));
    socket.on('boatPosition', createBoatPositionEvent(Team1, Team2, currentPlayer, currentPlayerTeam));
    socket.on('scoreUpdate', createScoreUpdateEvent(Team1, Team2, hud, currentLanguage));
    socket.on('gameState', gameStateEvent(ball));
    socket.on('tournamentEnded', createTournamentEndedEvent(currentPlayerTeam));
}

export function removeSocketListeners(socket) {
    socket.off('connect');
    socket.off('gamePaused');
    socket.off('gameUnpaused');
    socket.off('gameStarted');
    socket.off('stopGame');
    socket.off('winner');
    socket.off('cannonPosition');
    socket.off('ballFired');
    socket.off('damageApplied');
    socket.off('boatPosition');
    socket.off('scoreUpdate');
    socket.off('tournamentEnded');
}

export function updateServerData(gameCode, socket, currentPlayerTeam) {
    if (!currentPlayerTeam) {
        console.error('currentPlayerTeam is undefined');
        return;
    }

    const boatGroup = currentPlayerTeam.getBoatGroup();
    if (!boatGroup) {
        console.error('Boat or boatGroup is undefined for team', currentPlayerTeam.getTeamId());
        return;
    }


    socket.emit('ClientData', {
        gameCode: gameCode, 
        team: currentPlayerTeam.getTeamId(), 
        boat: boatGroup.position,
        cannon: currentPlayerTeam.getCannonPosInTheWorld(),
        boatHitbox: boatGroup.userData.hitbox
    });
}

export function updateBoatPositions(Team1, Team2) {
    if (!Team1 || !Team2) return;

    const boat1 = Team1.getBoatGroup();
    const boat2 = Team2.getBoatGroup();

    if (boat1)
        boat1Interpolator.update(boat1);
    if (boat2)
        boat2Interpolator.update(boat2);
}

export function initializeInterpolators(Team1, Team2, currentTeam) {
    if (!Team1 || !Team2) {
        console.error('Teams not initialized');
        return;
    }

    const boat1 = Team1.getBoatGroup();
    const boat2 = Team2.getBoatGroup();

    if (!boat1 || !boat2) {
        console.error('Boats not initialized');
        return;
    }

    boat1Interpolator.setIsLocalPlayer(Team1 === currentTeam);
    boat2Interpolator.setIsLocalPlayer(Team2 === currentTeam);

    boat1Interpolator.setInitialPosition(boat1.position.x, boat1.position.y, boat1.position.z);
    boat2Interpolator.setInitialPosition(boat2.position.x, boat2.position.y, boat2.position.z);

    boat1Interpolator.targetPosition = {
        x: boat1.position.x,
        y: boat1.position.y,
        z: boat1.position.z
    };
    boat2Interpolator.targetPosition = {
        x: boat2.position.x,
        y: boat2.position.y,
        z: boat2.position.z
    };
}

