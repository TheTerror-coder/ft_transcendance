import * as THREE from 'three';

const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
document.body.appendChild(trajectoryCanvas);

// export async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID)
export async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID, tubeLength)
{
    // const g = 9.81;
    // const v0 = cannonPower;
    // const alpha = cannonAngle * Math.PI / 180;
    // const timeStep = 0.1;
    // const trajectory = [];

    // const directionY = teamID === 1 ? -1 : 1;

    // for (let t = 0; ; t += timeStep) {
    //     const y = cannonY + (v0 * Math.cos(alpha) * t * directionY);
    //     const x = cannonX;
    //     const z = cannonZ + v0 * Math.sin(alpha) * t - 0.5 * g * t * t;

    //     if (z < -1) break;

    //     trajectory.push(new THREE.Vector3(x, y, z));
    // }

    // return trajectory;

    const g = 9.81;
    const v0 = cannonPower;
    const alpha = cannonAngle * Math.PI / 180;
    const timeStep = 0.1;
    const trajectory = [];

    const directionY = teamID === 1 ? -1 : 1;

    // Calculer le décalage initial en fonction de la longueur du tube
    const offsetX = 0;
    const offsetY = tubeLength * Math.cos(alpha) * directionY;
    const offsetZ = tubeLength * Math.sin(alpha);

    // Ajuster la position initiale du projectile
    const initialX = cannonX + offsetX;
    const initialY = cannonY + offsetY;
    const initialZ = cannonZ + offsetZ;

    for (let t = 0; ; t += timeStep) {
        const y = initialY + (v0 * Math.cos(alpha) * t * directionY);
        const x = initialX;
        const z = initialZ + v0 * Math.sin(alpha) * t - 0.5 * g * t * t;

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