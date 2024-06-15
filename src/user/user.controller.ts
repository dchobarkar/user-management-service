import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  search(
    @Req() req: Request,
    @Query('username') username?: string,
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
  ) {
    const userId = req['user'].id;
    const minAgeNumber = minAge ? parseInt(minAge, 10) : undefined;
    const maxAgeNumber = maxAge ? parseInt(maxAge, 10) : undefined;
    return this.userService.search(
      userId,
      username,
      minAgeNumber,
      maxAgeNumber,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
