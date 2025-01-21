
// the price will be the mera mera no mi
const binaryTreeVAR =
`
<div id="backgroundBinaryTree">
    <div class="binaryTree">
        <div id="fruitWinDiv">
            <p id="winnerOfTheTournament"></p>
        </div>
        <div style="align-self: center;">
            <p data-translate="final" class="stageWriteTournament" >final</p>
        </div>
        <div id="finalTournament" class="stepInTournament">
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="13" class="text"></span>
                    <span data-match="13" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span data-match="14" class="text"></span>
                    <span data-match="14" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
        </div>
        <div style="align-self: center;">
            <p data-translate="semiFinal" class="stageWriteTournament" >semi final</p>
        </div>
        <div id="secondStepTournament" class="stepInTournament">
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="9" class="text"></span>
                    <span data-match="9" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span  data-match="10" class="text"></span>
                    <span  data-match="10"data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
            <div class="matchTournament">
                <button class="btn-23">
                    <span  data-match="11" class="text"></span>
                    <span  data-match="11"data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span  data-match="12" class="text"></span>
                    <span  data-match="12" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
        </div>
        <div style="align-self: center;">
            <p data-translate="quarterFinal" class="stageWriteTournament" ></p>
        </div>
        <div id="firstStepOfTournament" class="stepInTournament">
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="1" class="text"></span>
                    <span data-match="1" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span data-match="2" class="text"></span>
                    <span data-match="2" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="3" class="text"></span>
                    <span data-match="3" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span data-match="4" class="text"></span>
                    <span data-match="4" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="5" class="text"></span>
                    <span data-match="5" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span data-match="6" class="text"></span>
                    <span data-match="6" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
            <div class="matchTournament">
                <button class="btn-23">
                    <span data-match="7" class="text"></span>
                    <span data-match="7" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
				<img class="versusImgInTournament" src="/static/photos/picturePng/tournament/versusInTournament.png">
                <button class="btn-23">
                    <span data-match="8" class="text"></span>
                    <span data-match="8" data-translate="empty" aria-hidden="" class="marquee">empty</span>
                </button>
            </div>
        </div>
    </div>
    <div id="tournamentStartDiv">
        <button id="startButtonTournament"><p id="startTournament" data-translate="StartTournament">START</p></button> 
    </div>
</div>
`





const joinTournamentVAR =
`
<div id="cross" style="margin-top: 5px; align-self: end;">
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
	</div>
	<div id="tournamentTitle" style="display:flex;"><p data-translate="Tournament" id="tournamentWrite">TOURNAMENT</p></div>
	<div id="tournamentContent"></div>
	<div id="tournamentStartDiv">
		<div style="display:flex; align-items: center;"> 
			<p id="numbersOfPlayersTournament" class="writeNumbersOfPlayers"></p><p class="writeNumbersOfPlayers">/</p><p class="writeNumbersOfPlayers">8</p>
		</div>
	</div>
`;

const tournamentCreateOrJoinVAR =
`
<div style="display:flex; justify-content: center; justify-items: center">
    <div id="centerTournament" style="display:flex;">
        <div style="align-self: center; align-items: center;" id="joinCreateTournament">
            <button id="joinTournamentButton"><p class="tournamentChoseJoinOrCreate" data-translate="joinTournament">JOIN TOURNAMENT</p></button>
            <button id="createTournamentButton"><p class="tournamentChoseJoinOrCreate" data-translate="createTournament">CREATE TOURNAMENT</p></button>
        </div>
    </div>
</div>
`;
