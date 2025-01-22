
async function connect()
{
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const bad_input = /^[^<>]+$/;
    if (!bad_input.test(email) || !bad_input.test(password))
	{
        alert("Invalid input.");
        return;
    }
    const data = {"email": email, "password": password};
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.CONNECT, data);
    console.log(response);
// jm custom beginning //
	if (response.status === 401) {
		if (response.data?.flows?.find(obj => (obj.id === FLOWs.MFA_AUTHENTICATE && obj.is_pending === true))) {
			await mfaAuthMiddlewareJob();
		}
		else {
            alert("Invalid credentials.");
			await replace_location(URLs.VIEWS.LOGIN_VIEW);
		}
	}
// jm custom end //
    if (response.status === "success")
		await mfaAuthMiddlewareJob();
    else if (response.status === 'error')
    {
        if (typeof response.errors === 'object') {
            let errorMessages = '';
            for (let key in response.errors) {
                if (response.errors.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${response.errors[key]}\n`;
                }
            }
            const tmp = errorMessages.substring(0, 7);
            if (strcmp(tmp, "__all__")) {
                errorMessages = errorMessages.substring(9);
            }
            alert(errorMessages);
        } else {
            alert(response.message);
            console.log("Errors:", response.message);
        }
        ELEMENTs.password().value = "";
    }
}