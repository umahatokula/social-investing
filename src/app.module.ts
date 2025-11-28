import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BrokerageModule } from './brokerage/brokerage.module';
import { TradeModule } from './trade/trade.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PerformanceModule } from './performance/performance.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { FollowModule } from './follow/follow.module';
import { CopyTradeModule } from './copy-trade/copy-trade.module';
import { ActivityModule } from './activity/activity.module';
import { AdminModule } from './admin/admin.module';
import { SyncModule } from './sync/sync.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule, UserModule, PrismaModule, BrokerageModule, TradeModule, PortfolioModule, PerformanceModule, LeaderboardModule, FollowModule, CopyTradeModule, ActivityModule, AdminModule, SyncModule, HealthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
