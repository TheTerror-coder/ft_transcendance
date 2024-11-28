
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
        // socket = new WebSocket("wss://localhost:1443/websocket/friend_invite/");
        // socket.onopen = function() {
        //     console.log("WebSocket connection established.", socket);
        // };
        // socket.onerror = function(error) {
        //     console.error("WebSocket error observed:", error);
        // };

        // socket.onclose = function(event) {
        //     console.log("WebSocket connection closed:", event);
        // };
        // socket.onmessage = function(event) {
        //     console.log("Received invitation:");
        //     var data = JSON.parse(event.data);
        //     if (data.type === 'invitation') {
        //         console.log("Received invitation:", data);
        //         Swal.fire({
        //             title: 'Friend Invitation',
        //             text: `You have received a friend invitation from ${data.from}.`,
        //             icon: 'info',
        //             showCancelButton: true,
        //             confirmButtonText: 'Accept',
        //             cancelButtonText: 'Reject',
        //             confirmButtonColor: 'green',
        //             cancelButtonColor: 'red',
        //         }).then((result) => {
        //             if (result.isConfirmed) {
        //                 socket.send(JSON.stringify({
        //                     type: 'response.invitation',
        //                     response: 'accept',
        //                     friend_request_id: data.friend_request_id
        //                 }));
        //             } else if (result.dismiss === Swal.DismissReason.cancel) {
        //                 socket.send(JSON.stringify({
        //                     type: 'response.invitation',
        //                     response: 'reject',
        //                     friend_request_id: data.friend_request_id
        //                 }));
        //             }
        //         });
        //     }
        // };
// jm custom beginning //
		await jwt_authenticate();
// jm custom end //
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