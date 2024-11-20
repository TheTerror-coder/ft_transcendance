
async function connect()
{
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {"email": email, "password": password};
	console.log('connect() functiongg', data);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.CONNECT, data);
    console.log('response', response);
    if (response.status == "success") {
        alert('connecting...');
        socket = new WebSocket("wss://localhost:8000/websocket/friend_invite/");
        socket.onopen = function() {
            console.log("WebSocket connection established.", socket);
        };
        
        console.log('ici', response);
        socket.onerror = function(error) {
            console.error("WebSocket error observed:", error);
        };

        socket.onclose = function(event) {
            console.log("WebSocket connection closed:", event);
        };
        socket.onmessage = function(event) {
            console.log("Received invitation:");
            var data = JSON.parse(event.data);
            if (data.type === 'invitation') {
                console.log("Received invitation:", data);
                Swal.fire({
                    title: 'Friend Invitation',
                    text: `You have received a friend invitation from ${data.from}.`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Accept',
                    cancelButtonText: 'Reject',
                    confirmButtonColor: 'green',
                    cancelButtonColor: 'red',
                }).then((result) => {
                    if (result.isConfirmed) {
                        socket.send(JSON.stringify({
                            type: 'response.invitation',
                            response: 'accept',
                            friend_request_id: data.friend_request_id
                        }));
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        socket.send(JSON.stringify({
                            type: 'response.invitation',
                            response: 'reject',
                            friend_request_id: data.friend_request_id
                        }));
                    }
                });
            }
        };
        window.history.pushState({}, "", "/homePage");
        handleLocation();
    }
    else {
        if (data.status == "error")
            alert(data.msgError);
    }
}
