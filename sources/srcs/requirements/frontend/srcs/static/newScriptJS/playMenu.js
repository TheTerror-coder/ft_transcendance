


function playDisplayHomepage()
{
    ELEMENTs.playButton().style.display = 'none';
    ELEMENTs.centerPlayDisplay().style.display = 'flex';
    ELEMENTs.firstElement().innerHTML = rapidPlayHTML;
    ELEMENTs.firstElement().style.display = "flex";
    ELEMENTs.firstElement().style.backgroundImage = "url('/photos/picturePng/homePage/Kizaru.png')";
    ELEMENTs.secondElement().innerHTML = TournamentButtonHTML;
    ELEMENTs.secondElement().style.backgroundImage = "url('/photos/picturePng/homePage/TournamentLuffy.png')";
    const rapidPlayButton = document.getElementById("rapidPlayButton");
    rapidPlayButton.onclick = () => rapidPlayLobbyDisplay();
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

    const joinLobbyButton = document.getElementById("joinLobbyButton");
    joinLobbyButton.onclick = () => joinLobbyPlay();
    const createLobbyButton = document.getElementById("createLobbyButton");
    createLobbyButton.onclick = () => createLobbyPlay();
}

function joinLobbyPlay()
{
    ELEMENTs.firstElement().style.display = "none"; 
    ELEMENTs.secondElement().style.display = "none"; 
    ELEMENTs.thirdElement().style.display = "none";
    ELEMENTs.playDisplay().innerHTML = joinCodeDisplay;
    const crossButton = document.getElementById("crossButton");
    crossButton.onclick = () => refreshJoinCreateLocalPlay();
}

function refreshJoinCreateLocalPlay()
{
    ELEMENTs.playDisplay().innerHTML = centerPlayDisplayVAR;
    ELEMENTs.firstElement() = document.getElementById("firstElement");
    ELEMENTs.secondElement() = document.getElementById("secondElement");
    ELEMENTs.thirdElement() = document.getElementById("thirdElement");
    ELEMENTs.firstElement().style.display = "flex"; 
    ELEMENTs.secondElement().style.display = "flex"; 
    ELEMENTs.thirdElement().style.display = "flex";
    ELEMENTs.playDisplay().innerHTML = rapidPlayLobbyDisplay(homePage)
}

function createLobbyPlay()
{   
    window.history.pushState({}, "", URLs.VIEWS.CREATE_LOBBY);
    handleLocation();
}
