import * as THREE from 'three';
import { createCannonBall } from './render.js';

const trajectoryCanvas = document.createElement('canvas');
trajectoryCanvas.id = 'trajectoryCanvas';
ELEMENTs.allPage().appendChild(trajectoryCanvas);

async function fireCannon(trajectoryData, scene) {
    const ballMesh = createCannonBall();
    
    if (!trajectoryData || trajectoryData.length === 0) {
        console.error('Aucun point de trajectoire trouvé');
        return;
    }

    ballMesh.position.set(
        trajectoryData[0].x,
        trajectoryData[0].y,
        trajectoryData[0].z
    );
    
    scene.add(ballMesh);
    
    const lerpFactor = 0.15;
    let currentIndex = 0;
    let lastPosition = trajectoryData[0];
    
    return new Promise((resolve, reject) => {
        try {
            const animate = async (startTime) => {
                const currentTime = performance.now();
                const progress = (currentTime - startTime) / (100 * trajectoryData.length);
                
                if (progress >= 1) {
                    scene.remove(ballMesh);
                    resolve();
                    return;
                }
                
                const targetIndex = Math.floor(progress * (trajectoryData.length - 1));
                if (targetIndex !== currentIndex) {
                    lastPosition = {
                        x: ballMesh.position.x,
                        y: ballMesh.position.y,
                        z: ballMesh.position.z
                    };
                    currentIndex = targetIndex;
                }
                
                const target = trajectoryData[currentIndex];
                
                ballMesh.position.x += (target.x - ballMesh.position.x) * lerpFactor;
                ballMesh.position.y += (target.y - ballMesh.position.y) * lerpFactor;
                ballMesh.position.z += (target.z - ballMesh.position.z) * lerpFactor;
                
                ballMesh.rotation.x += 0.05;
                ballMesh.rotation.z += 0.05;
                
                requestAnimationFrame(() => animate(startTime));
            };
            
            animate(performance.now());
            
        } catch (error) {
            console.error('Error during animation:', error);
            scene.remove(ballMesh);
            reject(error);
        }
    });
}

export async function fireEnnemieCannonBall(scene, trajectoryData, speed = 100, boatGroup) {
    const ballMesh = createCannonBall(boatGroup);
    
    const trajectoryObjects = [];
    for (let i = 0; i < trajectoryData.length; i += 3) {
        trajectoryObjects.push({
            x: parseFloat(trajectoryData[i]),
            y: parseFloat(trajectoryData[i + 1]),
            z: parseFloat(trajectoryData[i + 2])
        });
    }

    ballMesh.position.set(
        trajectoryObjects[0].x,
        trajectoryObjects[0].y,
        trajectoryObjects[0].z
    );
    
    scene.add(ballMesh);
    
    const lerpFactor = 0.15;
    let currentIndex = 0;
    let lastPosition = trajectoryObjects[0];
    
    try {
        const animate = async (startTime) => {
            const currentTime = performance.now();
            const progress = (currentTime - startTime) / (speed * trajectoryObjects.length);
            
            if (progress >= 1) {
                scene.remove(ballMesh);
                return;
            }
            
            const targetIndex = Math.floor(progress * (trajectoryObjects.length - 1));
            if (targetIndex !== currentIndex) {
                lastPosition = {
                    x: ballMesh.position.x,
                    y: ballMesh.position.y,
                    z: ballMesh.position.z
                };
                currentIndex = targetIndex;
            }
            
            const target = trajectoryObjects[currentIndex];
            
            ballMesh.position.x += (target.x - ballMesh.position.x) * lerpFactor;
            ballMesh.position.y += (target.y - ballMesh.position.y) * lerpFactor;
            ballMesh.position.z += (target.z - ballMesh.position.z) * lerpFactor;
            
            ballMesh.rotation.x += 0.05;
            ballMesh.rotation.z += 0.05;
            
            requestAnimationFrame(() => animate(startTime));
        };
        
        animate(performance.now());
        
    } catch (error) {
        console.error('Error during animation:', error);
        scene.remove(ballMesh);
    }
}

export async function doTheCal(scene, cannonTube, currentPlayerTeam, hud, socket, gameCode, TeamID) {
    const v0 = 27;
    let angle = -((cannonTube.rotation.y * 180 / Math.PI));
    const cannonPos = currentPlayerTeam.getCannonTubeTipPosition();

    const g = 9.81;
    const alpha = angle * Math.PI / 180;
    const timeStep = 0.1;
    const directionY = TeamID === 1 ? -1 : 1;
    const trajectory = [];

    for (let t = 0; ; t += timeStep) {
        const y = cannonPos.y + (v0 * Math.cos(alpha) * t * directionY);
        const x = cannonPos.x;
        const z = cannonPos.z + v0 * Math.sin(alpha) * t - 0.5 * g * t * t;

        if (z < -1) break;
        
        trajectory.push(x, y, z);
    }


    const trajectoryObjects = [];
    for (let i = 0; i < trajectory.length; i += 3) {
        trajectoryObjects.push({
            x: trajectory[i],
            y: trajectory[i+1],
            z: trajectory[i+2]
        });
    }

    const animationDuration = trajectoryObjects.length * 100;
    
    socket.emit('BallFired', {
        gameCode: gameCode,
        team: TeamID,
        trajectory: trajectory,
        animationEndTime: Date.now() + animationDuration
    });

    try {
        await fireCannon(trajectoryObjects, scene);
        
        socket.emit('animationComplete', {
            gameCode: gameCode,
            team: TeamID
        });

        cannonTube.rotation.y = 0;
        hud.showLoadingCircle();
    } catch (error) {
        console.error('Erreur pendant l\'animation:', error);
    }
    
    return trajectory;
}

