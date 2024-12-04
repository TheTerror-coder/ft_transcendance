
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
		if (data instanceof FormData) {
		options.body = data;
	} else {
		options.body = JSON.stringify(data)
			options.headers['Content-Type'] = 'application/json'
	}
	}

	const resp = await fetch(path, options)
	const msg = await resp.json()

	if (msg.jwt) {
		window.localStorage.setItem('jwt_access_token', msg.jwt.access_token);
		window.localStorage.setItem('jwt_refresh_token', msg.jwt.refresh_token);
	}
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

async function jwt_authenticate(params) {
	try {
		const response = await getJwtToken(URLs.OAUTH.AUTH_STATUS)
		if (response.find(data => data === 'jwt-credentials')){
			console.log("****DEBUG**** jwt_authenticate() -> jwt-credentials")
			return (true);
		}
		// onePongAlerter(ALERT_CLASSEs.WARNING, 'Warning', 'jwt credentials missing');
		return (false);
	} catch(error){
		console.log("****DEBUG**** Exception catch() in jwt_authenticate(): " + error)
		return (false);
	}
}

async function isUserAuthenticated(params) {
	try {
		const response = await getAuthenticationStatus();
		if (response.find(data => data === 'user-is-authenticated')){
			console.log("****DEBUG**** isUserAuthenticated() -> user is authenticated")
			return (true);
		}
		else if (response.find(data => data === 'not-authenticated')){
			console.log("****DEBUG**** isUserAuthenticated() -> not-authenticated")
			params.flows = response[2].flows;
			return (false);
		}
		else if (response.find(data => data === 'invalid-session')){
			console.log("****DEBUG**** isUserAuthenticated() -> invalid-session")
			window.sessionStorage.clear();
			window.location.replace(URLs.VIEWS.LOGIN_VIEW);
			return (false);
		}
		console.log("****DEBUG**** isUserAuthenticated() -> else")
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
	await _modal.show();
}

// returns token payload
async function parseJwt(token) {
	let base64Url = token.split('.')[1];
	let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	let jsonpayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	return JSON.parse(jsonpayload);
}
function strcmp(str1, str2) {
    return str1 === str2;
}

/**************************/
/*		 WEBSOKETS		  */
/**************************/

async function callWebSockets(params) {
	socket = new WebSocket("wss://localhost:1443/websocket/friend_invite/");
	socket.onopen = function() {
		console.log("WebSocket connection established.", socket);
	};
	socket.onerror = function(error) {
		console.error("WebSocket error observed:", error);
	};

	socket.onclose = function(event) {
		console.log("WebSocket connection closed:", event);
	};
	socket.onmessage = function(event) {
		console.log("Received invitation:");
		var data = JSON.parse(event.data);
		if (data.type === 'invitation') {
			console.log("Received invitation:", data);
			Swal.fire({
				title: 'Friend Invitation',
				text: `You have received a friend invitation from ${data.from}.`,
				icon: 'info',
				showCancelButton: true,
				confirmButtonText: 'Accept',
				cancelButtonText: 'Reject',
				confirmButtonColor: 'green',
				cancelButtonColor: 'red',
			}).then((result) => {
				if (result.isConfirmed) {
					socket.send(JSON.stringify({
						type: 'response.invitation',
						response: 'accept',
						friend_request_id: data.friend_request_id
					}));
				} else if (result.dismiss === Swal.DismissReason.cancel) {
					socket.send(JSON.stringify({
						type: 'response.invitation',
						response: 'reject',
						friend_request_id: data.friend_request_id
					}));
				}
			});
		}
	};
}


function handleFriendInvitation(socket, event) {
    console.log("Received invitation:");
    var data = JSON.parse(event.data);
    
    if (data.type === 'invitation') {
        console.log("Received invitation:", data);
        
        // Afficher la boîte de dialogue SweetAlert
        Swal.fire({
            title: 'Friend Invitation',
            text: `You have received a friend invitation from ${data.from}.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject',
            confirmButtonColor: 'green',
            cancelButtonColor: 'red',
        }).then((result) => {
            let response = result.isConfirmed ? 'accept' : 'reject';
            
            socket.send(JSON.stringify({
                type: 'response.invitation',
                response: response,
                friend_request_id: data.friend_request_id
            }));
        });
    }
}



// async function testRequest() {
// 	const response = await request('GET', 'https://localhost:1443/hello/');
// 	if (response.status === 200)
// 		console.log('request succeeded!!');
// 	console.log('request failed!!');
// }

function strcmp(str1, str2) {
    return str1 === str2;
}

function calculateScore(player_game_played, player_victory, opponent_game_played, opponent_victory, player_won) {
    let player_score = player_game_played > 0 ? (player_victory / player_game_played) * 100 : 0;
    let opponent_score = opponent_game_played > 0 ? (opponent_victory / opponent_game_played) * 100 : 0;
    let player_cote_change = 0;
    let opponent_cote_change = 0;

    if (player_won) {
        if (player_score < opponent_score) {
            player_cote_change = (opponent_score - player_score) * 1.5;
            opponent_cote_change = -(opponent_score - player_score) * 1.2;
        } else {
            player_cote_change = (opponent_score - player_score) * 1.2;
            opponent_cote_change = -(opponent_score - player_score) * 1.1;
        }
    } else {
        if (opponent_score < player_score) {
            opponent_cote_change = (player_score - opponent_score) * 1.5;
            player_cote_change = -(player_score - opponent_score) * 1.2;
        } else {
            opponent_cote_change = (player_score - opponent_score) * 1.2;
            player_cote_change = -(player_score - opponent_score) * 1.1;
        }
    }

    player_score += player_cote_change;
    opponent_score += opponent_cote_change;

    player_score = Math.max(player_score, 0);
    opponent_score = Math.max(opponent_score, 0);

    return { player_score, opponent_score };
}
