import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';
import { paramMissingError } from '@shared/constants';
import User from '../models/User';
import Friend from '../models/Friend';
import Message from '../models/Message';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import { Op } from 'sequelize';

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

interface FriendReturn {
  id: number;
  username: string;
  avatar: string;
}

interface FriendsFind {
  id: number;
  User1: FriendReturn;
  User2: FriendReturn;
}

interface FriendConversation {
  conversationId: number;
  friend: FriendReturn;
}

interface AddFriendData {
  addingId: number;
  friendId: number;
}

router.get('/get-friends', async (req: RequestWithUser, res: Response) => {
  const currentUserId = Number(req.query.currentUserId);
  
  const userFriends: FriendsFind[] = await Friend.findAll({
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
      if(Number(item.User1.id) !== currentUserId) {
        friendsReturn.push({
          conversationId: item.id,
          friend: item.User1
        });
        continue;
      }

      if(Number(item.User2.id) !== currentUserId) {
        friendsReturn.push({
          conversationId: item.id,
          friend: item.User2
        });
      }
    }
  }

  return res.json(friendsReturn).status(OK);
});

router.get('/select-friend', async (req: RequestWithUser, res: Response) => {
  const authUserId = Number(req.query.authUserId);
  const receiverId = Number(req.query.receiverId);

  const conversation: Friend = await Friend.findOne({
    where: {
      [Op.or]: [
        { user_1: authUserId, user_2: receiverId },
        { user_1: receiverId, user_2: authUserId }
      ]
    },
    raw: true
  });


  const messages = await Message.findAll({
    attributes: ['id', 'message', 'is_system', 'createdAt', 'conversationId'],
    where: {
      conversationId: conversation.id
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
    }]
  });

  return res.json({
    items: messages,
    conversationId: conversation.id
  }).status(OK);
});

router.get('/possible-friends', async (req: RequestWithUser, res: Response) => {
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

router.get('/friend-requests', async (req: RequestWithUser, res: Response) => {
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

  try {
    const user: Friend = await Friend.findOne({ where: { user_1: addFriendData.addingId, user_2: addFriendData.friendId } });

    await user.update({
      is_accepted: 1
    });
  } catch(err) {
    return res.status(BAD_REQUEST).send({
      error: 'unknown-acf-error'
    }); 
  }

  return res.json({
    done: 'true'
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
    const user: Friend = await Friend.findOne({ where: { user_1: addFriendData.addingId, user_2: addFriendData.friendId } });

    await user.update({
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