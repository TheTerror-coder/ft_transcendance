



function playDisplayHomepage(homePage)
{
    homePage.playButton.style.display = 'none';
    homePage.centerPlayDisplay.style.display = 'flex';
    homePage.firstElement.innerHTML = homePage.rapidPlayHTML;
    homePage.firstElement.style.display = "flex";
    homePage.firstElement.style.backgroundImage = "url('static/photos/picturePng/homePage/Kizaru.png')";
    homePage.secondElement.innerHTML = homePage.TournamentButtonHTML;
    homePage.secondElement.style.backgroundImage = "url('static/photos/picturePng/homePage/TournamentLuffy.png')";
    const rapidPlayButton = document.getElementById("rapidPlayButton");
    rapidPlayButton.onclick = () => rapidPlayLobbyDisplay(homePage);
}

function rapidPlayLobbyDisplay(homePage)
{
    homePage.firstElement.innerHTML = homePage.joinCreateLobbyHTML;
    homePage.firstElement.style.backgroundImage = "none";
    homePage.secondElement.innerHTML = homePage.createLobbyButtonHTML;
    homePage.secondElement.style.backgroundImage = "none";
    homePage.thirdElement.style.display = "block";
    homePage.thirdElement.innerHTML = homePage.localPlayButtonHTML;
    homePage.thirdElement.style.alignSelf = "center";
    homePage.firstElement.style.height = "109px";
    homePage.secondElement.style.height = "109px";
    homePage.thirdElement.style.height = "109px";

    const joinLobbyButton = document.getElementById("joinLobbyButton");
    joinLobbyButton.onclick = () => joinLobbyPlay(homePage);
    const createLobbyButton = document.getElementById("createLobbyButton");
    createLobbyButton.onclick = () => createLobbyPlay();
}

function joinLobbyPlay(homePage)
{
    homePage.firstElement.style.display = "none"; 
    homePage.secondElement.style.display = "none"; 
    homePage.thirdElement.style.display = "none";
    homePage.playDisplay.innerHTML = homePage.joinCodeDisplay;
    const crossButton = document.getElementById("crossButton");
    crossButton.onclick = () => refreshJoinCreateLocalPlay(homePage);
}

function refreshJoinCreateLocalPlay(homePage)
{
    homePage.playDisplay.innerHTML = centerPlayDisplayVAR;
    homePage.firstElement = document.getElementById("firstElement");
    homePage.secondElement = document.getElementById("secondElement");
    homePage.thirdElement = document.getElementById("thirdElement");
    homePage.firstElement.style.display = "flex"; 
    homePage.secondElement.style.display = "flex"; 
    homePage.thirdElement.style.display = "flex";
    homePage.playDisplay.innerHTML = rapidPlayLobbyDisplay(homePage)
}

function createLobbyPlay()
{   
    window.history.pushState({}, "", "/createLobby");
    handleLocation();
}

class PlayMenu
{
    constructor()
    {


        // this.rapidPlayButton = document.getElementById("rapidPlayButton");
        // this.createLobbyButton = document.getElementById("createLobbyButton");
        // this.joinLobbyButton = document.getElementById("joinLobbyButton");
        // this.onePlayerButton = document.getElementById("onePlayerButton");
        // this.twoPlayerButton = document.getElementById("twoPlayerButton");
        // this.captainButton = document.getElementById("captainButton");
        // this.gunnerButton = document.getElementById("gunnerButton");
        

    }



    // rapidPlay()
    // {
    //     this.tournamentButton.style.display = "none";
    //     this.rapidPlayButton.style.display = "none";
    //     this.joinLobbyButton.style.display = "block";
    //     this.createLobbyButton.style.display = "block";
    // }

    // twoPlayerChooseRole()
    // {
    //     this.onePlayerButton.style.display = "none";
    //     this.twoPlayerButton.style.display = "none";
    //     this.captainButton.style.display = "block";
    //     this.gunnerButton.style.display = "block";
    // }

    // onePlayerRapidPlay()
    // {
    //     lobbyDisplay();
    // }



    // joinRapidPlay()
    // {
    //     lobbyDisplay();
    // }
}



// playButtonImg.onclick = playDisplayHomepage;

// rapidPlayButton.onclick = rapidPlay;

// createLobbyButton.onclick = rapidPlayLobbyDisplay;

// joinLobbyButton.onclick =  joinRapidPlay;

// onePlayerButton.onclick = onePlayerRapidPlay;

// twoPlayerButton.onclick = twoPlayerChooseRole;



// captainButton.onclick = () => twoPlayerRapidPlay("captain");
// gunnerButton.onclick = () => twoPlayerRapidPlay("gunner");

// function playDisplayHomepage()
// {
//     centerPlayDisplay.style.display = 'flex';
//     playButton.style.display = 'none';
// }

// function rapidPlay()
// {
//     tournamentButton.style.display = "none";
//     rapidPlayButton.style.display = "none";
//     joinLobbyButton.style.display = "block";
//     createLobbyButton.style.display = "block";
// }


// function twoPlayerChooseRole()
// {
//     onePlayerButton.style.display = "none";
//     twoPlayerButton.style.display = "none";
//     captainButton.style.display = "block";
//     gunnerButton.style.display = "block";

//     // lobbyDisplay();
    
// }



// function onePlayerRapidPlay()
// {
//     lobbyDisplay();

// }

// function rapidPlayLobbyDisplay()
// {
//     joinLobbyButton.style.display = "none";
//     createLobbyButton.style.display = "none";
//     onePlayerButton.style.display = "block";
//     twoPlayerButton.style.display = "block";
// }

