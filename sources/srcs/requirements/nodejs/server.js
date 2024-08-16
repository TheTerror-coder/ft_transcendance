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

let ballPosition = { x: -2, y: 0, z: 5.5, width: 0.1, height: 0.1 }; // Position initiale de la balle plus haute
const players = {}; // Stocker les joueurs connectés
let ballDirection = { x: 0, y: 0, z: 0 };
// players[socket.id].ballDirection = { x: nombreAleatoire(-0.05, 0.05), y: nombreAleatoire(-0.05, 0.05), z: 0 };
global.playerCount = 0; // Compter le nombre de joueurs connectés
let gameInterval = null; // Référence à l'intervalle de mise à jour du jeu

function initializeBallDirection() {
    // Choisissez un paddle cible au hasard
    console.log(`Players: ${players}`);
    const playerIds = Object.keys(players);
    const randomPlayersId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const targetPaddle = players[randomPlayersId].paddle;

    // Calculer le vecteur directionnel
    let directionX = targetPaddle.x - ballPosition.x;
    let directionY = targetPaddle.y - ballPosition.y;

    // Normaliser le vecteur directionnel
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    ballDirection = {
        x: directionX / length,
        y: directionY / length
    };
    return ballDirection;
}


io.on('bateauPosition', (data) => {
    console.log(`Bateau position updated for player ${data.playerId}: ${data.x}, ${data.y}, ${data.z}`);
    players[socket.id].bateau.x = data.x;
    players[socket.id].bateau.y = data.y;
    players[socket.id].bateau.z = data.z;
    players[socket.id].bateau.width = data.width;
    players[socket.id].bateau.height = data.height;
});

function getRandomDirection(currentPosition, xMin, xMax) {
    // Définir les limites de la zone
    // const xMin = -5.65;
    // const xMax = -0.30;

    // Générer une position cible aléatoire sur l'axe x
    const targetX = Math.random() * (xMax - xMin) + xMin;

    // Calculer le y cible (inverse du y actuel)
    const targetY = -currentPosition.y;

    // Calculer le vecteur directionnel
    const directionX = targetX - currentPosition.x;
    const directionY = targetY - currentPosition.y;

    // Normaliser le vecteur
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedDirection = {
        x: directionX / length,
        y: directionY / length
    };

    return normalizedDirection; // Retourner le vecteur directionnel normalisé
}

function detectCollision(paddle, ball) {
    // console.log(`=================================================================`);
    // console.log(`Paddle position: ${paddle.x}, ${paddle.y}`);
    // console.log(`Ball position: ${ball.x}, ${ball.y}`);
    // console.log(`=================================================================`);
    
    // Vérifier si la balle est à l'intérieur des limites du paddle
    if (ball.x >= paddle.x - paddle.width / 2 && ball.x <= paddle.x + paddle.width / 2 &&
        ball.y >= paddle.y - paddle.height / 2 && ball.y <= paddle.y + paddle.height / 2) {
        return true;
    }
    return false;
}

const speed = 10;

const FPS = 60;
const TICK_RATE = 1000 / FPS;
let lastUpdateTime = Date.now();

function updateGameState() {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    // Mettre à jour la position de la balle
    updateBallPosition(deltaTime);

    io.emit('gameState', { ballPosition, ballDirection });
    // console.log(`Game state updated: ${ballPosition.x}, ${ballPosition.y}, ${ballPosition.z}`);
}

function updateBallPosition(deltaTime) {
    // ballDirection.x += ballPosition.x * speed * deltaTime;
    // ballDirection.y += ballPosition.y * speed * deltaTime;

    ballPosition.x += ballDirection.x * speed * deltaTime;
    ballPosition.y += ballDirection.y * speed * deltaTime;

    if (ballPosition.x >= 15 || ballPosition.x <= -15)
    {
        console.log(`Ball position 1: ${ballPosition.x}, ${ballPosition.y}`);
        if (!(ballPosition.x >= -5.65 || ballPosition.x <= -0.30)) 
        {
            ballDirection = getRandomDirection(ballPosition, -5.65, -0.30);
            console.log(`Ball direction updated: ${ballDirection.x}, ${ballDirection.y}`);
        }
        else
        {
            console.log(`Ball position 2: ${ballPosition.x}, ${ballPosition.y}`);
            ballDirection.x = -ballDirection.x;
        }
    }
    if (ballPosition.y >= 15 || ballPosition.y <= -15) {
        ballDirection.y = -ballDirection.y;
        console.log(`Ball direction 1: ${ballDirection.x}, ${ballDirection.y}`);
    }

    // Vérifier les collisions avec les paddles
    for (let id in players) {
        const player = players[id];
        if (detectCollision(player.paddle, ballPosition)) {
            // console.log('Collision detected');
            ballDirection.y = -ballDirection.y;
        }
    }
}

// setInterval(() => {
//     ballDirection.x *= 1.01;
//     ballDirection.y *= 1.01;
// }, 10000);

function resetGame() {
    ballPosition = { x: 0, y: 0, z: 5.5 };
    ballDirection = { x: 0.02, y: 0.02, z: 0 };
    // global.playerCount = 0;
    for (let id in players) {
        delete players[id];
    }
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    io.emit('stopGame');
}

let lock = false;
function acquireLock() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (!lock) {
                lock = true;
                clearInterval(interval);
                resolve();
            }
        }, 10); // Vérifie toutes les 10ms
    });
}

io.on('connection', async (socket) => {
    await acquireLock();
    const playerId = uuidv4(); // Générer un identifiant unique pour le joueur
    console.log(`Player count Connection before: ${global.playerCount}`);
    global.playerCount++;
    console.log(`Player count Connection after: ${global.playerCount}`);
    const playerRole = 'player' + global.playerCount;
    // const playerRole = global.playerCount === 1 ? 'player1' : 'player2'; // Attribuer un rôle au joueur
    players[socket.id] = { 
        playerId, 
        playerRole, 
        paddle: { x: 0, y: 0, width: 1, height: 0.2 },
        // ballDirection: {x: 0, y:0},
    };
    lock = false;
    // ballDirection = {x: 0, y:0};
    console.log(`Player connected: ${playerId} as ${playerRole}`);

    // Envoyer l'identifiant unique et le rôle au client
    socket.emit('playerInfo', { playerId, playerRole, ballDirection: ballDirection });

    // Envoyer la position initiale de la balle au nouveau client
    console.log(`Ball position: ${ballPosition.x}, ${ballPosition.y}, ${ballPosition.z}`);
    socket.emit('ballPosition', ballPosition);
    // socket.emit('ballDirection', ballDirection);

    // Démarrer le jeu lorsque deux joueurs sont connectés
    if (global.playerCount === 2) {
        io.emit('startGame');
        io.on('playerInfo unknown', (data) => {
            socket.emit('playerInfo', { playerId, playerRole });
        });
        gameInterval = setInterval(updateGameState, TICK_RATE); // Mettre à jour la position de la balle toutes les 16ms (~60fps)
    }

    // Gérer les événements de position des paddles
    socket.on('paddlePosition', (data) => {
        players[socket.id].paddle.x = data.x;
        players[socket.id].paddle.y = data.y;
        if (!global.ballDirectionInitialized) {
            ballDirection = initializeBallDirection();
            console.log(`Ball base direction updated: ${ballDirection.x}, ${ballDirection.y}`);
            global.ballDirectionInitialized = true; 
        }
        // console.log(`Data Paddle position updated for player ${players[socket.id].playerId}: ${data.x}, ${data.y}`);
        // console.log(`Player Paddle position updated for player ${players[socket.id].playerId}: ${players[socket.id].paddle.x}, ${players[socket.id].paddle.y}`);
        // Envoyer la position du paddle à tous les clients
        io.emit('paddlePosition', data);
    });

    socket.on('disconnect', async () => {
        await acquireLock();
        delete players[socket.id];
        console.log(`Player count disconnect before: ${global.playerCount}`);
        global.playerCount--;
        console.log(`Player count disconnect after: ${global.playerCount}`);
        if (global.playerCount === 0)
            resetGame();
        if (global.playerCount === 1)
        {
            io.emit('stopGame');
            io.emit('winner', players[Object.keys(players)[0]].playerRole);
            // window.location.href = '/lobby';
            io.emit('stopGame');
        }
        // Réinitialiser le jeu si un joueur se déconnecte
        lock = false;
        // resetGame();
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});