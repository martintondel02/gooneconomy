import { PrismaClient } from '@prisma/client';
import { PositionManager } from './PositionManager.js';

const prisma = new PrismaClient();

export interface LeaderboardEntry {
  username: string;
  netWorth: number;
  statusScore: number;
  rank: number;
}

export class LeaderboardManager {
  private posManager: PositionManager;
  private mockUsers: any[] = [
    { id: 'mock-1', username: 'GoonWhale', cashBalance: 50000, statusScore: 500 },
    { id: 'mock-2', username: 'ShadowTrader', cashBalance: 5200, statusScore: 200 },
    { id: 'mock-3', username: 'PumpKing', cashBalance: 840, statusScore: 100 },
    { id: 'mock-4', username: 'MossadAgent', cashBalance: 2100, statusScore: 350 },
  ];

  constructor(posManager: PositionManager) {
    this.posManager = posManager;
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const realUsers = await prisma.user.findMany({
      take: 20
    });

    const allUsers = [...this.mockUsers, ...realUsers];
    const entries: LeaderboardEntry[] = [];

    for (const user of allUsers) {
      const positions = await this.posManager.getActivePositions(user.id);
      const unrealizedPnL = positions.reduce((acc: number, p: any) => acc + this.posManager.calculatePnL(p), 0);
      
      entries.push({
        username: user.username,
        netWorth: user.cashBalance + unrealizedPnL,
        statusScore: user.statusScore || 0,
        rank: 0
      });
    }

    return entries
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  public async getUser(userId: string) {
    if (userId.startsWith('mock-')) {
      return this.mockUsers.find(u => u.id === userId);
    }
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  }

  public async updateBalance(userId: string, amount: number) {
    if (userId.startsWith('mock-')) {
      const user = this.mockUsers.find(u => u.id === userId);
      if (user) user.cashBalance += amount;
      return;
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { cashBalance: { increment: amount } }
    });
  }
}
