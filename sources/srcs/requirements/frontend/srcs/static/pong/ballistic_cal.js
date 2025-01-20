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

    return {
        geometries: [{
            data: {
                attributes: {
                    position: {
                        array: trajectory.flatMap(v => [v.x, v.y, v.z])
                    }
                }
            }
        }]
    };
}

async function createTrajectoryLine(trajectoryData) {
    const points = extractTrajectoryPoints(trajectoryData);
    const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    const material = new THREE.LineBasicMaterial({ 
        color: 0xff0000,
        linewidth: 2
    });
    return new THREE.Line(geometry, material);
}

async function fireCannon(trajectoryData, scene) {
    const ballMesh = createCannonBall();
    const points = extractTrajectoryPoints(trajectoryData);
    
    if (points.length === 0) {
        console.error('Aucun point de trajectoire trouvé');
        return;
    }

    scene.add(ballMesh);
    ballMesh.position.set(points[0].x, points[0].y, points[0].z);
    
    for (const point of points) {
        ballMesh.position.set(point.x, point.y, point.z);
        ballMesh.rotation.x += 0.1;
        ballMesh.rotation.z += 0.1;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    scene.remove(ballMesh);
}

export async function fireEnnemieCannonBall(scene, trajectoryData, speed = 16) {
    const ballMesh = createCannonBall();
    const points = extractTrajectoryPoints(trajectoryData);
    
    scene.add(ballMesh);
    
    for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
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

function extractTrajectoryPoints(trajectoryData) {
    if (!trajectoryData || !trajectoryData.geometries) {
        console.error('Données de trajectoire invalides:', trajectoryData);
        return [];
    }

    const points_array = trajectoryData?.geometries[0]?.data?.attributes?.position?.array || [];
    const points = [];
    
    for (let i = 0; i < points_array.length; i += 3) {
        points.push({
            x: points_array[i],
            y: points_array[i + 1],
            z: points_array[i + 2]
        });
    }
    
    return points;
}

