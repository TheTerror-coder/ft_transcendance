class lobbyPageClass 
{
    constructor()
    {
        background.style.backgroundImage = "none";
        this.crossButton = document.querySelector("#crossButton");
        this.playButtonInLobby = document.querySelector("#playButtonInLobby");
        crossButton.onclick = () => refreshHomePage();
    }
}


const lobbyTwoPlayerDisplayVAR = 
`<div>
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="/photos/picturePng/lobbyPage/lobbyBackground.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div class="cross" id="cross">
                <button id="crossButton"><img src="/photos/picturePng/lobbyPage/cross.png" alt="quitButton"></button>
            </div>
            <div class="centerLobbyDisplay" id="centerLobbyDisplay">
                <div class="lobbyDisplayRapidPlayPlayerOne" id="lobbyDisplayRapidPlayPlayerOne">
                    <button class="wantedProfile">
                        <img src="/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
                        <p id="usernameDisplay">USERNAME</p>
                        <span>10.000</span>
                    </button>
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
            <div class="cross" id="cross">
                <button id="crossButton"><img src="../photos/picturePng/lobbyPage/cross.png" alt="quitButton"></button>
            </div>
            <div class="centerLobbyDisplay" id="centerLobbyDisplay">
                <div class="lobbyDisplayRapidPlayPlayerOne" id="lobbyDisplayRapidPlayPlayerOne">
                    <button class="wantedProfile">
                        <img src="../photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
                        <p id="usernameDisplay">USERNAME</p>
                        <span>10.000</span>
                    </button>
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
                    <button id="PlayButtonInLobby" class="PlayButtonInLobby">PLAY</button>
            </div>
        </div>
    </div>
</div>`;