import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if username already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(new User());
      await expect(
        service.create({ username: 'existingUser' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockReturnValueOnce(new User());
      jest.spyOn(repository, 'save').mockResolvedValueOnce(new User());

      const result = await service.create({ username: 'newUser' } as any);
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('findAll', () => {
    it('should return all users from cache if available', async () => {
      const users = [new User(), new User()];
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(users);
      const result = await service.findAll();
      expect(result).toEqual(users);
    });

    it('should return all users from database if not cached', async () => {
      const users = [new User(), new User()];
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'find').mockResolvedValueOnce(users);
      jest.spyOn(cacheManager, 'set').mockResolvedValueOnce(null);
      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(cacheManager.set).toHaveBeenCalledWith('users', users);
    });
  });

  describe('findOne', () => {
    it('should return user from cache if available', async () => {
      const user = new User();
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(user);
      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });

    it('should return user from database if not cached', async () => {
      const user = new User();
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(cacheManager, 'set').mockResolvedValueOnce(null);
      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(cacheManager.set).toHaveBeenCalledWith('user-1', user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = new User();
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest.spyOn(repository, 'save').mockResolvedValue(user);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(null);
      const result = await service.update(1, {
        username: 'updatedUser',
      } as any);
      expect(result).toEqual(user);
      expect(cacheManager.del).toHaveBeenCalledWith('users');
      expect(cacheManager.set).toHaveBeenCalledWith('user-1', user);
    });

    it('should throw ConflictException if updating username to one that already exists', async () => {
      const user = new User();
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(new User());
      await expect(
        service.update(1, { username: 'existingUser' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(null);
      await service.remove(1);
      expect(cacheManager.del).toHaveBeenCalledWith('user-1');
      expect(cacheManager.del).toHaveBeenCalledWith('users');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('blockUser', () => {
    it('should throw BadRequestException if user tries to block themselves', async () => {
      await expect(service.blockUser(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if blocked user does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      await expect(service.blockUser(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is already blocked', async () => {
      const user = new User();
      user.blockedUsers = [2];
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      await expect(service.blockUser(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should block the user', async () => {
      const user = new User();
      user.blockedUsers = [];
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      await service.blockUser(1, 2);
      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('unblockUser', () => {
    it('should throw NotFoundException if user is not blocked', async () => {
      const user = new User();
      user.blockedUsers = [];
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      await expect(service.unblockUser(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should unblock the user', async () => {
      const user = new User();
      user.blockedUsers = [2];
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      await service.unblockUser(1, 2);
      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('search', () => {
    it('should return users based on search criteria', async () => {
      const users = [new User(), new User()];
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ blockedUsers: [] } as User);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      } as any);

      const result = await service.search(1, 'testUser', 20, 30);
      expect(result).toEqual(users);
    });

    it('should exclude blocked users from search results', async () => {
      const users = [new User(), new User()];
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ blockedUsers: [2] } as User);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      } as any);

      const result = await service.search(1, 'testUser', 20, 30);
      expect(result).toEqual(users);
    });
  });
});
