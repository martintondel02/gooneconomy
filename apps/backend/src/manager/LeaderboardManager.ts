import { PositionManager } from './PositionManager';

export interface LeaderboardEntry {
  username: string;
  netWorth: number;
  statusScore: number;
  rank: number;
}

export class LeaderboardManager {
  private posManager: PositionManager;
  private users: any[] = [
    { id: 'dev-user', username: 'GoonWhale', cashBalance: 1242, statusScore: 500 },
    { id: '2', username: 'ShadowTrader', cashBalance: 5200, statusScore: 200 },
    { id: '3', username: 'PumpKing', cashBalance: 840, statusScore: 100 },
    { id: '4', username: 'MossadAgent', cashBalance: 2100, statusScore: 350 },
  ];

  constructor(posManager: PositionManager) {
    this.posManager = posManager;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    const entries = this.users.map(user => {
      const positions = this.posManager.getActivePositions(user.id);
      const unrealizedPnL = positions.reduce((acc, p) => acc + this.posManager.calculatePnL(p), 0);
      
      return {
        username: user.username,
        netWorth: user.cashBalance + unrealizedPnL,
        statusScore: user.statusScore
      };
    });

    return entries
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  public getUser(userId: string) {
    return this.users.find(u => u.id === userId);
  }

  public updateBalance(userId: string, amount: number) {
    const user = this.getUser(userId);
    if (user) user.cashBalance += amount;
  }

  public claimStimulus(userId: string): { success: boolean; amount: number; nextClaimIn?: number } {
    const user = this.getUser(userId);
    if (!user) return { success: false, amount: 0 };

    const now = Date.now();
    const lastClaim = user.lastStimulusClaim || 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (now - lastClaim < cooldown) {
      return { 
        success: false, 
        amount: 0, 
        nextClaimIn: cooldown - (now - lastClaim) 
      };
    }

    const stimulusAmount = 100;
    user.cashBalance += stimulusAmount;
    user.lastStimulusClaim = now;

    return { success: true, amount: stimulusAmount };
  }
}
