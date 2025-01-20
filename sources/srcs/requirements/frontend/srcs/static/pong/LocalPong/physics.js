import * as THREE from 'three';

export class BallPhysics {
    constructor() {
        this.speed = 0.5;
        this.direction = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this.maxBounceAngle = Math.PI / 4; // 45 degrés
    }

    update(ball, boatGroup1, boatGroup2) {
        // Mise à jour de la position de la balle
        ball.position.x += this.direction.x * this.speed;
        ball.position.y += this.direction.y * this.speed;

        // Collision avec les murs latéraux
        if (ball.position.x >= 80 || ball.position.x <= -80) {
            this.direction.x *= -1;
        }

        // Collision avec les bateaux
        const boat1 = boatGroup1.getObjectByName('bateauTeam1');
        const boat2 = boatGroup2.getObjectByName('bateauTeam2');

        // Obtenir les dimensions réelles des bateaux
        const boat1Box = this.createBoatCollisionBox(boat1);
        const boat2Box = this.createBoatCollisionBox(boat2);

        if (this.checkBoatCollision(ball, boat1Box)) {
            this.handleBoatCollision(ball, boat1, boat1Box);
        }
        if (this.checkBoatCollision(ball, boat2Box)) {
            this.handleBoatCollision(ball, boat2, boat2Box);
        }

        // Vérification si la balle sort des limites (point marqué)
        if (ball.position.y >= 45) {
            return 2; // Point pour l'équipe 2
        } else if (ball.position.y <= -45) {
            return 1; // Point pour l'équipe 1
        }

        return 0; // Pas de point marqué
    }

    createBoatCollisionBox(boat) {
        // Calculer la boîte englobante du bateau
        const boundingBox = new THREE.Box3().setFromObject(boat);
        const size = boundingBox.getSize(new THREE.Vector3());

        return {
            minX: boat.position.x - (size.x / 2),
            maxX: boat.position.x + (size.x / 2),
            minY: boat.position.y - (size.y / 2),
            maxY: boat.position.y + (size.y / 2),
            width: size.x,
            height: size.y
        };
    }

    checkBoatCollision(ball, boatBox) {
        return (ball.position.x >= boatBox.minX &&
                ball.position.x <= boatBox.maxX &&
                ball.position.y >= boatBox.minY &&
                ball.position.y <= boatBox.maxY);
    }

    handleBoatCollision(ball, boat, boatBox) {
        // Inverser la direction Y
        this.direction.y *= -1;

        // Calculer l'angle de rebond basé sur la position de collision
        const relativeX = ball.position.x - boat.position.x;
        const normalizedX = relativeX / (boatBox.width / 2); // Utiliser la largeur réelle du bateau
        const bounceAngle = normalizedX * this.maxBounceAngle;

        // Mettre à jour la direction X en fonction de l'angle de rebond
        this.direction.x = Math.sin(bounceAngle);

        // S'assurer que la direction X n'est pas nulle
        if (Math.abs(this.direction.x) < 0.1) {
            this.direction.x = this.direction.x < 0 ? -0.1 : 0.1;
        }

        // Augmenter légèrement la vitesse
        this.speed *= 1.05;
        this.speed = Math.min(this.speed, 2); // Limiter la vitesse maximale

        // Déplacer la balle légèrement hors de la zone de collision
        // const offset = boatBox.height / 2 + 0.1;
        // ball.position.y += this.direction.y > 0 ? offset : -offset;
    }

    reset() {
        this.speed = 0.5;
        this.direction = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
    }
} 