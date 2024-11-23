
const eventManager = async (event) => {
	const { target } = event;
	

	if (target.matches('a')){
		await urlRoute(event);
	}
	
	if (target.id === ELEMENTs.signInWith42Button()?.id){
		event.preventDefault();
		await redirectToProvider();
	}
	else if (target.id === ELEMENTs.loginPageButton()?.id){
		event.preventDefault();
		window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	}
	else if (target.id === ELEMENTs.logoutButton()?.id){
		event.preventDefault();
		await logout();
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
	else if (target.id === ELEMENTs.skip_activate_totp_button()?.id){
		event.preventDefault();
		await skipTotpActivation();
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
	else if (target.id === ELEMENTs.buttonRefreshPage()?.id){
		event.preventDefault();
		window.history.pushState({}, "", URLs.VIEWS.LOGIN_VIEW);
		console.log("Pour le refresh de la page en html gang ta capte : URLs.VIEWS.LOGIN_VIEW = ", URLs.VIEWS.LOGIN_VIEW);
		handleLocation();
	}
	else if (target.id === ELEMENTs.connexion_confirm_button()?.id){
		event.preventDefault(); // TODO: il faudrait l'enlever pour utiliser correctement le boostrap
		await connect();
	}
	else if (target.id === ELEMENTs.createaccount_confirm_button()?.id){
		event.preventDefault(); // TODO: il faudrait l'enlever pour utiliser correctement le boostrap
		createAccount();
	}
	else if (target.id === ELEMENTs.wantedProfile()?.id){
		// event.preventDefault(); // TODO: il faudrait l'enlever pour utiliser correctement le bouton
		profileDisplay();
	}
	else if (target.id === ELEMENTs.playButtonImg()?.id){
		// event.preventDefault();
		playDisplayHomepage();
	}
	else if (target.id === ELEMENTs.buttonCreateLobby()?.id){
		event.preventDefault();
		CreateLobbyDisplay();
	}
	else if (target.id === ELEMENTs.addFriendButton()?.id)
	{
		event.preventDefault();
		await addFriend();
	}
	 
	// else if (target.id === ELEMENTs.buttonRefreshPage()?.id){
	// 	handleLocation();
	// }
	 
	// else if (target.id === 'live-alert'){
	// 	await onePongAlerter(ALERT_CLASSEs.SUCCESS, 'success', 'Welcome to One Pong!');
	// }
	console.log('event listener');
};

const auth_change = async (event) => {
	const flows = event.detail.flows;
	const pendingFlows = flows.length;

	if (pendingFlows !== 0){
		window.location.assign(URLs.VIEWS.LOGIN_VIEW);
	}
	window.location.assign(URLs.VIEWS.LOGIN_VIEW);
}

document.addEventListener("click", eventManager); 
document.addEventListener("auth-change", eventManager); 

const urlRoute = async (event) => {
	event = event || window.event;
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
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
	console.log('popstate');
	let pathname = window.location.pathname;
	const params = new URLSearchParams(window.location.search);
	let _storage = {};

	_storage.querystring = {
		next : params.get('next'),
		key : params.get('key'),
	};

	if (pathname.length === 0)
		pathname = '/';
	pathname += pathname.endsWith('/') ? '' : '/';

	let routeMatched = primaryRoutes[pathname];
	if (routeMatched){
		await routeMatched.view(routeMatched.title, routeMatched.description, _storage);
		return;
	}
	
	routeMatched = urlRoutes[pathname] || urlRoutes["404"];
	if (routeMatched.title === urlRoutes["404"]){
		await postAuthMiddlewareJob(undefined, routeMatched, _storage);
		return ;
	}
	if (!(await isUserAuthenticated(_storage))){
		if (!await doPendingFlows({}, _storage.flows))
			window.location.assign(URLs.VIEWS.LOGIN_VIEW);
		return;
	}
	await postAuthMiddlewareJob(undefined, routeMatched, _storage);
};

async function onePongAlerter(type, title, message) {
	const nth_alert = N_ALERT++;
	const placeHolder = document.createElement('div');
	placeHolder.innerHTML = `
	<div id="live-alert-placeholder" class="col-xs-10 col-sm-10 col-md-3 position-absolute top-0 end-0" style="z-index: 2222; margin-top: 8px; margin-right: 8px;">
	</div>
	`;
	document.body.appendChild(placeHolder);
	
	const alertPlaceholder = document.getElementById('live-alert-placeholder');

	const wrapper = document.createElement('div');
	wrapper.innerHTML = `
		<div id="alert-${nth_alert}" class="alert alert-${type} alert-dismissible fade show" role="alert">
				<h5 class="alert-heading" style="margin-bottom: 4px;">
					${
						(type === ALERT_CLASSEs.INFO)
						? '<i class="bi bi-info-circle" style="margin-right: 4px;"></i>'
						: (type === ALERT_CLASSEs.SUCCESS)
						? '<i class="bi bi-check-circle-fill" style="margin-right: 4px;"></i>'
						: (type === ALERT_CLASSEs.WARNING || type == ALERT_CLASSEs.DANGER)
						? '<i class="bi bi-exclamation-triangle-fill" style="margin-right: 4px;"></i>'
						: ''
					}
					${title}
				</h5>
				<hr style="margin: 0; margin-bottom: 2px;">
			<div>${message}</div>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
	`;
	alertPlaceholder.insertBefore(wrapper, alertPlaceholder.firstChild);

	const _alert = bootstrap.Alert.getOrCreateInstance(`#alert-${nth_alert}`);
	setTimeout(
		() => {
			if (bootstrap.Alert.getInstance(`#alert-${nth_alert}`))
				_alert.close();
		},
		5000
	);
}

window.onpopstate = handleLocation;
// window.route = urlRoute;

handleLocation();


