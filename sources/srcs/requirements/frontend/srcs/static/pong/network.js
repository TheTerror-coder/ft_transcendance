import { fireEnnemieCannonBall } from './ballistic_cal.js';
import { unloadScene } from './render.js';


function findTeam(Team1, Team2, teamID)
{
    if (teamID === Team1.getTeamId())
        return (Team1);
    else
        return (Team2);
}

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, scoreText, hud, scene, currentLanguage, gameCode) {
    console.log("currentLanguage dans setupSocketListeners", currentLanguage);

    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        // socket.emit('stopGame');
        window.location.href = '/home';
        console.log('Disconnected from the server');
    });

    socket.on('gamePaused', () => {
        console.log('Game Paused');
        currentPlayer.setIsPaused(true);
        console.log('currentPlayer IsPaused : ', currentPlayer.getIsPaused());
    });

    socket.on('gameUnpaused', () => {
        console.log('Game Unpaused');
        currentPlayer.setIsPaused(false);
        console.log('currentPlayer IsPaused : ', currentPlayer.getIsPaused());
    })

    socket.on('gameStarted', () => {
        console.log('Game Started');
        currentPlayer.setGameStarted(true);
        console.log('currentPlayer GameStarted : ', currentPlayer.getGameStarted());
    });

    socket.on('gameState', (data) => {
        ball.position.x = data.ballPosition.x;
        ball.position.y = data.ballPosition.y;
        ball.position.z = data.ballPosition.z;
    });
    
    socket.on('stopGame', () => {
        // gameStarted = false;
        // waitingMessage.style.display = 'block';
        console.log('Game stopped');
        // window.location.href = '/lobby';
        currentPlayer.setGameStarted(false);
    });

    socket.on('winner', async (winner) => {
        console.log(`L'équipe ${winner} a gagné !`);
        const TeamID = currentPlayer.getTeamID();
        const currentTeam = findTeam(Team1, Team2, TeamID);
        const teamName = currentTeam.getTeamName();
        
        // Afficher le texte de victoire/défaite
        console.log("currentLanguage dans winner", currentLanguage);
        if (winner === teamName) {
            await hud.showEndGameText(true, currentLanguage);
        } else {
            await hud.showEndGameText(false, currentLanguage);
        }
        
        // Attendre un court instant avant de marquer la partie comme terminée
        await new Promise(resolve => setTimeout(resolve, 500));
        currentPlayer.setGameStarted(false);
    });

    socket.on('cannonPosition', async (data) => {
        const {teamID, cannonPosition} = data;
        let team = findTeam(Team1, Team2, teamID);
        if (team && team.getCannon()) {
            console.log('cannonPosition through socket: ', cannonPosition);
            team.getCannon().position.x = cannonPosition.x;
        }
    });

    socket.on('ballFired', async (data) => {
        const trajectory = data;
        console.log('trajectory : ', trajectory);
        fireEnnemieCannonBall(scene, trajectory);
    });

    socket.on('updateHealth', async (data) => {
        const {teamID, health} = data;
        let team = findTeam(Team1, Team2, teamID);
        if (team = currentPlayer.getTeamID())
            hud.updateHealth(health);
        else
            hud.updateHealth2(health);
    });

    socket.on('boatPosition', async (data) => {
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
    });

    socket.on('scoreUpdate', async (data) => {
        const {team1, team2, gameCode} = data;
        Team1.setScore(team1);
        Team2.setScore(team2);
        console.log('Score updated for gameCode: ', gameCode, ' - Team 1: ', team1, 'Team 2: ', team2);
        scoreText.updateHUDText(`${team1} - ${team2}`, currentLanguage);
    });
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
