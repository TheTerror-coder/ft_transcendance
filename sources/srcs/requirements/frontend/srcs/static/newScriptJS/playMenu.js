


function playDisplayHomepage()
{
    ELEMENTs.playButton().style.display = 'none';
    ELEMENTs.centerPlayDisplay().style.display = 'flex';
    ELEMENTs.firstElement().innerHTML = rapidPlayHTML;
    ELEMENTs.firstElement().style.display = "flex";
    ELEMENTs.firstElement().style.backgroundImage = "url('/photos/picturePng/homePage/Kizaru.png')";
    ELEMENTs.secondElement().innerHTML = TournamentButtonHTML;
    ELEMENTs.secondElement().style.backgroundImage = "url('/photos/picturePng/homePage/TournamentLuffy.png')";
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
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
    const returnButtonPlayMenu = document.getElementById("returnButtonPlayMenu");
    returnButtonPlayMenu.onclick = () => navigationPlayMenu();
}



function createLobbyPlay()
{   
    window.history.pushState({}, "", URLs.VIEWS.CREATE_LOBBY);
    handleLocation();
    setTimeout(() => {
        ELEMENTs.buttonCreate().onclick = () => createLobbyDisplay();
    }, 70);
}

function navigationPlayMenu()
{
    let nav = 0;
    console.log("ELEMENTs.firstElement() = ", ELEMENTs.firstElement());
    if (ELEMENTs.firstElement() === null && ELEMENTs.secondElement() === null && ELEMENTs.thirdElement() === null)
        nav = 2;
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
            console.log("here in nav == 2");
            ELEMENTs.playButtonImg().click();
            rapidPlayButton.click();
        }
    }, 40);

}