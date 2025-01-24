// Version simplifiée du pong.js pour le mode local
import Team from './Team.js';
import Player from './Player.js';
import { initDebug, setupCameraControls } from './debug.js';
import { updatePositions, setupControls } from './controls.js';
import * as render from './render.js';
import { createHUD } from './HUD.js';
import { BallPhysics } from './physics.js';
import * as THREE from 'three';

const WINNING_SCORE = 10;
const BOAT_SPEED = 2; // Augmentation de la vitesse des bateaux

export async function main(currentLanguage = 'en') {
    // Initialisation des équipes locales
    const team1 = new Team("Team 1", 1, 1);
    const team2 = new Team("Team 2", 1, 2);
    
    // Création des joueurs locaux
    const player1 = new Player("player1", "captain", "Player 1", 1);
    const player2 = new Player("player2", "captain", "Player 2", 2);
    
    team1.setPlayer(player1);
    team2.setPlayer(player2);

    let { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display } = await render.initScene(team1, team2, team1);
    let hud = await createHUD(renderer);

    // Initialisation de la physique
    const ballPhysics = new BallPhysics();

    // Configuration des contrôles
    const keys = {};
    setupControls(keys);

    // Création des hitboxes visuelles
    const hitboxHelper1 = createHitboxHelper(boatGroup1.getObjectByName('bateauTeam1'));
    const hitboxHelper2 = createHitboxHelper(boatGroup2.getObjectByName('bateauTeam2'));
    scene.add(hitboxHelper1);
    scene.add(hitboxHelper2);

    let gameOver = false;

    // Boucle de jeu
    function gameLoop() {
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
            
            // Mise à jour des positions des bateaux
            if (keys['a'] || keys['d']) {
                const boat1 = boatGroup1.getObjectByName('bateauTeam1');
                if (keys['a'] && boat1.position.x > -55) {
                    boat1.position.x -= BOAT_SPEED;
                }
                if (keys['d'] && boat1.position.x < 55) {
                    boat1.position.x += BOAT_SPEED;
                }
                // Mise à jour de la hitbox du bateau 1
                updateHitboxHelper(hitboxHelper1, boat1);
            }
            
            if (keys['ArrowLeft'] || keys['ArrowRight']) {
                const boat2 = boatGroup2.getObjectByName('bateauTeam2');
                if (keys['ArrowLeft'] && boat2.position.x > -55) {
                    boat2.position.x -= BOAT_SPEED;
                }
                if (keys['ArrowRight'] && boat2.position.x < 55) {
                    boat2.position.x += BOAT_SPEED;
                }
                // Mise à jour de la hitbox du bateau 2
                updateHitboxHelper(hitboxHelper2, boat2);
            }
            
            // Mise à jour de la position de la balle
            const pointScored = ballPhysics.update(ball, boatGroup1, boatGroup2);
            
            // Gestion des points
            if (pointScored > 0) {
                if (pointScored === 1) {
                    team1.setScore(team1.getScore() + 1);
                } else {
                    team2.setScore(team2.getScore() + 1);
                }
                
                // Mise à jour du score dans le HUD
                hud.updateScore(team1.getScore(), team2.getScore());
                
                // Vérification de la victoire
                if (team1.getScore() >= WINNING_SCORE || team2.getScore() >= WINNING_SCORE) {
                    gameOver = true;
                    const winner = team1.getScore() >= WINNING_SCORE ? "Team 1" : "Team 2";
                    hud.showEndGameText(team1.getScore() >= WINNING_SCORE, currentLanguage);
                    setTimeout(() => {
                        // Retour au menu après 3 secondes
                        window.location.href = '/home';
                    }, 3000);
                } else {
                    // Reset de la balle si le jeu continue
                    ball.position.set(0, 0, 0);
                    ballPhysics.reset();
                }
            }
        }
        
        // Rendu
        renderer.render(scene, cameraPlayer);
        renderer.autoClear = false;
        renderer.render(hud.scene, hud.camera);
        renderer.autoClear = true;
    }

    gameLoop();
}

function createHitboxHelper(boat) {
    // Calculer la boîte englobante du bateau
    const boundingBox = new THREE.Box3().setFromObject(boat);
    const size = boundingBox.getSize(new THREE.Vector3());

    // Création d'une boîte de délimitation pour visualiser la hitbox
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const hitboxMesh = new THREE.Mesh(geometry, material);
    return hitboxMesh;
}

function updateHitboxHelper(hitboxHelper, boat) {
    // Mise à jour de la position de la hitbox visuelle
    hitboxHelper.position.copy(boat.position);
}

// Démarrage du jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    main();
}); 