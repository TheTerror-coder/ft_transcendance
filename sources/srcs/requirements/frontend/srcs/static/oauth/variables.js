
const PAGE_TITLE = 'One Pong';
const BASE_URL = `https://${window.location.host}`;
const BACKEND_BASE_URL = `${BASE_URL}/backpong`;
const ALLAUTH_BASE_URL = `${BASE_URL}/_allauth/browser/v1`;
const ULTIMAPI_PRODIVIDER_ID = 'ultimapi';
const MAILCATCHER_BASE_URL = `http://${window.location.hostname}:1080`;

const ON = true;
const OFF = false;

let error = null;

const PATHs = Object.freeze({
	
	VIEWS : Object.freeze({
		TOURNAMENT : '/tournament/',
		HOME : '/home/',
		LOGIN_REDIRECT_URL : '/home/',
		LOGIN : '/frontpong/account/login/',
		CALLBACKURL : '/frontpong/account/provider/callbackurl/',
		MFA : '/frontpong/account/mfa/',
		VERIFY_EMAIL : '/frontpong/account/verify-email/',
		EMAIL_STATUS : '/frontpong/account/email-status/',
		CREATE_LOBBY : '/create-lobby/',
		LOBBY : '/lobby/',
		PROFILE : '/profile/',
		TOURNAMENT_TREE : '/tournament-tree/',
		ERROR404 : '/error-404/',
		SOCIAL_ACCOUNT_LOGIN_ERROR : '/frontpong/socialaccount-login-error/',
	}),

});


const URLs = Object.freeze({
	
	//DRF api endpoints
	HELLO_endp : '/hello/',
	PROFILE_endp : BASE_URL + '/oauth/profile/',
	
	// VIEWS \\
	VIEWS : Object.freeze({
		TOURNAMENT : BASE_URL + PATHs.VIEWS.TOURNAMENT,
		TOURNAMENT_TREE : BASE_URL + PATHs.VIEWS.TOURNAMENT_TREE,
		HOME : BASE_URL + PATHs.VIEWS.HOME,
		LOGIN_REDIRECT_URL_VIEW : BASE_URL + PATHs.VIEWS.LOGIN_REDIRECT_URL,
		LOGIN_VIEW : BASE_URL + PATHs.VIEWS.LOGIN,
		CALLBACKURL_VIEW : BASE_URL + PATHs.VIEWS.CALLBACKURL,
		MFA_VIEW : BASE_URL + PATHs.VIEWS.CALLBACKURL,
		VERIFY_EMAIL_VIEW : BASE_URL + PATHs.VIEWS.VERIFY_EMAIL,
		EMAIL_STATUS_VIEW : BASE_URL + PATHs.VIEWS.EMAIL_STATUS,
		CREATE_LOBBY : BASE_URL + PATHs.VIEWS.CREATE_LOBBY, // a faire
		LOBBY : BASE_URL + PATHs.VIEWS.LOBBY,
		PROFILE : BASE_URL + PATHs.VIEWS.PROFILE,
		ERROR404 : BASE_URL + PATHs.VIEWS.ERROR404,
		SOCIAL_ACCOUNT_LOGIN_ERROR : BASE_URL + PATHs.VIEWS.SOCIAL_ACCOUNT_LOGIN_ERROR,
		// TOTP
		// TOTP_VIEWs : Object.freeze({
			// 	// Activate TOTP authentication
			// 	ACTIVATE : BASE_URL + PATHs.VIEWS.TOTP.ACTIVATE,
			// 	// Deactivate TOTP authentication
			// 	DEACTIVATE : BASE_URL + PATHs.VIEWS.TOTP.DEACTIVATE,
			// }),
	}),
		

	// BACKEND //
	CSRF : BACKEND_BASE_URL + '/csrf/',
	
	USERMANAGEMENT : Object.freeze({
		CONNECT : BACKEND_BASE_URL + '/user-management/login/',
		REGISTER : BACKEND_BASE_URL + '/user-management/register/',
		UPDATEPROFILE : BACKEND_BASE_URL + '/user-management/update-profile/',
		UPDATEPHOTO : BACKEND_BASE_URL + '/user-management/update-photo/',
		ADDFRIEND : BACKEND_BASE_URL + '/user-management/add-friend/',
		REMOVEFRIEND : BACKEND_BASE_URL + '/user-management/remove-friend/',
		PROFILE : BACKEND_BASE_URL + '/user-management/profile/',
		USERNAME : BACKEND_BASE_URL + '/user-management/users/',
		GETUSER : BACKEND_BASE_URL + '/user-management/get-user/',
		GETUSERPROFILE : BACKEND_BASE_URL + '/user-management/get-user-profile/',
		LOGOUT : BACKEND_BASE_URL + '/user-management/logout/',
		SETLANGUAGE : BACKEND_BASE_URL + '/user-management/set-language/',
		GETLANGUAGE : BACKEND_BASE_URL + '/user-management/get-language/',
		TOURNAMENT : BACKEND_BASE_URL + '/user-management/tournament/',
	}),


	REFRESH_TOKEN : BACKEND_BASE_URL + '/token/refresh/',
	// 'oauth' backend app \\
	OAUTH : Object.freeze({
		GENERATE_TOTP_QRCODE : BACKEND_BASE_URL + '/oauth' + '/qr/generate-totp-qrcode/',
		JWT_TOKEN : BACKEND_BASE_URL + '/oauth' + '/jwt/token/',
		AUTH_STATUS : BACKEND_BASE_URL + '/oauth' + '/account/jwt/',
	}),
	// allauth \\
	ALLAUTH : Object.freeze({
		// Oauth2 authentication
		REDIRECT_TO_PROVIDER : ALLAUTH_BASE_URL + '/auth/provider/redirect',
		// user session
		AUTH_STATUS : ALLAUTH_BASE_URL + '/auth/session',
		// email verification
		VERIFY_EMAIL : ALLAUTH_BASE_URL + '/auth/email/verify',
		// Mutli Factor Authentication
		MFA : Object.freeze({
			// authenticators
			AUTHENTICATORS : ALLAUTH_BASE_URL + '/account/authenticators',
			// Time-based One Time Password
			TOTP_AUTHENTICATOR : ALLAUTH_BASE_URL + '/account/authenticators/totp',
			TWO_FA_AUTHENTICATE : ALLAUTH_BASE_URL + '/auth/2fa/authenticate',
			MFA_REAUTHENTICATE : ALLAUTH_BASE_URL + '/auth/2fa/reauthenticate',
		}),
	}),
	
});

const ACCEPT_JSON = {
	accept : 'application/json',
}

const AUTHPROCESS = Object.freeze({
	LOGIN: 'login',
	CONNECT: 'connect',
});

const AuthenticatorType = Object.freeze({
	TOTP: 'totp',
	RECOVERY_CODES: 'recovery_codes',
	WEBAUTHN: 'webauthn',
})

const ELEMENTs = Object.freeze({
	headPage : () => document.getElementById("headPage"),
	buttonSound : () => document.getElementById("buttonSound"), 
	doorJamp : () => document.getElementById("doorJamp"),
	logoutDoor : () => document.getElementById("logoutDoor"),
	logoutButton : () => document.getElementById("logoutButton"),
	franceFlag : () => document.getElementById("franceFlag"),
	spainFlag : () => document.getElementById("spainFlag"),
	englandFlag : () => document.getElementById("englandFlag"),
	twoFA : () => document.getElementById("twoFA"),
	languageDiv : () => document.getElementById("languageDiv"),

	dropDownLanguage : () => document.getElementById("dropDownLanguage"),


	mainPage :  () => document.getElementById("mainPage"),
	allPage : () => document.getElementById("allPage"),

	refresh_session_button :  () => document.getElementById("refresh-session-button"),
	
	verify_email_button :  () => document.getElementById("verify-email-button"),
	verify_email_close_error_button :  () => document.getElementById("verify-email-close-error-button"),
	redirect_to_email_catcher_button :  () => document.getElementById("redirect-to-email-catcher-button"),
	
	totp_activate_button : () => document.getElementById("totp-activate-button"),
	skip_activate_totp_button : () => document.getElementById("skip-activate-totp-button"),
	close_mfa_reauth_modal : () => document.getElementById("close-mfa-reauth-modal"),
	validate_totp_value_button : () => document.getElementById("validate-totp-value-button"),
	validate_2fa_value_button : () => document.getElementById("validate-2fa-value-button"),
	validate_2fa_reauth_value_button : () => document.getElementById("validate-2fa-reauth-value-button"),
	totp_value_input : () => document.getElementById("totp-value-input"),
	two_fa_value_input : () => document.getElementById("2fa-value-input"),
	two_fa_reauth_value_input : () => document.getElementById("2fa-reauth-value-input"),

	oauth_modal : () => document.getElementById("oauth-modal"),
	oauth_modal2 : () => document.getElementById("oauth-modal2"),
	oauth_modal_content : () => document.getElementById("oauth-modal-content"),
	oauth_modal2_content : () => document.getElementById("oauth-modal2-content"),

	loginButton : () => document.getElementById("loginButton"),
	woodPresentation : () => document.getElementById("woodPresentation"),
	background : () => document.getElementById("background"),


	password : () => document.getElementById("password"),
	createPassword : () => document.getElementById("createPassword"),
	createConfirmPassword : () => document.getElementById("createConfirmPassword"),
	
	signInWith42Button :  () => document.getElementById("signInWith42Button"),
	buttonCreateAccount : () => document.getElementById("createAnAccount"),
	createaccount_confirm_button : () => document.getElementById("create-account-confirm-button"),
	
	createAccountChange : () => document.getElementById("formAccount"),
	
	formConnect : () => document.getElementById("formConnect"),

	buttonRefreshPage : () => document.getElementById("refreshPage"),
	buttonConnec : () => document.getElementById("connectionEmail"),
	connexion_confirm_button : () => document.getElementById("connexion-confirm-button"),

	// homePage
	playButtonImg : () => document.getElementById("playButtonImg"),
	wantedProfile : () => document.getElementById("wantedProfile"),
        
	playDisplay : () => document.getElementById("playDisplay"),
	
	
	centerPlayDisplay : () => document.getElementById("centerPlayDisplay"),
	playButton : () => document.getElementById("playButton"),
	firstElement : () => document.getElementById("firstElement"),
	secondElement : () => document.getElementById("secondElement"),
	thirdElement : () => document.getElementById("thirdElement"),

	addFriendButton : () => document.getElementById("addFriendButton"),
	rapidPlayButton : () => document.getElementById("rapidPlayButton"),

	usernameOfWanted : () => document.getElementById("usernameOfWanted"),
	primeAmount : () => document.getElementById("primeAmount"),
	pictureOfWanted : () => document.getElementById("pictureOfWanted"),
	
	//userPage
	nameUser : () => document.getElementById("nameUser"),
	photoUser : () => document.getElementById("profilPhotoInProfilePage"),
	prime : () => document.getElementById("prime"),
	
	// profilePage
	
	changeProfilePhotoButton : () => document.getElementById("changeProfilePhotoButton"),
	changeUsernameButton : () => document.getElementById("changeUsernameButton"),
	profilPhotoInProfilePage : () => document.getElementById("profilPhotoInProfilePage"),
	fileButton : () => document.getElementById("photoSimulateClickInput"),
	formFile : () => document.getElementById("formFile"),
	changeUsernamePopOver : () => document.getElementById("changeUsernamePopOver"),
	historicMatch : () => document.getElementById("historicMatch"),
	switch2FA : () => document.getElementById("switch2FA"),
	
	profilePage : () => document.getElementById("profilePage"),

	circleIsConnect : () => document.getElementById("circle-is-connect"),

	// createLobby
	switchNumbersOfPlayers : () => document.getElementById("switchNumbersOfPlayers"),
	chooseTeamSwitch : () => document.getElementById("chooseTeamSwitch"),
	chooseRoleSwitch : () => document.getElementById("chooseRoleSwitch"),
	luffyChibi : () => document.getElementById("luffyChibi"),
	zoroSanjiChibi : () => document.getElementById("zoroSanjiChibi"),
	buttonCreate : () => document.getElementById("buttonCreate"),
	contentCreateLobby : () => document.getElementById("contentCreateLobby"),

	
	helmsmanRoleDisplay : () => document.getElementById("helmsmanRoleDisplay"),
	gunnerRoleDisplay : () => document.getElementById("gunnerRoleDisplay"),
	ShirohigeTeam : () => document.getElementById("ShirohigeTeam"),

	centerLobbyDisplay : () => document.getElementById("centerLobbyDisplay"),

	// LOBBY
	lobbyDisplayRapidPlayPlayerOne : () => document.getElementById("lobbyDisplayRapidPlayPlayer1"),
	lobbyDisplayRapidPlayPlayerTwo : () => document.getElementById("lobbyDisplayRapidPlayPlayer2"),
	lobbyDisplayRapidPlayPlayerThree : () => document.getElementById("lobbyDisplayRapidPlayPlayer3"),
	lobbyDisplayRapidPlayPlayerFour : () => document.getElementById("lobbyDisplayRapidPlayPlayer4"),
	PlayButtonInLobby : () => document.getElementById("PlayButtonInLobby"),

	// TOURNAMENT
	tournamentButton : () => document.getElementById("tournamentButton"),
	createTournamentButton : () => document.getElementById("createTournamentButton"),
	joinTournamentButton : () => document.getElementById("joinTournamentButton"),
	centerTournament : () => document.getElementById("centerTournament"),
	tournamentContent : () => document.getElementById("tournamentContent"),
	numbersOfPlayersTournament : () => document.getElementById("numbersOfPlayersTournament"),
	tournamentWrite : () => document.getElementById("tournamentWrite"),
	joinButtonTournament : () => document.getElementById("joinButtonTournament"),
	number : () => document.getElementById("number"),

	//404Page
	redirectButton : () => document.getElementById("redirectButton"),

	//MUSIC
	
	musicPlayer : () => document.getElementById("musicPlayer"),
	music : () => document.getElementById("music"), 
	profilePageMusic : () => "/static/sound/ProfilePageWeDidIt!Party!.mp3",
	homePageMusic : () => "/static/sound/HomePageWorldsNumberOneOdenStore.mp3",
	lobbyMusic : () => "/static/sound/LobbyLuffyFierceAttack.mp3",
	TournamentMusic : () => "/static/sound/TournamentLetsBattle.mp3",
	loginMusic : () => "/static/sound/LoginPageWeDidIt.mp3",

});

let N_ALERT = 0;

const VARIABLEs = Object.freeze ({
	VERIFY_EMAIL : Object.freeze({
		INDEXES : Object.freeze({
			VERIFY_EMAIL : 'verify-email',
			INVALID_LINK :  'invalid-link',
			ERROR_OCCURED :  'error-occured',
			FAILURE :  'failure',
			INPUT_ERROR :  'input-error',
			EMAIL_CONFIRMED_YET :  'email-confirmed-yet',
		}),
	}),
});

const X_EMAIL_VERIFICATION_KEY = 'X-Email-Verification-Key';

class PAGE_ROUTEs {
	static LOGIN = '/static/pages/loginpage';
	static HOME = '/static/pages/homepage';
}

class USER {
	static FRIENDS = undefined;
	static FRIENDS_LIST_EVENT = 'friends-list-event';
}

const FLOWs = Object.freeze({
	VERIFY_EMAIL : "verify_email",
	LOGIN : "login",
	SIGNUP : "signup",
	PROVIDER_REDIRECT : "provider_redirect",
	PROVIDER_SIGNUP : "provider_signup",
	PROVIDER_TOKEN : "provider_token",
	MFA_AUTHENTICATE : "mfa_authenticate",
	REAUTHENTICATE : "reauthenticate",
	MFA_REAUTHENTICATE : "mfa_reauthenticate",
});

const ALERT_CLASSEs = Object.freeze({
	PRIMARY : 'primary',
	SECONDARY : 'secondary',
	SUCCESS : 'success',
	DANGER : 'danger',
	WARNING : 'warning',
	INFO : 'info',
	LIGHT : 'light',
	DARK : 'dark',
});

let ONE_SOCKET = undefined;

let toggle_flag = true;