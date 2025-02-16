

function isAlphanumeric(value) 
{
	return /^[a-zA-Z0-9]+$/.test(value);
}

const resetBaseHtmlVAR =
`
		<div class="headPage" id="headPage">
				<div class="button-container">
					<button class="buttonHeadPage">
						<div id="languageDiv">
							<img id="dropDownLanguage" src="/static/photos/picturePng/loginPage/drapeau/flagen.png" alt="flags for change language">
						</div>
					</button>
					<div id="soundDiv">
						<button><img id="buttonSound" src="/static/photos/picturePng/soundOff.png" alt="sound is on"></button>
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


window.addEventListener('popstate', function(event) {
	
	teamAvailable.team = 0;
	roleAvailableBlackBeard.role = 0;
	roleAvailableWhiteBeard.role = 0;
	nbBlackBeard = 0;
	nbWhiteBeard = 0;
	noticeDisconnect = null;
	tournamentAllUsers.clearUsers();
	UsersShufled.clearUsers();
	if (globalSocket !== null)
	{
		globalSocket.disconnect();
		globalSocket.close();
		globalSocket = null;
	}
	const canvases = document.querySelectorAll('canvas');
	if (canvases)
	{
		canvases.forEach(canvas => canvas.remove());
		ELEMENTs.allPage().innerHTML = resetBaseHtmlVAR;
		handleLocation();
	}
});