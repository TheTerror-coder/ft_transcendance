


function tournamentTreeView(title, description, data)
{
	
	if (savedTournamentCode.code)
	{
		document.title = title;
		ELEMENTs.doorJamp().style.display = "flex";
		displayBinaryTree();
	}
	else
	{
		replace_location(URLs.VIEWS.HOME);
		// error404View(title, description, data);
	}

}


async function tournamentView(title, description, data) 
{
	document.title = title;
	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.mainPage().innerHTML = tournamentCreateOrJoinVAR;
	ELEMENTs.twoFA().style.display = 'none';
	refreshLanguage();
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/tournament/colosseum.png')";
	ELEMENTs.joinTournamentButton().onclick = () => joinTournamentDisplay();
	ELEMENTs.createTournamentButton().onclick = () => createTournament();
	await changeMusic(ELEMENTs.TournamentMusic());
}

async function UserProfileView(username, description, data)
{
	ELEMENTs.mainPage().innerHTML = usersProfilePage;
	ELEMENTs.twoFA().style.display = 'none';
	ELEMENTs.doorJamp().style.display = 'flex';

	document.title = username +  " | " + PAGE_TITLE;
	// window.history.pushState({}, "", URLs.VIEWS.PROFILE + username);
	const user = {"username": username};
	refreshLanguage();
	document.getElementsByClassName("wantedProfileInProfilePage")[0].style.alignSelf = "center";
	const response = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user);
	const photoUrl = response.user_info.photo;
	const imgElement = ELEMENTs.photoUser();
	imgElement.src = photoUrl;
	ELEMENTs.nameUser().innerHTML = username;
	if (response.user_info.prime === null)
		ELEMENTs.prime().innerHTML = "0";
	else
		ELEMENTs.prime().innerHTML = response.user_info.prime;
	await getHistoric(response.user_info.recent_games, response.user_info.username);
	await statsInProfilePage(response.user_info.nbr_of_games, response.user_info.victorie, response.user_info.loose);
	refreshMusic();
}


async function	homeView(title, description, data) 
{
	if (ONE_SOCKET?.readyState !== 0 && ONE_SOCKET?.readyState !== 1)
		await callWebSockets();
	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.twoFA().style.display = 'block';
	document.title = title;
	ELEMENTs.mainPage().innerHTML = homePageDisplayVAR;
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);
	
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	
	ELEMENTs.usernameOfWanted().innerHTML = response.username;
	const photoUrl = response.photo;
	const imgElement = ELEMENTs.pictureOfWanted();
	imgElement.src = photoUrl;
	ELEMENTs.primeAmount().innerHTML = response.prime;
	ELEMENTs.wantedProfile().onclick = async () => {
		let ret = await assign_location(URLs.VIEWS.PROFILE);
		return ;
	};
	ELEMENTs.playButtonImg().onclick = () => playDisplayHomepage();
	await changeMusic(ELEMENTs.homePageMusic());
	refreshLanguage();
	// attachLogoutEvents();
}

async function	loginView(title, description, data) {
	if (await isUserAuthenticated({})) {
		await replace_location(URLs.VIEWS.HOME);
		return ;
	}
	document.title = title;
	ELEMENTs.mainPage().innerHTML = loginPageDisplayVAR;
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/loginPage/landscapeOnePiece.png')";
	refreshLanguage();
	ELEMENTs.twoFA().style.display = 'none';
	ELEMENTs.doorJamp().style.display = 'none';
	await changeMusic(ELEMENTs.loginMusic());
}

async function	profileView(title, description, data)
{
	document.title = title;

	if (ONE_SOCKET?.readyState !== 0 && ONE_SOCKET?.readyState !== 1) {
		let ret = await callWebSockets();
	}
	ELEMENTs.doorJamp().style.display = 'flex';
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
	ELEMENTs.mainPage().innerHTML = profilePageDisplayVAR;
	const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);

	const responseJWT = await getAuthenticationStatus();
	ELEMENTs.changeUsernameButton().innerHTML = responseJWT[2].user.display;
	ELEMENTs.primeAmount().innerHTML = response.prime;
	const photoUrl = response.photo;
	const imgElement = ELEMENTs.profilPhotoInProfilePage();
	imgElement.src = photoUrl;
	refreshLanguage();
	ELEMENTs.twoFA().style.display = 'block';
	let ret = await displayFriend();
	ret = await displayWaitingListFriend(response.pending_requests);
	ret = await getHistoric(response.recent_games, response.username);
	ret = await statsInProfilePage(response.nbr_of_games, response.victories, response.loose);
	ret = await changeMusic(ELEMENTs.profilePageMusic());
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
	ELEMENTs.twoFA().style.display = 'none';
	refreshLanguage();
	await changeMusic(ELEMENTs.lobbyMusic());

}

async function	providerCallbackView(title, description, data) {
	document.title = title;
	
	await mfaAuthMiddlewareJob();
}

async function	emailStatusView(title, description, data) {
	document.title = title;
	
	let index;
	let _params = {};
	
	// TO DO: get email verification information 
	const verification = await getEmailVerification(data.querystring.key);
	if (verification.find(_data => _data === 'verification-information')){
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
	else if (verification.find(_data => _data === 'input-error'))
		index = VARIABLEs.VERIFY_EMAIL.INDEXES.INVALID_LINK;
	else if (verification.find(_data => _data === 'email-verification-not-pending')){
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Email', 'Email verification is not pending');
		await askRefreshSession();
		return ;
	}
	else 
		return;
	_params.index = index;
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

async function	error404View(title, description, data)
{
	document.title = title;
	ELEMENTs.mainPage().innerHTML = Page404DisplayVAR;
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/404Page/Background404.jpeg')";
	ELEMENTs.redirectButton().onclick = () => replace_location(URLs.VIEWS.LOGIN_VIEW);
	refreshLanguage();
}