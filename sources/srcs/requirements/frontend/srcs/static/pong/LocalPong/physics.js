import * as THREE from 'three';

export class BallPhysics {
    constructor() {
        this.velocity = { x: 5, y: 5 };
        this.speed = 5;
    }

    update(ball, boat1BoundingBox, boat2BoundingBox) {
        // Mise à jour de la position
        ball.position.x += this.velocity.x;
        ball.position.y += this.velocity.y;

        // Collision avec les murs
        if (ball.position.y >= 45 || ball.position.y <= -45) {
            this.velocity.y *= -1;
        }

        // Collision avec les bateaux
        const ballBox = new THREE.Box3().setFromObject(ball);
        
        if (ballBox.intersectsBox(boat1BoundingBox) || ballBox.intersectsBox(boat2BoundingBox)) {
            this.velocity.x *= -1;
            
            // Ajuster l'angle en fonction de la position de collision
            if (ballBox.intersectsBox(boat1BoundingBox)) {
                const relativeIntersectY = ball.position.y - boat1BoundingBox.getCenter(new THREE.Vector3()).y;
                this.velocity.y = relativeIntersectY * 0.2;
            } else {
                const relativeIntersectY = ball.position.y - boat2BoundingBox.getCenter(new THREE.Vector3()).y;
                this.velocity.y = relativeIntersectY * 0.2;
            }
            
            // Normaliser la vélocité
            const length = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            this.velocity.x = (this.velocity.x / length) * this.speed;
            this.velocity.y = (this.velocity.y / length) * this.speed;
        }

        // Détection des points
        if (ball.position.x >= 60) {
            return 1; // Point pour l'équipe 1
        } else if (ball.position.x <= -60) {
            return 2; // Point pour l'équipe 2
        }

        return 0; // Pas de point marqué
    }

    reset() {
        this.velocity = {
            x: Math.random() > 0.5 ? this.speed : -this.speed,
            y: (Math.random() - 0.5) * this.speed
        };
    }
} 