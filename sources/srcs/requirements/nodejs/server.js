const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://127.0.0.1:8888', // Remplacez par l'URL de votre application Django
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

// Utilisez le middleware CORS
app.use(cors({
    origin: 'http://127.0.0.1:8888', // Remplacez par l'URL de votre application Django
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Définir les en-têtes de sécurité
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.static('public'));

function nombreAleatoire(min, max) {
    return Math.random() * (max - min) + min;
}

let ballPosition = { x: 0, y: 0, z: 5.5, width: 0.1, height: 0.1 }; // Position initiale de la balle plus haute
const players = {}; // Stocker les joueurs connectés
// let ballDirection = { x: 0, y: 0, z: 0 };
// players[socket.id].ballDirection = { x: nombreAleatoire(-0.05, 0.05), y: nombreAleatoire(-0.05, 0.05), z: 0 };
let playerCount = 0; // Compter le nombre de joueurs connectés
let gameInterval = null; // Référence à l'intervalle de mise à jour du jeu

io.on('bateauPosition', (data) => {
    console.log(`Bateau position updated for player ${data.playerId}: ${data.x}, ${data.y}, ${data.z}`);
    players[socket.id].bateau.x = data.x;
    players[socket.id].bateau.y = data.y;
    players[socket.id].bateau.z = data.z;
    players[socket.id].bateau.width = data.width;
    players[socket.id].bateau.height = data.height;
});

function getRandomDirection(currentPosition) {
    // Définir les limites de la zone
    const xMin = -5.65;
    const xMax = -0.30;
    const yOptions = [-0.15, 0.15]; // Options pour y

    // Générer une position cible aléatoire
    const targetX = Math.random() * (xMax - xMin) + xMin; // x aléatoire entre xMin et xMax
    let targetY;
    if (currentPosition.y >= 15) {
        targetY = -0.15;
    }
    else if (currentPosition.y <= -15) {
        targetY = 0.15;
    }
    else {
        targetY = yOptions[Math.floor(Math.random() * yOptions.length)]; // y aléatoire entre -15 et 15
    }

    // Position actuelle
    const currentX = currentPosition.x;
    const currentY = currentPosition.y;

    // Calculer le vecteur directionnel
    const directionX = targetX - currentX;
    const directionY = targetY - currentY;

    // Normaliser le vecteur
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedDirection = {
        x: directionX / length,
        y: directionY / length
    };

    return normalizedDirection; // Retourner le vecteur directionnel normalisé
}

function detectCollision(paddle, ball) {
    console.log(`=================================================================`);
    console.log(`Paddle position: ${paddle.x}, ${paddle.y}`);
    console.log(`Ball position: ${ball.x}, ${ball.y}`);
    console.log(`=================================================================`);
    
    // Vérifier si la balle est à l'intérieur des limites du paddle
    if (ball.x >= paddle.x - paddle.width / 2 && ball.x <= paddle.x + paddle.width / 2 &&
        ball.y >= paddle.y - paddle.height / 2 && ball.y <= paddle.y + paddle.height / 2) {
        return true;
    }
    return false;
}

const speed = 0.1;

function updateBallPosition() {
    ballPosition.x += ballDirection.x * speed;
    ballPosition.y += ballDirection.y * speed;
    currentPosition = { x: ballPosition.x, y: ballPosition.y };
    directionVector = getRandomDirection(currentPosition);

    // Normaliser le vecteur de direction
    const length = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
    if (length > 0) {
        directionVector.x /= length; // Normaliser
        directionVector.y /= length; // Normaliser
    }

    // Vérifier les collisions avec les murs
    if (ballPosition.x > 15 || ballPosition.x < -15) {
        if (currentPosition.x > -0.30 || currentPosition.x < -5.65) {
            ballDirection.x = -ballDirection.x;
        } else {
            ballDirection.x = directionVector.x * speed; // Multiplier par une vitesse constante
        }
    }
    if (ballPosition.y > 15 || ballPosition.y < -15) {
        if (currentPosition.y >= 15) {
            ballDirection.y = -ballDirection.y;
        } else {
            ballDirection.y = directionVector.y * speed; // Multiplier par une vitesse constante
        }
    }

    // Vérifier les collisions avec les paddles
    for (let id in players) {
        const player = players[id];
        if (detectCollision(player.paddle, ballPosition)) {
            console.log('Collision detected');
            ballDirection.y = -ballDirection.y;
        }
    }

    // Envoyer la position mise à jour de la balle et des paddles à tous les clients
    io.emit('ballPosition', ballPosition);
    io.emit('ballDirection', ballDirection);
    io.emit('paddlesPosition', Object.values(players).map(player => ({
        playerId: player.playerId,
        paddle: player.paddle
    })));
}

setInterval(() => {
    ballDirection.x *= 1.01;
    ballDirection.y *= 1.01;
}, 10000);

function resetGame() {
    ballPosition = { x: 0, y: 0, z: 6 };
    ballDirection = { x: 0.02, y: 0.02, z: 0 };
    playerCount = 0;
    for (let id in players) {
        delete players[id];
    }
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    io.emit('stopGame');
}

io.on('connection', (socket) => {
    const playerId = uuidv4(); // Générer un identifiant unique pour le joueur
    playerCount++;
    const playerRole = playerCount === 1 ? 'player1' : 'player2'; // Attribuer un rôle au joueur
    players[socket.id] = { 
        playerId, 
        playerRole, 
        paddle: { x: 0, y: 0, width: 1, height: 0.2 },
        ballDirection: { x: nombreAleatoire(-0.05, 0.05), y: nombreAleatoire(-0.05, 0.05), z: 0 }
    };
    ballDirection = players[socket.id].ballDirection;
    console.log(`Player connected: ${playerId} as ${playerRole}`);

    // Envoyer l'identifiant unique et le rôle au client
    socket.emit('playerInfo', { playerId, playerRole, ballDirection: players[socket.id].ballDirection });

    // Envoyer la position initiale de la balle au nouveau client
    socket.emit('ballPosition', ballPosition);
    // socket.emit('ballDirection', ballDirection);

    // Démarrer le jeu lorsque deux joueurs sont connectés
    if (playerCount === 2) {
        io.emit('startGame');
        io.on('playerInfo unknown', (data) => {
            socket.emit('playerInfo', { playerId, playerRole });
        });
        gameInterval = setInterval(updateBallPosition, 16); // Mettre à jour la position de la balle toutes les 16ms (~60fps)
    }

    // Gérer les événements de position des paddles
    socket.on('paddlePosition', (data) => {
        players[socket.id].paddle.x = data.x;
        players[socket.id].paddle.y = data.y;
        console.log(`Data Paddle position updated for player ${players[socket.id].playerId}: ${data.x}, ${data.y}`);
        console.log(`Player Paddle position updated for player ${players[socket.id].playerId}: ${players[socket.id].paddle.x}, ${players[socket.id].paddle.y}`);
        // Envoyer la position du paddle à tous les clients
        io.emit('paddlePosition', data);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${players[socket.id].playerId}`);
        delete players[socket.id];
        playerCount--;
        // Réinitialiser le jeu si un joueur se déconnecte
        resetGame();
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});