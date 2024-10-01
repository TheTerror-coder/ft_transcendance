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


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://127.0.0.1:8888',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

app.use(cors({
    origin: 'http://127.0.0.1:8888',
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

function updateGameOptions(game, io, socket) {
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
        socket.emit('AvailableOptions', data);
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
        game.numPlayersPerTeam = numPlayersPerTeam; // Stocker le nombre de joueurs par équipe
        console.log(game.gameStarted);
        game.setTeam(new Team("L'equipage du chapeau de paille", numPlayersPerTeam, 1));
        game.setTeam(new Team("L'equipage de Barbe-Noire", numPlayersPerTeam, 2));
        socket.join(gameCode);
        socket.emit('gameCreated', { gameCode: gameCode });
        updateGameOptions(game, io, socket);

        socket.on('confirmChoices', (choices) => {
            console.log(`Player ${socket.id}, ${choices.userName} has chosen ${choices.teamID} as their team and ${choices.role} as their role.`);
            let team = game.getTeam(parseInt(choices.teamID));
            if (team) {
                team.setPlayer(new Player(socket.id, choices.role, choices.userName, parseInt(choices.teamID)));
                sendPlayerLists(game, io, socket);
                // Vérifier si toutes les équipes sont pleines
                if (game.teams.get(1).getIsFull() && game.teams.get(2).getIsFull()) {
                    socket.emit('TeamsFull');
                }
            } else {
                console.log("Équipe non trouvée");
                socket.emit('error', { message: 'Équipe non trouvée' });
            }
        });
    });


    socket.on('launchGame', (gameCode) => {
        const channel = ChannelList.get(gameCode);
        const game = channel.getGame();
        if (game.teams.get(1).getIsFull() && game.teams.get(2).getIsFull()) {
            game.startGame();
            socket.emit('startGame');
        } else {
            socket.emit('error', { message: 'Toutes les équipes ne sont pas pleines' });
        }
    });

    socket.on('joinGame', (data) => {
        const gameCode = data.gameCode;
        const channel = ChannelList.get(gameCode);
        let game = channel.getGame();
        if (channel) {
            socket.join(gameCode);
            socket.emit('gameJoined', { gameCode: gameCode });
            // sendPlayerLists(game, io, socket);
        } else {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        const team1 = game.getTeam(1);
        const team2 = game.getTeam(2);
        if (team1.getIsFull() && team2.getIsFull()) {
            socket.emit('error', { message: 'Game is full' });
            socket.leave(gameCode);
            return;
        }
        updateGameOptions(game, io, socket);
    
        socket.on('confirmChoices', (choices) => {
            console.log(`Player ${socket.id}, ${choices.userName} has chosen ${choices.teamID} as their team and ${choices.role} as their role.`);
            let team = game.getTeam(parseInt(choices.teamID));
            if (team) {
                team.setPlayer(new Player(socket.id, choices.role, choices.userName, parseInt(choices.teamID)));
                sendPlayerLists(game, io, socket);
            } else {
                console.log("Équipe non trouvée");
                socket.emit('error', { message: 'Équipe non trouvée' });
            }
        });
    });
});

function sendPlayerLists(game, io, socket) {
    const teamsInfo = {};
    console.log("game.teams: " + game.teams);
    // console.log("game.teams.player: " + game.getTeam(1).getPlayerById(socket.id).getRole());
    // console.log("game.teams.player: " + game.getTeam(2).getPlayerById(socket.id).getRole());
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
    io.emit('updatePlayerLists', teamsInfo);
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});