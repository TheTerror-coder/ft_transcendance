
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

document.addEventListener('DOMContentLoaded', function() {
    const buttonFriend = document.getElementById('buttonFriend');
    const submitFriendButton = document.getElementById('submitFriendButton');
    // const playButton = document.getElementById('playButton');
    // const friendDisplay = document.getElementById('friendDisplay');
    const usernameAddFriend = document.getElementById('usernameAddFriend');
    const addFriend = document.querySelector("#addFriend");

    // const addFriendForm = document.getElementById('add_friend_form');

    buttonFriend.onclick = friendPage;
    submitFriendButton.onclick = submitFriendInvite;
    function friendPage() {
        buttonFriend.style.display = 'none';
        playButton.style.display = 'none';
        addFriend.style.display = 'block';
        // friendDisplay.style.display = 'block';
    }

    function submitFriendInvite(event) {
        event.preventDefault();
        let username = usernameAddFriend.value;
        const csrfToken = getCookie('csrftoken');
        fetch(addFriendURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            credentials: "include",
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
    }
    
});
