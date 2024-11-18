async function	homeView(title, description, data) {
	console.log('you are home view');
	document.title = title;

	// verifier si le frere est connecte
	const homePage = new homePageClass();
	flag.className = "homepageFlag";
	flag.id = 'homepageFlag';
	// homePage.rebeccaImg.style.display = 'block';
	let englandFlagImg = document.querySelector("#englandFlagImg");
	englandFlagImg.className = "englandFlag";
	englandFlag.style.marginRight = "-0.01px";
	homePage.playButtonImg.onclick = () => playDisplayHomepage(homePage);
	homePage.wantedProfile.onclick = () => profileDisplay();
	// const profile = await makeRequest('POST', URLs.PROFILE_endp);
	// const html = await getHtml(PAGE_ROUTEs.HOME);
	// ELEMENTs.mainPage().innerHTML = html;
	// ELEMENTs.statusDiv().innerHTML = 'status: ' + profile.status;
	// ELEMENTs.usernameDiv().innerHTML = 'user: ' + profile.username;
	// ELEMENTs.firstnameDiv().innerHTML = 'firstname: ' + profile.firstname;
	// ELEMENTs.lastnameDiv().innerHTML = 'lastname: ' + profile.lastname;
	// ELEMENTs.emailDiv().innerHTML = 'email: ' + profile.email;
	// ELEMENTs.profile_image().setAttribute('src', profile.profile_image)
}

async function	loginView(title, description, data) {
	console.log('you are at login view');
	// if (await isUserAuthenticated())
	// 	window.location.replace(URLs.VIEWS.HOME);
	document.title = title;
	ELEMENTs.mainPage().innerHTML = loginPageDisplayVAR;
	background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	
	// const myModal = new bootstrap.Modal('#loginModal', {
		// 	keyboard: false
		//   })
		//   myModal.show();
}
async function	profileView(title, description, data) {
	background.style.backgroundImage = "url('/static/static/photos/picturePng/homePage/luffyBackground.png')";
}

async function	createLobbyView(title, description, data) {
	const lobby = new CreateJoinLobbyClass();
	lobby.buttonCreateLobby.onclick = () => CreateLobbyDisplay(lobby);
	// verifier si le frere est connecte
	// const lobbyPage = new lobbyPageClass();
	// lobbyPage.crossButton.onclick = () => handleLocation();
	// lobbyPage.playButtonInLobby.onclick = () => handleLocation();
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
