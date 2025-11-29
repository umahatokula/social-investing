import { PrismaService } from '../../src/prisma/prisma.service';

// Resets DB state between e2e runs by truncating all app tables.
export async function resetDb(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Notification","Activity","CopyTradeExecution","CopyTradeSession","Holding","Trade","PerformanceMetric","EquitySnapshot","MonthlyReturn","Follow","SyncLog","Flag","AdminAuditLog","BrokerAccount","User" RESTART IDENTITY CASCADE;`,
  );
}
