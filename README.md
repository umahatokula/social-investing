# Verified Social Investing Platform - Backend

This is the backend for the Verified Social Investing Platform, built with NestJS, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based auth with Passport.js.
- **User Management**: Profiles, avatars, and status.
- **Brokerage Integration**: Connect external broker accounts (simulated).
- **Trade Syncing**: Automatically sync trades from connected brokers.
- **Portfolio Tracking**: Calculate holdings and portfolio value.
- **Performance Metrics**: Calculate Total Return, Risk Score, etc.
- **Leaderboard**: Rank users by performance.
- **Social**: Follow users and copy their trades.
- **Activity Feed**: See what users you follow are doing.
- **Admin**: Ban users and view system logs.
- **Sync Engine**: Daily cron job to sync data and update metrics.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis (configured via Docker)
- **Testing**: Jest (Unit & E2E)

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/investing_db?schema=public"
    REDIS_URL="redis://localhost:6380"
    JWT_SECRET="super-secret-key"
    JWT_EXPIRATION="1d"
    ```

3.  **Start Database**
    ```bash
    docker-compose up -d
    ```

4.  **Run Migrations**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run Application**
    ```bash
    npm run start:dev
    ```

## Testing

- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`

## API Overview

- **Auth**: `/auth/register`, `/auth/login`
- **Brokerage**: `/brokerage/connect`, `/brokerage/accounts`
- **Trade**: `/trades/sync`, `/trades`
- **Portfolio**: `/portfolio/summary`, `/portfolio/holdings`
- **Performance**: `/performance/metrics`
- **Leaderboard**: `/leaderboard`
- **Follow**: `/follow/:id`, `/follow/followers`
- **CopyTrade**: `/copy-trade/:tradeId`
- **Activity**: `/activity/feed`
- **Admin**: `/admin/ban/:userId`, `/admin/logs`

## License

MIT
