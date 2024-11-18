// const ip = process.env.HOST_IP || "localhost";


function getCookie(cname) {
    let name = cname + "=";
    console.log("name", name);
    let decodedCookie = decodeURIComponent(document.cookie);
    console.log("decodedCookie", decodedCookie);
    let ca = decodedCookie.split(';');
    console.log("ca", ca);
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            console.log("cookie if good returned", c.substring(name.length, c.length));
            return c.substring(name.length, c.length);
        }
        console.log("chelou je suis dans la boucle", c);
    }
    console.log("cookie is not return", ca);
    return "";
}


function connect()
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("connect", username, password);
    // window.history.pushState({}, "", "/homePage");
    // handleLocation();
    fetch('http://localhost:8888/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'X-CSRFToken': csrfToken,
        },
        // credentials: "include",
        body: new URLSearchParams({
            'username': username,
            'password': password,
        }),
    })
}

// async function connect()
// {

//     event.preventDefault();
//     if (this.checkValidity()) {

//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
//         const csrfToken = getCookie('csrftoken');
//         console.log("csrfToken", csrfToken);
//         await fetch('http://localhost:8888/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'X-CSRFToken': csrfToken,
//             },
//             credentials: "include",
//             body: new URLSearchParams({
//                 'username': username,
//                 'password': password,
//             }),
//         })
//         .then(response => {
//             if (response.ok)
//                 response.json();
//             else
//                 console.log("error de zinzin", response);
//         })
//         .then(data => {
//             if (data.status == "success")
//             {
//                 alert('connecting...');
//                 let usernameElement = document.querySelector("#usernameDisplay");
//                 usernameElement.textContent = `${data.username}`;
//                 socket = new WebSocket("ws://localhost:8000/ws/friend_invite/");
//                 socket.onopen = function() {
//                     console.log("WebSocket connection established.", socket);
//                 };
        
//                 socket.onerror = function(error) {
//                     console.error("WebSocket error observed:", error);
//                 };
        
//                 socket.onclose = function(event) {
//                     console.log("WebSocket connection closed:", event);
//                 };
//                 socket.onmessage = function(event) {
//                     console.log("Received invitation:");
//                     var data = JSON.parse(event.data);
//                     if (data.type === 'invitation') {
//                         console.log("Received invitation:", data);
//                         Swal.fire({
//                             title: 'Friend Invitation',
//                             text: `You have received a friend invitation from ${data.from}.`,
//                             icon: 'info',
//                             showCancelButton: true,
//                             confirmButtonText: 'Accept',
//                             cancelButtonText: 'Reject',
//                             confirmButtonColor: 'green',
//                             cancelButtonColor: 'red',
//                         }).then((result) => {
//                             if (result.isConfirmed) {
//                                 socket.send(JSON.stringify({
//                                     type: 'response.invitation',
//                                     response: 'accept',
//                                     friend_request_id: data.friend_request_id
//                                 }));
//                             } else if (result.dismiss === Swal.DismissReason.cancel) {
//                                 socket.send(JSON.stringify({
//                                     type: 'response.invitation',
//                                     response: 'reject',
//                                     friend_request_id: data.friend_request_id
//                                 }));
//                             }
//                         });
//                     }
//                 };
//                 // refreshHomePage();
//                 window.history.pushState({}, "", "/homePage");
//                 handleLocation();
//             }
//             else
//             {
//                 if (data.status == "error")
//                     alert(data.msgError);
//             }})
//         }
//     };
