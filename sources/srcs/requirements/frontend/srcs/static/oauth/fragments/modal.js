async function fragment_loadModalTemplate() {
	console.log('fragment_loadModalTemplate() | load ouath modal');
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