import * as THREE from 'three';

export function updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED) {
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();

        if (cannon) {
            if (keys && keys['d'] && cannon.position.x < 6) {
                cannon.position.x += CANNON_MOVE_SPEED * directionMove;
                emitCannonPosition(socket, gameCode, TeamID, cannon.position);
            }
            if (keys && keys['a'] && cannon.position.x > -6) {
                cannon.position.x -= CANNON_MOVE_SPEED * directionMove;
                emitCannonPosition(socket, gameCode, TeamID, cannon.position);
            }
        }
    }
}

export function updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, BOAT_MOVE_SPEED) {
    if (currentPlayer.getRole() === 'captain') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let boatGroup = currentPlayerTeam.getBoatGroup();

        let boatMoved = false;

        if (keys && keys['d'] && boatGroup.position.x < 40) {
            boatGroup.position.x += BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }
        if (keys && keys['a'] && boatGroup.position.x > -40) {
            boatGroup.position.x -= BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }

        if (boatMoved) {
            emitBoatAndCannonPosition(socket, gameCode, boatGroup, TeamID);
        }
    }
}

function emitCannonPosition(socket, gameCode, TeamID, position) {
    socket.emit('cannonPosition', { 
        gameCode: gameCode, 
        team: TeamID, 
        x: position.x,
        y: position.y,
        z: position.z
    });
}

function emitBoatAndCannonPosition(socket, gameCode, boatGroup, TeamID) {
    let boatGlobalPosition = new THREE.Vector3();
    boatGroup.getObjectByName(`bateauTeam${TeamID}`).getWorldPosition(boatGlobalPosition);

    let cannonGlobalPosition = new THREE.Vector3();
    boatGroup.getObjectByName(`cannonTeam${TeamID}`).getWorldPosition(cannonGlobalPosition);

    socket.emit('updatePositions', {
        gameCode: gameCode,
        team: TeamID,
        boatPosition: {
            x: boatGlobalPosition.x,
            y: boatGlobalPosition.y,
            z: boatGlobalPosition.z
        },
        cannonPosition: {
            x: cannonGlobalPosition.x,
            y: cannonGlobalPosition.y,
            z: cannonGlobalPosition.z
        }
    });
} 