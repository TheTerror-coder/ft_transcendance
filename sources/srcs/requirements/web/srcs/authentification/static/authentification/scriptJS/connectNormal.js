

buttonConnec.onclick = putFormConnect;

function putFormConnect()
{
    buttonConnectionAPI42.style.display = 'none';
    buttonConnec.style.display = 'none';
    buttonCreateAccount.style.display = 'none';
    formConnect.style.display = 'flex';
}



document.getElementById('formConnect').addEventListener('submit', function(event) {
    // Prevent the form from submitting immediately
    event.preventDefault();

    // Check if the form is valid
    if (this.checkValidity()) {
        // Additional validation: check if passwords match

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        let status;
        
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
        .then(data => 
        {
        if (data.status == "success") // ici tester avec la database
        {
            alert('connecting...');
            var socket = new WebSocket("ws://127.0.0.1:8000/ws/friend_invite/");
            refreshHomePage();
        }
        else // ici qund rien ne correspond a la database
            alert('Some of the required information is not complete.');
        })
    }
});
