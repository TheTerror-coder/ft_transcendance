let savedGameCode = null;

document.addEventListener('DOMContentLoaded', function() {
    const socket = io('http://localhost:3000');

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
        const launchGameButton = document.getElementById('launchGame');
        if (launchGameButton) {
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

    socket.on('startGame', () => {
        document.getElementById('startGame').style.display = 'block';
    });

    const startGameButton = document.getElementById('startGame');
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            socket.emit('startGame');
        });
    }

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