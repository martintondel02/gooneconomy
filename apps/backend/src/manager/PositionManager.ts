import { MatchingEngine } from '../engine/MatchingEngine';

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface Position {
  id: string;
  userId: string;
  assetId: string;
  side: PositionSide;
  entryPrice: number;
  quantity: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  isActive: boolean;
}

export class PositionManager {
  private positions: Position[] = [];
  private engine: MatchingEngine;

  constructor(engine: MatchingEngine) {
    this.engine = engine;
  }

  public openPosition(
    userId: string,
    assetId: string,
    side: PositionSide,
    margin: number,
    leverage: number
  ): Position {
    const currentPrice = this.engine.getCurrentPrice(assetId);
    
    // Quantity = (Margin * Leverage) / Price
    const quantity = (margin * leverage) / currentPrice;
    
    // Liquidation Price (approximate 90% margin loss)
    const liqBuffer = 0.9 / leverage;
    const liquidationPrice = side === PositionSide.LONG 
      ? currentPrice * (1 - liqBuffer)
      : currentPrice * (1 + liqBuffer);

    const position: Position = {
      id: Math.random().toString(36).substring(7),
      userId,
      assetId,
      side,
      entryPrice: currentPrice,
      quantity,
      leverage,
      margin,
      liquidationPrice,
      isActive: true
    };

    this.positions.push(position);
    return position;
  }

  public getActivePositions(userId?: string): Position[] {
    if (userId) {
      return this.positions.filter(p => p.userId === userId && p.isActive);
    }
    return this.positions.filter(p => p.isActive);
  }

  public calculatePnL(position: Position): number {
    const currentPrice = this.engine.getCurrentPrice(position.assetId);
    const priceDiff = position.side === PositionSide.LONG
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    return priceDiff * position.quantity;
  }

  public closePosition(positionId: string): { position: Position; pnl: number } | null {
    const idx = this.positions.findIndex(p => p.id === positionId && p.isActive);
    if (idx === -1) return null;

    const position = this.positions[idx];
    const pnl = this.calculatePnL(position);
    
    position.isActive = false;
    return { position, pnl };
  }

  public checkLiquidations(): { position: Position; pnl: number }[] {
    const liquidated: { position: Position; pnl: number }[] = [];
    
    this.positions.forEach(p => {
      if (!p.isActive) return;
      
      const currentPrice = this.engine.getCurrentPrice(p.assetId);
      const isLiquidated = p.side === PositionSide.LONG
        ? currentPrice <= p.liquidationPrice
        : currentPrice >= p.liquidationPrice;

      if (isLiquidated) {
        p.isActive = false;
        liquidated.push({ position: p, pnl: -p.margin });
      }
    });

    return liquidated;
  }
}
