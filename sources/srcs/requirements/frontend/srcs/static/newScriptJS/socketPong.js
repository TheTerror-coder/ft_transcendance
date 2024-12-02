// import socketIOClient from 'socket.io-client';

async function initializeSocket()
{
    console.log("JE SUIS DANS INITIALIZE SOCKET");
    const response = await fetch('/static/config.json');
    if (!response.ok) {
        console.error('Erreur réseau : ' + response.statusText);
        ip = 'localhost';
    } else {
        const data = await response.json();
        ip = data.HOST_IP;
    }
    
    // Configuration de la socket avec des options pour éviter les reconnexions inutiles
    socket = socketIOClient('http://' + ip + ':3000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket'],
        forceNew: false
    });

    // Gestion des événements de connexion
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });

    socket.on('connect', () => {
        console.log('Connecté au serveur pong avec l\'ip: ' + ip + ' sur le port: 3000 avec la socket: ' + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('disconnect', () => {
        console.log('Déconnecté du serveur pong avec l\'ip: ' + ip + ' sur le port: 3000 avec la socket: ' + socket.id + ' connected: ' + socket.connected);
    });

    return socket;
}