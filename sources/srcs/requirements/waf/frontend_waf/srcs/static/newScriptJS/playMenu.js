





function playDisplayHomepage()
{
    homePage.playButton.style.display = 'none';
    homePage.centerPlayDisplay.style.display = 'flex';
    homePage.firstElement.innerHTML = rapidPlayHTML;
    homePage.firstElement.style.display = "flex";
    homePage.firstElement.style.backgroundImage = "url('static/photos/picturePng/homePage/Kizaru.png')";
    homePage.secondElement.innerHTML = TournamentButtonHTML;
    homePage.secondElement.style.backgroundImage = "url('static/photos/picturePng/homePage/TournamentLuffy.png')";
    const rapidPlayButton = document.getElementById("rapidPlayButton");
    rapidPlayButton.onclick = () => rapidPlayLobbyDisplay;
}

function rapidPlayLobbyDisplay()
{
    homePage.firstElement.innerHTML = joinCreateLobbyHTML;
    homePage.firstElement.style.backgroundImage = "none";
    homePage.secondElement.innerHTML = createLobbyButtonHTML;
    homePage.secondElement.style.backgroundImage = "none";
    const joinLobbyButton = document.getElementById("joinLobbyButton");
    // joinLobbyButton.onclick = joinRapidPlay;
}

homePage.playButtonImg.onclick = playDisplayHomepage;

// function joinRapidPlay()
// {
//     homePage.lobby.style.display = "flex";
//     lobbyDisplay();
// }

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

