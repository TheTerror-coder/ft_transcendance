import * as THREE from 'three';
import { createCannonBall } from './render.js';
const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
document.body.appendChild(trajectoryCanvas);

export async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID)
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

export async function createTrajectoryLine(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0xff0000,
        linewidth: 2
    });
    return new THREE.Line(geometry, material);
}

export async function fireCannon(trajectory, scene)
{
    const ballMesh = createCannonBall();
    console.log('ballMesh : ', ballMesh);

    ballMesh.position.set(trajectory[0].x, trajectory[0].y, trajectory[0].z);
    scene.add(ballMesh);
    for (const point of trajectory)
    {
        ballMesh.position.set(point.x, point.y, point.z);
        ballMesh.rotation.x += 0.1;
        ballMesh.rotation.z += 0.1;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    scene.remove(ballMesh);
    // return ballMesh;
}

