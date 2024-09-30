
buttonConnec.onclick = putFormConnect;

function putFormConnect()
{
    buttonConnectionAPI42.style.display = 'none';
    buttonConnec.style.display = 'none';
    buttonCreateAccount.style.display = 'none';
    formConnect.style.display = 'flex';
}

var socket

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
            refreshHomePage();
        }
        else
            alert('Some of the required information is not complete.');
        })
    }    
});
