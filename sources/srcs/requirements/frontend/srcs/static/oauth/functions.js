
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
	document.body.removeChild(form);
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

	await refresh_jwt();

	access_token = window.localStorage.getItem('jwt_access_token');
	if (access_token) {
		options.headers['Authorization'] = 'Bearer ' + access_token;
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
		// console.log("In function redirectToProvider()", 'csrfmiddlewaretoken= ' + await getCsrfToken());
		postForm(URLs.ALLAUTH.REDIRECT_TO_PROVIDER, {
			provider : ULTIMAPI_PRODIVIDER_ID,
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
		replace_location(URLs.VIEWS.LOGIN_VIEW);
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
	console.log("Pending flows: matched any");
	return (false);
}

async function skipTotpActivation(params) {
	await postAuthMiddlewareJob({});
}

async function isTotpEnabled(params) {
	const response = await getTotpAuthenticatorStatus();
	
	if (response.find(status => status === 'totp-authenticator-set-yet')) {
		return (true);
	}
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
			if (params){
				params.flows = response[2].flows;
			}
			clear_jwt();
			return (false);
		}
		else if (response.find(data => data === 'invalid-session')){
			console.log("****DEBUG**** isUserAuthenticated() -> invalid-session")
			window.sessionStorage.clear();
			clear_jwt();
			await replace_location(URLs.VIEWS.LOGIN_VIEW);
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

	await fragment_loadModalTemplate();
	ELEMENTs.oauth_modal_content().innerHTML = html;
	const _modal = await bootstrap.Modal.getOrCreateInstance('#oauth-modal', {
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
	try {
		console.log("callWebSockets");
		let one_socket_state = window.localStorage.getItem('one_socket_state');

		if (one_socket_state !== 'connected' || (ONE_SOCKET?.readyState !== WebSocket.OPEN && ONE_SOCKET?.readyState !== WebSocket.CONNECTING)){
			ONE_SOCKET = new WebSocket(`wss://${window.location.host}/websocket/friend_invite/`);
		}
		ONE_SOCKET.onopen = function() {
			window.localStorage.setItem('one_socket_state', 'connected');
			console.log("WebSocket connection established.", ONE_SOCKET);
		};
		ONE_SOCKET.onerror = function(error) {
			console.error("WebSocket error observed:", error);
		};
		
		ONE_SOCKET.onclose = function(event) {
			window.localStorage.setItem('one_socket_state', 'closed');
			console.log("WebSocket connection closed:", event);
		};
		ONE_SOCKET.onmessage = async function(event) {

			var data = JSON.parse(event.data);
			if (data.type === 'invited') {
				console.log('******DEBUG******* Invited by', data.from);
				await onePongAlerter(ALERT_CLASSEs.INFO, 'Invitation', data.msg);
			}
			else if (data.type === 'update_name') {
				const newUsername = data.new_username;
				if (ELEMENTs.profilePage())
					replace_location(URLs.VIEWS.PROFILE);
			}
			// else if (data.type === 'remove_friend') {
			// 	if (ELEMENTs.profilePage())
			// 		replace_location(URLs.VIEWS.PROFILE);
			// }
			// else if (data.type === 'update_logout') {
			// 	if (ELEMENTs.profilePage())
			// 		replace_location(URLs.VIEWS.PROFILE);
			// }
			// else if (data.type === 'update_login') {
			// 	setTimeout(() => {
			// 		if (ELEMENTs.profilePage())
			// 			replace_location(URLs.VIEWS.PROFILE);
			// 	}, 3000);
			// 	console.log("update_login TA VUU");
			// }
			else if (data.type === 'friend_disconnected') {
				await onePongAlerter(ALERT_CLASSEs.DARK, 'Push Notification', `${data.friend.username} is offline!`);
				status_element = ELEMENTs.circleIsConnect(data.friend.id);
				if (status_element) {
					status_element.style.backgroundColor = 'red';
				}
			}
			else if (data.type === 'friend_connected') {
				await onePongAlerter(ALERT_CLASSEs.PRIMARY, 'Push Notification', `${data.friend.username} is online!`);
				status_element = ELEMENTs.circleIsConnect(data.friend.id);
				if (status_element) {
					status_element.style.backgroundColor = 'green';
				}
			}
			else if (data.type === 'you_online') {
				await onePongAlerter(ALERT_CLASSEs.PRIMARY, 'Push Notification', `you are online!`);
				if (ELEMENTs.profilePage())
					replace_location(URLs.VIEWS.PROFILE);
			}
			else if (data.type === 'my_friends') {
				console.log(`In my_friends()******DEBUG*******data.friends:${data.friends}`);
				const friends = data.friends;
				friends.forEach(friend => {
					console.log(`In my_friends()******DEBUG*******friend.username:${friend.username}, friend.status:${friend.status}, friend.id:${friend.id}`);
				});
				friendsListEvent = new CustomEvent(USER.FRIENDS_LIST_EVENT, {
					detail: {
						friends: data.friends,
					}
				});
				document.dispatchEvent(friendsListEvent);
			}
			else if (data.type === 'waiting_friends') {
				console.log(`In waiting_friends()******DEBUG*******waiting.requests:${data.waiting_requests}`);
				const waiting_requests = data.waiting_requests;
				waiting_requests.forEach(request => {
					console.log(`In waiting_friends()******DEBUG*******request.issuername:${request.issuername}, request.id:${request.request_id}`);
				});
				waitingFriendsListEvent = new CustomEvent(USER.WAITING_FRIENDS_LIST_EVENT, {
					detail: {
						waiting_requests: data.waiting_requests,
					}
				});
				document.dispatchEvent(waitingFriendsListEvent);
			}
		};
	} catch (error) {
		console.log('sendInvitation() an exception happenned ' + error);
	}
}

async function getMyFriendsList() {
	try {
		ONE_SOCKET.send(JSON.stringify({
			'type': 'my_friends',
		}));
	}
	catch (error) {
		console.log('In getMyFriendsList()********DEBUG********* ' + error);
	}
}

async function getWaitingFriendsList() {
	try {
		ONE_SOCKET.send(JSON.stringify({
			'type': 'waiting_friends',
		}));
	}
	catch (error) {
		console.log('In getWaitingFriendsList()********DEBUG********* ' + error);
	}
}

// async function handleFriendInvitation(event) {
// 	try {
// 		console.log("handleFriendInvitation");
// 		var data = JSON.parse(event.data);
// 		if (data.type === 'invitation') {
// 			ONE_SOCKET.send(JSON.stringify({
// 				type: 'response.invitation',
// 				response: 'pending',
// 				friend_request_id: data.friend_request_id
// 			}));
// 			if (ELEMENTs.profilePage())
// 				await assign_location(URLs.VIEWS.PROFILE);
// 		}
// 		else if (data.type === 'update_name') {
// 			if (ELEMENTs.profilePage())
// 				await assign_location(URLs.VIEWS.PROFILE);
// 		}
// 		else if (data.type === 'remove_friend') {
// 			if (ELEMENTs.profilePage())
// 				await assign_location(URLs.VIEWS.PROFILE);
// 		}
// 		else if (data.type === 'update_logout') {
// 			if (ELEMENTs.profilePage())
// 				await assign_location(URLs.VIEWS.PROFILE);
// 		}
// 		else if (data.type === 'update_login') {
// 			if (ELEMENTs.profilePage())
// 				await assign_location(URLs.VIEWS.PROFILE);
// 		}
// 	} catch (error) {
// 		console.log('sendInvitation() an exception happenned ' + error);
// 	}
// }


function strcmp(str1, str2) {
    return str1 === str2;
}



async function reauthenticateFirst(flows) {
	if (flows?.find(data => data.id === FLOWs.REAUTHENTICATE)) {
		// await reauthenticateJob(undefined);
		await logout_views();
		return (true);
	}
	else if (flows?.find(data => data.id === FLOWs.MFA_REAUTHENTICATE)) {
		console.log("Pending flows: mfa Reauthentication required");
		await requireMfaReauthenticateJob(undefined);
		return (true);
	}
	return false;
}

async function updateMfaBoxStatus(data) {
	if (ELEMENTs.switch2FA()) {
		if (await isTotpEnabled()) {
			ELEMENTs.switch2FA().checked = true;
		} else {
			ELEMENTs.switch2FA().checked = false;
		}
	}
}

async function assign_location(url) {
	window.history.pushState({}, "", url);
	await handleLocation();
}

async function replace_location(url) {
	window.history.replaceState({}, "", url);
	await handleLocation();
}

function dispose_modals() {
	const _modal = bootstrap.Modal.getInstance('#oauth-modal', {
		keyboard: false,
	});
	if (_modal) {
		_modal.dispose();
		ELEMENTs.oauth_modal()?.remove();
	}
	const _modal2 = bootstrap.Modal.getInstance('#oauth-modal2', {
		keyboard: false,
	});
	if (_modal2) {
		_modal2.dispose();
		ELEMENTs.oauth_modal2()?.remove();
	}
}

function clear_jwt() {
	window.localStorage.removeItem('jwt_access_token');
	window.localStorage.removeItem('jwt_refresh_token');
}

async function refresh_jwt() {
	const access_token = window.localStorage.getItem('jwt_access_token');
	if (access_token) {
		const token_payload = await parseJwt(access_token)
		const expiration = token_payload.exp;
		const time_now = Math.floor(Date.now() / 1000);
		const delta = expiration - time_now;
		if (delta < 2) {
			const refresh_token = window.localStorage.getItem('jwt_refresh_token');
			if (refresh_token) {
				await refreshTokenJob('POST', URLs.REFRESH_TOKEN, { 'refresh' : refresh_token });
			}
		}
	}
}
