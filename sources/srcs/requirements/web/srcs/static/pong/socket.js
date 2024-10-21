import socketIOClient from 'socket.io-client';

let ip;

fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        console.log("data: " + data.HOST_IP);
        ip = data.HOST_IP;
    });

const socket = socketIOClient('http://' + ip + ':3000');

export default socket;

