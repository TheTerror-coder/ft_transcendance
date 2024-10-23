import socketIOClient from 'socket.io-client';
// import socket from './socket.js';
// import {main as startPongGame} from './pong.js';

let savedGameCode = null;
let gameStarted = false;
let ip;
let socket;

// Fonction pour initialiser la socket
const initializeSocket = async () => {
    try {
        const response = await fetch('../../static/pong/config.json');
        if (!response.ok) {
            console.error('Erreur réseau : ' + response.statusText);
            ip = '127.0.0.1';
            socket = socketIOClient('http://' + ip + ':3000');
            console.log("Socket initialized: ", socket);
            return socket; // Retourner la socket
        }
        const data = await response.json(); // Attendre que les données soient disponibles
        ip = data.HOST_IP;
        socket = socketIOClient('http://' + ip + ':3000');
        console.log("Socket initialized: ", socket);
        return socket; // Retourner la socket
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la socket:', error);
        return null; // Retourner null en cas d'erreur
    }
};


document.addEventListener('DOMContentLoaded', async function() {
    // const socket = socket;

    const socket = await initializeSocket();
    if (!socket) {
        return;
    }

    console.log('socket in lobby.js: ', socket);

    socket.on('connect', () => {
        console.log('Connecté au serveur pong avec l\'ip: ' + ip + ' sur le port: 3000 avec la socket: ' + socket.id + ' connected: ' + socket.connected);
    });

    const createGameButton = document.getElementById('createGame');
    if (createGameButton) {
        createGameButton.addEventListener('click', () => {
            const numPlayersPerTeam = document.getElementById('numPlayersPerTeam').value;
            socket.emit('createGame', { numPlayersPerTeam });
        });
    }

    const joinGameButton = document.getElementById('joinGame');
    if (joinGameButton) {
        joinGameButton.addEventListener('click', () => {
            const gameCode = document.getElementById('gameCodeInput').value;
            socket.emit('joinGame', { gameCode });
        });
    }

    socket.on('TeamsFull', () => {
        if (gameStarted) return ;
        const launchGameButton = document.getElementById('launchGame');
        if (launchGameButton) {
            console.log("launchGameButton : apparition", launchGameButton);
            launchGameButton.style.display = 'block';
            launchGameButton.style.backgroundColor = 'green';
        }
    });

    const launchGameButton = document.getElementById('launchGame');
    if (launchGameButton) {
        launchGameButton.addEventListener('click', () => {
            console.log(savedGameCode);
            if (savedGameCode) {
                socket.emit('launchGame', savedGameCode);
            } else {
                console.error("Le code de la partie n'est pas disponible.");
            }
        });
    }

    socket.on('gameCreated', (data) => {
        console.log('Partie créée avec le code:', data.gameCode);
        document.getElementById('gameOptions').style.display = 'block';
        afficherCodePartie(data.gameCode);
        savedGameCode = data.gameCode; // Sauvegarder le code de la partie
        console.log("savedGameCode: ", savedGameCode);
    });

    socket.on('gameJoined', (data) => {
        console.log('Rejoint la partie:', data.gameCode);
        document.getElementById('gameOptions').style.display = 'block';
        afficherCodePartie(data.gameCode);
        savedGameCode = data.gameCode; // Sauvegarder le code de la partie
    });

    socket.on('AvailableOptions', (data) => {
        const teamsSelectElement = document.getElementById('teamsSelect');
        const rolesSelectElement = document.getElementById('rolesSelect');

        if (!teamsSelectElement) {
            console.error("L'élément teamsSelect n'existe pas dans le DOM.");
            return;
        }

        if (!rolesSelectElement) {
            console.error("L'élément rolesSelect n'existe pas dans le DOM.");
            return;
        }

        console.log("Réception des options disponibles :", data);

        teamsSelectElement.innerHTML = ''; // Effacer les options existantes
        rolesSelectElement.innerHTML = ''; // Effacer les options existantes

        data.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.value;
            option.textContent = team.name;
            teamsSelectElement.appendChild(option);
        });

        teamsSelectElement.addEventListener('change', (event) => {
            const selectedTeamId = event.target.value;
            const selectedTeamRoles = data.teamsRoles.find(team => team.teamId == selectedTeamId).roles;

            rolesSelectElement.innerHTML = ''; // Effacer les options existantes
            selectedTeamRoles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.value;
                option.textContent = role.name;
                rolesSelectElement.appendChild(option);
            });
        });

        // Déclencher l'événement change pour initialiser les rôles pour la première équipe sélectionnée
        teamsSelectElement.dispatchEvent(new Event('change'));
    });

    const confirmChoicesButton = document.getElementById('confirmChoices');
    if (confirmChoicesButton) {
        confirmChoicesButton.addEventListener('click', () => {
            const teamID = document.getElementById('teamsSelect').value;
            const role = document.getElementById('rolesSelect').value;
            const userName = document.getElementById('userName').value;
            socket.emit('confirmChoices', { teamID, role, userName });
        });
    }

    socket.on('startGame', async () => {
        gameStarted = true;
        // Cacher le bouton de lancement de la partie dès le début
        const launchGameButton = document.getElementById('launchGame');
        if (launchGameButton) {
            launchGameButton.style.display = 'none'; // Cacher le bouton
        }

        // console.log('gameData : ', gameData);
        // localStorage.setItem('gameData', JSON.stringify(gameData));
        // const teamsArray = JSON.parse(localStorage.getItem('gameData'));
        // console.log('teamsArray : ', teamsArray);
        // window.location.href = '../pong';
        const module = await import('./pong.js');
        // document.getElementById('gameOptions').style.display = 'none';
        // document.getElementById('hub').style.display = 'none';
        // document.getElementById('confirmChoices').style.display = 'none';
        const bodyElements = document.body.children;
        for (let i = 0; i < bodyElements.length; i++) {
            bodyElements[i].style.display = 'none';
        }
        await module.main(savedGameCode, socket);
    });

    // Fonction pour afficher le code de la partie dans le HUD
    function afficherCodePartie(codePartie) {
        let hudElement = document.getElementById('hud');
        if (!hudElement) {
            hudElement = document.createElement('div');
            hudElement.id = 'hud';
            hudElement.style.position = 'fixed';
            hudElement.style.top = '10px';
            hudElement.style.right = '10px';
            hudElement.style.padding = '10px';
            hudElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            hudElement.style.color = 'white';
            hudElement.style.borderRadius = '5px';
            document.body.appendChild(hudElement);
        }
        hudElement.textContent = `Code de la partie : ${codePartie}`;
    }

    socket.on('updatePlayerLists', (teamsInfo) => {
        const team1ListElement = document.getElementById('team1List');
        const team2ListElement = document.getElementById('team2List');

        team1ListElement.innerHTML = ''; // Effacer la liste existante
        teamsInfo[1].forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `${player.name} - Role: ${player.role}`;
            team1ListElement.appendChild(playerElement);
        });

        team2ListElement.innerHTML = ''; // Effacer la liste existante
        teamsInfo[2].forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `${player.name} - Role: ${player.role}`;
            team2ListElement.appendChild(playerElement);
        });
    });

    socket.on('error', (data) => {
        alert(data.message);
    });
});
