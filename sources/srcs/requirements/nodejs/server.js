// import { Game } from "./Game.js";
// import { Player } from "./Player.js";
// import { Team } from "./Team.js";
// import { Channel } from "./channel.js";

const Player = require('./Player.js');
const Team = require('./Team.js');
const Channel = require('./channel.js');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

let ip = "10.13.2.6";

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://' + ip + ':8888',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

app.use(cors({
    origin: 'http://' + ip + ':8888',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.static('public'));

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
        console.log("data: ", gameCode);
        console.log("data.gameCode : ", gameCode);
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