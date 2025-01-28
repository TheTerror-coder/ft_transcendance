
// import { initializeSocket } from './socketPong.js';

// let globalSocket;

function playDisplayHomepage()
{
    ELEMENTs.playButton().style.display = 'none';
    ELEMENTs.centerPlayDisplay().style.display = 'flex';
    ELEMENTs.firstElement().innerHTML = rapidPlayHTML;
    ELEMENTs.firstElement().style.display = "flex";
    ELEMENTs.firstElement().style.backgroundImage = "url('/photos/picturePng/homePage/Kizaru.png')";
    ELEMENTs.secondElement().innerHTML = TournamentButtonHTML;
    ELEMENTs.secondElement().style.backgroundImage = "url('/photos/picturePng/homePage/TournamentLuffy.png')";
    refreshLanguage();
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    ELEMENTs.rapidPlayButton().onclick = () => rapidPlayLobbyDisplay();
    ELEMENTs.tournamentButton().onclick = () => assign_location(URLs.VIEWS.TOURNAMENT);
}


function rapidPlayLobbyDisplay()
{
    ELEMENTs.firstElement().innerHTML = joinCreateLobbyHTML;
    ELEMENTs.firstElement().style.backgroundImage = "none";
    ELEMENTs.secondElement().innerHTML = createLobbyButtonHTML;
    ELEMENTs.secondElement().style.backgroundImage = "none";
    ELEMENTs.thirdElement().style.display = "block";
    ELEMENTs.thirdElement().innerHTML = localPlayButtonHTML;
    ELEMENTs.thirdElement().style.alignSelf = "center";
    ELEMENTs.firstElement().style.height = "109px";
    ELEMENTs.secondElement().style.height = "109px";
    ELEMENTs.thirdElement().style.height = "109px";
    refreshLanguage();

    const joinLobbyButton = document.getElementById("joinLobbyButton");
    joinLobbyButton.onclick = () => joinLobbyPlay();
    const createLobbyButton = document.getElementById("createLobbyButton");
    createLobbyButton.onclick = () => createLobbyPlay();
    const localPlayButton = document.getElementById("localPlayButton");
    localPlayButton.onclick = () => readyLocalPlay();
}

async function joinLobbyPlay()
{
    const socket = await initializeSocket();
    initializeGlobalSocket(socket);
    ELEMENTs.firstElement().style.display = "none"; 
    ELEMENTs.secondElement().style.display = "none"; 
    ELEMENTs.thirdElement().style.display = "none";
    ELEMENTs.playDisplay().innerHTML = joinCodeDisplay;
    refreshLanguage();
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    const joinButton = document.getElementById("joinButton");

    joinButton.onclick = () => {
        let gameCode = document.getElementById("number").value;
        globalSocket.emit('joinGame', { gameCode });
        setTimeout(() => {
            if (error === null)
            {
                if (nbPerTeam == 2)
                    joinTwoPlayersDisplay(gameCode);
                else
                    joinLobbyGame(gameCode, 2, "captain");
            }
            else
                error = null;
        }, 300);
    };
}


function readyLocalPlay()
{
    ELEMENTs.firstElement().style.display = "none"; 
    ELEMENTs.secondElement().style.display = "none";
    ELEMENTs.thirdElement().style.display = "none";
    ELEMENTs.playDisplay().innerHTML = localPlayDisplay;
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    const readyButton = document.getElementById("readyButton");
    refreshLanguage();
    readyButton.onclick = () => localPlay();
}

async function localPlay()
{
    document.getElementById('background').innerHTML = "";
    ELEMENTs.background().style.backgroundImage = '';
    const module = await import('../pong/LocalPong/pong.js');
    module.main(currentLanguage);
    // ELEMENTs.background().innerHTML = resetBaseHtmlVAR;
    // replaceLocation(URLs.VIEWS.HOME);
}


async function joinTwoPlayersDisplay(gameCode)
{
    ELEMENTs.playDisplay().innerHTML = joinTwoPlayersVAR;

    const joinButton = document.getElementById("joinButton");
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    await displayAvailableRoleAndTeamJoin();
    ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
    ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
    joinButton.onclick = () => initializeLobbyTwoVsTwo(gameCode);
    refreshLanguage();
}


function initializeLobbyTwoVsTwo(gameCode)
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().checked;
    const roleChosen = ELEMENTs.chooseRoleSwitch().checked;
    let teamID;
    let role;

    if ((teamChosen && teamAvailable.team === 1) || (teamChosen === false && teamAvailable.team === 2))
        teamID = teamAvailable.team;
    else 
        teamID = teamChosen ? 2 : 1;
    if ((teamID === 1 && roleChosen === false && roleAvailableBlackBeard.role === "gunner") || (teamID === 2 && roleChosen === false && roleAvailableWhiteBeard.role === "gunner"))
        role = "Cannoneer";
    else if ((teamID === 1 && roleChosen && roleAvailableBlackBeard.role === "captain") || (teamID === 2 && roleChosen === false && roleAvailableWhiteBeard.role === "captain"))
        role = "captain";
    else
        role = roleChosen ? "Cannoneer" : "captain";
    joinLobbyGame(gameCode, teamID, role);
}

async function createLobbyPlay()
{   
    await assign_location(URLs.VIEWS.CREATE_LOBBY); 
    refreshLanguage();
    const socket = await initializeSocket();
    initializeGlobalSocket(socket);
    ELEMENTs.buttonCreate().onclick = () => createLobbyDisplay();
}

async function navigationPlayMenu()
{
    let nav = 0;
    if (ELEMENTs.firstElement() === null && ELEMENTs.secondElement() === null && ELEMENTs.thirdElement() === null)
    {
        nav = 2;
        if (globalSocket !== null)
        {
            teamAvailable.team = 0;
            roleAvailableBlackBeard.role = 0;
            roleAvailableWhiteBeard.role = 0;
            globalSocket.disconnect();
            globalSocket = null;
        }
    }
    else if (ELEMENTs.thirdElement().style.display === "block")
        nav = 1;

    await replace_location(URLs.VIEWS.HOME);
    if (nav == 1)
        ELEMENTs.playButtonImg().click();
    if (nav == 2)
    {
        ELEMENTs.playButtonImg().click();
        ELEMENTs.rapidPlayButton().click();
    }
}