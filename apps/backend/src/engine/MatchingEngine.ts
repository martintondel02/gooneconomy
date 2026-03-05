import { OrderBook, TradeType } from '@gooneconomy/shared';

interface Order {
  id: string;
  userId: string;
  assetId: string;
  type: TradeType;
  quantity: number;
  price: number;
  timestamp: number;
}

export class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private assets: Map<string, { ticker: string; currentPrice: number }> = new Map();

  constructor() {}

  public initAsset(assetId: string, ticker: string, initialPrice: number) {
    this.orderBooks.set(assetId, {
      assetId,
      bids: [], // Buy orders
      asks: []  // Sell orders
    });
    this.assets.set(assetId, { ticker, currentPrice: initialPrice });
  }

  public getOrderBook(assetId: string): OrderBook | undefined {
    return this.orderBooks.get(assetId);
  }

  public getCurrentPrice(assetId: string): number {
    return this.assets.get(assetId)?.currentPrice || 0;
  }

  public placeMarketOrder(userId: string, assetId: string, type: TradeType, quantity: number): { executedPrice: number; quantity: number } {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error("Asset not found");

    // In this simulation, market orders instantly match and move the price
    // based on "impact". For simplicity, we use the current price + slippage.
    const impactFactor = 0.0001; // 0.01% price impact per unit of volume
    const slippage = type === 'BUY' ? 1 + (quantity * impactFactor) : 1 - (quantity * impactFactor);
    const executedPrice = asset.currentPrice * slippage;

    // Update the price
    asset.currentPrice = executedPrice;
    
    // In a more complex version, we'd drain liquidity from the order book here
    
    return { executedPrice, quantity };
  }

  // Shadow Market Maker baseline movement
  public injectVolatility(assetId: string, direction: 'UP' | 'DOWN', magnitude: number) {
    const asset = this.assets.get(assetId);
    if (!asset) return;

    const shift = direction === 'UP' ? 1 + magnitude : 1 - magnitude;
    asset.currentPrice *= shift;
  }
}
