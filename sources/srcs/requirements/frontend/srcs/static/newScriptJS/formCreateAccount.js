
async function createAccount(instance) {
    event.preventDefault();

    const email = document.getElementById('createEmail').value;
    const username = document.getElementById('createUser').value;
	if (!isAlphanumeric(username))
	{
		alert("Invalid input.");
        return;
	}
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('createConfirmPassword').value;
    const bad_input = /^[^<>]+$/;
    if (!bad_input.test(email) || !bad_input.test(username) || !bad_input.test(password) || !bad_input.test(confirmPassword)) {
        alert("Invalid input.");
        return;
    }
    const data = {"username": username, "email": email, "password1": password, "password2": confirmPassword};

    const response = await makeRequest('POST', URLs.USERMANAGEMENT.REGISTER, data);
    if (response.status === 'success') 
		await mfaAuthMiddlewareJob();
    else if (response.status === 'error') {
        if (typeof response.errors === 'object') {
            let errorMessages = '';
            for (let key in response.errors) {
                if (response.errors.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${response.errors[key]}\n`;
                }
            }
            alert(errorMessages);
        } else
            alert(response.errors);
        ELEMENTs.createPassword().value = '';
        ELEMENTs.createConfirmPassword().value = '';
    }
};
