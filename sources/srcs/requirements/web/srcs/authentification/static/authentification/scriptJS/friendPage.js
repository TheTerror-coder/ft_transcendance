
document.addEventListener('DOMContentLoaded', function() {
    const buttonFriend = document.getElementById('buttonFriend');
    const submitFriendButton = document.getElementById('submitFriendButton');
    const playButton = document.getElementById('playButton');
    const friendDisplay = document.getElementById('friendDisplay');
    const usernameAddFriend = document.getElementById('usernameAddFriend');
    const addFriendForm = document.getElementById('add_friend_form');

    buttonFriend.onclick = friendPage;
    submitFriendButton.onclick = submitFriendInvite;

    function friendPage() {
        buttonFriend.style.display = 'none';
        playButton.style.display = 'none';
        friendDisplay.style.display = 'block';
    }

    function submitFriendInvite(event) {
        event.preventDefault();
        let username = usernameAddFriend.value;

        fetch(addFriendURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: new URLSearchParams({
                'username': username,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);

                if (socket) {
                    if (socket.readyState === WebSocket.OPEN) {
                        console.log("WebSocket already open");
                        sendInvitation(username);
                    } 
                    else if (socket.readyState === WebSocket.CONNECTING) {
                        socket.addEventListener('open', function() {
                            sendInvitation(username);
                        });
                    }
                    else {
                        console.error('WebSocket connection is not open. readyState:', socket.readyState);
                    }
                } else {
                    console.error('WebSocket is not defined');
                }
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        usernameAddFriend.value = '';
    }

    function sendInvitation(username) {
        console.log("Sending invitationnnnnn to:", username);
        socket.send(JSON.stringify({
            'username': username,
            'type': 'invitation',
            'room_name': 'add_friend'
        }));

    //     socket.onmessage = function(event) {
    //         console.log('Invitation sent to:', username);
    //         var data = JSON.parse(event.data);
    //         if (data.type === 'invitation') {
    //             console.log("Received invitation:", data);

    //             // Créez les boutons d'acceptation et de rejet
    //             var acceptButton = document.createElement('button');
    //             acceptButton.textContent = 'Accept';
    //             acceptButton.onclick = function() {
    //                 socket.send(JSON.stringify({
    //                     type: 'response.invitation',
    //                     response: 'accept',
    //                     friend_request_id: data.friend_request_id
    //                 }));
    //             };

    //             var rejectButton = document.createElement('button');
    //             rejectButton.textContent = 'Reject';
    //             rejectButton.onclick = function() {
    //                 socket.send(JSON.stringify({
    //                     type: 'response.invitation',
    //                     response: 'reject',
    //                     friend_request_id: data.friend_request_id
    //                 }));
    //             };

    //             document.body.appendChild(acceptButton);
    //             document.body.appendChild(rejectButton);
    //         }
    //     };

    //     socket.onerror = function(error) {
    //         console.error("WebSocket error:", error);
    //     };

    //     socket.onclose = function(event) {
    //         console.log("WebSocket connection closed:", event);
    //     };
    }
});
