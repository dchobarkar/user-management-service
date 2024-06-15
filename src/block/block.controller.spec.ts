import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from './block.controller';
import { UserService } from '../user/user.service'; // Use relative path
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BlockController', () => {
  let controller: BlockController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [
        {
          provide: UserService,
          useValue: {
            blockUser: jest.fn(),
            unblockUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlockController>(BlockController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('blockUser', () => {
    it('should call userService.blockUser with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const params = { blockedUserId: '2' };
      await controller.blockUser(req as any, +params.blockedUserId); // Convert to number
      expect(userService.blockUser).toHaveBeenCalledWith(1, 2);
    });

    it('should throw BadRequestException if user tries to block themselves', async () => {
      jest
        .spyOn(userService, 'blockUser')
        .mockImplementation((userId, blockedUserId) => {
          if (userId === blockedUserId) {
            throw new BadRequestException(`You cannot block yourself`);
          }
          return Promise.resolve();
        });
      const req = { user: { id: 1 } };
      const params = { blockedUserId: '1' };
      await expect(
        controller.blockUser(req as any, +params.blockedUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(userService, 'blockUser')
        .mockRejectedValueOnce(new NotFoundException());
      const req = { user: { id: 1 } };
      const params = { blockedUserId: '2' };
      await expect(
        controller.blockUser(req as any, +params.blockedUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unblockUser', () => {
    it('should call userService.unblockUser with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const params = { blockedUserId: '2' };
      await controller.unblockUser(req as any, +params.blockedUserId); // Convert to number
      expect(userService.unblockUser).toHaveBeenCalledWith(1, 2);
    });

    it('should throw NotFoundException if user is not blocked', async () => {
      jest
        .spyOn(userService, 'unblockUser')
        .mockRejectedValueOnce(new NotFoundException());
      const req = { user: { id: 1 } };
      const params = { blockedUserId: '2' };
      await expect(
        controller.unblockUser(req as any, +params.blockedUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
