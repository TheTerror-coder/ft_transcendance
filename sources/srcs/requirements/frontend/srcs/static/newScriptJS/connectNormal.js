
async function connect()
{
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const data = {"email": email, "password": password};
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.CONNECT, data);
    console.log(response);
    if (response.status == "success") {
        alert('connecting...');
        await callWebSockets();

        socket.onmessage = function(event) {
            handleFriendInvitation(socket, event);
        };
        window.history.pushState({}, "", URLs.VIEWS.HOME);
        handleLocation();
    }
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