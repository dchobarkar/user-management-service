import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.decode(token) as { sub: string } | null;
      if (decoded && decoded.sub)
        req['user'] = { id: parseInt(decoded.sub, 10) };
    } catch (err) {
      console.error('Failed to decode JWT', err);
    }
  }

  next();
}
