const joinTwoPlayersVAR = 

`<div class="crossPlayMenu" id="cross">
    <button id="returnButtonPlayMenu"><img src="/static/photos/picturePng/homePage/miniCross.png" alt="quitButton"></button>
</div>
<div id="chooseTeamSwitchDisplay" style="display: flex; flex-direction: column;">
    <div style="align-self: center;">
        <p data-translate="ChooseYourTeam" style="font-size: 30px;font-weight: bolder;margin-bottom:0px;">Choose Your Team !</p>
    </div>
    <div>
        <div style="display:flex; justify-content: space-between;">
            <div style="display:flex; flex-direction: column;" id="KurohigeTeam">
                <p class="teamChooseFontHomePage" style="font-size: 25px;"> Black Beard </p>
                <img src="/photos/picturePng/lobbyPage/BackgroundKurohige.png" id="KurohigeTeamDisplay" style="height: 130px;">
            </div>
            <div class="container">
                <input type="checkbox" name="chooseTeamSwitch" id="chooseTeamSwitch" />
                <label for="chooseTeamSwitch" class="labelJoin"> </label>
            </div>
            <div style="display:flex; flex-direction: column;" id="ShirohigeTeam">
                <p class="teamChooseFontHomePage" style="font-size: 25px;"> White Beard </p>
                <img src="/photos/picturePng/lobbyPage/BackgroundShirohige.png" id="ShirohigeTeamDisplay" style="height: 130px;">
            </div>
        </div>
    </div>
</div>
<div id="chooseRoleDisplay" style="display: flex; flex-direction: column;">
    <div style="align-self: center;">
        <p data-translate="ChooseRole" style="font-size: 30px;font-weight: bolder;margin-bottom:0px;"> Choose Your Role ! </p>
    </div>
    <div style="display:flex; justify-content: space-between; height: 140px;">
        <div id="helmsmanRoleDisplay">
            <p data-translate="Helmsman" class="teamChooseFontHomePage" style="font-size: 25px; margin-top: 10px;"> Helmsman </p>
        </div>
            <div class="container">
                <input type="checkbox" name="chooseRoleSwitch" id="chooseRoleSwitch" />
                <label for="chooseRoleSwitch" class="labelJoin"> </label>
            </div>
        <div id="gunnerRoleDisplay">
            <p data-translate="Gunner" class="teamChooseFontHomePage" style="display:flex; justify-content: center; font-size: 25px;"> Gunner </p>
        </div>
    </div>
</div>
    <button data-translate="joinButton" id="joinButton" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
</div>`;


const localPlayDisplay = 
`
<div class="crossPlayMenu" id="cross">
    <button id="returnButtonPlayMenu"><img src="/static/photos/picturePng/homePage/miniCross.png" alt="quitButton"></button>
</div>
<div style="display:flex; justify-content: center; align-item: center;">
    <div style="display: flex;flex-direction: column; margin-left: 120px; margin-right: 120px; margin-bottom: 200px;">
        <button data-translate="Ready" id="readyButton" class="fontConfirmCreateAccount" style="justify-content: center; margin-top: -20px; font-size: 400%;">Ready</button>
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
            <input data-translate="placeholderJoinCode" id="number" type="text" class="form-control" placeholder="Lobby Code" maxlength="4" style="font-family: arial;" required>
        </p>
        <button data-translate="joinButton" id="joinButton" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
    </div>
</div>`;

const joinCreateLobbyHTML = `<button data-translate="JoinLobby" class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>`;

const createLobbyButtonHTML =  `<button data-translate="CreateLobby" class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>`;

const localPlayButtonHTML = `<button data-translate="localPlay" class="localPlayButton fontTextPlay" id="localPlayButton">LOCAL PLAY</button>`;

const rapidPlayHTML = `<button data-translate="rapidPlay" class="fontTextPlay rapidPlayButton" id="rapidPlayButton">RAPID PLAY</button>`;

const TournamentButtonHTML =`<button data-translate="Tournament" id="tournamentButton" class="fontTextPlay">TOURNAMENT</button>`;


const homePageDisplayVAR = 
`<div style="display:flex">
    <div class="centerHomepage" id="centerHomepage">
        <div class="book">
            <div class="sideBar">
            </div>
            <div style="display:flex; flex-direction: column; width:180px;">
            <h1 data-translate="Friends" style="font-size: 30px; align-self: center;">Friends</h1>
                <input style="width: 170px; margin-top: 20px;" id="usernameAddFriend"></input>
                <div style="display:flex; justify-content: center; margin-top: 20px;">
                    <button data-translate="AddFriend" class="buttonCreate" type="submit" id="addFriendButton">ADD</button>
                </div>
            </div>
            <div class="cover">
            </div>
        </div>
    <div class="playButton" id="playButton">
        <button data-translate="Play" class="playImg fontTextPlay" id="playButtonImg" style="font-size:600%;">PLAY</button>
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
            <span id="primeAmount"></span>
        </button>
    </div>
</div>`;