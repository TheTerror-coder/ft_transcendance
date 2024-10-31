

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
    const buttonChangeUsername = document.getElementById('buttonChangeUsername');
    buttonChangeUsername.onclick = changeUsername;
    const newUsername = document.getElementById('newUsername');
    const newPicture = document.getElementById('newPicture');
    const buttonChangePicture = document.getElementById('buttonChangePicture');
    buttonChangePicture.onclick = changePicture;

    const removeFriendButton = document.getElementById('submitRemoveFriendButton');
    const usernameRemoveFriendInput = document.getElementById('usernameRemoveFriend');
    removeFriendButton.onclick = removeFriend;
    wantedProfile.onclick = profileDisplay;

    function profileDisplay()
    {
        // rebecca.style.display = 'none';
        wantedProfile.style.display = 'none';
        // friendButton.style.display = 'flex';
        friendDisplay.style.display = 'block';
        playButton.style.display = 'none';
        flag.style.display = 'none';
        wantedInProfilePage.style.opacity = '1';
        profilePage.style.display = 'flex';
        profilePage.style.flexDirection = 'flex-end';
        wantedInProfilePage.style.display = 'block';
        friendDisplayProfileok();
    }

    
    function friendDisplayProfileok() {
        fetch(profileURL)
        .then(response => response.json())
        .then(data => {
            let usernameElement = document.querySelector("#usernameDisplay2");
            usernameElement.textContent = `${data.username}`;
            const friends = data.friends;
            const pendingRequests = data.pending_requests;
            
            const friendListContainer = document.getElementById('listFriend');
            friendListContainer.innerHTML = '';
            
            friends.forEach(friend => {
                const friendItem = document.createElement('p');
                friendItem.textContent = `${friend.username}`;
                friendListContainer.appendChild(friendItem);
            });
            
            const pendingRequestContainer = document.getElementById('pendingRequests');
            pendingRequestContainer.innerHTML = '';
            
            pendingRequests.forEach(request => {
                const requestItem = document.createElement('div');
                requestItem.classList.add('pending-request');
    
                requestItem.innerHTML = `
                    <p>${request.from_user}</p>
                    <button class="accept-button" id="accept-${request.friend_request_id}" style="background-color: green; color: white;">Accept</button>
                    <button class="reject-button" id="reject-${request.friend_request_id}" style="background-color: red; color: white;">✖</button>
                `;
    
                pendingRequestContainer.appendChild(requestItem);
                
                document.getElementById(`accept-${request.friend_request_id}`).onclick = function() {
                    socket.send(JSON.stringify({
                        type: 'response.invitation',
                        response: 'accept',
                        friend_request_id: request.friend_request_id
                    }));
                    friendDisplayProfileok();
                };
    
                document.getElementById(`reject-${request.friend_request_id}`).onclick = function() {
                    socket.send(JSON.stringify({
                        type: 'response.invitation',
                        response: 'reject',
                        friend_request_id: request.friend_request_id
                    }));
                    friendDisplayProfileok();
                };
            });
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
        });
    }
    




    removeFriendButton.onclick = function(event) {
        event.preventDefault();

        const username = usernameRemoveFriendInput.value;
        removeFriend(username);
    };

    function removeFriend(username) {
        const csrfToken = getCookie('csrftoken');
        fetch(removeFriendURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            credentials: "include",
            body: new URLSearchParams({
                'username': username,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log(data.message);
                friendDisplayProfileok();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'ami :', error);
        })
    }

    buttonChangePicture.onclick = function(event) {
        event.preventDefault();
    
        const fileInput = document.getElementById("newPicture");
        const picture = fileInput.files[0];
    
        if (!picture) {
            alert("Veuillez sélectionner un fichier.");
            return;
        }
    
        console.log("Fichier sélectionné :", picture);
        changePicture(picture);
    };

    function changePicture(picture) {
        console.log("iccccci et laaaaa : ", picture);
        const formData = new FormData();
        formData.append('photo', picture);
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        const csrfToken = getCookie('csrftoken');
    
        fetch(updatePictureURL, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: "include",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Erreur:', error));
    };

    
    buttonChangeUsername.onclick = function(event) {
        event.preventDefault();

        const userNameUpdate = newUsername.value;
        changeUsername(userNameUpdate);
    };

    function changeUsername(username) {
        const csrfToken = getCookie('csrftoken');
        fetch(updateNameURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({ 'username': username })
        })
        .then(response => {
            if (!response.ok) { 
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                friendDisplayProfileok();
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du nom d\'utilisateur :', error);
        });
    }
});