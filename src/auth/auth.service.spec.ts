import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';

import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(null);
      await expect(service.generateToken(1)).rejects.toThrow(NotFoundException);
    });

    it('should return a token if user exists', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(new User());
      const token = await service.generateToken(1);
      expect(token).toBe('mockToken');
    });
  });
});
