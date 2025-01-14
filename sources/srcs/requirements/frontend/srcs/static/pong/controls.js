// import * as THREE from 'three';
import { doTheCal } from './ballistic_cal.js';

export function updateAndEmitCannonPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, CANNON_MOVE_SPEED)
{
    if (currentPlayer.getRole() === 'Cannoneer') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let cannon = currentPlayerTeam.getCannon();
        let cannonTubeMoved = false;

        if (cannon) {
            if (keys && keys['d'] && keys['d'].pressed && ((cannon.position.x > -6 && TeamID === 1) || (cannon.position.x < 6 && TeamID === 2)))
            {
                if (currentPlayer.getIsPaused())
                    return;
                cannon.position.x += CANNON_MOVE_SPEED * directionMove;
                cannonTubeMoved = true;
            }
            if (keys && keys['a'] && keys['a'].pressed && ((cannon.position.x < 6 && TeamID === 1) || (cannon.position.x > -6 && TeamID === 2)))
            {
                if (currentPlayer.getIsPaused())
                    return;
                cannon.position.x -= CANNON_MOVE_SPEED * directionMove;
                cannonTubeMoved = true;
            }
        }
        // let cannonPosInTheWorld = currentPlayerTeam.getCannonPosInTheWorld();
        let cannonPos = cannon.position.x;
        if (cannonTubeMoved) {
            console.log('cannonTubeMoved : ', cannonPos);
            emitCannonPosition(socket, gameCode, TeamID, cannonPos);
        }
    }
}

export function updateAndEmitCannonRotation(keys, currentPlayerTeam, currentPlayer, CANNON_ROTATION_SPEED, hud, scene, socket, gameCode)
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
                    setInterval(async () =>
                    {
                        if (!currentPlayer.getIsPaused())
                        {
                            if (!pause)
                            {
                                if (cannonTube.rotation.y < -(75 * (Math.PI / 180))) isGoingUp = false;
                                else if (cannonTube.rotation.y > 0) isGoingUp = true;
                                
                                cannonTube.rotation.y += (isGoingUp ? 1 : -1) * CANNON_ROTATION_SPEED * directionRotation;
                                if (keys && keys[' '] && keys[' '].pressed)
                                {
                                    pause = true;
                                    trajectoryLine = await doTheCal(scene, cannonTube, currentPlayerTeam, trajectoryLine, hud);
                                    console.log('trajectoryLine : ', trajectoryLine);
                                    emitBallFired(socket, gameCode, TeamID, trajectoryLine);
                                }
                            }
                            else
                            {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                if (keys && keys['r'] && keys['r'].pressed)
                                {
                                    if (hud.getPercentage(keys, 'r') >= 100)
                                    {
                                        pause = false;
                                        scene.remove(trajectoryLine);
                                    }
                                }
                            }
                        }
                    }, 100);
                }
                else if (TeamID === 2)
                {
                    let isGoingUp = true;
                    let pause = false;
                    let trajectoryLine = null;
                    setInterval(async () =>
                    {
                        if (!currentPlayer.getIsPaused())
                        {
                            if (!pause)
                            {
                                if (cannonTube.rotation.y >= 0) isGoingUp = false;
                                if (cannonTube.rotation.y <= -(75 * (Math.PI / 180))) isGoingUp = true;
                                
                                cannonTube.rotation.y += (isGoingUp ? 1 : -1) * CANNON_ROTATION_SPEED;
                                if (keys && keys[' '] && keys[' '].pressed)
                                {
                                    pause = true;
                                    trajectoryLine = await doTheCal(scene, cannonTube, currentPlayerTeam, trajectoryLine, hud);
                                    console.log('trajectoryLine : ', trajectoryLine);
                                    emitBallFired(socket, gameCode, TeamID, trajectoryLine);
                                }
                            }
                            else
                            {
                                if (keys && keys['r'] && keys['r'].pressed)
                                {
                                    if (hud.getPercentage(keys, 'r') >= 100)
                                    {
                                        pause = false;
                                        scene.remove(trajectoryLine);
                                    }
                                }
                            }
                        }
                    }, 100);
                }
            }
        }
    }
}

function emitBallFired(socket, gameCode, TeamID, trajectoryLine)
{
    console.log('PONG EMIT BALL FIRED');
    socket.emit('BallFired', {
        gameCode: gameCode,
        team: TeamID,
        trajectory: trajectoryLine,
    });
}

export function updateAndEmitBoatPositions(gameCode, socket, keys, currentPlayerTeam, currentPlayer, BOAT_MOVE_SPEED)
{
    if (currentPlayer.getRole() === 'captain') {
        let directionMove = currentPlayerTeam.getTeamId() === 1 ? -1 : 1;
        let TeamID = currentPlayerTeam.getTeamId();
        let boatGroup = currentPlayerTeam.getBoatGroup();

        let boatMoved = false;

        if (keys && keys['d'] && keys['d'].pressed && ((boatGroup.position.x > -55 && TeamID === 1) || (boatGroup.position.x < 55 && TeamID === 2)))
        {
            if (currentPlayer.getIsPaused())
                return;
            boatGroup.position.x += BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }
        if (keys && keys['a'] && keys['a'].pressed && ((boatGroup.position.x < 55 && TeamID === 1) || (boatGroup.position.x > -55 && TeamID === 2)))
        {
            if (currentPlayer.getIsPaused())
                return;
            boatGroup.position.x -= BOAT_MOVE_SPEED * directionMove;
            boatMoved = true;
        }

        if (boatMoved) {
            emitBoatPosition(socket, gameCode, boatGroup, TeamID);
        }
    }
}

function emitCannonPosition(socket, gameCode, TeamID, x)
{
    socket.emit('cannonPosition', { 
        gameCode: gameCode, 
        team: TeamID, 
        cannonPosition: {
            x: x,
        }
    });
}

function emitBoatPosition(socket, gameCode, boatGroup, TeamID)
{
    socket.emit('boatPosition', {
        gameCode: gameCode,
        team: TeamID,
        boatPosition: {
            x: boatGroup.position.x,
        },
    });
} 
