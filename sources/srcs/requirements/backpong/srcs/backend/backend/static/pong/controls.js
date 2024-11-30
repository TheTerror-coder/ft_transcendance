import * as THREE from 'three';

export function updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED) {
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();
        let cannonTubeMoved = false;

        if (cannon) {
            if (keys && keys['d'] && ((cannon.position.x > -6 && TeamID === 1) || (cannon.position.x < 6 && TeamID === 2)))
            {
                cannon.position.x += CANNON_MOVE_SPEED * directionMove;
                // emitCannonPosition(socket, gameCode, TeamID, cannon.position);
                cannonTubeMoved = true;
            }
            if (keys && keys['a'] && ((cannon.position.x < 6 && TeamID === 1) || (cannon.position.x > -6 && TeamID === 2)))
            {
                cannon.position.x -= CANNON_MOVE_SPEED * directionMove;
                // emitCannonPosition(socket, gameCode, TeamID, cannon.position);
                cannonTubeMoved = true;
            }
        }
        if (cannonTubeMoved) {
            emitCannonPosition(socket, gameCode, TeamID, cannon.position);
        }
    }
}

export function updateAndEmitCannonRotation(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED)
{
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionRotation = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();
        let cannonTube = currentPlayerTeam.getCannonTube();
        let boatGroup = currentPlayerTeam.getBoatGroup();

        if (cannon && cannonTube) {
            if (keys && keys['w'] && cannonTube.rotation.y > -Math.PI / 2) {
                cannonTube.rotation.y += CANNON_ROTATION_SPEED * directionRotation;
                emitBoatAndCannonPosition(socket, gameCode, boatGroup, TeamID);
            }
            if (keys && keys['s'] && cannonTube.rotation.y < 0) {
                cannonTube.rotation.y -= CANNON_ROTATION_SPEED * directionRotation;
                emitBoatAndCannonPosition(socket, gameCode, boatGroup, TeamID);
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

        if (keys && keys['d'] && ((boatGroup.position.x > -55 && TeamID === 1) || (boatGroup.position.x < 55 && TeamID === 2))) {
            boatGroup.position.x += BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }
        if (keys && keys['a'] && ((boatGroup.position.x < 55 && TeamID === 1) || (boatGroup.position.x > -55 && TeamID === 2))) {
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
        cannonPosition: {
            x: position.x,
            y: position.y,
            z: position.z
        }
    });
}

function emitBoatAndCannonPosition(socket, gameCode, boatGroup, TeamID) {
    // let boatGlobalPosition = new THREE.Vector3();
    // boatGroup.getObjectByName(`bateauTeam${TeamID}`).getWorldPosition(boatGlobalPosition);

    // let cannonGlobalPosition = new THREE.Vector3();
    // boatGroup.getObjectByName(`cannonTeam${TeamID}`).getWorldPosition(cannonGlobalPosition);

    const cannonRotation = boatGroup.getObjectByName(`cannonTeam${TeamID}`).rotation;

    socket.emit('boatPosition', {
        gameCode: gameCode,
        team: TeamID,
        boatPosition: {
            x: boatGroup.position.x,
            y: boatGroup.position.y,
            z: boatGroup.position.z
        },
        cannonRotation: {
            x: cannonRotation.x,
            y: cannonRotation.y,
            z: cannonRotation.z
        }
        // cannonPosition: {
        //     x: cannonGlobalPosition.x,
        //     y: cannonGlobalPosition.y,
        //     z: cannonGlobalPosition.z
        // }
    });
} 
