import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);

    const updatedUser = await this.findOne(id);

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${id} not found`);
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
    if (minAge) {
      const minBirthdate = new Date(
        currentDate.getFullYear() - minAge,
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      query.andWhere('user.birthdate <= :minBirthdate', { minBirthdate });
    }

    if (maxAge) {
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
    return this.userRepository.save(user);
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<User> {
    const user = await this.findOne(userId);

    user.blockedUsers = user.blockedUsers.filter((id) => id !== blockedUserId);

    return this.userRepository.save(user);
  }
}
