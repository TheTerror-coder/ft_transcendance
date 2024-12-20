
// signInWith42Button.onclick = connectAPI42;
// buttonCreateAccount.onclick = createAnAccount;

// function createAnAccount()
// {
//     if (flagSelected === "en")
//     {
//         signInWith42Button.style.display = 'none';
//         buttonConnec.style.display = 'none';
//         buttonCreateAccount.style.display = 'none';
//         createAccountChange.style.display = 'flex'; 
//     }
// }



async function createAccount(instance) {
    event.preventDefault();

    const email = document.getElementById('createEmail').value;
    const username = document.getElementById('createUser').value;
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('createConfirmPassword').value;
    const bad_input = /^[^<>]+$/;
    if (!bad_input.test(email) || !bad_input.test(username) || !bad_input.test(password) || !bad_input.test(confirmPassword)) {
        alert("Invalid input.");
        return;
    }
    console.log('createAccount() function: email: ', email,"\nusername: ", username, "\npassword: ",password, "\nconfirmPassword: ", confirmPassword);
    const data = {"username": username, "email": email, "password1": password, "password2": confirmPassword};

    console.log("registerURL", data);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.REGISTER, data);
    if (response.status === 'success') {
        alert('Form is valid and passwords match! Submitting...');
        await callWebSockets();
        socket.onmessage = function(event) {
            handleFriendInvitation(socket, event);
        };
        window.history.pushState({}, "", URLs.VIEWS.HOME);
        handleLocation();
        // window.history.pushState({}, "", URLs.VIEWS.LOGIN_VIEW);
        // handleLocation();
    }
    else if (response.status === 'error') {
        if (typeof response.errors === 'object') {
            let errorMessages = '';
            for (let key in response.errors) {
                if (response.errors.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${response.errors[key]}\n`;
                }
            }
            alert(errorMessages);
            console.log("Errors:", errorMessages);
        } else {
            alert(response.errors);
            console.log("Errors:", response.errors);
        }
        ELEMENTs.createPassword().value = '';
        ELEMENTs.createConfirmPassword().value = '';
    }
};


async function hashStringSHA256(input) 
{
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}