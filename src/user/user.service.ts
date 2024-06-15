import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    await this.cacheManager.del('users');
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const cachedUsers = await this.cacheManager.get<User[]>('users');
    if (cachedUsers) return cachedUsers;

    const users = await this.userRepository.find();
    await this.cacheManager.set('users', users);
    return users;
  }

  async findOne(id: number): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(`user-${id}`);
    if (cachedUser) return cachedUser;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    await this.cacheManager.set(`user-${id}`, user);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);

    const updatedUser = await this.findOne(id);

    await this.cacheManager.set(`user-${id}`, updatedUser);
    await this.cacheManager.del('users');
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${id} not found`);

    await this.cacheManager.del(`user-${id}`);
    await this.cacheManager.del('users');
  }

  async search(
    username?: string,
    minAge?: number,
    maxAge?: number,
  ): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    const currentDate = new Date();
    if (minAge !== undefined) {
      const minBirthdate = new Date(
        currentDate.getFullYear() - minAge,
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      query.andWhere('user.birthdate <= :minBirthdate', { minBirthdate });
    }

    if (maxAge !== undefined) {
      const maxBirthdate = new Date(
        currentDate.getFullYear() - maxAge,
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      query.andWhere('user.birthdate >= :maxBirthdate', { maxBirthdate });
    }

    return query.getMany();
  }

  async blockUser(userId: number, blockedUserId: number): Promise<User> {
    const user = await this.findOne(userId);

    if (user.blockedUsers.includes(blockedUserId)) {
      throw new NotFoundException(
        `User with ID ${blockedUserId} is already blocked`,
      );
    }

    user.blockedUsers.push(blockedUserId);
    await this.cacheManager.set(`user-${userId}`, user);
    await this.cacheManager.del('users');
    return this.userRepository.save(user);
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<User> {
    const user = await this.findOne(userId);

    user.blockedUsers = user.blockedUsers.filter((id) => id !== blockedUserId);

    await this.cacheManager.set(`user-${userId}`, user);
    await this.cacheManager.del('users');
    return this.userRepository.save(user);
  }
}
