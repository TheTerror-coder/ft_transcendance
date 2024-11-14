//HOME PAGE INFORMATION
// <div class="rebecca" id="rebecca">
//     <img src="../static/photos/picturePng/homePage/rebecca_newspapers.png" alt="Rebecca" style="margin-top: -10px;" class="rebeccaImg" id="rebeccaImg">
// </div>

const homePageDisplayVAR = 
`<div class="homePage" id="homePage">
    <div class="centerHomepage" id="centerHomepage">
        <div class="book">
            <div class="sideBar">
            </div>
            <div style="display:flex; flex-direction: column; width:180px;">
                <h1 style="font-size: 30px; align-self: center;">Friends</h1>
                <form style="width:170px;">
                    <div class="form-group">
                        <select multiple class="form-control" id="exampleFormControlSelect2">
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        </select>
                    </div>
                    <input style="width: 170px; margin-top: 20px;"></input>
                    <div style="display:flex; justify-content: center; margin-top: 20px;">
                        <button class="buttonCreate type="submit"">ADD</button>
                    </div>
                </form>
            </div>
            <div class="cover">
                <p>SOCIAL</p>
            </div>
        </div>
    <div class="playButton" id="playButton">
        <button class="playImg fontTextPlay" id="playButtonImg">PLAY</button>
    </div>
    <div class="centerPlayDisplay" id="centerPlayDisplay">
        <div class="playDisplay" id="playDisplay">
            <!-- rapidPlayButton -->
            <div class="imgPlayMenu" id="firstElement">
            </div>
            <div class="imgPlayMenu" id="secondElement">
            </div>
            <div class="imgPlayMenu" id="thirdElement" style="display: none;">
            </div>
        </div>
    </div>
    <div class="wantedFriendHomePageDisplay">
        <button class="wantedProfile" id="wantedProfile">
            <img src="photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
            <p>USERNAME</p>
            <span>10.000</span>
        </button>
    </div>
</div>`;


class homePageClass
{
    constructor()
    {
        background.style.backgroundImage = "url('../static/photos/picturePng/homePage/luffyBackground.png')";
        this.centerHomepage = document.getElementById("centerHomepage");
        this.homePage = document.getElementById("homePage");
        
        
        this.submitFriendButton = document.getElementById("submitFriendButton");
        this.usernameAddFriend = document.getElementById("usernameAddFriend");
        this.addFriend = document.getElementById("addFriend");
        
        
        this.friendButton = document.getElementById("friendButton");
        this.buttonFriend = document.getElementById("buttonFriend");
        this.friendDisplay = document.getElementById("friendDisplay");
    
    
        this.wantedProfile = document.getElementById("wantedProfile");
        this.profilePage = document.getElementById("profilePage");
    
        this.wantedInProfilePage = document.getElementById("wantedInProfilePage");

        this.centerPlayDisplay = document.getElementById("centerPlayDisplay");



        
        this.playButton = document.getElementById("playButton");
        this.playButtonImg = document.getElementById("playButtonImg");
        this.playDisplay = document.getElementById("playDisplay");
        this.firstElement = document.getElementById("firstElement");
        this.secondElement = document.getElementById("secondElement");
        this.thirdElement = document.getElementById("thirdElement");

        this.lobby = document.getElementById("lobby");

        this.joinCreateLobbyHTML = `<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

        this.createLobbyButtonHTML =  `<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;

        this.localPlayButtonHTML = `<button class="localPlayButton fontTextPlay" id="localPlayButton">LOCAL PLAY</button>`;

        this.rapidPlayHTML = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

        this.TournamentButtonHTML =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;
    }
}
