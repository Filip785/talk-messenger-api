import socketIO from 'socket.io';
import http from 'http';

export function initSocketIO(httpServer: http.Server) {
  const io = socketIO(httpServer);

  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('message-sent', (message) => {
      io.sockets.emit('message-received', message);
    })
  });
}