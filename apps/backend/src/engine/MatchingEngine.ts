import { OrderBook, TradeType } from '@gooneconomy/shared';

export interface Trade {
  id: string;
  assetId: string;
  type: TradeType;
  price: number;
  quantity: number;
  timestamp: number;
}

export class MatchingEngine {
  private assets: Map<string, { ticker: string; currentPrice: number; prevPrice: number }> = new Map();
  private trades: Trade[] = [];

  constructor() {}

  public initAsset(assetId: string, ticker: string, initialPrice: number) {
    this.assets.set(assetId, { 
      ticker, 
      currentPrice: initialPrice,
      prevPrice: initialPrice
    });
  }

  public getOrderBook(assetId: string): OrderBook | undefined {
    const asset = this.assets.get(assetId);
    if (!asset) return undefined;

    const price = asset.currentPrice;
    const bids = [];
    const asks = [];

    // Generate 15 levels of mock depth
    for (let i = 1; i <= 15; i++) {
      const spread = 0.0005 * i; // 0.05% per level
      const bidPrice = price * (1 - spread);
      const askPrice = price * (1 + spread);
      
      bids.push({
        price: bidPrice,
        quantity: Math.random() * 5 + (20 / i), // More liquidity closer to mid
        total: 0
      });

      asks.push({
        price: askPrice,
        quantity: Math.random() * 5 + (20 / i),
        total: 0
      });
    }

    return {
      assetId,
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price)
    };
  }

  public getCurrentPrice(assetId: string): number {
    return this.assets.get(assetId)?.currentPrice || 0;
  }

  public getRecentTrades(assetId?: string, limit: number = 20): Trade[] {
    const filtered = assetId 
      ? this.trades.filter(t => t.assetId === assetId)
      : this.trades;
    return filtered.slice(-limit).reverse();
  }

  public placeMarketOrder(userId: string, assetId: string, type: TradeType, quantity: number): { executedPrice: number; quantity: number } {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error("Asset not found");

    const impactFactor = 0.00005; 
    const slippage = type === 'BUY' ? 1 + (quantity * impactFactor) : 1 - (quantity * impactFactor);
    const executedPrice = asset.currentPrice * slippage;

    asset.prevPrice = asset.currentPrice;
    asset.currentPrice = executedPrice;

    const trade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      type,
      price: executedPrice,
      quantity,
      timestamp: Date.now()
    };
    
    this.trades.push(trade);
    if (this.trades.length > 500) this.trades.shift();
    
    return { executedPrice, quantity };
  }

  public injectVolatility(assetId: string, direction: 'UP' | 'DOWN', magnitude: number) {
    const asset = this.assets.get(assetId);
    if (!asset) return;

    const shift = direction === 'UP' ? 1 + magnitude : 1 - magnitude;
    asset.prevPrice = asset.currentPrice;
    asset.currentPrice *= shift;
    
    // Occasionally generate a small trade to show activity
    if (Math.random() > 0.7) {
      this.trades.push({
        id: Math.random().toString(36).substr(2, 9),
        assetId,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        price: asset.currentPrice,
        quantity: Math.random() * 2,
        timestamp: Date.now()
      });
    }
  }
}
