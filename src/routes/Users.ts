import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { paramMissingError } from '@shared/constants';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

interface LoginData {
  username: string;
  password: string;
}

interface NewUserData {
  name: string;
  username: string;
  password: string;
  avatar: string;
}

router.post('/login', async (req: Request, res: Response) => {
  const loginData: LoginData = req.body.loginData;

  if (!loginData) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }
  const user: User = await User.findOne({
    where: {
      username: loginData.username
    },
    raw: true
  });

  if(!user) return res.status(UNAUTHORIZED).send({ error: 'unauthorized-user' });

  if(!bcrypt.compareSync(loginData.password, user.password)) return res.status(UNAUTHORIZED).send({ error: 'unauthorized-user' });

  const { password, createdAt, updatedAt, ...authUser } = user;

  return res.json({
    ...authUser,
    api_token: jwt.sign(authUser, process.env.TOKEN_SECRET!, { expiresIn: 60 * 60 })
  }).status(OK);
});

router.post('/create', async (req: Request, res: Response) => {
  const newUserData: NewUserData = req.body.userData;
  if (!newUserData) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }

  newUserData.password = bcrypt.hashSync(newUserData.password, 10);
  newUserData.avatar = 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';

  try {
    await User.create(newUserData);
  } catch(err) {
    if(err.errors[0].type !== 'unique violation') {
      return res.status(BAD_REQUEST).send({
        error: 'unknown-cu-error'
      }); 
    }

    return res.status(BAD_REQUEST).send({
      error: 'unique-cu-username'
    });
  }

  return res.json({
    done: 'true'
  }).status(OK);
});

export default router;
