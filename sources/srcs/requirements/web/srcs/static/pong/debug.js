import { updateAndEmitBoatPositions, updateAndEmitCannonPositions } from './controls.js';

let BOAT_MOVE_SPEED = 0.2;
let CANNON_MOVE_SPEED = 0.1;
let FRAME_RATE = 110;

let intervalId = null;
let gameCodeGlobal = null;
let socketGlobal = null;
let keysGlobal = null;
let currentPlayerTeamGlobal = null;
let currentPlayerGlobal = null;

export function initDebug(boatMoveSpeed, cannonMoveSpeed, frameRate, gameCode, socket, keys, currentPlayerTeam, currentPlayer) {
    BOAT_MOVE_SPEED = boatMoveSpeed;
    CANNON_MOVE_SPEED = cannonMoveSpeed;
    FRAME_RATE = frameRate;
    gameCodeGlobal = gameCode;
    socketGlobal = socket;
    keysGlobal = keys;
    currentPlayerTeamGlobal = currentPlayerTeam;
    currentPlayerGlobal = currentPlayer;
}

// Fonction pour afficher les valeurs actuelles
function displayCurrentValues() {
    console.log(`BOAT_MOVE_SPEED: ${BOAT_MOVE_SPEED}, CANNON_MOVE_SPEED: ${CANNON_MOVE_SPEED}, FRAME_RATE: ${FRAME_RATE}`);
}

// Fonction pour ajuster les valeurs
function adjustValues(key) {
    switch (key) {
        case 'ArrowUp':
            BOAT_MOVE_SPEED += 0.1;
            break;
        case 'ArrowDown':
            BOAT_MOVE_SPEED = Math.max(0, BOAT_MOVE_SPEED - 0.1);
            break;
        case 'ArrowRight':
            CANNON_MOVE_SPEED += 0.01;
            break;
        case 'ArrowLeft':
            CANNON_MOVE_SPEED = Math.max(0, CANNON_MOVE_SPEED - 0.01);
            break;
        case '+':
            FRAME_RATE += 10;
            break;
        case '-':
            FRAME_RATE = Math.max(10, FRAME_RATE - 10);
            break;
        case 'p':
            restartInterval();
            break;
        default:
            return;
    }
    displayCurrentValues();
}

// Fonction pour redémarrer l'intervalle avec la nouvelle FRAME_RATE
function restartInterval() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    console.log('restartInterval : ', FRAME_RATE);
    intervalId = setInterval(() => {
        updateAndEmitBoatPositions(
            gameCodeGlobal, 
            socketGlobal, 
            keysGlobal, 
            currentPlayerTeamGlobal, 
            currentPlayerGlobal,
            BOAT_MOVE_SPEED
        );
        updateAndEmitCannonPositions(
            gameCodeGlobal, 
            socketGlobal, 
            keysGlobal, 
            currentPlayerTeamGlobal, 
            currentPlayerGlobal,
            CANNON_MOVE_SPEED
        );
    }, FRAME_RATE);
}

// Écouteur d'événements pour ajuster les valeurs en continu
window.addEventListener('keydown', (event) => {
    if (!intervalId) {
        adjustValues(event.key);
        intervalId = setInterval(() => adjustValues(event.key), 100);
    }
});

window.addEventListener('keyup', () => {
    clearInterval(intervalId);
    intervalId = null;
});

export function setupCameraControls(cameraPlayer, displayInfo) {
    const keys = {};
    let isCameraControlActive = false;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'c') {
            isCameraControlActive = !isCameraControlActive; // Activer ou désactiver le contrôle de la caméra
        }
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    function updateCameraPosition() {
        if (isCameraControlActive) {
            // Créer un vecteur de direction pour le mouvement
            const direction = new THREE.Vector3(); // Déclaration de la variable direction ici
            cameraPlayer.getWorldDirection(direction); // Obtenir la direction dans laquelle la caméra regarde

            // Normaliser le vecteur de direction pour éviter un mouvement plus rapide
            direction.y = 0; // Ignorer la direction verticale
            direction.normalize();

            // Déplacement de la caméra
            if (keys['w']) { // Avancer
                // cameraPlayer.position.add(direction.clone().multiplyScalar(0.1)); // Avancer dans la direction de la caméra
                cameraPlayer.position.y += 0.1;
            }
            if (keys['s']) { // Reculer
                // cameraPlayer.position.add(direction.clone().multiplyScalar(-0.1)); // Reculer dans la direction opposée
                cameraPlayer.position.y -= 0.1;
            }
            if (keys['ArrowUp']) {
                cameraPlayer.position.z += 0.1; // Avancer
            }
            if (keys['ArrowDown']) {
                cameraPlayer.position.z -= 0.1; // Reculer
            }
            if (keys['ArrowLeft']) {
                cameraPlayer.position.x -= 0.1; // Déplacer à gauche
            }
            if (keys['ArrowRight']) {
                cameraPlayer.position.x += 0.1; // Déplacer à droite
            }
            if (keys['q']) { // Rotation à gauche
                cameraPlayer.rotation.y -= 0.01;
            }
            if (keys['e']) { // Rotation à droite
                cameraPlayer.rotation.y += 0.01;
            }
            if (keys['r']) { // Rotation vers le haut
                cameraPlayer.rotation.x -= 0.01;
            }
            if (keys['f']) { // Rotation vers le bas
                cameraPlayer.rotation.x += 0.01;
            }
            if (keys['t']) { // Rotation vers le haut
                cameraPlayer.rotation.z += 0.01;
            }
            if (keys['g']) { // Rotation vers le bas
                cameraPlayer.rotation.z -= 0.01;
            }
        }

        // Afficher les valeurs de position et de rotation en temps réel
        displayInfo.innerText = `Position - X: ${cameraPlayer.position.x.toFixed(2)}, Y: ${cameraPlayer.position.y.toFixed(2)}, Z: ${cameraPlayer.position.z.toFixed(2)}\n` +
                                 `Rotation - X: ${cameraPlayer.rotation.x.toFixed(2)}, Y: ${cameraPlayer.rotation.y.toFixed(2)}, Z: ${cameraPlayer.rotation.z.toFixed(2)}`;
    }

    setInterval(updateCameraPosition, 16); // Mettre à jour la position de la caméra à chaque intervalle
}

export { restartInterval };