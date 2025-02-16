async function fragment_mfaOverview(params) {
		
	let content = '';
	let _activate = true;

	if (params.find(marker => marker === 'totp')){
		_activate = false;
		content = `
		<div id="mfa-auth-app-active">
			<p id="mfa-auth-app-active">
				Authentication using an authenticator app is active.
			</p>
		</div>
		<div>
			<label>
				Authenticator code:
				<input id="2fa-value-input" type='text' minlength="6" maxlength="6" size="6" placeholder="xxx xxx" />
			</label>
		</div>
		`;
	}
	else {
		content = `
		<div id="mfa-auth-app-not-active">
			<p>
				An authenticator app is not active.
			</p>
		</div>
		`;
	}

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Two-Factor Authentication</h3>
		${
			(_activate)
			? '<button id="skip-activate-totp-button" type="button" class="btn-close" aria-label="Close"></button>'
			: ''
		}
	</div>
	<div class="modal-body">
	

		<div class="d-flex flex-column justify-content-center align-items-center">
			<h2>Authenticator App</h2>
			` + content + `
		</div>


	</div>
	`;

	body += _activate ? `
	<div class="modal-footer justify-content-center align-items-center">
		<button id="totp-activate-button" type="button" class="btn btn-primary">Activate</button>
	</div>
	` : `
	<div class="modal-footer justify-content-center align-items-center">
		<button id="validate-2fa-value-button" type="button" class="btn btn-primary">Validate</button>
	</div>
	`;

	return (body);
}

async function fragment_activateTotp(params) {

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Two-Factor Authentication</h3>
	</div>
	<div class="modal-body">
	

		<div class="d-flex flex-column justify-content-center align-items-center">
			<h2>Activate TOTP</h2>

			<div>
				<label>
					Authenticator secret:
					<input disabled type='text' size="32" value="` + params.totp_secret + `" />
					<div>
						<span>You can store this secret and use it to reinstall your authenticator app at a later time.</span>
					</div>
				</label>
			</div>
			<div>
				` + params.totp_qrcode + `
			</div>
			<div>
				<label>
					Authenticator code:
					<input id="totp-value-input" type='text' minlength="6" maxlength="6" size="6" placeholder="xxx xxx" />
				</label>
			</div>

		</div>


	</div>
	<div class="modal-footer justify-content-center align-items-center">
		<button id="validate-totp-value-button" type="button" class="btn btn-primary">Validate</button>
	</div>
	`;
	return (body);
}

async function fragment_mfaReauthenticate(params) {
		
	content = `
	<div id="mfa-auth-app-active">
		<p id="mfa-auth-app-active">
			Reauthentication using an authenticator app is required!
		</p>
	</div>
	<div>
		<label>
			Authenticator code:
			<input id="2fa-reauth-value-input" type='text' minlength="6" maxlength="6" size="6" placeholder="xxx xxx" />
		</label>
	</div>
	`;

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Two-Factor Reauthentication</h3>
		<button id="close-mfa-reauth-modal" type="button" class="btn-close" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	

		<div class="d-flex flex-column justify-content-center align-items-center">
			<h2>Authenticator App</h2>
			` + content + `
		</div>


	</div>
	`;

	body += `
	<div class="modal-footer justify-content-center align-items-center">
		<button id="validate-2fa-reauth-value-button" type="button" class="btn btn-primary">Validate</button>
	</div>
	`;

	return (body);
}