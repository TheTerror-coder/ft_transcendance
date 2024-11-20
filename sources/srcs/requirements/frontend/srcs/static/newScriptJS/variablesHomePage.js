//HOME PAGE INFORMATION

const joinCodeDisplay = 
`
<div class="cross" id="cross">
    <button id="crossButton"><img src="../static/photos/picturePng/lobbyPage/cross.png" alt="quitButton"></button>
</div>
<div style="display:flex; justify-content: center; align-item: center;">
    <div style="display: flex;flex-direction: column; margin-left: 120px; margin-right: 120px;">
        <p class="fontConnexion">
            <input id="number" type="text" class="form-control" placeholder="Lobby Code" maxlength="4" style="font-family: arial;" required>
        </p>
        <button class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
    </div>
</div>`;

const joinCreateLobbyHTML = `<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

const createLobbyButtonHTML =  `<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;

const localPlayButtonHTML = `<button class="localPlayButton fontTextPlay" id="localPlayButton">LOCAL PLAY</button>`;

const rapidPlayHTML = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

const TournamentButtonHTML =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;



const centerPlayDisplayVAR =     
`
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
</div>`;

const homePageDisplayVAR = 
`<div style="display:flex">
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
            <img src="/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
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
   
        this.wantedProfile = document.getElementById("wantedProfile");
        
        this.playDisplay = document.getElementById("playDisplay");
        
        
        this.centerPlayDisplay = document.getElementById("centerPlayDisplay");
        this.playButton = document.getElementById("playButton");
        this.playButtonImg = document.getElementById("playButtonImg");
        this.firstElement = document.getElementById("firstElement");
        this.secondElement = document.getElementById("secondElement");
        this.thirdElement = document.getElementById("thirdElement");

        // this.joinCodeDisplay = 
        // `<div class="cross" id="cross">
        //     <button id="crossButton"><img src="../static/photos/picturePng/lobbyPage/cross.png" alt="quitButton"></button>
        // </div>
        // <div style="display:flex; justify-content: center; align-item: center;">
        //     <div style="display: flex;flex-direction: column; margin-left: 120px; margin-right: 120px;">
        //         <p class="fontConnexion">
        //             <input id="number" type="text" class="form-control" placeholder="Lobby Code" maxlength="4" style="font-family: arial;" required>
        //         </p>
        //         <button class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
        //     </div>
        // </div>`;

        // this.joinCreateLobbyHTML = `<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

        // this.createLobbyButtonHTML =  `<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;

        // this.localPlayButtonHTML = `<button class="localPlayButton fontTextPlay" id="localPlayButton">LOCAL PLAY</button>`;

        // this.rapidPlayHTML = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

        // this.TournamentButtonHTML =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;


    }
}
