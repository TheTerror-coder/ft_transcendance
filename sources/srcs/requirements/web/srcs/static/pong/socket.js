import socketIOClient from 'socket.io-client';

const ip = process.env.HOST_IP || "127.0.0.1";

const socket = socketIOClient('http://' + ip + ':3000');

export default socket;

