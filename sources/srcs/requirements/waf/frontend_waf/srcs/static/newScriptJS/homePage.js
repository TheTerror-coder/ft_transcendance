class homePageClass
{
    constructor()
    {
        this.centerHomepage = document.querySelector("#centerHomepage");
        this.homePage = document.querySelector("#homePage");
    
        this.buttonFriend = document.querySelector("#buttonFriend");
        this.friendDisplay = document.querySelector("#friendDisplay");
    
        this.submitFriendButton = document.querySelector("#submitFriendButton");
        this.usernameAddFriend = document.querySelector("#usernameAddFriend");
    
    
        this.rebecca = document.querySelector("#rebecca");
        this.rebeccaImg = document.querySelector("#rebeccaImg");
    
        this.friendButton = document.querySelector("#friendButton");
    
    
        this.wantedProfile = document.querySelector("#wantedProfile");
        this.profilePage = document.querySelector("#profilePage");
    
        this.wantedInProfilePage = document.querySelector("#wantedInProfilePage");

        this.centerPlayDisplay = document.getElementById("centerPlayDisplay");



        
        this.playButton = document.getElementById("playButton");
        this.playButtonImg = document.getElementById("playButtonImg");
        this.playDisplay = document.getElementById("playDisplay");
        this.firstElement = document.getElementById("firstElement");
        this.secondElement = document.getElementById("secondElement");

        this.lobby = document.getElementById("lobby");

        this.joinCreateLobbyHTML = `<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

        this. createLobbyButtonHTML =  `<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;



        this.rapidPlayHTML = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

        this.TournamentButtonHTML =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;
    }
}