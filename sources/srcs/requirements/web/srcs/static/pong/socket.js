import socketIOClient from 'socket.io-client';

let ip = "10.13.2.6";

const socket = socketIOClient('http://' + ip + ':3000');

export default socket;

