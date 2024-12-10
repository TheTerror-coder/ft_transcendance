// import socketIOClient from 'socket.io-client';

async function initializeSocket()
{
    console.log("JE SUIS DANS INITIALIZE SOCKET");
    const response = await fetch('/static/gameserver/config.json');
    console.log(response);
    if (!response.ok) {
        console.error('Erreur réseau : ' + response.statusText);
        ip = 'localhost';
    } else {
        const data = await response.json();
        ip = data.HOST_IP;
    }
    console.log("IP: ", ip);

    ip = 'localhost';

    // Configuration de la socket avec des options pour ��viter les reconnexions inutiles
    socket = io('wss://' + ip + ':1443', {
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
        console.log('Connecté au serveur pong avec l\'ip: ' + ip + ' sur le port: 3000 avec la socket: ' + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('disconnect', () => {
        console.log('Déconnecté du serveur pong avec l\'ip: ' + ip + ' sur le port: 3000 avec la socket: ' + socket.id + ' connected: ' + socket.connected);
    });

    socket.on('error', (error) => {
        console.error('Erreur socket:', error);
    });

    return socket;
}