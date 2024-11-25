
async function getAuthenticators() {
	//return: array
	const response = await makeRequest('GET', URLs.ALLAUTH.MFA.AUTHENTICATORS);
	if (response.status === 200){
		return ([
			'200',
			'authenticators-list',
			response.data, //array
		]);
	} else if (response.status === 401){
		return ([
			'401',
			'not-authenticated',
			response.data, //object
			response.meta,
		]);
	} else if (response.status === 410){
		return ([
			'410',
			'invalid-session',
			response.data,
			response.meta,
		]);
	}
	return ([]);
}

async function getTotpAuthenticatorStatus() {
	const response = await makeRequest('GET', URLs.ALLAUTH.MFA.TOTP_AUTHENTICATOR);
	if (response.status === 200){
		return ([
			'200',
			'totp-authenticator-set-yet',
			response.data,
		]);
	} else if (response.status === 404){
		return ([
			'404',
			'no-totp-authenticator-set',
			response.meta,
		]);
	} else if (response.status === 409){
		return ([
			'409',
			'account-prohibits-authenticator',
		]);
	}
	return ([]);
}

async function getActivateTotp(code) {
	const response = await makeRequest('POST', URLs.ALLAUTH.MFA.TOTP_AUTHENTICATOR, { 'code' : code, });
	if (response.status === 200){
		return ([
			'200',
			'totp-authenticator-information',
			response.data, //object
		]);
	}
	else if (response.status === 400){
		return ([
			'400',
			'input-error',
			response.errors, // array
		]);
	}
	else if (response.status === 409){
		return ([
			'409',
			'account-prohibits-authenticator',
		]);
	}
	return ([]);
}

async function get2faAuthenticate(code) {
	const response = await makeRequest('POST', URLs.ALLAUTH.MFA.TWO_FA_AUTHENTICATE, { 'code' : code, });
	if (response.status === 200){
		return ([
			'200',
			'authenticated',
			response.data, //object
			response.meta, //object
		]);
	}
	else if (response.status === 400){
		return ([
			'400',
			'input-error',
			response.errors, // array
		]);
	}
	else if (response.status === 401){
		return ([
			'401',
			'not-authenticated',
			response.data, // object
			response.meta, // object
		]);
	}
	return ([]);
}

async function getDeactivateTotp(code) {
	const response = await makeRequest('DELETE', URLs.ALLAUTH.MFA.TOTP_AUTHENTICATOR, { code });
	if (response.status === 200){
		return ([
			'200',
			'success-response',
		]);
	}
	else if (response.status === 401){
		return ([
			'401',
			'reauthentication-required',
			response.data,
			response.meta,
		]);
	}
	return ([]);
}

async function getAuthenticationStatus() {
	const response = await makeRequest('GET', URLs.ALLAUTH.AUTH_STATUS);
	if (response.status === 200){
		return ([
			'200',
			'user-is-authenticated',
			response.data,
			response.meta,
		]);
	} else if (response.status === 401){
		return ([
			'401',
			'not-authenticated',
			response.data,
			response.meta,
		]);
	} else if (response.status === 410){
		return ([
			'410',
			'invalid-session',
			response.data,
			response.meta,
		]);
	}
	return ([]);
}

async function verifyEmail(key) {
	const response = await makeRequest('POST', URLs.ALLAUTH.VERIFY_EMAIL, { key });
	if (response.status === 200){
		return ([
			'200',
			'user-is-authenticated',
			response.data,
			response.meta,
		]);
	}
	else if (response.status === 400){
		return ([
			'400',
			'input-error',
			response.errors,
		]);
	}
	else if (response.status === 401){
		return ([
			'401',
			'not-authenticated',
			response.data,
			response.meta,
		]);
	}
	else if (response.status === 409){
		return ([
			'409',
			'email-verification-not-pending',
		]);
	}
	return ([]);
}

async function getEmailVerification(key) {
	const response = await makeRequest('GET', URLs.ALLAUTH.VERIFY_EMAIL, undefined, { 'X-Email-Verification-Key': key });
	if (response.status === 200){
		return ([
			'200',
			'verification-information',
			response.data,
			response.meta,
		]);
	}
	else if (response.status === 400){
		return ([
			'400',
			'input-error',
			response.errors,
		]);
	}
	else if (response.status === 409){
		return ([
			'409',
			'email-verification-not-pending',
		]);
	}
	return ([]);
}

async function getQrCodeGenerated(totp_url) {
	const response = await makeRequest('POST', URLs.OAUTH.GENERATE_TOTP_QRCODE, { totp_url });
	if (response.status === 200){
		return ([
			'200',
			'qrcode-generated',
			response.totp_qrcode,
		]);
	}
	else {
		return ([
			'error-occured',
		]);
	}
}

async function getJwtToken(url) {
	const response = await makeRequest('GET', url);
	if (response.status === 200){
		return ([
			'200',
			'jwt-credentials',
		]);
	}
	else {
		return ([
			'error-occured',
		]);
	}
}

async function logout() {
	await makeRequest('DELETE', URLs.ALLAUTH.AUTH_STATUS);
	window.sessionStorage.clear();
	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
}
