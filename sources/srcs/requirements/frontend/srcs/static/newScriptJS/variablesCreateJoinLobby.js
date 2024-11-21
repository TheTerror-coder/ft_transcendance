

class CreateJoinLobbyClass
{
    constructor()
    {
        this.switchNumbersOfPlayers = document.getElementById("switchNumbersOfPlayers");
        this.luffyChibi = document.getElementById("luffyChibi");
        this.zoroSanjiChibi = document.getElementById("zoroSanjiChibi");
        this.buttonCreateLobby = document.getElementById("buttonCreate");
        this.cross = document.getElementById("cross");
        this.chooseTeamSwitch = document.getElementById("chooseTeamSwitch");

        this.cross.onclick = () => refreshHomePage();
        switchNumbersOfPlayers.addEventListener('change', function() {
            const time = 900;
            switchNumbersOfPlayers.disabled = true;
            setTimeout(() => {
                switchNumbersOfPlayers.disabled = false;
                }, time);
            if (switchNumbersOfPlayers.checked) 
            {
                zoroSanjiChibi.style.opacity = 1;
                luffyChibi.style.opacity = 0.4;
                chooseTeamSwitch.style.display = "flex";
            } 
            else 
            {
                zoroSanjiChibi.style.opacity = 0.4;
                luffyChibi.style.opacity = 1;
                chooseTeamSwitch.style.display = "none";

            }
        });

    }
}


function CreateLobbyDisplay() 
{
    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    else
    {
        ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }
    const crossButton = document.getElementById("crossButton");
    crossButton.onclick = () => refreshHomePage();
    const playButtonInLobby = document.getElementById("playButtonInLobby");
}



const CreateJoinLobbyDisplayVAR = 
`<div>
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="../static/photos/picturePng/lobbyPage/lobbyBackground.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div class="cross" id="cross">
                <button id="crossButton"><img src="/static/photos/picturePng/homePage/cross.png" alt="quitButton"></button>
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
            <div id="chooseTeamSwitch" style="display: none; flex-direction: ">
                <p> ICI CA VA CHOISIR SA TEAM EN LEGEEEEEENDE</p>
            </div>
            <div style="display: flex; justify-content: center;">
                <button class="buttonCreate" id="buttonCreate">Create</button>
            </div>
        </div>
    </div>
</div>`;
