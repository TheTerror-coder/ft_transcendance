// import socketIOClient from 'socket.io-client';

let savedGameCode = null;
let gameStarted = false;
let ip;
let globalSocket = null;
let nbPerTeam;


let error = null;


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
        gameFound = true;
        console.log("gameFound: ", gameFound);
    });
    globalSocket.on('AvailableOptions', (data) => {

        console.log("Reception des options disponibles :", data);
        console.log("AvailableOptions: data: ",data);
    });
    globalSocket.on('updatePlayerLists', (data) => {
        dataDav = data;
        console.log("Reception des listes des joueurs :", data);
        updateLobby(data);
    });
    globalSocket.on('startGame', async (data) => {
        const module = await import ('../pong/pong.js');
        // main(socket, gameCode); // Lancer le jeu
        ELEMENTs.background().innerHTML = "";
        await module.main(savedGameCode, globalSocket);
        ELEMENTs.background().style.backgroundImage = "none";
        console.log("globalSocket dans startGame: ", globalSocket);
    });
    globalSocket.on('TeamsFull', () => {
        ELEMENTs.PlayButtonInLobby().style.display = "block";
    });
    globalSocket.on('error', (data) => {
        console.log("JE SUIS DANS ERROR DE CREATE LOBBY");
        error = data.message;
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
            nbPerTeam = 1;
            globalSocket.emit('createGame', { numPlayersPerTeam: nbPerTeam });
            ELEMENTs.usernameOfWanted().innerHTML = response.username;
            const photoUrl = response.photo;
            const imgElement = ELEMENTs.pictureOfWanted();
            imgElement.src = photoUrl;
            ELEMENTs.primeAmount().innerHTML = response.prime;
            setTimeout(() => {
                globalSocket.emit('confirmChoices', { teamID: 1, role: "captain", userName: response.username });
                if (error !== null)
                {
                    console.log("error: ", error);
                    error = null;
                    replace_location(URLs.VIEWS.HOME);
                    return ;
                }
                console.log("saveCodeGameCode dans ;la focntion de cree les bails: ", savedGameCode);
                document.getElementById("lobbyCode").innerHTML = savedGameCode;
            }, 300);
            console.log("globalSocket OnevsOne create lobby: ", globalSocket);
        }, 100);
        refreshLanguage();
    }
    else
        createLobbyforTwoPlayer();
}

function createLobbyforTwoPlayer()
{
    console.log("GLOBAL SOCKET: ", globalSocket);
    nbPerTeam = 2;
    globalSocket.emit('createGame', { numPlayersPerTeam: nbPerTeam });
    // initializeGameEvent();
    ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    setTimeout(() => {
        ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
        ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
        ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
    }, 60);
    refreshLanguage();
}


async function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().checked;
    const roleChosen = ELEMENTs.chooseRoleSwitch().checked;

    const teamID = teamChosen ? 2 : 1;
    const role = roleChosen ? "Cannoneer" : "captain";
    console.log("teamID: ", teamID);
    console.log("role: ", role);
    console.log("GLOBAL SOCKET: ", globalSocket);
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);

    globalSocket.emit('confirmChoices', { teamID, role, userName: user.username }); // TODO: get user name from database
    if (error !== null)
    {
        
        console.log("error: ", error);
        error = null;
        return ;
    }
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
    console.log("savedGameCode in lobbyTwoPlayer: ", savedGameCode);
    document.getElementById("lobbyCode").innerHTML = savedGameCode;

    setTimeout(() => {
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 60);

    refreshLanguage();

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