
async function fragment_requireEmailVerify(params) {

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Confirm Email Address</h3>
	</div>
	<div class="modal-body">
		
		
		<div class="d-flex justify-content-center align-items-center">
			<p>Email verification required.</p>
		</div>
	
	
	</div>
	`;
	
	return (body);
}

async function fragment_emailVerification(params) {

	let content = {}
	content[VARIABLEs.VERIFY_EMAIL.INDEXES.VERIFY_EMAIL] = `
		<p>Please confirm that <a href="">` + params.email + `</a> is an email address for user ` + params.user?.username + `.</p>
	`;
	content[VARIABLEs.VERIFY_EMAIL.INDEXES.INVALID_LINK] = `
		<p>Invalid verification link.</p>
	`;
	content[VARIABLEs.VERIFY_EMAIL.INDEXES.EMAIL_CONFIRMED_YET] = `
		<p>Unable to confirm email <a href=""></a> because it is already confirmed.</p>
		`;

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Confirm Email Address</h3>
		${
			(params.index !== VARIABLEs.VERIFY_EMAIL.INDEXES.VERIFY_EMAIL)
			? '<button id="verify-email-close-error-button" type="button" class="btn-close" aria-label="Close"></button>'
			: ''
		}
	</div>
	<div class="modal-body">
	

		<div class="d-flex justify-content-center align-items-center">
			${content[params.index]}
		</div>


	</div>
		${
			(params.index === VARIABLEs.VERIFY_EMAIL.INDEXES.VERIFY_EMAIL)
			?
		'<div class="modal-footer justify-content-center align-items-center">' +
			'<button id="verify-email-button" type="button" class="btn btn-primary">Confirm</button>' +
		'</div>'
			: ''
		}
	`;

  return (body);
}

async function fragment_isEmailVerified(params) {

	let content = {}
	content[VARIABLEs.VERIFY_EMAIL.INDEXES.FAILURE] = `
<p>Error : if you're seeing this message, the verirfication failed. Press below button to authenticate.</p>
	`;
	content[VARIABLEs.VERIFY_EMAIL.INDEXES.INPUT_ERROR] = `
<p>Error : ` + params.error_message + `</p>
		`;

	let body = `
	<div class="modal-header text-center">
		<h3 class="modal-title w-100" id="staticBackdropLabel">Email Confirmation</h3>
		<button id="verify-email-close-error-button" type="button" class="btn-close" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	

		<div class="d-flex justify-content-center align-items-center">
			${
				(params.index)
				? content[params.index]
				: 'error'
			}
		</div>


	</div>
	`;

  return (body);
}