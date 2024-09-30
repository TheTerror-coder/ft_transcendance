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
                socket = new WebSocket("ws://127.0.0.1:8000/ws/friend_invite/");
                socket.onmessage = function(event) {
                    console.log('Message received:', event.data);  // Log pour vérifier la réception du message
                    var data = JSON.parse(event.data);
                    if (data.type === 'invitation') {
                        console.log("Received invitation:", data);

                        // Créez les boutons d'acceptation et de rejet
                        var acceptButton = document.createElement('button');
                        acceptButton.textContent = 'Accept';
                        acceptButton.onclick = function() {
                            socket.send(JSON.stringify({
                                type: 'response.invitation',
                                response: 'accept',
                                friend_request_id: data.friend_request_id
                            }));
                        };

                        var rejectButton = document.createElement('button');
                        rejectButton.textContent = 'Reject';
                        rejectButton.onclick = function() {
                            socket.send(JSON.stringify({
                                type: 'response.invitation',
                                response: 'reject',
                                friend_request_id: data.friend_request_id
                            }));
                        };

                        document.body.appendChild(acceptButton);
                        document.body.appendChild(rejectButton);
                    }
                };
                refreshHomePage();
            }
            else
                alert('Some of the required information is not complete.');
            })
    }    
});

function sendInvitation(username) {
    console.log("Sending invitation to:", username);
    socket.send(JSON.stringify({
        'username': username,
        'type': 'invitation',
        'room_name': 'add_friend'
    }));
}

// Exemple d'utilisation de la fonction sendInvitation
document.getElementById('sendInvitationButton').onclick = function() {
    var username = document.getElementById('usernameAddFriend').value;
    sendInvitation(username);
};