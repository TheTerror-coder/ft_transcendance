
const PAGE_TITLE = 'One Pong';
const BASE_URL = `https://${window.location.host}`;
const BACKEND_BASE_URL = `${BASE_URL}/backpong`;
const ALLAUTH_BASE_URL = `${BASE_URL}/_allauth/browser/v1`;
const ULTIMAPI_PRODIVIDER_ID = 'ultimapi';

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
	}),

});


const URLs = Object.freeze({
	
	//DRF api endpoints
	HELLO_endp : '/hello/',
	PROFILE_endp : BASE_URL + '/oauth/profile/',
	
	// VIEWS \\
	VIEWS : Object.freeze({
		TOURNAMENT : BASE_URL + PATHs.VIEWS.TOURNAMENT,
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
		USERSOCKET : BACKEND_BASE_URL + '/user-management/user-socket/',
		GETUSER : BACKEND_BASE_URL + '/user-management/get-user/',
		GETUSERPROFILE : BACKEND_BASE_URL + '/user-management/get-user-profile/',
		LOGOUT : BACKEND_BASE_URL + '/user-management/logout/',
		// SETINFOGAME : BACKEND_BASE_URL + '/user-management/set-info-game/',
		SETLANGUAGE : BACKEND_BASE_URL + '/user-management/set-language/',
		GETLANGUAGE : BACKEND_BASE_URL + '/user-management/get-language/',
		TOURNAMENT : BACKEND_BASE_URL + '/user-management/tournament/',
	}),


	// 'oauth' backend app \\
	OAUTH : Object.freeze({
		GENERATE_TOTP_QRCODE : BACKEND_BASE_URL + '/oauth' + '/qr/generate-totp-qrcode/',
		JWT_TOKEN : BACKEND_BASE_URL + '/oauth' + '/jwt/token/',
		AUTH_STATUS : BACKEND_BASE_URL + '/oauth' + '/social/jwt/token/',
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
	doorJamp : () => document.getElementById("doorJamp"),
	logoutDoor : () => document.getElementById("logoutDoor"),
	logoutButton : () => document.getElementById("logoutButton"),
	franceFlag : () => document.getElementById("franceFlag"),
	spainFlag : () => document.getElementById("spainFlag"),
	englandFlag : () => document.getElementById("englandFlag"),
	flag : () => document.getElementById("flag"),
	twoFA : () => document.getElementById("twoFA"),
	languageDiv : () => document.getElementById("languageDiv"),

	dropDownLanguage : () => document.getElementById("dropDownLanguage"),


	mainPage :  () => document.getElementById("mainPage"),
	
	loginPageButton :  () => document.getElementById("loginPageButton"),
	statusDiv :  () => document.getElementById("status"),
	usernameDiv :  () => document.getElementById("username"),
	firstnameDiv :  () => document.getElementById("firstname"),
	lastnameDiv :  () => document.getElementById("lastname"),
	emailDiv :  () => document.getElementById("email"),
	profile_image :  () => document.getElementById("profile-image"),
	refresh_session_button :  () => document.getElementById("refresh-session-button"),
	
	verify_email_button :  () => document.getElementById("verify-email-button"),
	verify_email_close_error_button :  () => document.getElementById("verify-email-close-error-button"),
	
	mfa_auth_app_is_active : () => document.getElementById("mfa-auth-app-active"),
	mfa_auth_app_not_active : () => document.getElementById("mfa-auth-app-not-active"),
	totp_deactivate_button : () => document.getElementById("totp-deactivate-button"),
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

	loginPage : () => document.getElementById("loginPage"),
	
	
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
	bookProfile : () => document.getElementById("bookProfile"),

	// createLobby
	switchNumbersOfPlayers : () => document.getElementById("switchNumbersOfPlayers"),
	chooseTeamSwitchDisplay : () => document.getElementById("chooseTeamSwitchDisplay"),
	chooseTeamSwitch : () => document.getElementById("chooseTeamSwitch"),
	chooseRoleSwitch : () => document.getElementById("chooseRoleSwitch"),
	teamFontOne : () => document.getElementById("teamFontOne"),
	teamFontTwo : () => document.getElementById("teamFontTwo"),
	luffyChibi : () => document.getElementById("luffyChibi"),
	zoroSanjiChibi : () => document.getElementById("zoroSanjiChibi"),
	buttonCreate : () => document.getElementById("buttonCreate"),
	cross : () => document.getElementById("cross"),
	chooseTeamSwitch : () => document.getElementById("chooseTeamSwitch"),
	contentCreateLobby : () => document.getElementById("contentCreateLobby"),

	
	helmsmanRoleDisplay : () => document.getElementById("helmsmanRoleDisplay"),
	gunnerRoleDisplay : () => document.getElementById("gunnerRoleDisplay"),
	KurohigeTeamDisplay : () => document.getElementById("KurohigeTeamDisplay"),
	ShirohigeTeamDisplay : () => document.getElementById("ShirohigeTeamDisplay"),
	ShirohigeTeam : () => document.getElementById("ShirohigeTeam"),



	centerLobbyDisplay : () => document.getElementById("centerLobbyDisplay"),


	// LOBBY
	lobbyDisplayRapidPlayPlayerOne : () => document.getElementById("lobbyDisplayRapidPlayPlayerOne"),
	lobbyDisplayRapidPlayPlayerTwo : () => document.getElementById("lobbyDisplayRapidPlayPlayerTwo"),
	lobbyDisplayRapidPlayPlayerThree : () => document.getElementById("lobbyDisplayRapidPlayPlayerThree"),
	lobbyDisplayRapidPlayPlayerFour : () => document.getElementById("lobbyDisplayRapidPlayPlayerFour"),
	PlayButtonInLobby : () => document.getElementById("PlayButtonInLobby"),

	// TOURNAMENT
	tournamentButton : () => document.getElementById("tournamentButton"),
	createTournamentButton : () => document.getElementById("createTournamentButton"),
	joinTournamentButton : () => document.getElementById("joinTournamentButton"),
	centerTournament : () => document.getElementById("centerTournament"),
	tournamentContent : () => document.getElementById("tournamentContent"),
	startTournament : () => document.getElementById("startTournament"),
	numbersOfPlayersTournament : () => document.getElementById("numbersOfPlayersTournament"),
	tournamentWrite : () => document.getElementById("tournamentWrite"),
	forLetPlaceTree : () => document.getElementById("forLetPlaceTree"),

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

let toggle_flag = true;