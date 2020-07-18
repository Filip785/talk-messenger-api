import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { paramMissingError } from '@shared/constants';
import User from '../models/User';
import Friend from '../models/Friend';
import Message from '../models/Message';
import expressJwt from 'express-jwt';
import { Op } from 'sequelize';
import { format, addHours } from 'date-fns';
import SystemConfigs from 'src/models/SystemConfigs';

const router = Router();

interface JwtUser {
  id: number;
  username: string;
  avatar: string;
  iat: number;
  exp: number;
}

interface RequestWithUser extends Request {
  user?: JwtUser;
}

interface FriendConversation {
  conversationId: number;
  friend?: Friend;
  lastMessage?: { message: string, createdAtTime: string, createdAt: string }
}

interface AddFriendData {
  addingId: number;
  friendId: number;
}

router.get('/get-friends', expressJwt({ secret: process.env.TOKEN_SECRET! }), async (req: RequestWithUser, res: Response) => {
  const currentUserId = Number(req.query.currentUserId);
  
  const userFriends: Friend[] = await Friend.findAll({
    where: {
      [Op.or]: {
        user_1: currentUserId,
        user_2: currentUserId
      },
      is_accepted: 1
    },
    include: [{
      model: User,
      as: 'User1',
      attributes: ['id', 'username', 'avatar'],
    }, {
      model: User,
      as: 'User2',
      attributes: ['id', 'username', 'avatar']
    }],
  });

  const friendsReturn: FriendConversation[] = [];

  if(userFriends.length > 0) {
    const friendsLength = userFriends.length;

    for (let x = 0; x < friendsLength; x++) {
      const item = userFriends[x];

      const lastMessage: Message | null = await Message.findOne({
        where: {
          conversationId: item.id
        },
        order: [ [ 'createdAt', 'DESC' ] ],
        raw: true
      });

      const friendsObject: FriendConversation = { conversationId: item.id, friend: Number(item.User1!.id) !== currentUserId ? item.User1 : item.User2, lastMessage: undefined };

      if(lastMessage) {
        const dateTime = new Date(lastMessage.createdAt);

        const createdAtTime = format(dateTime, 'hh:mm a');
        const createdAt = format(dateTime, 'dd.MM.yyyy');

        friendsObject.lastMessage = { message: lastMessage.message, createdAtTime, createdAt };
      }

      friendsReturn.push(friendsObject);
    }
  }

  return res.json(friendsReturn).status(OK);
});

router.get('/select-friend', expressJwt({ secret: process.env.TOKEN_SECRET! }), async (req: RequestWithUser, res: Response) => {
  const authUserId = Number(req.query.authUserId);
  const receiverId = Number(req.query.receiverId);

  const conversation: Friend | null = await Friend.findOne({
    where: {
      [Op.or]: [
        { user_1: authUserId, user_2: receiverId },
        { user_1: receiverId, user_2: authUserId }
      ]
    },
    raw: true
  });

  const messages: Message[] = await Message.findAll({
    attributes: ['id', 'message', 'isSystem', 'createdAt', 'conversationId', 'isSeen', 'isSeenAt'],
    where: {
      conversationId: conversation!.id
    },
    include: [{
      model: User,
      as: 'Receiver',
    }, {
      model: User,
      as: 'Sender',
    }, {
      model: Friend,
      as: 'Friend'
    }],
    order: [ [ 'id', 'ASC' ] ]
  });

  const newConversationMessage: string = await SystemConfigs.getNewConversationMessage();

  if (authUserId !== receiverId) {
    const lastItem = messages[messages.length - 1];
    lastItem.setDataValue('isSeenAt', format(addHours(lastItem.isSeenAt as Date, 2), `dd.MM.yyyy 'at' hh:mm a`));
  }

  return res.json({
    items: messages,
    conversationId: conversation!.id,
    newConversationMessage
  }).status(OK);
});

router.get('/possible-friends', expressJwt({ secret: process.env.TOKEN_SECRET! }), async (req: RequestWithUser, res: Response) => {
  const currentUserId = Number(req.query.currentUserId);
  const excluded = [ currentUserId ];

  const friends: Friend[] = await Friend.findAll({
    where: {
      [Op.or]: [
        { user_1: currentUserId },
        { user_2: currentUserId }
      ]
    },
    raw: true
  });

  if(friends.length > 0) {
    const friendsLength = friends.length;
    for(let x = 0; x < friendsLength; x++) {
      const friendObject = friends[x];
      if(currentUserId === Number(friendObject.user_1)) {
        excluded.push(Number(friendObject.user_2));
      } else {
        excluded.push(Number(friendObject.user_1));
      }
    }
  }

  const possibleFriends = await User.findAll({
    where: {
      id: {
        [Op.notIn]: excluded
      }
    }
  });

  return res.json(possibleFriends).status(OK);
});

router.get('/friend-requests', expressJwt({ secret: process.env.TOKEN_SECRET! }), async (req: RequestWithUser, res: Response) => {
  const currentUserId = Number(req.query.currentUserId);

  const friendRequests: Friend[] = await Friend.findAll({
    attributes: ['id'],
    where: {
      user_2: currentUserId,
      is_accepted: 0
    },
    include: [{
      model: User,
      as: 'User1',
      attributes: ['id', 'username', 'avatar']
    }],
  });

  return res.json({
    count: friendRequests.length,
    friendRequests
  }).status(OK);
});

router.post('/add-friend', async (req: RequestWithUser, res: Response) => {
  const addFriendData: AddFriendData = req.body.addFriendData;
  if (!addFriendData) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }

  try {
    await Friend.create({
      user_1: addFriendData.addingId,
      user_2: addFriendData.friendId,
      is_accepted: 0
    });
  } catch(err) {
    return res.status(BAD_REQUEST).send({
      error: 'unknown-af-error'
    }); 
  }

  return res.json({
    done: 'true'
  }).status(OK);
});

router.post('/accept-friend', async (req: RequestWithUser, res: Response) => {
  const addFriendData: AddFriendData = req.body.addFriendData;
  if (!addFriendData) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }

  let friendRelationship: Friend | null = null;
  let newConversationMessage: string | null = null;

  try {
    friendRelationship = await Friend.findOne({ where: { user_1: addFriendData.addingId, user_2: addFriendData.friendId } });
    
    newConversationMessage = await SystemConfigs.getNewConversationMessage();

    await friendRelationship!.update({
      is_accepted: 1
    });
  } catch(err) {
    return res.status(BAD_REQUEST).send({
      error: 'unknown-acf-error'
    }); 
  }

  return res.json({
    conversationId: friendRelationship!.id,
    newConversationMessage
  }).status(OK);
});

router.post('/deny-friend', async (req: RequestWithUser, res: Response) => {
  const addFriendData: AddFriendData = req.body.addFriendData;
  if (!addFriendData) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }

  try {
    const user: Friend | null = await Friend.findOne({ where: { user_1: addFriendData.addingId, user_2: addFriendData.friendId } });

    await user!.update({
      is_accepted: -1
    });
  } catch(err) {
    return res.status(BAD_REQUEST).send({
      error: 'unknown-df-error'
    }); 
  }

  return res.json({
    done: 'true'
  }).status(OK);
});

export default router;