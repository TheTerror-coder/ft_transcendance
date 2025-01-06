
//TODO: Nico: ?? this one is not used
//metre a joue les infos, si le user change de nom

async function tournamentView(title, description, data) 
{
	document.title = title;
	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.mainPage().innerHTML = tournamentCreateOrJoinVAR;
	ELEMENTs.twoFA().style.display = 'none';
	refreshLanguage();
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/tournament/colosseum.png')";
	ELEMENTs.joinTournamentButton().onclick = () => joinTournament();
	ELEMENTs.createTournamentButton().onclick = () => createTournament();
}

async function UserProfileView(username, description, data)
{
	ELEMENTs.mainPage().innerHTML = usersProfilePage;
	ELEMENTs.mainPage().style.display = "flex";
	ELEMENTs.twoFA().style.display = 'none';
	ELEMENTs.doorJamp().style.display = 'flex';

	document.title = username +  " | " + PAGE_TITLE;
	window.history.pushState({}, "", URLs.VIEWS.PROFILE + username);
	const user = {"username": username};
	document.getElementsByClassName("wantedProfileInProfilePage")[0].style.alignSelf = "center";
	const response = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user);
	// console.log("user :  ", response);
	// console.log("game played :  ", response.user_info['game played']);
	// console.log("victory :  ", response.user_info.victorie);
	// console.log("photo :  ", response.user_info.photo);
	// console.log("prime :  ", response.user_info.prime);
	const photoUrl = response.user_info.photo;
	const imgElement = ELEMENTs.photoUser ();
	imgElement.src = photoUrl;
	ELEMENTs.nameUser().innerHTML = username;
	ELEMENTs.prime().innerHTML = response.user_info.prime;
	await getHistoric(response.user_info['game played']);
	await statsInProfilePage();
}


async function	homeView(title, description, data) 
{
	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.twoFA().style.display = 'block';
	document.title = title;
	ELEMENTs.mainPage().innerHTML = homePageDisplayVAR;
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);
	
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";

	// ELEMENTs.flag().className = "homepageFlag";
	// ELEMENTs.englandFlagImg().style.transform = "scale(1.2)";
	// ELEMENTs.englandFlag().style.marginRight = "-0.01px";
	
	ELEMENTs.usernameOfWanted().innerHTML = response.username;
	const photoUrl = response.photo;
	const imgElement = ELEMENTs.pictureOfWanted();
	imgElement.src = photoUrl;
	ELEMENTs.primeAmount().innerHTML = response.prime;
	ELEMENTs.wantedProfile().onclick = () => {
		replace_location(URLs.VIEWS.PROFILE);
	};
	refreshLanguage();
	ELEMENTs.playButtonImg().onclick = () => playDisplayHomepage();
	console.log('homeView: ');
}

async function	loginView(title, description, data) {
	if (await isUserAuthenticated({})) {
		replace_location(URLs.VIEWS.HOME);
	}
	document.title = title;
	ELEMENTs.mainPage().innerHTML = loginPageDisplayVAR;
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/loginPage/landscapeOnePiece.png')";
	refreshLanguage();
	ELEMENTs.twoFA().style.display = 'none';
	ELEMENTs.doorJamp().style.display = 'none';


	
	// const myModal = new bootstrap.Modal('#loginModal', {
		// 	keyboard: false
		//   })
		//   myModal.show();
}

async function	profileView(title, description, data)
{
	document.title = title;

	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	ELEMENTs.mainPage().innerHTML = profilePageDisplayVAR;
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);
	console.log("response: ", response.photo);

	const responseJWT = await getAuthenticationStatus();
	ELEMENTs.changeUsernameButton().innerHTML = responseJWT[2].user.display;
	ELEMENTs.primeAmount().innerHTML = response.prime;
	const photoUrl = response.photo;
	const imgElement = ELEMENTs.profilPhotoInProfilePage();
	imgElement.src = photoUrl;
	refreshLanguage();
	ELEMENTs.twoFA().style.display = 'block';
	await displayFriend(response.friends, response.user_socket);
	await displayWaitingListFriend(response.pending_requests);
	await getHistoric(response.recent_games);
	await statsInProfilePage();
}

async function	createLobbyView(title, description, data) 
{
	ELEMENTs.doorJamp().style.display = 'flex';
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
	ELEMENTs.twoFA().style.display = 'none';
	refreshLanguage();

}

async function	providerCallbackView(title, description, data) {
	document.title = title;
	
	await mfaAuthMiddlewareJob();
}

async function	emailStatusView(title, description, data) {
	// console.log('email status view');
	document.title = title;
	
	let index;
	let _params = {};
	
	// get email verification information 
	const verification = await getEmailVerification(data.querystring.key);
	if (verification.find(_data => _data === 'verification-information')){
		// console.log('Function emailStatusView(): verification-information');
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
		// console.log('Function emailStatusView(): input-error');
		index = VARIABLEs.VERIFY_EMAIL.INDEXES.INVALID_LINK;
	}
	else if (verification.find(_data => _data === 'email-verification-not-pending')){
		// console.log('Function emailStatusView(): email-verification-not-pending');
		// console.log("Error 409: email-verification-not-pending");
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Email', 'Email verification is not pending');
		await askRefreshSession();
		return ;
	}
	else {
		// console.log('Function emailStatusView(): Error somewhere');
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