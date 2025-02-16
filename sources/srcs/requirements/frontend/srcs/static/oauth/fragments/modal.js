async function fragment_loadModalTemplate() {
	const modalcontent_elm = ELEMENTs.oauth_modal_content();
	if (modalcontent_elm)
		modalcontent_elm.replaceChildren();
	else {
		const elm = ELEMENTs.mainPage();
		elm.replaceChildren();
		elm.innerHTML = `
<div id="oauth-modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
	<div id="oauth-modal-dialog" class="modal-dialog modal-dialog-scrollable modal-xl modal-dialog-centered">
		<div id="oauth-modal-content" class="modal-content">
			...
		</div>
	</div>
</div>
	`;
	}
}

async function fragment_loadModal2Template() {
	const modalcontent_elm = ELEMENTs.oauth_modal2_content();
	if (modalcontent_elm)
		modalcontent_elm.replaceChildren();
	else {
		const main_page = ELEMENTs.mainPage();
		const newdiv = document.createElement('div');
		newdiv.innerHTML = `
<div id="oauth-modal2" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
	<div id="oauth-modal2-dialog" class="modal-dialog modal-dialog-scrollable modal-xl modal-dialog-centered">
		<div id="oauth-modal2-content" class="modal-content">
			...
		</div>
	</div>
</div>
	`;
	main_page.appendChild(newdiv);
	}
}