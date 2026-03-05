interface Candle {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export class CandleStore {
  private candles: Map<string, Candle[]> = new Map();
  private currentCandle: Map<string, Candle> = new Map();

  public update(assetId: string, price: number) {
    const now = Math.floor(Date.now() / 60000) * 60; // start of the minute
    let candle = this.currentCandle.get(assetId);

    if (!candle || candle.time !== now) {
      if (candle) {
        // Save the finished candle
        const history = this.candles.get(assetId) || [];
        history.push(candle);
        // Keep only last 100 candles
        if (history.length > 100) history.shift();
        this.candles.set(assetId, history);
      }
      
      // Start a new candle
      candle = {
        time: now,
        open: price,
        high: price,
        low: price,
        close: price
      };
    } else {
      // Update existing candle
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
    }

    this.currentCandle.set(assetId, candle);
  }

  public getCandles(assetId: string): Candle[] {
    const history = this.candles.get(assetId) || [];
    const current = this.currentCandle.get(assetId);
    return current ? [...history, current] : history;
  }
}
