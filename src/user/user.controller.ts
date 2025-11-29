import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.userService.findOne({ id: req.user.userId });
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() data: UpdateUserDto) {
    return this.userService.updateUser({
      where: { id: req.user.userId },
      data,
    });
  }
}
