import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getToken', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(service, 'generateToken')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getToken(1)).rejects.toThrow(NotFoundException);
    });

    it('should return a token if user exists', async () => {
      jest.spyOn(service, 'generateToken').mockResolvedValueOnce('mockToken');
      const result = await controller.getToken(1);
      expect(result).toEqual({ token: 'mockToken' });
    });
  });
});
