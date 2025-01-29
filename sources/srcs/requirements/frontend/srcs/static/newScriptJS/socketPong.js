// import socketIOClient from 'socket.io-client';

async function initializeSocket()
{
    console.log("JE SUIS DANS INITIALIZE SOCKET");
	socket = io(`wss://${window.location.host}`, {
        // path: '/socket.io',
        transports: ['websocket'],
        // reconnection: true,
        // reconnectionAttempts: 5,
        // reconnectionDelay: 1000,
        // reconnectionDelayMax: 5000,
        // timeout: 20000,
        // forceNew: true,
        // rejectUnauthorized: false,
        // secure: true,
        // autoConnect: true,
        // withCredentials: true
    });

    // Gestion des événements de connexion
    socket.on('connect_error', (error) => {
        console.error('Erreur de connexion détaillée:', {
            message: error.message,
            description: error.description,
            stack: error.stack,
            type: error.type
        });
        
        console.log("URL de connexion:", socket.io.uri);
        console.log("Options de transport actuelles:", socket.io.opts);
        console.log("État de la connexion:", socket.connected);
        
        // Ne forcez pas le polling si la connexion échoue
        // Laissez Socket.IO gérer automatiquement le fallback
    });

    socket.on('connect', () => {
        console.log('Connecté au serveur pong avec l\'ip: ' + window.location.hostname + ` sur le port: ${window.location.port} avec la socket: ` + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('disconnect', () => {
        console.log('Déconnecté du serveur pong avec l\'ip: ' + window.location.hostname + ` sur le port: ${window.location.port} avec la socket: ` + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('error', (data) => {
        // console.error('Erreur:', error);
		error = data.message;
		console.log("error: ", error, ", data.message: ", data.message);
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