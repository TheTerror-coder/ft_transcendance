async function postAuthMiddlewareJob(params, routeMatched, _storage, skip_mfa) {
	console.log("****DEBUG**** post auth middleware job")
	try {
		await jwt_authenticate();
		
		if (routeMatched){
			await render_next(params, routeMatched, _storage);
			return ;
		}
		else {
			window.location.replace(URLs.VIEWS.HOME);
			return ;
		}
	} catch (error) {
		console.log("****DEBUG**** Exception catch() in postAuthMiddlewareJob(): " + error);
	}
}

async function render_next(params, routeMatched, _storage) {
	console.log("****DEBUG**** render_next()");
	
	try {
		
		if (!window.localStorage.getItem('jwt_access_token')){
			console.log("****DEBUG**** jwt credentials missing, calling once again jwt_authenticate()");
			await jwt_authenticate();
		}
		if (routeMatched){
			await routeMatched.view(routeMatched.title, routeMatched.description, _storage);
			return ;
		}
		else {
			window.location.replace(URLs.VIEWS.HOME);
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
		console.log('Function verifyEmailJob(): verification-information');
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
		console.log('Function verifyEmailJob(): input-error');
		index = VARIABLEs.VERIFY_EMAIL.INDEXES.INPUT_ERROR;
		_params.error_message = _response[2][0].message;
	}
	else if (_response.find(_data => _data === 'not-authenticated')){
		console.log('Function verifyEmailJob(): not-authenticated');
		await doPendingFlows({}, flows=_response[2].flows);
		return ;
	}
	else if (_response.find(_data => _data === 'email-verification-not-pending')){
		console.log('Function verifyEmailJob(): email-verification-not-pending');
		console.log("Error 409: email-verification-not-pending");
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Email', 'Email verification is not pending');
		await askRefreshSession();
		return ;
	}
	else {
		console.log('Function verifyEmailJob(): Error somewhere');
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
		console.log("****DEBUG**** mfaJob(): totp is active");
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
	console.log('activate totp job');
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
		console.log("account prohibits authenticator");
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Time-based One Time Password', 'account prohibits authenticator');
		await askRefreshSession();
		return ;
	}
}

async function	validateTotpValueJob(params) {
	console.log('validate totp value job');
	
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
		if (!await isUserAuthenticated()){
			await logout();
		}
		await postAuthMiddlewareJob();
		return ;
	} else { //'account-prohibits-authenticator'
		// reauthentication needed
		console.log("account prohibits authenticator: reauthentication needed");
		await onePongAlerter(ALERT_CLASSEs.INFO, 'Time-based One Time Password', 'account prohibits authenticator');
		await askRefreshSession();
		return ;
	}
}

async function	twoFaAuthenticateJob(params) {
	console.log('validate 2fa value job');
	
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
		if (!await isUserAuthenticated()){
			await logout();
		}
		await postAuthMiddlewareJob();
		return ;
	} else if (response.find(data => data === 'not-authenticated')){
		console.log('Function twoFaAuthenticateJob(): not-authenticated');
		await doPendingFlows({}, flows=response[2].flows);
		return ;
	}
	else {
		console.log('Function twoFaAuthenticateJob(): Error somewhere');
		return;
	}
}

async function	deactivateTotpJob(params) {
	const response = await getDeactivateTotp();
	if (response.find(data => data === 'success-response')){
		return ;
	} else {
		window.localStorage.setItem('skip_switch2FA_flag', 'true');
		console.log('*********DEBUG********* in deactivateTotpJob(): reauthentication needed')
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
		if (!await isUserAuthenticated()){
			await logout();
		}
		const _modal = await bootstrap.Modal.getInstance('#oauth-modal2');
		await _modal.dispose();
		ELEMENTs.oauth_modal2().remove();
		ELEMENTs.switch2FA().click();
		return;
	}
}
