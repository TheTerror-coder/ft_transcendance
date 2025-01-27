async function mfaAuthMiddlewareJob() {
	try {
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
	} catch (error) {
		console.log("****EXCEPTION**** mfaAuthMiddlewareJob(): ", error);
	}
}

async function postAuthMiddlewareJob(params, routeMatched, _storage, skip_mfa) {
	try {
		await jwt_authenticate();
		await callWebSockets();

		if (routeMatched){
			await render_next(params, routeMatched, _storage);
			return ;
		}
		else {
			replace_location(URLs.VIEWS.HOME);
			return ;
		}
	} catch (error) {
		console.log("****DEBUG**** Exception catch() in postAuthMiddlewareJob(): " + error);
	}
}

async function render_next(params, routeMatched, _storage) {
	
	try {
		
		if (!window.localStorage.getItem('jwt_access_token')){
			await jwt_authenticate();
		}

		await updateMfaBoxStatus();
		if (routeMatched){
			await routeMatched.view(routeMatched.title, routeMatched.description, _storage);
			return ;
		}
		else {
			replace_location(URLs.VIEWS.HOME);
			return ;
		}
	} catch (error) {
		console.log("****DEBUG**** render_next() Exception: " + error);
	}
}

async function	requireEmailVerifyJob(params) {
	await fragment_loadModalTemplate();
	const html = await fragment_requireEmailVerify();
	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal', {
		keyboard: false,
	});
	await _modal.show();
}

async function	verifyEmailJob(params) {
	const key = window.sessionStorage.getItem(X_EMAIL_VERIFICATION_KEY);
	
	let index;
	let _params = {};

	const _response = await verifyEmail(key);
	if (_response.find(_data => _data === 'user-is-authenticated')){
		if (_response[3].is_authenticated){
			if (!await isTotpEnabled()){
				await mfaJob(undefined, totp_active=false);
				return ;
			}
			await postAuthMiddlewareJob();
			return ;
		}
		return ;
		// else {
		// 	index = VARIABLEs.VERIFY_EMAIL.INDEXES.FAILURE;
		// }
	}
	else if (_response.find(_data => _data === 'input-error')){
		index = VARIABLEs.VERIFY_EMAIL.INDEXES.INPUT_ERROR;
		_params.error_message = _response[2][0].message;
	}
	else if (_response.find(_data => _data === 'not-authenticated')){
		await doPendingFlows({}, flows=_response[2].flows);
		return ;
	}
	else if (_response.find(_data => _data === 'email-verification-not-pending')){
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Email', 'Email verification is not pending');
		await askRefreshSession();
		return ;
	}
	else {
		return;
	}

	_params.index = index;
	await fragment_loadModalTemplate();
	const html = await fragment_isEmailVerified(_params);
	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal', {
		keyboard: false,
	});
	await _modal.show();
}

async function mfaJob(params, totp_active) {
	
	let _params = [];

	if (totp_active) {
		_params.push('totp');
	}
	await fragment_loadModalTemplate();
	const html = await fragment_mfaOverview(_params);
	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal', {
		keyboard: false,
	});
	await _modal.show();
}

async function	activateTotpJob(params) {
	const _params = {};
	const response = await getTotpAuthenticatorStatus();
	if (response.find(data => data === 'no-totp-authenticator-set')){
		_params.totp_secret = response[2].secret;
		_params.totp_url = response[2].totp_url;

		const qr_response = await getQrCodeGenerated(_params.totp_url);
		if (qr_response.find(_data => _data === 'qrcode-generated')){
			const str = qr_response[2];
			_params.totp_qrcode = str.slice(str.indexOf('<svg'));
		}

		await fragment_loadModalTemplate();
		const html = await fragment_activateTotp(_params);
		ELEMENTs.oauth_modal_content().innerHTML = html;
		const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal', {
			keyboard: false,
		});
		await _modal.show();
	} else if (response.find(data => data === 'totp-authenticator-set-yet')){
		await mfaJob(undefined, totp_active=(await isTotpEnabled()));
		return ;
	} else { //'account-prohibits-authenticator'
		// reauthentication needed
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Time-based One Time Password', 'account prohibits authenticator');
		await askRefreshSession();
		return ;
	}
}

async function	validateTotpValueJob(params) {
	
	const _input = ELEMENTs.totp_value_input();
	_input.disabled = true;
	const response = await getActivateTotp(_input.value);
	if (response.find(data => data === 'input-error')){
		// raise error message
		await onePongAlerter(ALERT_CLASSEs.DANGER, 'Error', response[2][0].message);
		_input.disabled = '';
		return ;
	} else if (response.find(data => data === 'totp-authenticator-information')){
		// go to ?next
		if (!await isUserAuthenticated({})){
			await logout_views();
		}
		await postAuthMiddlewareJob();
		return ;
	} else { //'account-prohibits-authenticator'
		// reauthentication needed
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Time-based One Time Password', 'account prohibits authenticator');
		await askRefreshSession();
		return ;
	}
}

async function	twoFaAuthenticateJob(params) {
	
	const _input = ELEMENTs.two_fa_value_input();
	_input.disabled = true;
	const response = await get2faAuthenticate(_input.value);
	if (response.find(data => data === 'input-error')){
		// raise error message
		await onePongAlerter(ALERT_CLASSEs.DANGER, 'Error', response[2][0].message);
		_input.disabled = '';
		return ;
	} else if (response.find(data => data === 'authenticated')){
		// go to ?next
		if (!await isUserAuthenticated({})){
			await logout_views();
		}
		await postAuthMiddlewareJob();
		return ;
	} else if (response.find(data => data === 'not-authenticated')){
		await doPendingFlows({}, flows=response[2].flows);
		return ;
	}
	else {
		return;
	}
}

async function	deactivateTotpJob(params) {
	const response = await getDeactivateTotp();
	if (response.find(data => data === 'success-response')){
		return ;
	} else {
		window.localStorage.setItem('skip_switch2FA_flag', 'true');
		await reauthenticateFirst(response[2].flows);
		return ;
	}
}

async function requireMfaReauthenticateJob(params) {
	
	await fragment_loadModal2Template();
	const html = await fragment_mfaReauthenticate();
	ELEMENTs.oauth_modal2_content().innerHTML = html;
	const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal2', {
		keyboard: false,
	});
	await _modal.show();
}

async function	mfaReauthenticateJob(params) {
	const _input = ELEMENTs.two_fa_reauth_value_input();
	_input.disabled = true;
	const response = await getMfaReauthenticate(_input.value);
	if (response.find(data => data === 'input-error')){
		// raise error message
		await onePongAlerter(ALERT_CLASSEs.DANGER, 'Error', response[2][0].message);
		_input.disabled = '';
		return ;
	} else if (response.find(data => data === 'reauthenticated')){
		if (!await isUserAuthenticated({})){
			await logout_views();
		}
		const _modal = await bootstrap.Modal.getInstance('#oauth-modal2');
		await _modal.dispose();
		ELEMENTs.oauth_modal2().remove();
		ELEMENTs.switch2FA().click();
		return;
	}
}

async function refreshTokenJob(method, path, data, headers) {
	const options = {
		method,
		headers: {
			...ACCEPT_JSON,
			...headers,
			'X-CSRFToken' : await getCsrfToken(),
		}
	}

	if (data) {
		if (data instanceof FormData) {
		options.body = data;
	} else {
		options.body = JSON.stringify(data)
		options.headers['Content-Type'] = 'application/json'
	}
	}

	const resp = await fetch(path, options)
	const msg = await resp.json()

	if (msg.access && msg.refresh) {
		window.localStorage.setItem('jwt_access_token', msg.access);
		window.localStorage.setItem('jwt_refresh_token', msg.refresh);
	}
  return (msg);
}
