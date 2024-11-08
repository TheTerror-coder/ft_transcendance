playButtonImg.onclick = playDisplayHomepage;

rapidPlayButton.onclick = rapidPlay;

createLobbyButton.onclick = rapidPlayLobbyDisplay;

joinLobbyButton.onclick =  joinRapidPlay;

onePlayerButton.onclick = onePlayerRapidPlay;

twoPlayerButton.onclick = twoPlayerChooseRole;


captainButton.onclick = () => twoPlayerRapidPlay("captain");
gunnerButton.onclick = () => twoPlayerRapidPlay("gunner");

function playDisplayHomepage()
{
    playDisplay.style.display = 'flex';
    playDisplay.style.flexDirection = 'column';
    playButton.style.display = 'none';
}

function rapidPlay()
{
    tournamentButton.style.display = "none";
    rapidPlayButton.style.display = "none";
    joinLobbyButton.style.display = "block";
    createLobbyButton.style.display = "block";
}


function twoPlayerChooseRole()
{
    onePlayerButton.style.display = "none";
    twoPlayerButton.style.display = "none";
    captainButton.style.display = "block";
    gunnerButton.style.display = "block";

    // lobbyDisplay();
    
}

function twoPlayerRapidPlay(role)
{
    lobbyDisplay();
    console.log(role);
}


function onePlayerRapidPlay()
{
    lobbyDisplay();

}

function rapidPlayLobbyDisplay()
{
    joinLobbyButton.style.display = "none";
    createLobbyButton.style.display = "none";
    onePlayerButton.style.display = "block";
    twoPlayerButton.style.display = "block";
}

function joinRapidPlay()
{
    lobbyDisplay();
}