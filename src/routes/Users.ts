import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { paramMissingError } from '@shared/constants';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';

const router = Router();

interface LoginData {
  email: string;
  password: string;
}

interface NewUserData {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

interface JwtUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  iat: number;
  exp: number;
}

interface RequestWithUser extends Request {
  user?: JwtUser;
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
      email: loginData.email
    },
    raw: true
  });

  if(!user) return res.json({error: 'true'}).status(UNAUTHORIZED);

  if(!bcrypt.compareSync(loginData.password, user.password)) return res.json({error: 'true'}).status(UNAUTHORIZED);

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
      return res.json({
        error: 'unknown-cu-error'
      }).status(BAD_REQUEST); 
    }

    return res.json({
      error: 'unique-cu-email'
    }).status(BAD_REQUEST);
  }

  return res.json({
    done: 'true'
  }).status(OK);
});

router.get('/all', expressJwt({ secret: process.env.TOKEN_SECRET! }), async (req: RequestWithUser, res: Response) => {
  const users = await User.findAll();
  return res.json(users).status(OK);
});

export default router;
