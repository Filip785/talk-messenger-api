import socketIO from 'socket.io';
import http from 'http';
import Message from './models/Message';
import { format } from 'date-fns';

export function initSocketIO(httpServer: http.Server) {
  const io = socketIO(httpServer);

  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('message-sent', async (conversationMessage) => {
      const msg = await Message.create({
        senderId: conversationMessage.senderId,
        receiverId: conversationMessage.receiverId,
        conversationId: conversationMessage.conversationId,
        message: conversationMessage.message,
        is_system: 0
      });

      const sender = await msg.getSender();

      const dateTimeCreated = new Date(msg.createdAt);

      const timeCreated = format(dateTimeCreated, 'hh:mm a');
      const dateCreated = format(dateTimeCreated, 'dd.MM.yyyy');

      msg.dataValues.createdAtTime = timeCreated;
      msg.dataValues.createdAt = dateCreated;

      io.sockets.emit('message-received', {
        ...msg.dataValues,
        Sender: sender.dataValues
      });
    });
  });
}