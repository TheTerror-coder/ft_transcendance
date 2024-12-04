//HOME PAGE INFORMATION


const joinTwoPlayersVAR = 

`<div class="crossPlayMenu" id="cross">
    <button id="returnButtonPlayMenu"><img src="/static/photos/picturePng/homePage/miniCross.png" alt="quitButton"></button>
</div>
<div style="display:flex; justify-content: center; align-item: center;">
    <div id="chooseTeamSwitchDisplay" style="display: flex; flex-direction: column; margin-left: 140px; margin-right: 140px;">
        <div style="align-self: center;">
            <p style="font-size: 30px;font-weight: bolder;margin-bottom:0px;">Choose Your Team !</p>
        </div>
        <div>
            <div style="display:flex; justify-content: space-between; height:246px;">
                <div style="display:flex; flex-direction: column;" id="KurohigeTeam">
                    <p class="teamChooseFont"> Black Beard </p>
                    <img src="/photos/picturePng/lobbyPage/BackgroundKurohige.png" id="KurohigeTeamDisplay">
                </div>
                <div class="container">
                    <input type="checkbox" name="chooseTeamSwitch" id="chooseTeamSwitch" />
                    <label for="chooseTeamSwitch" class="label"> </label>
                </div>
                <div style="display:flex; flex-direction: column;" id="ShirohigeTeam">
                    <p class="teamChooseFont"> White Beard </p>
                    <img src="/photos/picturePng/lobbyPage/BackgroundShirohige.png" id="ShirohigeTeamDisplay">
                </div>
            </div>
        </div>
    </div>
    <div id="chooseRoleDisplay" style="display: flex; flex-direction: column;margin-left: 140px; margin-right: 140px;">
        <div style="align-self: center;">
            <p style="font-size: 30px;font-weight: bolder;margin-bottom:0px;"> Choose Your Role ! </p>
        </div>
        <div style="display:flex; justify-content: space-between; height:246px;">
            <div id="helmsmanRoleDisplay">
                <p class="teamChooseFont" style="margin-left: 12px;"> Helmsman </p>
            </div>
                <div class="container">
                    <input type="checkbox" name="chooseRoleSwitch" id="chooseRoleSwitch" />
                    <label for="chooseRoleSwitch" class="label"> </label>
                </div>
            <div id="gunnerRoleDisplay">
                <p class="teamChooseFont" style="display:flex; justify-content: center;"> Gunner </p>
            </div>
        </div>
    </div>
        <button id="joinButton" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
    </div>
</div>`;

const joinCodeDisplay = 
`
<div class="crossPlayMenu" id="cross">
    <button id="returnButtonPlayMenu"><img src="/static/photos/picturePng/homePage/miniCross.png" alt="quitButton"></button>
</div>
<div style="display:flex; justify-content: center; align-item: center;">
    <div style="display: flex;flex-direction: column; margin-left: 120px; margin-right: 120px; margin-bottom: 200px;">
        <p class="fontConnexion">
            <input id="number" type="text" class="form-control" placeholder="Lobby Code" maxlength="4" style="font-family: arial;" required>
        </p>
        <button id="joinButton" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
    </div>
</div>`;

const joinCreateLobbyHTML = `<button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

const createLobbyButtonHTML =  `<button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;

const localPlayButtonHTML = `<button class="localPlayButton fontTextPlay" id="localPlayButton">LOCAL PLAY</button>`;

const rapidPlayHTML = `<button class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

const TournamentButtonHTML =`<button id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;

{/* <form style="width:170px;">
<div class="form-group">
    <select multiple class="form-control" id="exampleFormControlSelect2">
    <option>Username</option>
    <option>Username</option>
    <option>Username</option>
    <option>Username</option>
    <option>Username</option>
    </select>
</div>
</form> */}



const homePageDisplayVAR = 
`<div style="display:flex">
    <div class="centerHomepage" id="centerHomepage">
        <div class="book">
            <div class="sideBar">
            </div>
            <div style="display:flex; flex-direction: column; width:180px;">
            <h1 style="font-size: 30px; align-self: center;">Friends</h1>
                <input style="width: 170px; margin-top: 20px;" id="usernameAddFriend"></input>
                <div style="display:flex; justify-content: center; margin-top: 20px;">
                    <button class="buttonCreate type="submit" id="addFriendButton">ADD</button>
                </div>
            </div>
            <div class="cover">

            </div>
        </div>
    <div class="playButton" id="playButton">
        <button class="playImg fontTextPlay" id="playButtonImg">PLAY</button>
    </div>
    <div class="centerPlayDisplay" id="centerPlayDisplay">
        <div class="playDisplay" id="playDisplay">
            <div class="crossPlayMenu">
                <button id="returnButtonPlayMenu"><img src="/static/photos/picturePng/homePage/miniCross.png" alt="Return Back"></button>
            </div>
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
            <img id="pictureOfWanted" alt="profile picture" class="profilePicture">
            <p id="usernameOfWanted"></p>
            <span id="primeAmount">10.000</span>
        </button>
    </div>
</div>`;


// id="wantedProfile"