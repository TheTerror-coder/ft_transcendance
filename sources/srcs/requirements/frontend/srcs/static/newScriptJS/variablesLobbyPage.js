
const wantedPlayerOne = 
`<div class="wantedFriendHomePageDisplay">
    <button class="wantedProfile">
        <img id="pictureOfWanted1" alt="profile picture" class="profilePicture">
        <p id="usernameOfWanted1"></p>
        <span id="primeAmount1"></span>
    </button>
</div>`

const wantedPlayerTwo = 
`<div class="wantedFriendHomePageDisplay">
    <button class="wantedProfile">
        <img id="pictureOfWanted2" alt="profile picture" class="profilePicture">
        <p id="usernameOfWanted2"></p>
        <span id="primeAmount2"></span>
    </button>
</div>`

const wantedPlayerThree = 
`<div class="wantedFriendHomePageDisplay">
    <button class="wantedProfile">
        <img id="pictureOfWanted3" alt="profile picture" class="profilePicture">
        <p id="usernameOfWanted3"></p>
        <span id="primeAmount3"></span>
    </button>
</div>`

const wantedPlayerFour = 
`<div class="wantedFriendHomePageDisplay">
    <button class="wantedProfile">
        <img id="pictureOfWanted4" alt="profile picture" class="profilePicture">
        <p id="usernameOfWanted4"></p>
        <span id="primeAmount4"></span>
    </button>
</div>`


// il faudra en faire un pour chaque joueur (sauf joueur 1)
const waitingPlayer2 =
`<div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerTwo">
    <div class="wrapper">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
    </div>
</div>`

const waitingPlayer3 =
`<div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerThree">
    <div class="wrapper">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
    </div>
</div>`

const waitingPlayer4 =
`<div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerFour">
    <div class="wrapper">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
    </div>
</div>`



const lobbyTwoPlayerDisplayVAR = 
`<div>
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="/photos/picturePng/lobbyPage/lobbyBackground.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div style="display:flex; justify-content: space-between;">
                <div class="lobbyCode">
                    <p class="lobbyCodeText">LOBBY: </p>
                    <p id="lobbyCode" class="lobbyCodeText"></p>
                </div>
            </div>
            <div class="centerLobbyDisplay" id="centerLobbyDisplay">
                <div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerOne">
                    <div class="wrapper">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerTwo">
                    <div class="wrapper">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <div class="versus" id="versus">
                    <img src="/photos/picturePng/lobbyPage/versusLogo.png" alt="versus">
                </div>
                <div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerThree">
                    <div class="wrapper">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerFour">
                    <div class="wrapper">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
            </div>
            <div class="fireBackground" id="fireBackground">
                    <button id="PlayButtonInLobby" class="PlayButtonInLobby">PLAY</button>
            </div>
        </div>
    </div>
</div>`;


const lobbyPageDisplayVAR = 
`<div>
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="../photos/picturePng/lobbyPage/lobbyBackground.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div style="display:flex; justify-content: space-between;">
                <div class="lobbyCode">
                    <p class="lobbyCodeText">LOBBY: </p>
                    <p id="lobbyCode" class="lobbyCodeText"></p>
                </div>
            </div>
            <div class="centerLobbyDisplay" id="centerLobbyDisplay">
                <div class="lobbyDisplayRapidPlayPlayerOne" id="lobbyDisplayRapidPlayPlayerOne">
                    <div class="wantedFriendHomePageDisplay">
                        <button class="wantedProfile" id="wantedProfile">
                            <img id="pictureOfWanted" alt="profile picture" class="profilePicture">
                            <p id="usernameOfWanted"></p>
                            <span id="primeAmount"></span>
                        </button>
                    </div>
                </div>
                <div class="versus" id="versus">
                    <img src="../photos/picturePng/lobbyPage/versusLogo.png" alt="versus">
                </div>
                <div class="lobbyDisplayRapidPlayPlayerTwo" id="lobbyDisplayRapidPlayPlayerTwo">
                    <div class="wrapper">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
            </div>
            <div class="fireBackground" id="fireBackground">
                    <button data-translate="Play" id="PlayButtonInLobby" class="PlayButtonInLobby">PLAY</button>
            </div>
        </div>
    </div>
</div>`;

const resetBaseHtmlVAR =
`        
<div class="headPage" id="headPage">
            <button style="width: 100px; height:70px;">
                <div class="logoutDoor" id="logoutDoor">
                    <div class="doorJamb" id="doorJamp">
                        <img class="chopperDoor" src="/static/photos/picturePng/chopperDoor.png" alt="logout">
                        <div id="logoutButton" class="logoutDoorPng">
                        </div>
                    </div>
                </div>
            </button>
             <div class="button-container">
                <div id="twoFA">
                    <label class="switch">
                    <input type="checkbox" id="switch2FA"/>
                    <span>
                        <em></em>
                        <strong></strong>
                    </span>
                    </label>
                </div>
                <button class="buttonHeadPage">
                    <div id="languageDiv">
                        <img id="dropDownLanguage" src="/static/photos/picturePng/loginPage/drapeau/flagen.png" alt="flags for change language">
                    </div>
                </button>
            </div>
        </div>
        <div id="mainPage" style="flex: 1;">
        </div>
        <!-- --------------- PONG FILES LIST START --------------- -->
        <script src="/static/newScriptJS/socketPong.js"></script>
        <!-- ----------------- PONG FILES LIST END ----------------- -->
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> <!-- SweetAlert2 pour le popup de l'invit, voir avec bootstrap-->
        <script src="/static/newScriptJS/logout.js"></script>
        <script src="/static/newScriptJS/variablesLoginPage.js"></script>
        <script src="/static/newScriptJS/lobbyPage.js"></script>
        <script src="/static/newScriptJS/createLobby.js"></script>
        <script src="/static/newScriptJS/variablesHomePage.js"></script>
        <script src="/static/newScriptJS/variablesCreateJoinLobby.js"></script>
        <script src="/static/newScriptJS/variablesLobbyPage.js"></script>
        <script src="/static/newScriptJS/variablesProfilePage.js"></script>
        <script src="/static/newScriptJS/variablesTournamentPage.js"></script>
        <script src="/static/newScriptJS/homePage.js"></script>
        <script src="/static/newScriptJS/connectNormal.js"></script>
        <script src="/static/newScriptJS/formCreateAccount.js"></script>
        <script src="/static/newScriptJS/playMenu.js"></script>
        <script src="/static/newScriptJS/lobbyPage.js"></script>
        <script src="/static/newScriptJS/404Page.js"></script>
        <script src="/static/newScriptJS/profilePage.js"></script>
        <script src="/static/newScriptJS/tournament.js"></script>
        
        <script src="/static/oauth/alerter.js"></script>
		<script src="/static/oauth/fragments/mfa.js"></script>
		<script src="/static/oauth/fragments/email-verification.js"></script>
		<script src="/static/oauth/fragments/modal.js"></script>
		<script src="/static/oauth/jobs.js"></script>
		<script src="/static/oauth/functions.js"></script>
		<script src="/static/oauth/allauth.js"></script>
        <script src="/static/newScriptJS/join.js"></script>
		<script src="/static/views.js"></script>
		<script src="/static/router.js"></script>
`;