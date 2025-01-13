
const tournamentPageDisplayVAR = 
`
    <div style="display:flex; justify-content: end;"><button><img src="/static/photos/picturePng/cross.png" style="display:flex; flex-direction:flex-end; width:60px; height:60px;" id="cross"></button></div>
    <div id="tournamentTitle" style="display:flex;"><p data-translate="Tournament" id="tournamentWrite">TOURNAMENT</p></div>
    <div id="tournamentContent"></div>
    <div id="tournamentStartDiv"><button id="startTournament" style="align-self:center;"><p style="font-size: 60px;">START</p></button> 
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
