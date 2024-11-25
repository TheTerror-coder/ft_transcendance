async function profileDisplay() 
{
    // window.history.pushState({}, "", URLs.VIEWS.PROFILE);
    // handleLocation();
    // ELEMENTs.mainPage().innerHTML = profilePageDisplayVAR;
    // console.log("PROFILE DISPLAY LOOOOL");
	// const response = await makeRequest(URLs.USERMANAGEMENT.PROFILE, 'GET');
	// console.log('profileView: ', response);
    // await displayFriend();
    // await displayWaitingListFriend();
}


function refreshHomePage()
{
    window.history.pushState({}, "", URLs.VIEWS.HOME);
    handleLocation();
}


async function addFriend()
{
    
    const usernameAddValue = document.getElementById("usernameAddFriend").value;
    const data = {"username": usernameAddValue};
    
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.ADDFRIEND, data);
    if (response.status === 'success') {
        alert('Friend request sent at ', usernameAddValue);
        if (socket) {
            if (socket.readyState === WebSocket.OPEN) {
                console.log("WebSocket already open");
                sendInvitation(data.username);
            } 
            else if (socket.readyState === WebSocket.CONNECTING) {
                socket.addEventListener('open', function() {
                    sendInvitation(data.username);
                });
            }
            else {
                console.error('WebSocket connection is not open. readyState:', socket.readyState);
            }
        } else {
            console.error('WebSocket is not defined');
        }
    } else {
        alert(response.message);
    }
}



function sendInvitation(username) {
    console.log("Sending invitationnnnnn to:", username);
    socket.send(JSON.stringify({
        'username': username,
        'type': 'invitation',
        'room_name': 'add_friend'
    }));

    socket.onmessage = function(event) {
        console.log('Invitation sent to:', username);
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
    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };
    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
    };
}
