import * as THREE from 'three';
import { calculateCannonBallTrajectory, createTrajectoryLine, fireCannon } from './ballistic_cal.js';

export function updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED) {
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();
        let cannonTubeMoved = false;

        if (cannon) {
            if (keys && keys['d'] && keys['d'].pressed && ((cannon.position.x > -6 && TeamID === 1) || (cannon.position.x < 6 && TeamID === 2)))
            {
                cannon.position.x += CANNON_MOVE_SPEED * directionMove;
                cannonTubeMoved = true;
            }
            if (keys && keys['a'] && keys['a'].pressed && ((cannon.position.x < 6 && TeamID === 1) || (cannon.position.x > -6 && TeamID === 2)))
            {
                cannon.position.x -= CANNON_MOVE_SPEED * directionMove;
                cannonTubeMoved = true;
            }
        }
        let connonPosInTheWorld = currentPlayerTeam.getCannonPosInTheWorld();
        if (cannonTubeMoved) {
            emitCannonPosition(socket, gameCode, TeamID, connonPosInTheWorld.x);
        }
    }
}

export function updateAndEmitCannonRotation(keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED, hud, scene)
{
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionRotation = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();
        let cannonTube = currentPlayerTeam.getCannonTube();

        console.log('currentPlayer GameStarted : ', currentPlayer.getGameStarted());

        if (cannon && cannonTube)
        {
            if (currentPlayer.getGameStarted())
            {
                if (TeamID === 1)
                {
                    let isGoingUp = true;
                    let pause = false;
                    let trajectoryLine = null;
                    setInterval(async () => {
                        if (!pause)
                        {
                            if (cannonTube.rotation.y < -(75 * (Math.PI / 180))) isGoingUp = false;
                            else if (cannonTube.rotation.y > 0) isGoingUp = true;
                            
                            cannonTube.rotation.y += (isGoingUp ? 1 : -1) * CANNON_ROTATION_SPEED * directionRotation;
                            if (keys && keys[' '] && keys[' '].pressed)
                            {
                                pause = true;
                                const v0 = 27;  // Vitesse initiale en m/s
                                let angle = -((cannonTube.rotation.y * 180 / Math.PI));  // Angle de tir en degrés
                                const cannonPos = currentPlayerTeam.getCannonTubeTipPosition();
                                console.log('======== cannonPosTip ========= : ', cannonPos);
                                const trajectory = await calculateCannonBallTrajectory(cannonPos.x, cannonPos.y, cannonPos.z, angle, v0, currentPlayerTeam.getTeamId());
                                trajectoryLine = await createTrajectoryLine(trajectory);
                                scene.add(trajectoryLine);
                                console.log('trajectory : ', trajectory);
                                await fireCannon(trajectory, scene);
                                cannonTube.rotation.y = 0;
                                hud.scene.add(hud.loadingCircle.group);
                            }
                        }
                        else
                        {
                            if (keys && keys['r'] && keys['r'].pressed)
                            {
                                if (hud.getPercentage(keys, 'r') >= 100)
                                {
                                    console.log('key pressed : ', keys['r'].time);
                                    pause = false;
                                    scene.remove(trajectoryLine);
                                    // cannonTube.rotation.y = 0;
                                }
                            }
                        }
                    }, 100);
                }
                else if (TeamID === 2)
                {
                    let isGoingUp = true;
                    setInterval(async () => {
                        if (cannonTube.rotation.y >= 0) isGoingUp = false;
                        if (cannonTube.rotation.y <= -(75 * (Math.PI / 180))) isGoingUp = true;
                        
                        cannonTube.rotation.y += (isGoingUp ? 1 : -1) * CANNON_ROTATION_SPEED;
                    }, 100);
                }
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

        if (keys && keys['d'] && keys['d'].pressed && ((boatGroup.position.x > -55 && TeamID === 1) || (boatGroup.position.x < 55 && TeamID === 2))) {
            boatGroup.position.x += BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }
        if (keys && keys['a'] && keys['a'].pressed && ((boatGroup.position.x < 55 && TeamID === 1) || (boatGroup.position.x > -55 && TeamID === 2))) {
            boatGroup.position.x -= BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }

        if (boatMoved) {
            emitBoatPosition(socket, gameCode, boatGroup, TeamID);
        }
    }
}

function emitCannonPosition(socket, gameCode, TeamID, x) {
    socket.emit('cannonPosition', { 
        gameCode: gameCode, 
        team: TeamID, 
        cannonPosition: {
            x: x,
        }
    });
}

// function emitCannonRotation(socket, gameCode, TeamID, y) {
//     socket.emit('cannonRotation', { 
//         gameCode: gameCode, 
//         team: TeamID, 
//         cannonRotation: {
//             y: y,
//         }
//     });
// }

function emitBoatPosition(socket, gameCode, boatGroup, TeamID) {

    // const cannonRotation = boatGroup.getObjectByName(`cannonTeam${TeamID}`).rotation;

    socket.emit('boatPosition', {
        gameCode: gameCode,
        team: TeamID,
        boatPosition: {
            x: boatGroup.position.x,
            // y: boatGroup.position.y,
            // z: boatGroup.position.z
        },
        // cannonRotation: {
        //     x: cannonRotation.x,
        //     y: cannonRotation.y,
        //     z: cannonRotation.z
        // }
        // cannonPosition: {
        //     x: cannonGlobalPosition.x,
        //     y: cannonGlobalPosition.y,
        //     z: cannonGlobalPosition.z
        // }
    });
} 
