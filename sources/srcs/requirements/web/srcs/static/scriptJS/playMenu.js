const centerPlayDisplay = document.getElementById("centerPlayDisplay");
const playButton = document.getElementById("playButton");
const playButtonImg = document.getElementById("playButtonImg");
const playDisplay = document.getElementById("playDisplay");
const allOfPlayDisplay = document.getElementById("allOfPlayDisplay");
const allOfPlayDisplay2 = document.getElementById("allOfPlayDisplay2");
// const playMenu = document.getElementById("playMenu");

const joinCreateLobby = `<div class="imgPlayMenu">
<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>
</div>
<div class="imgPlayMenu">
<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>
</div>`


let firstElement = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

const secondElement =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;

function playDisplayHomepage()
{
    playButton.style.display = 'none';
    centerPlayDisplay.style.display = 'flex';
    allOfPlayDisplay.innerHTML = firstElement;
    allOfPlayDisplay.style.display = "flex";
    allOfPlayDisplay.style.backgroundImage = "url('static/photos/picturePng/homePage/Kizaru.png')";
    allOfPlayDisplay2.innerHTML = secondElement;
    allOfPlayDisplay2.style.backgroundImage = "url('static/photos/picturePng/homePage/TournamentLuffy.png')";
    const rapidPlayButton = document.getElementById("rapidPlayButton");
    rapidPlayButton.onclick = rapidPlayLobbyDisplay;
}


function rapidPlayLobbyDisplay()
{
    // allOfPlayDisplay.innerHTML = joinCreateLobby;
}


playButtonImg.onclick = playDisplayHomepage;

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

// function joinRapidPlay()
// {
//     lobbyDisplay();
// }