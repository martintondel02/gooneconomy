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

export interface LiveTrade {
  id: string;
  assetId: string;
  userId: string;
  username: string;
  type: TradeType;
  price: number;
  quantity: number;
  timestamp: number;
}

export class MatchingEngine {
  private assets: Map<string, AssetData> = new Map();
  private recentTrades: LiveTrade[] = [];

  constructor() {}

  public async syncFromDb() {
    const dbAssets = await prisma.asset.findMany();
    
    for (const a of dbAssets) {
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

    for (let i = 1; i <= 15; i++) {
      const spread = 0.0002 * i; 
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

  public recordTrade(trade: LiveTrade) {
    this.recentTrades.push(trade);
    if (this.recentTrades.length > 200) {
      this.recentTrades.shift(); // Keep last 200 trades globally in memory
    }
  }

  public getRecentTrades(assetId: string, limit: number = 20): LiveTrade[] {
    return this.recentTrades.filter(t => t.assetId === assetId).slice(-limit);
  }

  public clearRecentTrades() {
    this.recentTrades = [];
  }

  public updatePrice(assetId: string, newPrice: number) {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.currentPrice = newPrice;
    }
  }

  public async persistPrices() {
    for (const asset of this.assets.values()) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { currentPrice: asset.currentPrice }
      });
    }
  }
}
