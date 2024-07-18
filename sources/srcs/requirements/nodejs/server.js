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

app.use(express.static('public'));

let ballPosition = { x: 0, y: 0 };
let ballDirection = { x: 0.02, y: 0.02 };
const players = {}; // Stocker les joueurs connectés
let playerCount = 0; // Compter le nombre de joueurs connectés
let gameInterval = null; // Référence à l'intervalle de mise à jour du jeu

function detectCollision(paddle, ball) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.width > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.height > paddle.y
    );
}

function updateBallPosition() {
    ballPosition.x += ballDirection.x;
    ballPosition.y += ballDirection.y;

    // Vérifier les collisions avec les murs
    if (ballPosition.x > 2.5 || ballPosition.x < -2.5) {
        ballDirection.x = -ballDirection.x;
    }
    if (ballPosition.y > 2.5 || ballPosition.y < -2.5) {
        ballDirection.y = -ballDirection.y;
    }

    // Vérifier les collisions avec les paddles
    for (let id in players) {
        const player = players[id];
        if (detectCollision(player.paddle, ballPosition)) {
            ballDirection.x = -ballDirection.x;
        }
    }

    // Envoyer la position mise à jour de la balle à tous les clients
    io.emit('ballPosition', ballPosition);
}

function resetGame() {
    ballPosition = { x: 0, y: 0 };
    ballDirection = { x: 0.02, y: 0.02 };
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
        paddle: { x: 0, y: 0, width: 1, height: 0.2 } // Initialiser le paddle
    };
    console.log(`Player connected: ${playerId} as ${playerRole}`);

    // Envoyer l'identifiant unique et le rôle au client
    socket.emit('playerInfo', { playerId, playerRole });

    // Envoyer la position initiale de la balle au nouveau client
    socket.emit('ballPosition', ballPosition);

    // Démarrer le jeu lorsque deux joueurs sont connectés
    if (playerCount === 2) {
        io.emit('startGame');
        gameInterval = setInterval(updateBallPosition, 16); // Mettre à jour la position de la balle toutes les 16ms (~60fps)
    }

    // Gérer les événements de position des paddles
    socket.on('paddlePosition', (data) => {
        players[socket.id].paddle.x = data.x;
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