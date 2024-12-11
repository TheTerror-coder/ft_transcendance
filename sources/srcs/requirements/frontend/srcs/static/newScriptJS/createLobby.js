// import socketIOClient from 'socket.io-client';

let savedGameCode = null;
let gameStarted = false;
let ip;
let globalSocket = null;
let nbPerTeam;

let dataDav;


function initializeGlobalSocket(socket)
{
    globalSocket = socket;
    console.log("GLOBAL SOCKET: ", globalSocket);
    globalSocket.on('gameCreated', (data) => {
        console.log('Partie créée avec le code:', data.gameCode);
        savedGameCode = data.gameCode; // Sauvegarder le code de la partie
        console.log("savedGameCode: ", savedGameCode);
    });
    globalSocket.on('gameJoined', (data) => {
        console.log('Rejoint la partie:', data.gameCode);
        savedGameCode = data.gameCode; // Sauvegarder le code de la partie
        nbPerTeam = data.nbPlayerPerTeam;
        console.log("looooool !!! nbPlayerPerTeam: ", data.nbPlayerPerTeam);
        console.log("savedGameCode: ", savedGameCode);
    });
    globalSocket.on('AvailableOptions', (data) => {

        console.log("Reception des options disponibles :", data);
    });
    globalSocket.on('updatePlayerLists', (data) => {
        dataDav= data;

        console.log("Reception des listes des joueurs :", data);
    });
    globalSocket.on('startGame', (data) => {
        console.log("Debut de la partie :", data);
    });
    globalSocket.on('error', (data) => {
        alert(data.message);
    });
}

// function initializeGameEvent()
// {
//     globalSocket.on('gameCreated', (data) => {
//         console.log('Partie créée avec le code:', data.gameCode);
//         savedGameCode = data.gameCode; // Sauvegarder le code de la partie
//         console.log("savedGameCode: ", savedGameCode);
//     });
// }

async function createLobbyDisplay()
{
    const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);


    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
    {
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;

        setTimeout(() => {
            globalSocket.emit('createGame', { numPlayersPerTeam: 1 });
            // globalSocket.emit(await ('createGame'), { numPlayersPerTeam: 1 });
            ELEMENTs.usernameOfWanted().innerHTML = response.username;
            const photoUrl = response.photo;
            const imgElement = ELEMENTs.pictureOfWanted();
            imgElement.src = photoUrl;
            ELEMENTs.primeAmount().innerHTML = response.prime;
            setTimeout(() => {
                globalSocket.emit('confirmChoices', { teamID: 1, role: "captain", userName: response.username });
                console.log("saveCodeGameCode dans ;la focntion de cree les bails: ", savedGameCode);
                document.getElementById("lobbyCode").innerHTML = savedGameCode;
            }, 300);
            console.log("globalSocket OnevsOne create lobby: ", globalSocket);
        }, 100);
        setLanguage(currentLanguage);
    }
    else
    {
        ELEMENTs.usernameOfWanted().innerHTML = response.username;
        const photoUrl = response.photo;
        const imgElement = ELEMENTs.pictureOfWanted();
        imgElement.src = photoUrl;
        ELEMENTs.primeAmount().innerHTML = response.prime;
        createLobbyforTwoPlayer();
    }
}

function createLobbyforTwoPlayer()
{
    console.log("GLOBAL SOCKET: ", globalSocket);
    globalSocket.emit('createGame', { numPlayersPerTeam: 2 });
    // initializeGameEvent();
    ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    setTimeout(() => {
        ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
        ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
        console.log("juste avant le onclick de buttoncreate");
        ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
    }, 60);
    setLanguage(currentLanguage);
}


function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().checked;
    const roleChosen = ELEMENTs.chooseRoleSwitch().checked;
    
    console.log("team chosen: ", teamChosen);
    console.log("role chosen: ", roleChosen);
    console.log("GLOBAL SOCKET: ", globalSocket);

    const teamID = teamChosen ? 1 : 2;
    const role = roleChosen ? "captain" : "Cannoneer";
    console.log("teamID: ", teamID);
    console.log("role: ", role);
    console.log("GLOBAL SOCKET: ", globalSocket);
    globalSocket.emit('confirmChoices', { teamID, role, userName: "USER NAME HERE" }); // TODO: get user name from database
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
    console.log("savedGameCode in lobbyTwoPlayer: ", savedGameCode);
    document.getElementById("lobbyCode").innerHTML = savedGameCode;

    setTimeout(() => {
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 60);
    setLanguage(currentLanguage);

}


function switchRole()
{
    if (ELEMENTs.chooseRoleSwitch().checked == true)
    {
        ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.3";
        ELEMENTs.gunnerRoleDisplay().style.opacity = "0.9";
    }
    else
    {
        
        ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.9";
        ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.gunnerRoleDisplay().style.opacity = "0.3";
    }
}

function switchTeam()
{
    const kurohige = document.getElementById("KurohigeTeam");
    if (ELEMENTs.chooseTeamSwitch().checked == true)
    {
        kurohige.style.opacity = "0.3";
        kurohige.style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeam().style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeam().style.opacity = "0.9";

    }
    else
    {
        kurohige.style.transition = "opacity 0.5s ease";
        kurohige.style.opacity = "0.9";
        ELEMENTs.ShirohigeTeam().style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeam().style.opacity = "0.3";
    }
}