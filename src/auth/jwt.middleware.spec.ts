import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

import { jwtMiddleware } from './jwt.middleware';

describe('JwtMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should call next function', () => {
    jwtMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should set user id in request if token is valid', () => {
    const decoded = { sub: '1' };
    jest.spyOn(jwt, 'decode').mockReturnValue(decoded);

    req.headers.authorization = 'Bearer mockToken';
    jwtMiddleware(req as Request, res as Response, next);

    expect(req['user']).toEqual({ id: 1 }); // Now expecting id as a number
    expect(next).toHaveBeenCalled();
  });

  it('should not set user id in request if token is invalid', () => {
    jest.spyOn(jwt, 'decode').mockReturnValue(null);

    req.headers.authorization = 'Bearer invalidToken';
    jwtMiddleware(req as Request, res as Response, next);

    expect(req['user']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
