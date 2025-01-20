
// let currentSound = true;

// function changeMusic(newSource) 
// {
//     let newSourceElement = document.createElement('source');
//     newSourceElement.src = newSource;
//     newSourceElement.type = 'audio/mp3';

//     ELEMENTs.musicPlayer().innerHTML = '';

//     ELEMENTs.musicPlayer().appendChild(newSourceElement);

//     ELEMENTs.musicPlayer().load();
// 	console.log("currentSound dans changeMusic: ", currentSound);
// 	refreshMusic();
// }

// function OnOffMusic() 
// {
// 	if (ELEMENTs.musicPlayer().paused)
// 	{
// 		ELEMENTs.musicPlayer().play();
// 		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOn.png";
// 		ELEMENTs.buttonSound().alt = "sound is on !";
// 		currentSound = true;
// 	}
// 	else
// 	{
// 		ELEMENTs.musicPlayer().pause();
// 		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOff.png";
// 		ELEMENTs.buttonSound().alt = "sound is off !";
// 		currentSound = false;
// 	} 
// }

// function refreshMusic()
// {
// 	if (currentSound === true)
// 		ELEMENTs.musicPlayer().play();
// 	else
// 		ELEMENTs.musicPlayer().pause();
// }


const resetBaseHtmlVAR =
`        
<audio id="musicPlayer" loop>
			<source src="/static/sound/test.mp3" type="audio/mp3">
		</audio>
        <div class="headPage" id="headPage">
            <div class="button-container">
                <button class="buttonHeadPage">
                    <div id="languageDiv">
                        <img id="dropDownLanguage" src="/static/photos/picturePng/loginPage/drapeau/flagen.png" alt="flags for change language">
                    </div>
                </button>
				<div id="soundDiv">
					<button><img id="buttonSound" src="/static/photos/picturePng/soundOn.png" alt="sound is on"></button>
				</div>
               <div id="twoFA">
                   <label class="switch">
                   <input type="checkbox" id="switch2FA"/>
                   <span>
                       <em></em>
                       <strong></strong>
                   </span>
                   </label>
               </div>
           </div>
            <button style="width: 100px; height:70px;">
                <div class="logoutDoor" id="logoutDoor">
                    <div class="doorJamb" id="doorJamp">
                        <img class="chopperDoor" src="/static/photos/picturePng/chopperDoor.png" alt="logout">
                        <div id="logoutButton" class="logoutDoorPng">
                        </div>
                    </div>
                </div>
            </button>
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
		<script src="/static/newScriptJS/utils.js"></script>

        
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