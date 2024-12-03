// import socketIOClient from 'socket.io-client';

async function initializeSocket()
{
    console.log("JE SUIS DANS INITIALIZE SOCKET");
    const response = await fetch('/static/config.json');
    console.log(response);
    if (!response.ok) {
        console.error('Erreur réseau : ' + response.statusText);
        ip = 'localhost';
    } else {
        const data = await response.json();
        ip = data.HOST_IP;
    }
    console.log("IP: ", ip);

    const caCert = await fetch('/usr/share/frontend/volumes/nginx/certs/ca/ca.crt');
    const clientCert = await fetch('/usr/share/frontend/volumes/nginx/certs/nginx.crt');
    const clientKey = await fetch('/usr/share/frontend/volumes/nginx/certs/nginx.key');
    if (!caCert.ok || !clientCert.ok || !clientKey.ok)
    {
        console.error('Erreur réseau : ' + caCert.statusText + ' ' + clientCert.statusText + ' ' + clientKey.statusText);
        return null;
    }
    else
    {
        const caCertData = await caCert.text();
        const clientCertData = await clientCert.text();
        const clientKeyData = await clientKey.text();
        console.log("CA CERT: ", caCertData);
        console.log("CLIENT CERT: ", clientCertData);
        console.log("CLIENT KEY: ", clientKeyData);
    }

    // Configuration de la socket avec des options pour éviter les reconnexions inutiles
    socket = io('wss://' + ip + ':1443', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket'],
        forceNew: false,
        secure: true,
        ca: caCertData,
        cert: clientCertData,
        key: clientKeyData,
        rejectUnauthorized: false
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