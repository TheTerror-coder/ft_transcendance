const Player = require('./Player.js');
const Team = require('./Team.js');
const Channel = require('./channel.js');

const express = require('express');
// const https = require('https');
const http = require('http');
// const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const ip = process.env.HOST_IP || "localhost";

const allowedOrigins = ['http://' + ip + ':8888', 'http://' + ip + ':3000'];

// const httpsOptions = {
//     key: fs.readFileSync('./volumes/web/certs/web.key'),
//     cert: fs.readFileSync('./volumes/web/certs/web.crt')
// };

// let httpsOptions;

const app = express();

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.static('node'));

// app.enable('trust proxy');

// // Exemple de route
// app.get('/', (req, res) => {
//     res.send('Hello from Node.js!');
// });

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

let ChannelList = new Map();

function generateGameCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function updateGameOptions(game, io, gameCode) {
    console.log("updateGameOptions");
    if (!game.gameStarted) {
        console.log("updateGameOptions: game.gameStarted is false");
        let teamsData = [];
        let teamsRolesData = new Map();

        game.teams.forEach((team, key) => {
            console.log("key: " + key);
            if (!team.getIsFull()) {
                teamsData = [...teamsData, { name: team.name, value: key }];
            }

            let rolesData = [];
            let rolesDataPossible = [
                { name: "Capitaine", value: "captain" },
                { name: "Cannonier", value: "Cannoneer" }
            ];

            team.player.forEach((player, key) => {
                console.log("key: " + key);
                rolesData = [...rolesData, { name: player.getRole(), value: player.getRole() }];
            });

            let rolesDataAvailable = rolesDataPossible.filter(possibleRole => 
                !rolesData.some(takenRole => takenRole.value === possibleRole.value)
            );

            teamsRolesData.set(key, rolesDataAvailable);
        });

        const data = {
            teams: teamsData,
            teamsRoles: Array.from(teamsRolesData.entries()).map(([key, roles]) => ({
                teamId: key,
                roles: roles
            }))
        };
        console.log("data: ", data);
        io.to(gameCode).emit('AvailableOptions', data);
    }
}

function checkIfGameIsFull(game, io, gameCode)
{
    const team1 = game.teams.get(1);
    const team2 = game.teams.get(2);

    if (team1.getIsFull() && team2.getIsFull()) {
        io.to(gameCode).emit('TeamsFull');
    }
}

io.on('connection', (socket) => {
    socket.on('createGame', ({ numPlayersPerTeam }) => {
        let gameCode;
        do {
            gameCode = generateGameCode();
        } while (ChannelList.has(gameCode)); // Vérifier si le code existe déjà dans la Map

        let channel = new Channel(gameCode, socket.id);
        ChannelList.set(gameCode, channel);
        let game = channel.getGame();
        game.setNbPlayerPerTeam(numPlayersPerTeam);
        console.log("numPlayersPerTeam: " + numPlayersPerTeam);
        console.log(game.gameStarted);
        game.setTeam(new Team("L'equipage du chapeau de paille", numPlayersPerTeam, 1));
        game.setTeam(new Team("L'equipage de Barbe-Noire", numPlayersPerTeam, 2));
        socket.join(gameCode);
        socket.emit('gameCreated', { gameCode: gameCode });
        updateGameOptions(game, io, gameCode);

        socket.on('confirmChoices', (choices) => {
            console.log(`Player ${socket.id}, ${choices.userName} has chosen ${choices.teamID} as their team and ${choices.role} as their role.`);
            let team = game.getTeam(parseInt(choices.teamID));
            if (team) {
                team.setPlayer(new Player(socket.id, choices.role, choices.userName, parseInt(choices.teamID)));
                sendPlayerLists(game, io, gameCode);
            } else {
                console.log("Équipe non trouvée");
                socket.emit('error', { message: 'Équipe non trouvée' });
            }
        });
    });

    socket.on('launchGame', (gameCode) => {
        const channel = ChannelList.get(gameCode);
        const game = channel.getGame();
        if (game.teams.get(1).getIsFull() && game.teams.get(2).getIsFull())
        {
            if (channel.getCreator() === socket.id)
            {
                // game.startGame(io, gameCode);
                io.to(gameCode).emit('startGame');

            }
            else
            {
                socket.emit('error', { message: 'Vous n\'êtes pas le créateur de la partie' });
            }
        }
        else
        {
            socket.emit('error', { message: 'Toutes les équipes ne sont pas pleines' });
        }
    });

    socket.on('joinGame', (data) => {
        const gameCode = data.gameCode;
        const channel = ChannelList.get(gameCode);
        let game = channel.getGame();
        const team1 = game.getTeam(1);
        const team2 = game.getTeam(2);
        if (channel) {
            if (team1.getIsFull() && team2.getIsFull())
            {
                socket.emit('error', { message: 'Partie pleine' });
                socket.leave(gameCode);
                return;
            }
            socket.join(gameCode);
            const allRooms = io.sockets.adapter.rooms;
            const allSockets = [];
            for (const [room, sockets] of Object.entries(allRooms)) {
                allSockets.push(sockets);
            }
            console.log("allSockets: " + allSockets);
            socket.emit('gameJoined', { gameCode: gameCode });
            // sendPlayerLists(game, io, socket);
        } else {
            socket.emit('error', { message: 'Partie non trouvée' });
            return;
        }
        updateGameOptions(game, io, gameCode);
    
        socket.on('confirmChoices', (choices) => {
            console.log(`Player ${socket.id}, ${choices.userName} has chosen ${choices.teamID} as their team and ${choices.role} as their role.`);
            let team = game.getTeam(parseInt(choices.teamID));
            if (team) {
                team.setPlayer(new Player(socket.id, choices.role, choices.userName, parseInt(choices.teamID)));
                sendPlayerLists(game, io, gameCode);
            } else {
                console.log("Équipe non trouvée");
                socket.emit('error', { message: 'Équipe non trouvée' });
            }
        });

        setInterval(() => {
            checkIfGameIsFull(game, io, gameCode);
        }, 1000);
    });

    socket.on('GameStarted', (gameCode) => {
        console.log("GameStarted");
        let game = ChannelList.get(gameCode).getGame();
        if (game)
        {
            game.addNbPlayerConnected();
            console.log("game.nbPlayerConnected: " + game.nbPlayerConnected);
        }
        else
        {
            console.log("Game not found");
        }
        if (game.nbPlayerConnected === game.nbPlayerPerTeam * 2)
        {
            game.sendGameData(io, gameCode);
        }
        else
        {
            console.log("game.nbPlayerConnected: " + game.nbPlayerConnected);
            console.log("game.nbPlayerPerTeam: " + game.nbPlayerPerTeam);
            console.log("Game is not full");
        }
    });

    socket.on('ClientData', (data) => {
        // for (const [key, value] of Object.entries(data)) {
        //     console.log(`${key}: ${value}`);
        // }
        // console.log("ClientData: " + data);
        // console.log("data.TeamID: " + data.TeamID);
        // console.log("data.gameCode: " + data.gameCode);
        // for (const [key, value] of Object.entries(ChannelList)) {
        //     console.log(`${key}: ${value}`);
        // }
        let game = ChannelList.get(data.gameCode)?.getGame();
        if (game)
        {
            // console.log("game: " + game);
            // console.log("game.getTeam(data.TeamID): " + game.getTeam(data.TeamID));
            game.updateClientData(data);
        }
    });

    socket.on('cannonPosition', async (data) => {
        let game = ChannelList.get(data.gameCode)?.getGame();
        if (game) {
            await game.updateCannonPosition(data.team, data.x, data.y, data.z);
            io.to(data.gameCode).emit('cannonPosition', data);
        } else {
            console.error(`Game not found for gameCode: ${data.gameCode}`);
        }
    });

    socket.on('boatPosition', async (data) => {
        let game = ChannelList.get(data.gameCode)?.getGame();
        if (game) {
            await game.updateBoatPosition(data.team, data.x, data.y, data.z);
            io.to(data.gameCode).emit('boatPosition', data);
        } else {
            console.error(`Game not found for gameCode: ${data.gameCode}`);
        }
    });

    socket.on('boatAndCannonPosition', async (data) => {
        let game = ChannelList.get(data.gameCode)?.getGame();
        if (game) {
            await game.updateBoatAndCannonPosition(data.team, data.boatX, data.boatY, data.boatZ, data.cannonX, data.cannonY, data.cannonZ);
            io.to(data.gameCode).emit('boatAndCannonPosition', data);
        } else {
            console.error(`Game not found for gameCode: ${data.gameCode}`);
        }
    });
});

function sendPlayerLists(game, io, gameCode) {
    const teamsInfo = {};
    console.log("game.teams: " + game.teams);
    game.teams.forEach((team, key) => {
        console.log("key: " + key);
        if (team.player) {
            teamsInfo[key] = Array.from(team.player.values()).map(player => ({
                id: player.id,
                name: player.name,
                role: player.role
            }));
        }
        else
        {
            console.log("team.player is empty");
            teamsInfo[key] = [];
        }
    });
    console.log("teamsInfo[1][0].name: " + teamsInfo[1][0].name);
    // console.log("teamsInfo[2][0].name: " + teamsInfo[2][0].name);
    io.to(gameCode).emit('updatePlayerLists', teamsInfo);
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
