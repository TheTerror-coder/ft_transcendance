
// import { initializeSocket } from './socketPong.js';

// let globalSocket;

function playDisplayHomepage()
{
    console.log("je suis cense etre al");
    ELEMENTs.playButton().style.display = 'none';
    ELEMENTs.centerPlayDisplay().style.display = 'flex';
    ELEMENTs.firstElement().innerHTML = rapidPlayHTML;
    ELEMENTs.firstElement().style.display = "flex";
    ELEMENTs.firstElement().style.backgroundImage = "url('/photos/picturePng/homePage/Kizaru.png')";
    ELEMENTs.secondElement().innerHTML = TournamentButtonHTML;
    ELEMENTs.secondElement().style.backgroundImage = "url('/photos/picturePng/homePage/TournamentLuffy.png')";
    setLanguage(currentLanguage);
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    ELEMENTs.rapidPlayButton().onclick = () => rapidPlayLobbyDisplay();
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
    setLanguage(currentLanguage);

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
    setLanguage(currentLanguage);
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
    const joinButton = document.getElementById("joinButton");

    // TO DO: faire condition en fonction de ce que je vais recevoir comme info de Ben
    joinButton.onclick = () => {
        let gameCode = document.getElementById("number").value;
        console.log("gameCode = ", gameCode);
        globalSocket.emit('joinGame', { gameCode });
        setTimeout(() => {
            console.log("nbPER TEAM PURAPINNN", nbPerTeam);
            if (nbPerTeam == 2)
                joinTwoPlayersDisplay();
            else
                console.log("on est al mon frere");
        }, 500);
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
    setLanguage(currentLanguage);

    // rejoindre le gang
}


function joinTwoPlayersDisplay()
{
    ELEMENTs.playDisplay().innerHTML = joinTwoPlayersVAR;
}


function createLobbyPlay()
{   
    window.history.pushState({}, "", URLs.VIEWS.CREATE_LOBBY);
    handleLocation();
    setTimeout(async() => {
        setLanguage(currentLanguage);
        console.log("JE SUIS DANS CREATE LOBBY");
        const socket = await initializeSocket();
        initializeGlobalSocket(socket);
        ELEMENTs.buttonCreate().onclick = () => createLobbyDisplay();
    }, 70);
}

function navigationPlayMenu()
{
    let nav = 0;
    console.log("ELEMENTs.firstElement() = ", ELEMENTs.firstElement());
    if (ELEMENTs.firstElement() === null && ELEMENTs.secondElement() === null && ELEMENTs.thirdElement() === null)
    {
        nav = 2;
        if (globalSocket !== null)
        {
            globalSocket.disconnect();
            globalSocket = null;
        }
    }
    else if (ELEMENTs.thirdElement().style.display === "block")
        nav = 1;

    refreshHomePage();
    setTimeout(() => {
        if (nav == 1)
        {
            ELEMENTs.playButtonImg().click();
        }
        if (nav == 2)
        {
            ELEMENTs.playButtonImg().click();
            setTimeout(() => {
                ELEMENTs.rapidPlayButton().click();
            }, 40);
        }
    }, 70);

}