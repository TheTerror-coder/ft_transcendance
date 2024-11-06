
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
    });

    socket.on('winner', (winner) => {
        console.log(`Le joueur ${winner} a gagné !`);
        waitingMessage.style.display = 'block';
        waitingMessage.innerText = `Le joueur ${winner} a gagné !`;
        window.location.href = '/lobby';
    });

    socket.on('cannonPosition', (data) => {
        let team = findTeam(Team1, Team2, data.team);
        if (team && team.getCannon()) {
            team.getCannon().position.set(data.x, data.y, data.z);
        }
    });

    socket.on('boatAndCannonPosition', (data) => {
        const {boatPosition, cannonPosition} = data;
        console.log('boatAndCannonPosition received');
        console.log('boatPosition: ', boatPosition);
        console.log('cannonPosition: ', cannonPosition);
        console.log('team: ', data.team);
        let team = findTeam(Team1, Team2, data.team);
        if (team && team.getBoat() && team.getCannon()) {
            team.getBoat().position.set(boatPosition.x, boatPosition.y, boatPosition.z);
            team.getCannon().position.set(cannonPosition.x, cannonPosition.y, cannonPosition.z);
            
            if (currentPlayer.getRole() === 'Cannoneer' && currentPlayer.getTeamId() === data.team) {
                updateCannoneerCamera(team.getBoat(), currentPlayer);
            }
        } else {
            console.error('Team, boat or cannon not found for team', data.team);
        }
    });
}

export function updateServerData(gameCode, socket, currentPlayerTeam) {
    if (!currentPlayerTeam) {
        console.error('currentPlayerTeam is undefined');
        return;
    }

    const boat = currentPlayerTeam.getBoat();
    const cannon = currentPlayerTeam.getCannon();

    if (!boat || !cannon) {
        console.error('Boat or cannon is undefined for team', currentPlayerTeam.getTeamId());
        return;
    }

    console.log('updateServerData : ', { 
        gameCode: gameCode, 
        TeamID: currentPlayerTeam.getTeamId(), 
        boat: boat.position, 
        cannon: cannon.position 
    });
    
    socket.emit('ClientData', { 
        gameCode: gameCode, 
        TeamID: currentPlayerTeam.getTeamId(), 
        boat: boat.position, 
        cannon: cannon.position 
    });
}

export function periodicGameStateUpdate(socket) {
    setInterval(() => {
        socket.emit('requestGameStateUpdate');
    }, 2000);
}
