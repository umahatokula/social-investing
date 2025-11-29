import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('activity')
@Controller('activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('feed')
  async getFeed(@Request() req) {
    return this.activityService.getFeed(req.user.userId);
  }

  @Get('global')
  async getGlobal() {
    return this.activityService.getGlobalFeed();
  }
}
