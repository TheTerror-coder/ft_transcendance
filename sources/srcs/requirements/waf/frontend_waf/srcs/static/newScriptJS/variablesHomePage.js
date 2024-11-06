//HOME PAGE INFORMATION

const homePageDisplayVAR = 
`<div class="homePage" id="homePage">
    <div class="rebecca" id="rebecca">
        <img src="../static/photos/picturePng/homePage/rebecca_newspapers.png" alt="Rebecca" style="margin-top: -10px;" class="rebeccaImg" id="rebeccaImg">
    </div>
    <div class="centerHomepage" id="centerHomepage">
        <div class="playButton" id="playButton">
            <button class="playImg fontTextPlay" id="playButtonImg">PLAY</button>
        </div>

        <div class="addFriend" id="addFriend">
            <p>SOCIAL</p>
            <img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="one piece crew !">
            <p>Friend</p>
            <form method="post">
                <div class="form-group">
                    <label for="friendUsernameADD">ADD FRIEND</label>
                    <input type="text" class="form-control" placeholder="Enter Username" id="usernameAddFriend" name="username" required>
                </div>
                <button type="submit" class="btn btn-primary" id="submitFriendButton">Submit</button>
            </form>
        </div>
        <div class="centerPlayDisplay" id="centerPlayDisplay">
            <div class="playDisplay" id="playDisplay">
                <!-- rapidPlayButton -->
                    <div class="imgPlayMenu" id="firstElement">
                    </div>
                    <div class="imgPlayMenu" id="secondElement">
                </div>

            </div>
        </div>
        <div class="wantedFriendHomePageDisplay">
            <button class="wantedProfile" id="wantedProfile">
                <img src="photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
                <p>USERNAME</p>
                <span>10.000</span>
            </button>
            <div class="friendButton" id="friendButton">
            <button id="buttonFriend"><img src="./photos/picturePng/homePage/add_friend_button.png" alt="add friend"></button>
            </div>
        </div>
    </div>
</div>`;


class homePageClass
{
    constructor()
    {
        background.style.backgroundImage = "url('../static/photos/picturePng/homePage/landscapeMenu.png')";
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



        // <button class="onePlayerButton fontTextPlay" id="onePlayerButton">ONE PLAYER</button>
        // <button class="twoPlayerButton fontTextPlay" id="twoPlayerButton">TWO PLAYER</button>
        // <button class="captainButton fontTextPlay" id="captainButton">CAPTAIN</button>
        // <button class="gunnerButton fontTextPlay" id="gunnerButton">GUNNER</button>
    //     <div class="imgPlayMenu">
    //     <button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>
    //  </div>
    //  <div class="imgPlayMenu">
    //     <button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>
    //  </div>

    // <!-- TournamentButton -->
    // <button class="createTournamentButton fontTextPlay" id="createTournamentButton">CREATE TOURNAMENT</button>
    // <button class="joinTournamentButton fontTextPlay" id="joinTournamentButton">JOIN TOURNAMENT</button>