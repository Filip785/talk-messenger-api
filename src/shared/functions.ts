import { Request, Response } from 'express';
import logger from './Logger';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function generateAccessToken(username: string) {
  return jwt.sign(username, process.env.TOKEN_SECRET!);
}

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};
