import * as THREE from 'three';
import { createCannonBall } from './render.js';
const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
document.body.appendChild(trajectoryCanvas);

async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID)
{
    const g = 9.81;
    const v0 = cannonPower;
    const alpha = cannonAngle * Math.PI / 180;
    const timeStep = 0.1;
    const trajectory = [];
    const directionY = teamID === 1 ? -1 : 1;

    for (let t = 0; ; t += timeStep) {
        const y = cannonY + (v0 * Math.cos(alpha) * t * directionY);
        const x = cannonX;
        const z = cannonZ + v0 * Math.sin(alpha) * t - 0.5 * g * t * t;

        if (z < -1) break;
        trajectory.push({x, y, z});
    }

    return trajectory;
}

async function createTrajectoryLine(trajectoryData) {
    const points = trajectoryData.map(point => new THREE.Vector3(point.x, point.y, point.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0xff0000,
        linewidth: 2
    });
    return new THREE.Line(geometry, material);
}

async function fireCannon(trajectoryData, scene) {
    const ballMesh = createCannonBall();
    
    if (!trajectoryData || trajectoryData.length === 0) {
        console.error('Aucun point de trajectoire trouvé');
        return;
    }

    scene.add(ballMesh);
    ballMesh.position.set(trajectoryData[0].x, trajectoryData[0].y, trajectoryData[0].z);
    
    for (const point of trajectoryData) {
        ballMesh.position.set(point.x, point.y, point.z);
        ballMesh.rotation.x += 0.1;
        ballMesh.rotation.z += 0.1;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    scene.remove(ballMesh);
}

export async function fireEnnemieCannonBall(scene, trajectoryData, speed = 16) {
    const ballMesh = createCannonBall();

    console.log('trajectoryData : ', trajectoryData);
    scene.add(ballMesh);
    
    for (let i = 0; i < trajectoryData.length - 1; i++) {
        const start = trajectoryData[i];
        const end = trajectoryData[i + 1];
        const interpolated = interpolatePoints(start, end);
        
        for (const point of interpolated) {
            ballMesh.position.set(point.x, point.y, point.z);
            ballMesh.rotation.x += 0.1;
            ballMesh.rotation.z += 0.1;
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }
    
    scene.remove(ballMesh);
}

export async function doTheCal(scene, cannonTube, currentPlayerTeam, hud, socket, gameCode, TeamID)
{
    const v0 = 27;  // Vitesse initiale en m/s
    let angle = -((cannonTube.rotation.y * 180 / Math.PI));  // Angle de tir en degrés
    const cannonPos = currentPlayerTeam.getCannonTubeTipPosition();
    console.log('======== cannonPosTip ========= : ', cannonPos);
    const trajectory = await calculateCannonBallTrajectory(cannonPos.x, cannonPos.y, cannonPos.z, angle, v0, currentPlayerTeam.getTeamId());
    // trajectoryLine = await createTrajectoryLine(trajectory);
    // scene.add(trajectoryLine);
    console.log('trajectory : ', trajectory);
    socket.emit('BallFired', {
        gameCode: gameCode,
        team: TeamID,
        trajectory: trajectory,
    });
    await fireCannon(trajectory, scene);
    cannonTube.rotation.y = 0;
    hud.scene.add(hud.loadingCircle.group);
    return trajectory;
}

function interpolatePoints(start, end, steps = 10) {
    const points = [];
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        points.push({
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            z: start.z + (end.z - start.z) * t
        });
    }
    return points;
}

// function extractTrajectoryPoints(trajectoryData) {
//     if (!trajectoryData) {
//         console.error('Données de trajectoire invalides:', trajectoryData);
//         return [];
//     }
//     return trajectoryData;
// }

