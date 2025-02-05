// ./src/users/users.controller.ts

import { Get, Controller, Res, HttpStatus, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getUser(@Res() res) {
    const users = this.userService.getAllUsers();
    res.send(users);
  }
  @Post()
  getUsersLocation(@Res() res, @Body() user) {
    this.userService.postLocation(user);
    res.status(HttpStatus.OK).send("User's location fetched successfully");
  }
}
