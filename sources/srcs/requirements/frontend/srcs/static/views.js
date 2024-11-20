

async function	homeView(title, description, data) 
{
	console.log('you are home page view');
	document.title = title;
	ELEMENTs.mainPage().innerHTML = homePageDisplayVAR;

	background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	flag.className = "homepageFlag";
	flag.id = 'homepageFlag';
	let englandFlagImg = document.getElementById("englandFlagImg");
	englandFlagImg.className = "englandFlag";
	englandFlag.style.marginRight = "-0.01px";
	// ELEMENTs.playButtonImg.onclick = () => playDisplayHomepage();  TO DO: A FAIRE
	// ELEMENTs.wantedProfile.onclick = () => profileDisplay();
}


async function	loginView(title, description, data) {
	console.log('you are at login view');
	// if (await isUserAuthenticated())
	// 	window.location.replace(URLs.VIEWS.HOME);
	document.title = title;
	ELEMENTs.mainPage().innerHTML = loginPageDisplayVAR;
	background.style.backgroundImage = "url('/static/photos/picturePng/loginPage/landscapeOnePiece.png')";
	
	// const myModal = new bootstrap.Modal('#loginModal', {
		// 	keyboard: false
		//   })
		//   myModal.show();
}
async function	profileView(title, description, data) 
{
	document.title = title;
	background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	ELEMENTs.mainPage().innerHTML = profilePageDisplayVAR;
}

async function	createLobbyView(title, description, data) 
{
	document.title = title;
	ELEMENTs.mainPage().innerHTML = CreateJoinLobbyDisplayVAR;


	ELEMENTs.switchNumbersOfPlayers().addEventListener('change', function() {
		const time = 900;
		ELEMENTs.switchNumbersOfPlayers().disabled = true;
		setTimeout(() => {
			ELEMENTs.switchNumbersOfPlayers().disabled = false;
			}, time);
		if (ELEMENTs.switchNumbersOfPlayers().checked) 
		{
			ELEMENTs.zoroSanjiChibi().style.opacity = 1;
			ELEMENTs.luffyChibi().style.opacity = 0.4;
			ELEMENTs.chooseTeamSwitch().style.display = "flex";
		} 
		else 
		{
			ELEMENTs.zoroSanjiChibi().style.opacity = 0.4;
			ELEMENTs.luffyChibi().style.opacity = 1;
			ELEMENTs.chooseTeamSwitch().style.display = "none";
		}
	});
	ELEMENTs.cross().onclick = () => refreshHomePage();
}

async function	providerCallbackView(title, description, data) {
	console.log('provider callback view');
	document.title = title;
	const params = {};

	if (await isUserAuthenticated(params)){
		if (!await isTotpEnabled()){
			await mfaJob(undefined, totp_active=false);
			return ;
		}
		await postAuthMiddlewareJob();
	}
	else {
		await doPendingFlows(params, flows=params?.flows);
		return ;
	}
}

async function	emailStatusView(title, description, data) {
	console.log('email status view');
	document.title = title;
	
	let index;
	let _params = {};
	
	// get email verification information 
	const verification = await getEmailVerification(data.querystring.key);
	if (verification.find(_data => _data === 'verification-information')){
		console.log('Function emailStatusView(): verification-information');
		if (verification[2].email && verification[3].is_authenticating){
			index = VARIABLEs.VERIFY_EMAIL.INDEXES.VERIFY_EMAIL;
			//save email verfication key
			window.sessionStorage.setItem(X_EMAIL_VERIFICATION_KEY, data.querystring.key)
		}
		else if (!verification[2].email){
			index = VARIABLEs.VERIFY_EMAIL.INDEXES.INVALID_LINK;
		}
		else {
			index = VARIABLEs.VERIFY_EMAIL.INDEXES.EMAIL_CONFIRMED_YET;
		}
	}
	else if (verification.find(_data => _data === 'input-error')){
		console.log('Function emailStatusView(): input-error');
		index = VARIABLEs.VERIFY_EMAIL.INDEXES.INVALID_LINK;
	}
	else if (verification.find(_data => _data === 'email-verification-not-pending')){
		console.log('Function emailStatusView(): email-verification-not-pending');
		console.log("Error 409: email-verification-not-pending");
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Email', 'Email verification is not pending');
		await askRefreshSession();
		return ;
	}
	else {
		console.log('Function emailStatusView(): Error somewhere');
		return;
	}
	_params.index = index;
	// add to params the data returned when requested email-verification-information. e.g username, email
	_params = {
		..._params,
		...verification[2],
	};
	await fragment_loadModalTemplate();
	const html = await fragment_emailVerification(_params);
	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = new bootstrap.Modal('#oauth-modal', {
		keyboard: false,
	});
	_modal.show();
}

async function	error404View(title, description, data) {
	console.log('error 404 view');
	document.title = title;
}
