
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
