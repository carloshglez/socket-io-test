import openSocket from 'socket.io-client';

const  socket = openSocket('http://15.152.161.16:8000');

export function subscribeToChat(payload) {
    socket.emit('subscribeToChat', payload);
}

export function getConfirmSubscription(cb) {
    socket.on('confirmSubscription', (payload) => cb(null, payload));
}

export function sendPosition(eventInfo) {
    socket.emit('sendPosition', eventInfo);
}

export function getPosition(cb) {
    socket.on('getPosition', (payload) => cb(null, payload));
}

export function getUserDisconnected(cb) {
    socket.on('user disconnected', (playerNumberOut) => cb(null, playerNumberOut));
}
