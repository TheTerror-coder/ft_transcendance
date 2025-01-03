import { fireEnnemieCannonBall } from './ballistic_cal.js';
import { unloadScene } from './render.js';


function findTeam(Team1, Team2, teamID)
{
    if (teamID === Team1.getTeamId())
        return (Team1);
    else
        return (Team2);
}

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball, scoreText, hud, scene, ocean, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2, requestAnimationFrameId) {
    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        // socket.emit('stopGame');
        window.location.href = '/home';
        console.log('Disconnected from the server');
    });

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
        console.log('teamName : ', teamName);
        console.log('winner : ', winner);
        if (winner === teamName)
            await hud.showEndGameText(true);
        else
            await hud.showEndGameText(false);
        currentPlayer.setGameStarted(false);
        // socket.disconnect();
        console.log('Game ended');
        // console.log('socket disconnected ', socket);
    });

    // socket.on('gameEnded', () => {
    //     currentPlayer.setGameStarted(false);
    //     // unloadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2);
    // });

    socket.on('cannonPosition', async (data) => {
        const {teamID, cannonPosition} = data;
        let team = findTeam(Team1, Team2, teamID);
        if (team && team.getCannon()) {
            team.getCannon().position.x = cannonPosition.x;
        }
    });

    socket.on('cannonRotation', async (data) => {
        const {teamID, cannonRotation} = data;
        let team = findTeam(Team1, Team2, teamID);
        if (team && team.getCannon()) {
            team.getCannon().rotation.y = cannonRotation.y;
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
                console.log('team.getCannonPosInTheWorld() : ', team.getCannonPosInTheWorld());
                currentPlayer.updateCannoneerCameraPos(boatFormerPosition, boatPosition.x);
            }
        } else {
            console.error('Team, boat or cannon not found for team', teamID);
        }
    });

    socket.on('scoreUpdate', (data) => {
        const {team1, team2} = data;
        Team1.setScore(team1);
        Team2.setScore(team2);
        console.log('Score updated - Team 1: ', team1, 'Team 2: ', team2);
        scoreText.updateHUDText(`Score - Team 1: ${Team1.getScore()}, Team 2: ${Team2.getScore()}`);
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
