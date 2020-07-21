import socketIO from 'socket.io';
import http from 'http';
import { Op } from 'sequelize';
import Friend from './models/Friend';
import Message from './models/Message';
import { format, addHours } from 'date-fns';

export function initSocketIO(httpServer: http.Server) {
  const io = socketIO(httpServer);

  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('join-rooms', async (params) => {
      const currentUserId = params.id;

      const friendships: Friend[] = await Friend.findAll({
        where: {
          [Op.or]: {
            user_1: currentUserId,
            user_2: currentUserId
          },
          is_accepted: 1
        },
        raw: true
      });

      const friendshipAmount = friendships.length;

      for(let x = 0; x < friendshipAmount; x++) {
        socket.join(`${friendships[x].id}`);
      }
    });

    socket.on('message-sent', async (conversationMessage) => {
      const msg = await Message.create({
        senderId: conversationMessage.senderId,
        receiverId: conversationMessage.receiverId,
        conversationId: conversationMessage.conversationId,
        message: conversationMessage.message,
        isSystem: 0,
        // isSeen and isSeenAt default
      });
      
      const sender = await msg.getSender();

      const dateTimeCreated = new Date(msg.createdAt);

      msg.setDataValue('createdAtTime', format((dateTimeCreated.valueOf() + dateTimeCreated.getTimezoneOffset() * 60 * 1000), `hh:mm 'at' a`));
      msg.setDataValue('createdAt', format(dateTimeCreated, 'dd.MM.yyyy'));
      msg.setDataValue('isSeenAt', format(addHours(msg.getDataValue('isSeenAt') as Date, 2), `dd.MM.yyyy 'at' hh:mm a`));


      io.to(`${conversationMessage.conversationId}`).emit('message-received', {
        ...msg.get({ plain: true }),
        Sender: sender.get({ plain: true })
      });
    });

    socket.on('message-seen', async (msgId: number, conversationId: number) => {
      const isSeenAt = format(new Date(), 'yyyy-MM-dd hh:mm a');

      const msg = await Message.update({
        //isSeen: 1,
        isSeenAt
      }, { where: { id: msgId } });
      
      io.to(`${conversationId}`).emit('message-seen-update', format(new Date(isSeenAt), `dd.MM.yyyy 'at' hh:mm a`));
    });
  });
}