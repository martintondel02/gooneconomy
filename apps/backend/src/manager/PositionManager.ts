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
    const quantity = (margin * leverage) / currentPrice;
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

    // Record the Opening Trade
    await prisma.trade.create({
      data: {
        userId,
        assetId,
        type: side === PositionSide.LONG ? 'BUY' : 'SELL',
        quantity,
        priceAtExecution: currentPrice,
        pnl: 0
      }
    });

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
    const currentPrice = this.engine.getCurrentPrice(position.assetId);
    
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { isActive: false, closedAt: new Date() }
    });

    // Record the Closing Trade
    await prisma.trade.create({
      data: {
        userId: position.userId,
        assetId: position.assetId,
        type: position.side === 'LONG' ? 'SELL' : 'BUY',
        quantity: position.quantity,
        priceAtExecution: currentPrice,
        pnl: pnl
      }
    });

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
      const isLiquidated = p.side === 'LONG'
        ? currentPrice <= p.liquidationPrice
        : currentPrice >= p.liquidationPrice;

      if (isLiquidated) {
        await prisma.position.update({
          where: { id: p.id },
          data: { isActive: false, closedAt: new Date() }
        });
        
        // Record the Liquidation Trade
        await prisma.trade.create({
          data: {
            userId: p.userId,
            assetId: p.assetId,
            type: p.side === 'LONG' ? 'SELL' : 'BUY',
            quantity: p.quantity,
            priceAtExecution: currentPrice,
            pnl: -p.margin
          }
        });

        liquidated.push({ position: p, pnl: -p.margin });
      }
    }

    return liquidated;
  }
}
