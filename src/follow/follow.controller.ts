import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('follow')
@Controller('follow')
@UseGuards(AuthGuard('jwt'))
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiParam({ name: 'id', type: String })
  @Post(':id')
  async followUser(@Request() req, @Param('id') followingId: string) {
    return this.followService.followUser(req.user.userId, followingId);
  }

  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  async unfollowUser(@Request() req, @Param('id') followingId: string) {
    return this.followService.unfollowUser(req.user.userId, followingId);
  }

  @Get('followers')
  async getFollowers(@Request() req) {
    return this.followService.getFollowers(req.user.userId);
  }

  @Get('following')
  async getFollowing(@Request() req) {
    return this.followService.getFollowing(req.user.userId);
  }
}
