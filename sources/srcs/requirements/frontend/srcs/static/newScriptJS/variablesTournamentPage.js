
const joinTournamentVAR =
`
<div id="cross" style="margin-top: 5px;">
    <button><img src="/static/photos/picturePng/homePage/miniCross.png" alt="quitButton" id="cross"></button>
</div>
<div style="display:flex; justify-content: center; height: 700px; align-self: center; align-items: center;">
    <div style="display: flex;flex-direction: column;">
        <p class="fontConnexion">
            <input data-translate="placeholderJoinCode" id="number" type="text" class="form-control" placeholder="Tournament Code" maxlength="4" style="font-family: arial;" required>
        </p>
        <button data-translate="joinButton" id="joinButtonTournament" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">Join</button>
    </div>
</div>`;


const tournamentPageDisplayVAR = 
`
    <div style="justify-content: space-between;display: flex;">
        <div>
            <p class="tournamentCodeDisplay" data-translate="TournamentCode"></p>
            <p class="tournamentCodeDisplay" id="tournamentCode"></p>
        </div>
        <div style="display:flex; justify-content: end;"><button><img src="/static/photos/picturePng/cross.png" style="display:flex; flex-direction:flex-end; width:60px; height:60px;" id="cross"></button></div>
    </div>
    <div id="tournamentTitle" style="display:flex;"><p data-translate="Tournament" id="tournamentWrite">TOURNAMENT</p></div>
    <div id="tournamentContent"></div>
    <div id="tournamentStartDiv"><button id="startTournament" style="align-self:center;"><p data-translate="StartTournament" style="font-size: 60px;">START</p></button> 
        <div style="display:flex;"> 
            <p id="numbersOfPlayersTournament" class="writeNumbersOfPlayers">0</p><p class="writeNumbersOfPlayers">/</p><p class="writeNumbersOfPlayers">8</p>
        </div>
    </div>
`;

const tournamentCreateOrJoinVAR =
`
<div style="display:flex; justify-content: center; justify-items: center">
    <div id="centerTournament" style="display:flex;">
        <div style="display:flex; justify-content: end;"><button><img src="/static/photos/picturePng/cross.png" style="display:flex; flex-direction:flex-end; width:60px; height:60px;" id="cross"></button></div>
        <div style="align-self: center; align-items: center;" id="joinCreateTournament">
            <button id="joinTournamentButton"><p class="tournamentChoseJoinOrCreate" data-translate="joinTournament">JOIN TOURNAMENT</p></button>
            <button id="createTournamentButton"><p class="tournamentChoseJoinOrCreate" data-translate="createTournament">CREATE TOURNAMENT</p></button>
        </div>
    </div>
</div>
`;
