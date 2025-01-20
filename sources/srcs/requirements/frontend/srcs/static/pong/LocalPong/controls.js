const BOAT_SPEED = 0.5;

export function updatePositions(keys, team1, team2) {
    // Contrôles équipe 1
    if (keys['a']) {
        const boat1 = team1.getBoat();
        if (boat1.position.x > -55) {
            boat1.position.x -= BOAT_SPEED;
        }
    }
    if (keys['d']) {
        const boat1 = team1.getBoat();
        if (boat1.position.x < 55) {
            boat1.position.x += BOAT_SPEED;
        }
    }

    // Contrôles équipe 2
    if (keys['ArrowLeft']) {
        const boat2 = team2.getBoat();
        if (boat2.position.x > -55) {
            boat2.position.x -= BOAT_SPEED;
        }
    }
    if (keys['ArrowRight']) {
        const boat2 = team2.getBoat();
        if (boat2.position.x < 55) {
            boat2.position.x += BOAT_SPEED;
        }
    }
}

export function setupControls(keys) {
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });
} 