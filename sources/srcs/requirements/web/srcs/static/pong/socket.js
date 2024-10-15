import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3000');

export default socket;

