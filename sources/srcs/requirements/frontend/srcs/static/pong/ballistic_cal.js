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
        trajectory.push(new THREE.Vector3(x, y, z));
    }

    return trajectory;
}

async function createTrajectoryLine(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0xff0000,
        linewidth: 2
    });
    return new THREE.Line(geometry, material);
}

async function fireCannon(trajectory, scene)
{
    const ballMesh = createCannonBall();
    console.log('ballMesh : ', ballMesh);

    ballMesh.position.set(trajectory[0].x, trajectory[0].y, trajectory[0].z);
    scene.add(ballMesh);
    for (const point of trajectory)
    {
        console.log('point : ', point);
        ballMesh.position.set(point.x, point.y, point.z);
        ballMesh.rotation.x += 0.1;
        ballMesh.rotation.z += 0.1;
        new Promise(resolve => setTimeout(resolve, 100));
    }
    scene.remove(ballMesh);
    // return ballMesh;
}

export async function fireEnnemieCannonBall(scene, trajectoryData) {
    if (!trajectoryData || !trajectoryData.geometries) {
        console.error('Données de trajectoire invalides:', trajectoryData);
        return;
    }

    const ballMesh = createCannonBall();
    console.log('ballMesh : ', ballMesh);
    
    try {
        // Extraire le tableau de points de la trajectoire de manière sécurisée
        const points_array = trajectoryData?.geometries[0]?.data?.attributes?.position?.array || [];
        const points = [];
        
        // Convertir le tableau plat en points Vector3
        for (let i = 0; i < points_array.length; i += 3) {
            points.push(new THREE.Vector3(
                points_array[i],     // x
                points_array[i + 1], // y
                points_array[i + 2]  // z
            ));
        }
        
        if (points.length === 0) {
            console.error('Aucun point de trajectoire trouvé');
            return;
        }
        
        // Positionner la balle au premier point
        ballMesh.position.set(points[0].x, points[0].y, points[0].z);
        scene.add(ballMesh);
        
        // Animer la balle le long de la trajectoire
        for (const point of points) {
            ballMesh.position.set(point.x, point.y, point.z);
            ballMesh.rotation.x += 0.1;
            ballMesh.rotation.z += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        scene.remove(ballMesh);
    } catch (error) {
        console.error('Erreur lors de l\'animation de la balle:', error);
        scene.remove(ballMesh);
    }
}

export async function doTheCal(scene, cannonTube, currentPlayerTeam, trajectoryLine, hud)
{
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
    return trajectoryLine;
}

