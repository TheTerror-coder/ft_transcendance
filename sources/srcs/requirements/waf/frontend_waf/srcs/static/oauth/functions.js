
function postForm(action, data)
{
	const form = document.createElement('form');
	form.method = 'POST';
	form.action = action;

	for(const key in data)
	{
		const d = document.createElement('input');
		d.type = 'hidden';
		d.name = key;
		d.value = data[key];
		form.appendChild(d);
	}
	document.body.appendChild(form);
	form.submit();
	// document.body.removeChild(form);
}

async function getCsrfToken()
{
	const url = URLs.CSRF;
	const req = new Request(url);
	req.mode = 'cors';
	req.headers = {
		"Accept": "application/json",
	};
	
	let response = await fetch(req);
	let data = await response.json();
	
	console.log('csrf in getcsrfToken(): ' + data.csrf_token);
	return (data.csrf_token);
}

async function makeRequest(method, path, data, headers) {
	const options = {
		method,
		headers: {
			...ACCEPT_JSON,
			...headers,
			'X-CSRFToken' : await getCsrfToken(),
		}
	}

  if (data) {
	options.body = JSON.stringify(data)
	options.headers['Content-Type'] = 'application/json'
  }
  const resp = await fetch(path, options)
  const msg = await resp.json()
  if (msg.status === 410) {
    window.sessionStorage.removeItem('sessionToken');
  }
  if (msg.meta?.session_token) {
    window.sessionStorage.setItem('sessionToken', msg.meta.session_token)
  }
//   if ([401, 410].includes(msg.status)) {
//     const event = new CustomEvent('auth-change', { details: msg });
//     document.dispatchEvent(event);
//   }
  return (msg);
}

async function redirectToProvider()
{
	try {
		
		console.log("In function redirectToProvider()", 'csrfmiddlewaretoken= ' + await getCsrfToken());
		postForm(URLs.ALLAUTH.REDIRECT_TO_PROVIDER, {
			provider : OAUTH2_PRODIVIDER_ID,
			callback_url : URLs.VIEWS.CALLBACKURL_VIEW,
			process : AUTHPROCESS.LOGIN,
			csrfmiddlewaretoken : await getCsrfToken(),
		});

	} catch(error){
		console.log("Error: In function redirectToProvider()", 'an error occured');
		window.alert('an error occured');
		return;
	}
}

async function doPendingFlows(params, flows) {
	/* 
	params: object
	*/
	console.log("Do Pending flows");
	if (flows?.lenght < 1){
		console.log("Pending flows: Authentication required");
		window.location.replace(URLs.VIEWS.LOGIN_VIEW);
		return (true);
	}
	else if (flows?.find(data => data.id === FLOWs.VERIFY_EMAIL && data.is_pending)) {
		console.log("Pending flows: Email verification required");
		await requireEmailVerifyJob(params);
		return (true);
	}
	else if (flows?.find(data => data.id === FLOWs.MFA_AUTHENTICATE && data.is_pending)) {
		console.log("Pending flows: MFA authenticate required");
		await mfaJob(undefined, totp_active=true);
		return (true);
	}
	// else if (params.flows?.find(data => data.id === FLOWs.LOGIN && data.is_pending)) {
	// 	console.log("Pending flows: Login required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	// else if (params.flows?.find(data => data.id === FLOWs.SIGNUP && data.is_pending)) {
	// 	console.log("Pending flows: Sign up required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	// else if (params.flows?.find(data => data.id === FLOWs.REAUTHENTICATE && data.is_pending)) {
	// 	console.log("Pending flows: Reauthentication required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	// else if (params.flows?.find(data => data.id === FLOWs.PROVIDER_REDIRECT && data.is_pending)) {
	// 	console.log("Pending flows: Provider redirect required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	// else if (params.flows?.find(data => data.id === FLOWs.PROVIDER_SIGNUP && data.is_pending)) {
	// 	console.log("Pending flows: Provider sign up required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	// else if (params.flows?.find(data => data.id === FLOWs.PROVIDER_TOKEN && data.is_pending)) {
	// 	console.log("Pending flows: Provider token required");
	// 	window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	// 	return (true);
	// }
	console.log("Pending flows: matched any");
	// window.location.replace(URLs.VIEWS.LOGIN_VIEW);
	return (false);
}

async function skipTotpActivation(params) {
	await postAuthMiddlewareJob({});
}

async function isTotpEnabled(params) {
	const authenticators = (await getAuthenticators())[2];
	
	const totp = authenticators?.flows?.find(flow => flow?.types?.includes(AuthenticatorType.TOTP));
	if (totp)
		return (true);
	return (false);
}

async function isUserAuthenticated(params) {
	try {

		console.log("In function isUserAuthenticated()", '***pass***');
		const response = await getAuthenticationStatus();
		if (response.find(data => data === 'user-is-authenticated')){
			console.log('user is authenticated!')
			return (true);
		}
		else if (response.find(data => data === 'not-authenticated')){
			params.flows = response[2].flows;
			return (false);
		}
		else if (response.find(data => data === 'invalid-session')){
			window.sessionStorage.clear();
			window.location.replace(URLs.VIEWS.LOGIN_VIEW);
			return (false);
		}
		return (false);
	} catch(error){
		console.log("Catched ERROR: In function isUserAuthenticated()", error);
		// window.alert('an error occured: ' + error);
		return (false);
	};
}

async function getHtml(path){
	const response = await fetch(path);
	const html = await response.text();
	return (html);
}

async function displayProfile() {
	try {
		
		console.log("In function displayProfile()", '***pass***');
		postForm(URLs.PROFILE_endp, {
			csrfmiddlewaretoken : await getCsrfToken(),
		});

	} catch(error){
		console.log("Error: In function displayProfile()", 'an error occured');
		window.alert('an error occured');
		return;
	};
}

async function askRefreshSession(params) {
	await fragment_loadModalTemplate();
	
	const html = `
	<div class="modal-body">
		<div class="d-flex flex-column justify-content-center align-items-center">
			<button id="refresh-session-button" type="button" class="btn btn-primary">Refresh session</button>
		</div>
	</div>
	`;

	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = new bootstrap.Modal('#oauth-modal', {
		keyboard: false,
	});
	_modal.show();
}

// async function testRequest() {
// 	const response = await request('GET', 'https://localhost:1443/hello/');
// 	if (response.status === 200)
// 		console.log('request succeeded!!');
// 	console.log('request failed!!');
// }
