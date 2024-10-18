
var socket

buttonConnec.onclick = putFormConnect;

function putFormConnect()
{
    buttonConnectionAPI42.style.display = 'none';
    buttonConnec.style.display = 'none';
    buttonCreateAccount.style.display = 'none';
    formConnect.style.display = 'flex';
}

document.getElementById('formConnect').addEventListener('submit', function(event) {
    event.preventDefault();

    if (this.checkValidity()) {

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        fetch(loginURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: new URLSearchParams({
                'username': username,
                'password': password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status == "success")
            {
                alert('connecting...');
                let usernameElement = document.querySelector("#usernameDisplay");
                usernameElement.textContent = `${data.username}`;
                socket = new WebSocket("ws://127.0.0.1:8000/ws/friend_invite/");
                socket.onopen = function() {
                    console.log("WebSocket connection established.");
                };
        
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
                refreshHomePage();
            }
            else
            {
                if (data.status == "error")
                    alert(data.msgError);
            }})
    }    
});
