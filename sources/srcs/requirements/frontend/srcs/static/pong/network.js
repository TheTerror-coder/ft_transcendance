import { fireEnnemieCannonBall } from './ballistic_cal.js';
import { unloadScene } from './render.js';


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
    } else {
        await hud.showEndGameText(false, currentLanguage);
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

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, scoreText, hud, scene, currentLanguage, gameCode) {
    console.log("currentLanguage dans setupSocketListeners", currentLanguage);

    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        window.location.href = '/home';
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

export function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}
