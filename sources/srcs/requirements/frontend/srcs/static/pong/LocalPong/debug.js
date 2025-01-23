import * as THREE from 'three';

export function setupCameraControls(cameraPlayer, displayInfo) {
    const keys = {};
    let isCameraControlActive = false;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'c') {
            isCameraControlActive = !isCameraControlActive;
        }
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    function updateCameraPosition() {
        if (isCameraControlActive) {
            if (keys['w']) cameraPlayer.position.y += 0.1;
            if (keys['s']) cameraPlayer.position.y -= 0.1;
            if (keys['ArrowUp']) cameraPlayer.position.z += 0.1;
            if (keys['ArrowDown']) cameraPlayer.position.z -= 0.1;
            if (keys['ArrowLeft']) cameraPlayer.position.x -= 0.1;
            if (keys['ArrowRight']) cameraPlayer.position.x += 0.1;
            
            displayInfo.innerText = `Position - X: ${cameraPlayer.position.x.toFixed(2)}, Y: ${cameraPlayer.position.y.toFixed(2)}, Z: ${cameraPlayer.position.z.toFixed(2)}\n` +
                                  `Rotation - X: ${cameraPlayer.rotation.x.toFixed(2)}, Y: ${cameraPlayer.rotation.y.toFixed(2)}, Z: ${cameraPlayer.rotation.z.toFixed(2)}`;
        }
    }

    setInterval(updateCameraPosition, 16);
}

export function initDebug(BOAT_MOVE_SPEED, CANNON_MOVE_SPEED, FRAME_RATE) {
    console.log(`Debug initialized with:
        BOAT_MOVE_SPEED: ${BOAT_MOVE_SPEED}
        CANNON_MOVE_SPEED: ${CANNON_MOVE_SPEED}
        FRAME_RATE: ${FRAME_RATE}
    `);
} 