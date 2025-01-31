
async function initializeSocket()
{
	socket = io(`wss://${window.location.host}`, {
        transports: ['websocket'],
    });

    socket.on('connect_error', (error) => {
        console.error('Erreur de connexion détaillée:', {
            message: error.message,
            description: error.description,
            stack: error.stack,
            type: error.type
        }); 
    });

    socket.on('connect', () => {
        console.log('Connecté au serveur pong avec l\'ip: ' + window.location.hostname + ` sur le port: ${window.location.port} avec la socket: ` + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('disconnect', () => {
        console.log('Déconnecté du serveur pong avec l\'ip: ' + window.location.hostname + ` sur le port: ${window.location.port} avec la socket: ` + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('error', (data) => {
		error = data.message;
        alert(error);
        if (data.ErrorCode === 1 || data.ErrorCode === 2)
        {
            replace_location(URLs.VIEWS.HOME);
            socket.disconnect();
        }
		setTimeout( ()=> {
			error = null;
		}, 1000)
    });

    return socket;
}