

const TeamAndRoleTwoPlayerLobbyVAR =
`
<div style="height: 493px; margin-left: 200px; margin-right: 200px;">
    <div id="chooseTeamSwitchDisplay" style="display: flex; flex-direction: column; margin-left: 140px; margin-right: 140px;">
        <div style="align-self: center;">
            <p data-translate="ChooseYourTeam" style="font-size: 30px;font-weight: bolder;margin-bottom:0px;">Choose Your Team !</p>
        </div>
        <div>
            <div style="display:flex; justify-content: space-between; height:246px;">
                <div style="display:flex; flex-direction: column;" id="KurohigeTeam">
                    <p data-translate="kurohige" class="teamChooseFont"> Black Beard </p>
                    <img src="/photos/picturePng/lobbyPage/BackgroundKurohige.png" id="KurohigeTeamDisplay">
                </div>
                <div class="container">
                    <input type="checkbox" name="chooseTeamSwitch" id="chooseTeamSwitch" />
                    <label for="chooseTeamSwitch" class="label"> </label>
                </div>
                <div style="display:flex; flex-direction: column; width: 190px;" id="ShirohigeTeam">
                    <p data-translate="shirohige" class="teamChooseFont" style="width: 190px;">White Beard</p>
                    <img src="/photos/picturePng/lobbyPage/BackgroundShirohige.png" id="ShirohigeTeamDisplay">
                </div>
            </div>
        </div>
    </div>
    <div id="chooseRoleDisplay" style="display: flex; flex-direction: column;margin-left: 140px; margin-right: 140px;">
        <div style="align-self: center;">
            <p data-translate="ChooseRole" style="font-size: 30px;font-weight: bolder;margin-bottom:0px;"> Choose Your Role ! </p>
        </div>
        <div style="display:flex; justify-content: space-between; height:246px;">
            <div id="helmsmanRoleDisplay">
                <p data-translate="Helmsman" class="teamChooseFont" style="margin-left: 12px;"> Helmsman </p>
            </div>
                <div class="container">
                    <input type="checkbox" name="chooseRoleSwitch" id="chooseRoleSwitch" />
                    <label for="chooseRoleSwitch" class="label"> </label>
                </div>
            <div id="gunnerRoleDisplay">
                <p data-translate="Gunner" class="teamChooseFont" style="display:flex; justify-content: center;"> Gunner </p>
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
            <div >
                <button id="crossButton"><img id="cross" src="/static/photos/picturePng/cross.png" alt="quit Button"></button>
            </div>
            <div id="contentCreateLobby" style="display: flex; flex-direction: column; height: 600px;">
                <div style="display: flex; justify-content: center;">
                    <p data-translate="PlayersPerTeams" style="font-size:70px;">NUMBERS OF PLAYERS PER TEAMS</p>
                </div>
                <div class="createLobbySwitch">
                    <img src="../static/photos/picturePng/lobbyPage/luffyChibi.png" alt="One" id="luffyChibi">
                    <div class="container">
                        <input type="checkbox" name="switchNumbersOfPlayers" id="switchNumbersOfPlayers" />
                        <label for="switchNumbersOfPlayers" class="label"> </label>
                    </div>
                    <img src="/static/photos/picturePng/lobbyPage/sanjiAndZoroChibi.png" alt="Two" id="zoroSanjiChibi">
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <button data-translate="CreateButton" class="buttonCreate" id="buttonCreate">Create</button>
            </div>
        </div>
    </div>
</div>`;