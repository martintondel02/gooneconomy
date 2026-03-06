import { PrismaClient } from '@prisma/client';
import { MatchingEngine } from '../engine/MatchingEngine.js';

const prisma = new PrismaClient();

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export class PositionManager {
  private engine: MatchingEngine;

  constructor(engine: MatchingEngine) {
    this.engine = engine;
  }

  public async openPosition(
    userId: string,
    assetId: string,
    side: PositionSide,
    margin: number,
    leverage: number
  ) {
    const currentPrice = this.engine.getCurrentPrice(assetId);
    
    // Quantity = (Margin * Leverage) / Price
    const quantity = (margin * leverage) / currentPrice;
    
    // Liquidation Price (approximate 90% margin loss)
    const liqBuffer = 0.9 / leverage;
    const liquidationPrice = side === PositionSide.LONG 
      ? currentPrice * (1 - liqBuffer)
      : currentPrice * (1 + liqBuffer);

    const position = await prisma.position.create({
      data: {
        userId,
        assetId,
        side: side as any,
        entryPrice: currentPrice,
        quantity,
        leverage,
        margin,
        liquidationPrice,
        isActive: true
      }
    });

    // Deduct margin from user balance
    await prisma.user.update({
      where: { id: userId },
      data: { cashBalance: { decrement: margin } }
    });

    return position;
  }

  public async getActivePositions(userId?: string) {
    return await prisma.position.findMany({
      where: {
        ...(userId ? { userId } : {}),
        isActive: true
      }
    });
  }

  public calculatePnL(position: any): number {
    const currentPrice = this.engine.getCurrentPrice(position.assetId);
    const priceDiff = position.side === PositionSide.LONG
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    return priceDiff * position.quantity;
  }

  public async closePosition(positionId: string) {
    const position = await prisma.position.findUnique({
      where: { id: positionId, isActive: true }
    });

    if (!position) return null;

    const pnl = this.calculatePnL(position);
    
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { isActive: false, closedAt: new Date() }
    });

    // Return margin + pnl to user
    await prisma.user.update({
      where: { id: position.userId },
      data: { cashBalance: { increment: position.margin + pnl } }
    });

    return { position: updatedPosition, pnl };
  }

  public async checkLiquidations() {
    const activePositions = await this.getActivePositions();
    const liquidated: { position: any; pnl: number }[] = [];
    
    for (const p of activePositions) {
      const currentPrice = this.engine.getCurrentPrice(p.assetId);
      const isLiquidated = p.side === PositionSide.LONG
        ? currentPrice <= p.liquidationPrice
        : currentPrice >= p.liquidationPrice;

      if (isLiquidated) {
        await prisma.position.update({
          where: { id: p.id },
          data: { isActive: false, closedAt: new Date() }
        });
        
        // Margin is already deducted, so PnL for user is -margin (lost it all)
        liquidated.push({ position: p, pnl: -p.margin });
      }
    }

    return liquidated;
  }
}
