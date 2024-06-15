import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testUser',
        name: 'Test',
        surname: 'User',
        birthdate: '1990-01-01', // Use string instead of Date object
      };
      jest.spyOn(userService, 'create').mockResolvedValue(createUserDto as any);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(createUserDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testUser',
        name: 'Test',
        surname: 'User',
        birthdate: '1990-01-01', // Use string instead of Date object
      };
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new ConflictException());

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [new User(), new User()];
      jest.spyOn(userService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = new User();
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const user = new User();
      jest.spyOn(userService, 'update').mockResolvedValue(user);

      const result = await controller.update(1, updateUserDto);
      expect(result).toEqual(user);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw ConflictException if updating username to one that already exists', async () => {
      const updateUserDto: UpdateUserDto = { username: 'existingUser' };
      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(new ConflictException());

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(userService, 'remove').mockResolvedValue(undefined);

      await controller.remove(1);
      expect(userService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should return users based on search criteria', async () => {
      const users = [new User(), new User()];
      jest.spyOn(userService, 'search').mockResolvedValue(users);

      const req = { user: { id: 1 } };
      const query = { username: 'testUser', minAge: '20', maxAge: '30' };

      const result = await controller.search(
        req as any,
        query.username,
        query.minAge,
        query.maxAge,
      );
      expect(result).toEqual(users);
      expect(userService.search).toHaveBeenCalledWith(1, 'testUser', 20, 30);
    });
  });
});
