import { OrderBook, TradeType } from '@gooneconomy/shared';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../store/RedisManager.js';

const prisma = new PrismaClient();

export interface AssetData {
  id: string;
  ticker: string;
  name: string;
  type: string;
  currentPrice: number;
  totalSupply: number;
  volatility: number;
  manualBias: number;
}

export class MatchingEngine {
  private assets: Map<string, AssetData> = new Map();

  constructor() {}

  public async syncFromDb() {
    const dbAssets = await prisma.asset.findMany();
    
    for (const a of dbAssets) {
      // Try to recover high-frequency price from Redis first
      let activePrice = a.currentPrice;
      try {
        const cachedPrice = await redisClient.hGet('market:prices', a.id);
        if (cachedPrice) {
          activePrice = parseFloat(cachedPrice);
        }
      } catch (e) {
        console.warn(`Could not fetch cached price for ${a.ticker}`);
      }

      this.assets.set(a.id, {
        id: a.id,
        ticker: a.ticker,
        name: a.name,
        type: a.type,
        currentPrice: activePrice,
        totalSupply: a.totalSupply,
        volatility: a.volatility,
        manualBias: a.manualBias
      });
    }
  }

  public getAssets(): AssetData[] {
    return Array.from(this.assets.values());
  }

  public getAsset(id: string): AssetData | undefined {
    return this.assets.get(id);
  }

  public getCurrentPrice(assetId: string): number {
    return this.assets.get(assetId)?.currentPrice || 0;
  }

  public getOrderBook(assetId: string): OrderBook | undefined {
    const asset = this.assets.get(assetId);
    if (!asset) return undefined;

    const price = asset.currentPrice;
    const bids = [];
    const asks = [];

    // Realistic-ish depth generation
    for (let i = 1; i <= 15; i++) {
      const spread = 0.0002 * i; // Tight spread
      bids.push({
        price: price * (1 - spread),
        quantity: (Math.random() * 10 + 5) / (i * 0.5),
        total: 0
      });
      asks.push({
        price: price * (1 + spread),
        quantity: (Math.random() * 10 + 5) / (i * 0.5),
        total: 0
      });
    }

    return {
      assetId,
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price)
    };
  }

  public placeMarketOrder(userId: string, assetId: string, type: TradeType, quantity: number): { executedPrice: number; quantity: number } {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error("Asset not found");

    const impactFactor = 0.00002; // Institutional grade low impact
    const slippage = type === 'BUY' ? 1 + (quantity * impactFactor) : 1 - (quantity * impactFactor);
    const executedPrice = asset.currentPrice * slippage;

    asset.currentPrice = executedPrice;
    
    return { executedPrice, quantity };
  }

  public updatePrice(assetId: string, newPrice: number) {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.currentPrice = newPrice;
    }
  }

  // Fallback persistent sync for database
  public async persistPrices() {
    for (const asset of this.assets.values()) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { currentPrice: asset.currentPrice }
      });
    }
  }
}
