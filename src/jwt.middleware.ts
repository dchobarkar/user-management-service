import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as unknown as { sub: number };
        req['user'] = { id: decoded.sub };
      } catch (err) {
        console.error('Failed to decode JWT', err);
      }
    }
    next();
  }
}
