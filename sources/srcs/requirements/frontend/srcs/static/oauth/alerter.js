async function onePongAlerter(type, title, message) {
	const nth_alert = N_ALERT++;
	const placeHolder = document.createElement('div');
	placeHolder.innerHTML = `
	<div id="live-alert-placeholder" class="col-xs-10 col-sm-10 col-md-3 position-absolute top-0 end-0" style="z-index: 2222; margin-top: 8px; margin-right: 8px;">
	</div>
	`;
	document.body.appendChild(placeHolder);
	
	const alertPlaceholder = document.getElementById('live-alert-placeholder');

	const wrapper = document.createElement('div');
	wrapper.innerHTML = `
		<div id="alert-${nth_alert}" class="alert alert-${type} alert-dismissible fade show" role="alert">
				<h5 class="alert-heading" style="margin-bottom: 4px;">
					${
						(type === ALERT_CLASSEs.INFO)
						? '<i class="bi bi-info-circle" style="margin-right: 4px;"></i>'
						: (type === ALERT_CLASSEs.SUCCESS)
						? '<i class="bi bi-check-circle-fill" style="margin-right: 4px;"></i>'
						: (type === ALERT_CLASSEs.WARNING || type == ALERT_CLASSEs.DANGER)
						? '<i class="bi bi-exclamation-triangle-fill" style="margin-right: 4px;"></i>'
						: ''
					}
					${title}
				</h5>
				<hr style="margin: 0; margin-bottom: 2px;">
			<div>${message}</div>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
	`;
	alertPlaceholder.insertBefore(wrapper, alertPlaceholder.firstChild);

	const _alert = bootstrap.Alert.getOrCreateInstance(`#alert-${nth_alert}`);
	setTimeout(
		() => {
			if (bootstrap.Alert.getInstance(`#alert-${nth_alert}`))
				_alert.close();
		},
		5000
	);
}