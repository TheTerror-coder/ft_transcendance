
async function addFriend()
{
	try {
		const usernameAddValue = document.getElementById("usernameAddFriend").value;
		const bad_input = /^[^<>]+$/;
		if (!bad_input.test(usernameAddValue)) {
			alert("Invalid input.");
			return;
		}
		const data = {"username": usernameAddValue};
		const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
		const resp = await makeRequest('POST', URLs.USERMANAGEMENT.USERSOCKET, user);
		if (ONE_SOCKET?.readyState != 0 && ONE_SOCKET?.readyState != 1)
			await callWebSockets();
		const response = await makeRequest('POST', URLs.USERMANAGEMENT.ADDFRIEND, data);
		if (response.status === 'success') {
			alert('Friend request sent at ', usernameAddValue);
			if (ONE_SOCKET) {
				if (ONE_SOCKET?.readyState === WebSocket.OPEN)
					sendInvitation(data.username);
				else if (ONE_SOCKET?.readyState === WebSocket.CONNECTING) {
					await waitForSocketOpen();
					sendInvitation(data.username);
				}
				else {
					console.error('WebSocket connection is not open. readyState:', ONE_SOCKET);
					console.error('WebSocket connection is not open. readyState:', ONE_SOCKET.readyState);
				}
				// ONE_SOCKET.onmessage = async function (event) {
				// 	await handleFriendInvitation(event);
				// };
			}
		} else {
			alert(response.message);
		}
	} catch (error) {
		console.log(`addFriend() an exception happened:` + error);
	}
}

function waitForSocketOpen() {
	try {
		return new Promise((resolve, reject) => {
			if (ONE_SOCKET?.readyState === WebSocket.OPEN) {
				resolve();
			} else {
				ONE_SOCKET.addEventListener('open', () => {
					resolve();
				});
	
				ONE_SOCKET.addEventListener('error', (err) => {
					reject(new Error('WebSocket connection failed: ' + err));
				});
			}
		});
	} catch (error) {
		console.log(`waitForSocketOpen() an exception happened:` + error);
	}
}


function sendInvitation(username) {
	console.log('****************sendInvitation()*************');
	try {
		ONE_SOCKET.send(JSON.stringify({
			'username': username,
			'type': 'invitation',
			'room_name': 'add_friend'
		}));
		
		// ONE_SOCKET.onmessage = function(event) {
		// 	var data = JSON.parse(event.data);
		// 	console.log('****************sendInvitation() alert *************', data);
		// 	if (data.type === 'invitation') {
		// 		var acceptButton = document.createElement('button');
		// 		acceptButton.textContent = 'Accept';
		// 		acceptButton.onclick = function() {
		// 			ONE_SOCKET.send(JSON.stringify({
		// 				type: 'response.invitation',
		// 				response: 'accept',
		// 				friend_request_id: data.friend_request_id
		// 			}));
		// 		};
		// 		var rejectButton = document.createElement('button');
		// 		rejectButton.textContent = 'Reject';
		// 		rejectButton.onclick = function() {
		// 			ONE_SOCKET.send(JSON.stringify({
		// 				type: 'response.invitation',
		// 				response: 'reject',
		// 				friend_request_id: data.friend_request_id
		// 			}));
		// 		};
		// 		document.body.appendChild(acceptButton);
		// 		document.body.appendChild(rejectButton);
		// 	}
		// };
		// ONE_SOCKET.onerror = function(error) {
		// 	console.error("WebSocket error:", error);
		// };
		// ONE_SOCKET.onclose = function(event) {
		// 	console.log("WebSocket connection closed:", event);
		// };
	} catch (error) {
		console.log('sendInvitation() an exception happenned ' + error);
	}
}