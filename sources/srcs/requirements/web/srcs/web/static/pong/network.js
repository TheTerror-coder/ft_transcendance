function findTeam(Team1, Team2, teamID)
{
    if (teamID === Team1.getTeamId())
        return (Team1);
    else
        return (Team2);
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

export function setupSocketListeners(socket, Team1, Team2, currentPlayer, ball) {
    socket.on('connect', (data) => {
        var Team = data.Team;
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        socket.emit('stopGame');
        window.location.href = '/lobby';
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
        gameStarted = false;
        waitingMessage.style.display = 'block';
        console.log('Game stopped');
        window.location.href = '/lobby';
        currentPlayer.setGameStarted(false);
    });

    socket.on('winner', (winner) => {
        console.log(`Le joueur ${winner} a gagné !`);
        // gameStarted = false;
    });

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

    socket.on('boatPosition', async (data) => {
        const {teamID, boatPosition} = data;
        let team = findTeam(Team1, Team2, teamID);
        if (team && team.getBoatGroup()) {
            team.getBoatGroup().position.x = boatPosition.x;
            
            if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamID() === teamID) {
                updateCannoneerCamera(team.getBoatGroup(), currentPlayer);
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
        const scoreDisplay = document.getElementById('scoreDisplay');
        scoreDisplay.innerText = `Score - Team 1: ${Team1.getScore()}, Team 2: ${Team2.getScore()}`;
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
