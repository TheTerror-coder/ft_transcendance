import * as THREE from 'three';

const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
document.body.appendChild(trajectoryCanvas);

// export async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID)
export async function calculateCannonBallTrajectory(cannonX, cannonY, cannonZ, cannonAngle, cannonPower, teamID, tubeLength)
{
    const g = 9.81;
    const v0 = cannonPower;
    const alpha = cannonAngle * Math.PI / 180;
    const timeStep = 0.1;
    const trajectory = [];
    const directionY = teamID === 1 ? -1 : 1;

    // Calculer le point de départ avec la position du bout du canon
    const cannonTipOffset = tubeLength * directionY;
    const rotationMatrix = new THREE.Matrix4().makeRotationZ(alpha);
    const tipVector = new THREE.Vector3(0, cannonTipOffset, 0).applyMatrix4(rotationMatrix);

    const initialX = cannonX + tipVector.x;
    const initialY = cannonY + tipVector.y;
    const initialZ = cannonZ + tipVector.z;

    // Calculer les composantes de la vitesse initiale
    const v0x = v0 * Math.sin(alpha);
    const v0y = v0 * Math.cos(alpha) * directionY;
    const v0z = v0 * Math.sin(alpha);

    // Limiter le nombre de points calculés
    const maxPoints = 30; // Nombre maximum de points dans la trajectoire
    let pointCount = 0;
    
    for (let t = 0; pointCount < maxPoints; t += timeStep) {
        const x = initialX + v0x * t;
        const y = initialY + v0y * t;
        const z = initialZ + v0z * t - 0.5 * g * t * t;

        if (z < -1) break;
        trajectory.push(new THREE.Vector3(x, y, z));
        pointCount++;
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

