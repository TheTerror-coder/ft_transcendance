

buttonFriend.onclick = friendPage;

submitFriendButton.onclick = submitFriendInvite;


function friendPage()
{
    buttonFriend.style.display = 'none';
    playButton.style.display = 'none';
    friendDisplay.style.display = 'block';
}

function submitFriendInvite()
{
    let username = usernameAddFriend.value;

    fetch(addFriendUR, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: new URLSearchParams({
            'username': username,
        }),
    })
}
