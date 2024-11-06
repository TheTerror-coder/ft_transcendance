

class CreateJoinLobbyClass
{
    constructor()
    {
        this.switchNumbersOfPlayers = document.getElementById("switchNumbersOfPlayers");
        this.luffyChibi = document.getElementById("luffyChibi");
        this.zoroSanjiChibi = document.getElementById("zoroSanjiChibi");
        this.buttonCreateLobby = document.getElementById("buttonCreateLobby");


        switchNumbersOfPlayers.addEventListener('change', function() {
            const time = 900;
            switchNumbersOfPlayers.disabled = true;
            setTimeout(() => {
                switchNumbersOfPlayers.disabled = false;
                }, time);
            if (switchNumbersOfPlayers.checked) 
            {
            zoroSanjiChibi.style.opacity = 1;
            luffyChibi.style.opacity = 0.7;
            } 
            else 
            {
            zoroSanjiChibi.style.opacity = 0.7;
            luffyChibi.style.opacity = 1;
            }
        });
        window.addEventListener('DOMContentLoaded', () => {
            switchNumbersOfPlayers.checked = false;
            zoroSanjiChibi.style.opacity = 0.7;
            luffyChibi.style.opacity = 1;
          });

    }
}


function CreateLobbyDisplay(state) 
{
    if (state.switchNumbersOfPlayers.checked == false)
    {
        mainPage.innerHTML = lobbyPageDisplayVAR;
    }
    else
    {
        mainPage.innerHTML = "";
    }
}



const CreateJoinLobbyDisplayVAR = 
`<div class="lobby" id="lobby">
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="../static/photos/picturePng/lobbyPage/luffy-vs-usopp.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div class="cross" id="cross">
                <button id="crossButton"><img src="../static/photos/picturePng/lobbyPage/cross.png" alt="quitButton"></button>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: center;">
                    <p style="font-size:70px;">NUMBERS OF PLAYERS PER TEAMS</p>
                </div>
                <div class="createLobbySwitch">
                    <img src="../static/photos/picturePng/lobbyPage/luffyChibi.png" alt="One" class="luffyChibi" id="luffyChibi">
                    <div class="radioInput">
                        <input type="checkbox" role="switch" class="liquid-3" id="switchNumbersOfPlayers" /> 
                    </div>
                    <img src="../static/photos/picturePng/lobbyPage/sanjiAndZoroChibi.png" alt="Two" class="zoroSanjiChibi" id="zoroSanjiChibi">
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <button id="buttonCreateLobby"> CHELOU </button>
            </div>
        </div>
    </div>
</div>`;