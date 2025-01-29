import Team from './Team.js';
import Player from './Player.js';
import { updatePositions, setupControls } from './controls.js';
import * as render from './render.js';
import { createHUD } from './HUD.js';
import { BallPhysics } from './physics.js';
import * as THREE from 'three';
import { Box3, Box3Helper } from 'three';

const WINNING_SCORE = 10;
const BOAT_SPEED = 2;
export async function main(currentLanguage = 'en') {
    const team1 = new Team("Team 1", 1, 1);
    const team2 = new Team("Team 2", 1, 2);
    
    const player1 = new Player("player1", "captain", "Player 1", 1);
    const player2 = new Player("player2", "captain", "Player 2", 2);
    
    team1.setPlayer(player1);
    team2.setPlayer(player2);

    let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display } = await render.initScene(team1, team2, team1);
    let hud = await createHUD(renderer);

    const ballPhysics = new BallPhysics();

    const keys = {};
    setupControls(keys);

    let boat1BoundingBox = new Box3().setFromObject(boatGroup1);
    let boat2BoundingBox = new Box3().setFromObject(boatGroup2);
    let boat1Hitbox = new Box3Helper(boat1BoundingBox, 0xffff00);
    let boat2Hitbox = new Box3Helper(boat2BoundingBox, 0xff0000);

    function updateBoatHitboxes() {
        boat1BoundingBox.setFromObject(boatGroup1);
        boat2BoundingBox.setFromObject(boatGroup2);

        boat1BoundingBox.min.x += 7;
        boat2BoundingBox.min.x += 7;
        boat1BoundingBox.max.x += 2;
        boat2BoundingBox.max.x -= 2;
        boat1BoundingBox.max.y -= 1;
        boat2BoundingBox.max.y -= 1;
        boat1BoundingBox.min.y += 1;
        boat2BoundingBox.min.y += 1;
        boat1BoundingBox.max.z /= 3;
        boat2BoundingBox.max.z /= 3;

        boat1Hitbox.updateMatrixWorld(true);
        boat2Hitbox.updateMatrixWorld(true);
    }

    let gameOver = false;

    function gameLoop() {
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
            
            if (keys['a'] || keys['d']) {
                const boat1 = boatGroup1.getObjectByName('bateauTeam1');
                if (keys['a'] && boat1.position.x > -55) {
                    boat1.position.x -= BOAT_SPEED;
                }
                if (keys['d'] && boat1.position.x < 55) {
                    boat1.position.x += BOAT_SPEED;
                }
            }
            
            if (keys['ArrowLeft'] || keys['ArrowRight']) {
                const boat2 = boatGroup2.getObjectByName('bateauTeam2');
                if (keys['ArrowLeft'] && boat2.position.x > -55) {
                    boat2.position.x -= BOAT_SPEED;
                }
                if (keys['ArrowRight'] && boat2.position.x < 55) {
                    boat2.position.x += BOAT_SPEED;
                }
            }
            
            updateBoatHitboxes();
            
            const pointScored = ballPhysics.update(ball, boat1BoundingBox, boat2BoundingBox);
            
            if (pointScored > 0) {
                if (pointScored === 1) {
                    team1.setScore(team1.getScore() + 1);
                } else {
                    team2.setScore(team2.getScore() + 1);
                }
                
                hud.updateScore(team1.getScore(), team2.getScore());
                
                if (team1.getScore() >= WINNING_SCORE || team2.getScore() >= WINNING_SCORE) {
                    gameOver = true;
                    const winner = team1.getScore() >= WINNING_SCORE ? "Team 1" : "Team 2";
                    hud.showEndGameText(team1.getScore() >= WINNING_SCORE, currentLanguage);
                    setTimeout(() => {
                        render.unloadScene(scene, renderer);
                        ELEMENTs.allPage().innerHTML = resetBaseHtmlVAR;
                        replace_location(URLs.VIEWS.HOME);
                    }, 3000);
                } else {
                    ball.position.set(0, 0, 0);
                    ballPhysics.reset();
                }
            }
        }
        
        renderer.render(scene, cameraPlayer);
        renderer.autoClear = false;
        renderer.render(hud.scene, hud.camera);
        renderer.autoClear = true;
    }

    gameLoop();
}

document.addEventListener('DOMContentLoaded', () => {
    main();
}); 