import * as THREE from 'three';

export class BallPhysics {
    constructor() {
        this.velocity = { x: 1, y: 1 };
        this.speed = 1;
        this.FIELD_WIDTH = 150;
        this.FIELD_HEIGHT = 105;
        this.SPEED_INCREASE_FACTOR = 1.05;
        this.BALL_MAX_SPEED = 1.5;
    }

    update(ball, boat1BoundingBox, boat2BoundingBox) {
        ball.position.x += this.velocity.x;
        ball.position.y += this.velocity.y;

        if (ball.position.x <= -this.FIELD_WIDTH / 2) {
            ball.position.x = -this.FIELD_WIDTH / 2 + 0.5;
            this.velocity.x = -this.velocity.x;
            this.speed = Math.min(this.speed * this.SPEED_INCREASE_FACTOR, this.BALL_MAX_SPEED);
        } else if (ball.position.x >= this.FIELD_WIDTH / 2) {
            ball.position.x = this.FIELD_WIDTH / 2 - 0.5;
            this.velocity.x = -this.velocity.x;
            this.speed = Math.min(this.speed * this.SPEED_INCREASE_FACTOR, this.BALL_MAX_SPEED);
        }

        const ballBox = new THREE.Box3().setFromObject(ball);
        
        if (ballBox.intersectsBox(boat1BoundingBox) || ballBox.intersectsBox(boat2BoundingBox)) {
            const hitbox = ballBox.intersectsBox(boat1BoundingBox) ? boat1BoundingBox : boat2BoundingBox;
            const hitboxCenter = new THREE.Vector3();
            hitbox.getCenter(hitboxCenter);

            const offset = 1;
            if (this.velocity.y > 0) {
                ball.position.y = hitbox.min.y - offset;
            } else {
                ball.position.y = hitbox.max.y + offset;
            }

            const relativeIntersectX = ball.position.x - hitboxCenter.x;
            const normalizedIntersect = relativeIntersectX / ((hitbox.max.x - hitbox.min.x) / 2);
            
            const bounceAngle = normalizedIntersect * (Math.PI / 4);
            
            this.velocity.x = Math.sin(bounceAngle);
            this.velocity.y = -Math.sign(this.velocity.y) * Math.cos(bounceAngle);
            
            const length = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            this.velocity.x = (this.velocity.x / length) * this.speed;
            this.velocity.y = (this.velocity.y / length) * this.speed;
            
            this.speed = Math.min(this.speed * this.SPEED_INCREASE_FACTOR, this.BALL_MAX_SPEED);
        }

        if (ball.position.y <= -this.FIELD_HEIGHT / 2) {
            return 1;
        } else if (ball.position.y >= this.FIELD_HEIGHT / 2) {
            return 2;
        }

        return 0;
    }

    reset() {
        this.speed = 1;
        
        const minAngle = Math.PI / 6;
        const maxAngle = Math.PI * 5 / 6;
        const angle = minAngle + Math.random() * (maxAngle - minAngle);
        
        const upward = Math.random() > 0.5;
        const finalAngle = upward ? angle : -angle;
        
        this.velocity = {
            x: Math.cos(finalAngle) * this.speed,
            y: Math.sin(finalAngle) * this.speed
        };
    }
} 