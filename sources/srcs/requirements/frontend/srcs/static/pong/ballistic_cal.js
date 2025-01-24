import * as THREE from 'three';
import { createCannonBall } from './render.js';

const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
document.body.appendChild(trajectoryCanvas);

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

export async function doTheCal(scene, cannonTube, currentPlayerTeam, hud, socket, gameCode, TeamID) {
    const v0 = 27;  // Vitesse initiale en m/s
    let angle = -((cannonTube.rotation.y * 180 / Math.PI));  // Angle de tir en degrés
    const cannonPos = currentPlayerTeam.getCannonTubeTipPosition();
    console.log('======== cannonPosTip ========= : ', cannonPos);

    // Calculer la trajectoire avec gravité et direction
    const g = 9.81;
    const alpha = angle * Math.PI / 180;
    const timeStep = 0.1;
    const directionY = TeamID === 1 ? -1 : 1;
    const trajectory = [];

    // Calculer la trajectoire point par point
    for (let t = 0; ; t += timeStep) {
        const y = cannonPos.y + (v0 * Math.cos(alpha) * t * directionY);
        const x = cannonPos.x;
        const z = cannonPos.z + v0 * Math.sin(alpha) * t - 0.5 * g * t * t;

        if (z < -1) break;
        
        // Stocker les points comme une liste plate de nombres
        trajectory.push(x, y, z);
    }

    console.log('trajectory : ', trajectory);

    // Pour l'affichage, convertir en format objet
    const trajectoryObjects = [];
    for (let i = 0; i < trajectory.length; i += 3) {
        trajectoryObjects.push({
            x: trajectory[i],
            y: trajectory[i+1],
            z: trajectory[i+2]
        });
    }

    // Ajouter la durée estimée de l'animation
    const animationDuration = trajectoryObjects.length * 100; // 100ms par point
    
    socket.emit('BallFired', {
        gameCode: gameCode,
        team: TeamID,
        trajectory: trajectory,
        animationEndTime: Date.now() + animationDuration  // Nouveau !
    });

    // Animer le projectile
    await fireCannon(trajectoryObjects, scene);
    
    // Signaler la fin de l'animation
    socket.emit('animationComplete', {
        gameCode: gameCode,
        team: TeamID
    });

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

