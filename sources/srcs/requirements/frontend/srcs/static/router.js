
const eventManager = async (event) => {
	const { target } = event;

	if (target.matches('a')){
		await urlRoute(event);
	}
	
	if (target.id === ELEMENTs.signInWith42Button()?.id){
		event.preventDefault();
		await redirectToProvider();
	}
	else if (target.id === ELEMENTs.verify_email_button()?.id){
		event.preventDefault();
		await verifyEmailJob();
	}
	else if (target.id === ELEMENTs.totp_activate_button()?.id){
		event.preventDefault();
		await activateTotpJob();
	}
	else if (target.id === ELEMENTs.validate_totp_value_button()?.id){
		event.preventDefault();
		await validateTotpValueJob();
	}
	else if (target.id === ELEMENTs.validate_2fa_value_button()?.id){
		event.preventDefault();
		await twoFaAuthenticateJob();
	}
	else if (target.id === ELEMENTs.validate_2fa_reauth_value_button()?.id){
		event.preventDefault();
		await mfaReauthenticateJob();
	}
	else if (target.id === ELEMENTs.skip_activate_totp_button()?.id){
		event.preventDefault();
		await skipTotpActivation();
		return;
	}
	else if (target.id === ELEMENTs.verify_email_close_error_button()?.id){
		event.preventDefault();
		await logout();
	}
	else if (target.id === ELEMENTs.refresh_session_button()?.id){
		event.preventDefault();
		await logout();
	}
	else if (target.id === ELEMENTs.buttonConnec()?.id){
		event.preventDefault();
		putFormConnect();
	}
	else if (target.id === ELEMENTs.buttonCreateAccount()?.id){
		event.preventDefault();
		putFormRegister();
	}
	else if (target.id === ELEMENTs.buttonRefreshPage()?.id || target.id === ELEMENTs.woodPresentation()?.id || target.id === ELEMENTs.loginButton()?.id || (target.id === ELEMENTs.headPage()?.id && ELEMENTs.woodPresentation() !== null) ){
		event.preventDefault();
		if (ELEMENTs.createAccountChange().hasAttribute('style') || ELEMENTs.formConnect().hasAttribute('style'))
			await replace_location(URLs.VIEWS.LOGIN_VIEW);
	}
	else if (target.id === ELEMENTs.connexion_confirm_button()?.id){
		event.preventDefault();
		await connect();
	}
	else if (target.id === ELEMENTs.createaccount_confirm_button()?.id)
	{
		event.preventDefault();
		createAccount();
	}
	else if (target.id === ELEMENTs.addFriendButton()?.id)
	{
		event.preventDefault();
		await addFriend();
	}
	else if (target.id === ELEMENTs.buttonSound()?.id)
		OnOffMusic();
	else if (target.id === document.getElementById("yesButton")?.id)
		await logout_views();
	else if (target.id === document.getElementById("noButton")?.id)
		await replace_location(URLs.VIEWS.HOME);
	else if (target.id === document.getElementById("crossJoinTournament")?.id)
		await assign_location(URLs.VIEWS.HOME);
	else if (target.id === ELEMENTs.logoutButton()?.id || target.id === ELEMENTs.doorJamp()?.id)
	{
		teamAvailable.team = 0;
		roleAvailableBlackBeard.role = 0;
		roleAvailableWhiteBeard.role = 0;
		nbBlackBeard = 0;
		nbWhiteBeard = 0;
		noticeDisconnect = null;
		tournamentAllUsers.clearUsers();
		UsersShufled.clearUsers();

		event.preventDefault();
		if (globalSocket !== null)
		{
			globalSocket.disconnect();
			globalSocket.close();
			globalSocket = null;
		}
		if (ELEMENTs.addFriendButton() === null)
			await assign_location(URLs.VIEWS.HOME);
		else
		{
			await fragment_loadModalTemplate();
			ELEMENTs.oauth_modal_content().innerHTML = getLogOutPopUp;
			const _modal = new bootstrap.Modal('#oauth-modal', {
				keyboard: false,
			});
			refreshLanguage();
			await _modal.show();
		}
	}
	else if (target.id === ELEMENTs.close_mfa_reauth_modal()?.id)
	{
		ELEMENTs.switch2FA().click();
	}
	else if (target.id === ELEMENTs.switch2FA()?.id)
		{
			if (window.localStorage.getItem('skip_switch2FA_flag') !== 'true'){
				
				if (await isTotpEnabled()) 
					await deactivateTotpJob();
				else 
				await activateTotpJob();
			return ;
		}
		window.localStorage.removeItem('skip_switch2FA_flag');
	}
	else if (target.id === ELEMENTs.redirect_to_email_catcher_button()?.id)
	{
		event.preventDefault();
		await openEmailCatcher();
	}
};

document.addEventListener("click", eventManager); 

const urlRoute = async (event) => {
	event = event || window.event;
	event.preventDefault();
	await assign_location(event.target.href);
};

const primaryRoutes = {};
primaryRoutes[PATHs.VIEWS.LOGIN] = {
	view : loginView,
	title : "Login | " + PAGE_TITLE,
	description : "",
};
primaryRoutes[PATHs.VIEWS.CALLBACKURL] = {
	view : providerCallbackView,
	title : "Third Party Callback | " + PAGE_TITLE,
	description : "",
};
primaryRoutes[PATHs.VIEWS.VERIFY_EMAIL] = {
	view : emailStatusView,
	title : "Email verify | " + PAGE_TITLE,
	description : "",
};
primaryRoutes[PATHs.VIEWS.ERROR404] = {
	view : error404View,
	title : "Not Found | " + PAGE_TITLE,
	description : "",
};
primaryRoutes[PATHs.VIEWS.SOCIAL_ACCOUNT_LOGIN_ERROR] = {
	view : socialAccountLoginError,
	title : "Social Account Login Error | " + PAGE_TITLE,
	description : "",
};

const urlRoutes = {
	"404" : {
		view : error404View,
		title : "Not Found | " + PAGE_TITLE,
		description : "",
	}
};
urlRoutes["/"] = {
	view : homeView,
	title : "Home | " + PAGE_TITLE,
	description : "",
};
urlRoutes[PATHs.VIEWS.HOME] = {
	view : homeView,
	title : "Home | " + PAGE_TITLE,
	description : "",
};
urlRoutes[PATHs.VIEWS.CREATE_LOBBY] = {
	view : createLobbyView,
	title : "Create_lobby | " + PAGE_TITLE,
	description : "",
};
urlRoutes[PATHs.VIEWS.PROFILE] = {
	view : profileView,
	title : "Profile | " + PAGE_TITLE,
	description : "",
};
urlRoutes[PATHs.VIEWS.TOURNAMENT] = {
	view : tournamentView,
	title : "Tournament | " + PAGE_TITLE,
	description : "",
};
urlRoutes[PATHs.VIEWS.TOURNAMENT_TREE] = {
	view : tournamentTreeView,
	title : "Tournament Tree | " + PAGE_TITLE,
	description : "",
};
// urlRoutes[PATHs.VIEWS.MFA] = {
// 	view : mfaView,
// 	title : "MFA | " + PAGE_TITLE,
// 	description : "",
// };
// urlRoutes[PATHs.VIEWS.TOTP.ACTIVATE] = {
// 	view : mfaActivateTotpView,
// 	title : "MFA TOTP Activation | " + PAGE_TITLE,
// 	description : "",
// };
// urlRoutes[PATHs.VIEWS.TOTP.DEACTIVATE] = {
// 	view : mfaDeactivateTotpView,
// 	title : "MFA TOTP DeActivation | " + PAGE_TITLE,
// 	description : "",
// };
// urlRoutes[PATHs.VIEWS.VERIFY_EMAIL] = {
// 	view : verifyEmailView,
// 	title : "Verify Email | " + PAGE_TITLE,
// 	description : "",
// };

const handleLocation = async () => {
	dispose_modals();
	let pathname = window.location.pathname;
	const params = new URLSearchParams(window.location.search);
	let _storage = {};

	_storage.querystring = {
		next : params.get('next'),
		key : params.get('key'),
	};

	// if (globalSocket != null)
	// {
	// 	globalSocket.disconnect();
	// }

	if (pathname.length === 0)
		pathname = '/';
	pathname += pathname.endsWith('/') ? '' : '/';

	let routeMatched = primaryRoutes[pathname];
	if (routeMatched){
		await routeMatched.view(routeMatched.title, routeMatched.description, _storage);
		return;
	}

	routeMatched = urlRoutes[pathname] || urlRoutes["404"];
	if (routeMatched === urlRoutes["404"])
	{
		await assign_location(URLs.VIEWS.ERROR404);
		return ;
	}
	if (!(await isUserAuthenticated(_storage))){
		// if (!await doPendingFlows({}, _storage.flows))
		await replace_location(URLs.VIEWS.LOGIN_VIEW);
		return;
	}
	await render_next(undefined, routeMatched, _storage);
};



window.addEventListener('load', async () => {
    const urlActuelle = window.location.href;

    if (!urlActuelle.includes('login')) {
        const response = await getAuthenticationStatus();

        if (response.find(data => data === 'user-is-authenticated')) {
            const user = {"username" : response[2].user.display};
            const resp = await makeRequest('POST', URLs.USERMANAGEMENT.USERSOCKET, user);
            if (resp.status === 'error'){
                await callWebSockets();
			}
        }
        else if (response.find(data => data === 'not-authenticated')) {
        }
        else if (response.find(data => data === 'invalid-session')) 
		{
            window.sessionStorage.clear();
            await replace_location(URLs.VIEWS.LOGIN_VIEW);
        }
    }
});

window.onpopstate = handleLocation;

handleLocation();