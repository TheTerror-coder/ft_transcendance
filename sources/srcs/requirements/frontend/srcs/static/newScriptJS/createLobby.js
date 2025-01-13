// import socketIOClient from 'socket.io-client';

let savedGameCode = {
    _code: null, 
  
    get code() {
      return this._code;
    },
  
    set code(value) {
      this._code = value;
      if (document.getElementById("lobbyCode") !== null)
        document.getElementById("lobbyCode").innerHTML = value;
    }
  };
let gameStarted = false;
let ip;
let globalSocket = null;
let nbPerTeam;


let error = null;


function initializeGlobalSocket(socket)
{
    console.log("initializeGlobalSocket");
    globalSocket = socket;
    console.log("GLOBAL SOCKET: ", globalSocket);
    globalSocket.on('gameCreated', (data) => {
        console.log('Partie créée avec le code:', data.gameCode);
        savedGameCode.code = data.gameCode; // Sauvegarder le code de la partie
    });
    globalSocket.on('gameJoined', (data) => {
        console.log('Rejoint la partie:', data.gameCode);
        savedGameCode.code = data.gameCode; // Sauvegarder le code de la partie
        nbPerTeam = data.nbPlayerPerTeam;
        console.log("looooool !!! nbPlayerPerTeam: ", data.nbPlayerPerTeam);
        console.log("savedGameCode: ", savedGameCode.code);
        gameFound = true;
        console.log("gameFound: ", gameFound);
    });
    globalSocket.on('AvailableOptions', AvailableOptionsEvent);
    
    globalSocket.on('updatePlayerLists', UpdatePlayerListEvent);

    globalSocket.on('startGame', StartGameEvent);

    globalSocket.on('TeamsFull', TeamsFullEvent);

    globalSocket.on('gameUnpaused', async () => {
        console.log("gameUnpaused");
        // const module = await import ('../pong/pong.js');
        // document.getElementById('background').innerHTML = "";
        // await module.main(savedGameCode.code, globalSocket, currentLanguage);
    });
    globalSocket.on('error', (data) => {
        console.log("JE SUIS DANS ERROR DE CREATE LOBBY");
        error = data.message;
        alert(data.message);
    });
}

const AvailableOptionsEvent = (data) => {
    console.log("Reception des options disponibles :", data);
    // globalSocket.off('AvailableOptions', AvailableOptionsEvent);
}

const UpdatePlayerListEvent = (data) => {
    dataDav = data;
    console.log("Reception des listes des joueurs :", data);
    updateLobby(data);
    // globalSocket.off('updatePlayerLists', UpdatePlayerListEvent);
}

const TeamsFullEvent = () => {
    ELEMENTs.PlayButtonInLobby().style.display = "block";
    // globalSocket.off('TeamsFull', TeamsFullEvent);
}

const StartGameEvent = async (data) => {
    const module = await import ('../pong/pong.js');
    document.getElementById('background').innerHTML = "";
    console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    await module.main(savedGameCode.code, globalSocket, currentLanguage);
    console.log("globalSocket dans startGame: ", globalSocket);
    globalSocket.off('startGame', StartGameEvent);
    globalSocket.off('TeamsFull', TeamsFullEvent);
    globalSocket.off('updatePlayerLists', UpdatePlayerListEvent);
    globalSocket.off('AvailableOptions', AvailableOptionsEvent);
}

async function createLobbyDisplay()
{
    const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);


    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
    {
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;

        // setTimeout(async () => {
        nbPerTeam = 1;
        globalSocket.emit('createGame', { numPlayersPerTeam: nbPerTeam });
        ELEMENTs.usernameOfWanted().innerHTML = response.username;
        const photoUrl = response.photo;
        const imgElement = ELEMENTs.pictureOfWanted();
        imgElement.src = photoUrl;
        ELEMENTs.primeAmount().innerHTML = response.prime;
        globalSocket.emit('confirmChoices', { teamID: 1, role: "captain", userName: response.username });
        setTimeout(async () => {
            if (error !== null)
            {
                console.log("error: ", error);
                error = null;
                await replace_location(URLs.VIEWS.HOME);
                return ;
            }
        }, 100);
        savedGameCode.code = savedGameCode.code;
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
    // setTimeout(() => {
        ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
        ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
        ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
    // }, 60);
    refreshLanguage();
}


async function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().checked;
    const roleChosen = ELEMENTs.chooseRoleSwitch().checked;

    const teamID = teamChosen ? 2 : 1;
    const role = roleChosen ? "Cannoneer" : "captain";
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);

    globalSocket.emit('confirmChoices', { teamID, role, userName: user.username }); // TODO: get user name from database
    setTimeout(() => {
        if (error !== null)
        {
            console.log("error: ", error);
            error = null;
            return ;
        }
    }, 20);
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
    setTimeout(() => {
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 20);
        
    savedGameCode.code = savedGameCode.code;
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