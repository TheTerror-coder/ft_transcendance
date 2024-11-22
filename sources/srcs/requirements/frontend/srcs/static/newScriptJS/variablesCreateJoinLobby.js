
function CreateLobbyDisplay() 
{
    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    else
    {
        ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    }
    const crossButton = document.getElementById("crossButton");
    crossButton.onclick = () => refreshHomePage();
    const playButtonInLobby = document.getElementById("playButtonInLobby");
}


const TeamAndRoleTwoPlayerLobbyVAR =
`
<div>
    <div id="chooseTeamSwitchDisplay">
        <div style="align-self: center;">
            <p>Choose Your Team !</p>
        </div>
        <div>
            <div style="display:flex; justify-content: space-between">
                <div id="KurohigeTeamDisplay">
                    <p class="teamChooseFont"> Team Kurohige </p>
                </div>
                <div class="container">
                    <input type="checkbox" name="chooseTeamSwitch" id="chooseTeamSwitch" />
                    <label for="chooseTeamSwitch" class="label"> </label>
                </div>
                <div id="MugiwaraTeamDisplay">
                    <p class="teamChooseFont"> Team Mugiwara </p>
                </div>
            </div>
        </div>
    </div>
    <div id="chooseRoleDisplay">
        <div style="align-self: center;">
            <p> Choose Your Role ! </p>
        </div>
        <div style="display:flex; justify-content: space-between;">
            <div id="helmsmanRoleDisplay">
                <p class="teamChooseFont"> Helmsman </p>
            </div>
                <div class="container">
                    <input type="checkbox" name="chooseRoleSwitch" id="chooseRoleSwitch" />
                    <label for="chooseRoleSwitch" class="label"> </label>
                </div>
            <div id="gunnerRoleDisplay">
                <p class="teamChooseFont"> Gunner </p>
            </div>
        </div>
    </div>
</div>
` 



const CreateJoinLobbyDisplayVAR = 
`<div>
    <video class="videoBackground" id="videoBackground" autoplay muted loop>
        <source src="../static/photos/picturePng/lobbyPage/lobbyBackground.mp4" type="video/mp4" style="z-index: -1;">
    </video>
    <div style="display: flex; justify-content: center; width: -webkit-fill-available;">
        <div class="lobbyRapidPlay" id="lobbyRapidPlay">
            <div class="cross">
                <button id="crossButton"><img id="cross" src="/static/photos/picturePng/cross.png" alt="quit Button"></button>
            </div>
            <div id="contentCreateLobby" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: center;">
                    <p style="font-size:70px;">NUMBERS OF PLAYERS PER TEAMS</p>
                </div>
                <div class="createLobbySwitch">
                    <img src="../static/photos/picturePng/lobbyPage/luffyChibi.png" alt="One" class="luffyChibi" id="luffyChibi">
                    <div class="container">
                        <input type="checkbox" name="switchNumbersOfPlayers" id="switchNumbersOfPlayers" />
                        <label for="switchNumbersOfPlayers" class="label"> </label>
                    </div>
                    <img src="/static/photos/picturePng/lobbyPage/sanjiAndZoroChibi.png" alt="Two" class="zoroSanjiChibi" id="zoroSanjiChibi">
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <button class="buttonCreate" id="buttonCreate">Create</button>
            </div>
        </div>
    </div>
</div>`;
