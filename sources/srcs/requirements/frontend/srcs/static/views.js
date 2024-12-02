



async function UserProfileView(username, description, data)
{
	ELEMENTs.mainPage().innerHTML = usersProfilePage;
	ELEMENTs.mainPage().style.display = "flex";
	document.title = username +  " | " + PAGE_TITLE;
	window.history.pushState({}, "", URLs.VIEWS.PROFILE + username);

	console.log("usernam in userprofile :  ", username);
	// document.getElementsByClassName(".wantedProfileInProfilePage").style.alignSelf = "center";
	document.getElementsByClassName("wantedProfileInProfilePage")[0].style.alignSelf = "center";
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.)
	ELEMENTs.nameUser().innerHTML = username;
	// update berry gang

	// mettre en parametre les donnees du frero
	await getHistoric();
	await statsInProfilePage();

}


async function	homeView(title, description, data) 
{
	document.title = title;
	ELEMENTs.mainPage().innerHTML = homePageDisplayVAR;
	const response = await getAuthenticationStatus();

	background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	flag.className = "homepageFlag";
	flag.id = 'homepageFlag';
	let englandFlagImg = document.getElementById("englandFlagImg");
	englandFlagImg.className = "englandFlag";
	englandFlag.style.marginRight = "-0.01px";
	
	ELEMENTs.usernameOfWanted().innerHTML = response[2].user.display;
	ELEMENTs.primeAmount().innerHTML = "1 000 000 000";


	ELEMENTs.wantedProfile().onclick = () => profileView();
	console.log('homeView: ');
}


async function	loginView(title, description, data) {
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
	window.history.pushState({}, "", URLs.VIEWS.PROFILE);
	console.log("profile view");
	document.title = "Profile | " + PAGE_TITLE;

	background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	ELEMENTs.mainPage().innerHTML = profilePageDisplayVAR;
	console.log('Just BEFOREEEEEE response la fraude sa mere : URLs.USERMANAGEMENT.PROFILE', URLs.USERMANAGEMENT.PROFILE);
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);
	console.log("response: ", response);

	const responseJWT = await getAuthenticationStatus();
	ELEMENTs.changeUsernameButton().innerHTML = responseJWT[2].user.display;
	ELEMENTs.primeAmount().innerHTML = "10 000 000 000";

	await displayFriend(response.friends, response.user_socket);
	await displayWaitingListFriend(response.pending_requests);
	await getHistoric();
	await statsInProfilePage();
}

async function	createLobbyView(title, description, data) 
{
	document.title = title;
	ELEMENTs.mainPage().innerHTML = CreateJoinLobbyDisplayVAR;

	ELEMENTs.switchNumbersOfPlayers().addEventListener('change', function() 
	{
		if (ELEMENTs.switchNumbersOfPlayers().checked) 
		{
			ELEMENTs.zoroSanjiChibi().style.opacity = 1;
			ELEMENTs.luffyChibi().style.opacity = 0.4;
		} 
		else 
		{
			ELEMENTs.zoroSanjiChibi().style.opacity = 0.4;
			ELEMENTs.luffyChibi().style.opacity = 1;
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
	await _modal.show();
}

async function	error404View(title, description, data) {
	console.log('error 404 view');
	document.title = title;
}