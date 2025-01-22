
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


const Page404DisplayVAR = 
`<div class="Page404">
    <p style="font-family: arial; font-size: 100px;">ERROR:404</p>
    <p style="font-family: arial;">WRONG PAGE</p>
	<button data-translate="redirect" id="redirectButton" class="redirectButton">redirect</button>
</div>`;


const getLogOutPopUp = 
`
	<div class="modal-body">
		<div style="justify-content: center; display: flex; font-size: 60px;">
			<p style="font-size: 40px;" data-translate="leavingDoor">Do you wanna leave ?</p>
		</div>
		<div class="d-flex justify-content-center align-items-center">
			<button data-translate="yes" id="yesButton" type="button" class="btn btn-primary" style="margin-right: 160px;">YES</button>
			<button data-translate="no" id="noButton" type="button" class="btn btn-primary" style="--bs-btn-border-color: red;--bs-btn-hover-bg: #a90000;--bs-btn-hover-border-color: #b30000;--bs-btn-active-bg: #c70000;--bs-btn-bg: red;">NO</button>
		</div>
	</div>
	`;
