interface Candle {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = '1s' | '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '3h' | '4h' | '12h' | '24h' | '1d';

const TF_SECONDS: Record<string, number> = {
  '1s': 1,
  '5s': 5,
  '10s': 10,
  '15s': 15,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '3h': 10800,
  '4h': 14400,
  '12h': 43200,
  '24h': 86400,
  '1d': 86400,
};

export class CandleStore {
  // assetId -> timeframe -> candles
  private history: Map<string, Map<string, Candle[]>> = new Map();
  // assetId -> timeframe -> current candle
  private current: Map<string, Map<string, Candle>> = new Map();

  public update(assetId: string, price: number) {
    const nowSec = Math.floor(Date.now() / 1000);

    if (!this.history.has(assetId)) this.history.set(assetId, new Map());
    if (!this.current.has(assetId)) this.current.set(assetId, new Map());

    const assetHistory = this.history.get(assetId)!;
    const assetCurrent = this.current.get(assetId)!;

    (Object.keys(TF_SECONDS)).forEach(tf => {
      const duration = TF_SECONDS[tf];
      const candleStartTime = Math.floor(nowSec / duration) * duration;
      
      let candle = assetCurrent.get(tf);

      // If timeframe rolled over or doesn't exist
      if (!candle || candle.time !== candleStartTime) {
        if (candle) {
          if (!assetHistory.has(tf)) assetHistory.set(tf, []);
          const history = assetHistory.get(tf)!;
          history.push(candle);
          if (history.length > 1000) history.shift();
        }

        // New Candle - INITIALIZED WITH PREVIOUS CLOSE OR CURRENT PRICE
        const prevClose = candle ? candle.close : price;
        candle = {
          time: candleStartTime,
          open: prevClose,
          high: Math.max(prevClose, price),
          low: Math.min(prevClose, price),
          close: price
        };
      } else {
        // MULTI-TICK UPDATE: TRACK HIGH/LOW
        candle.high = Math.max(candle.high, price);
        candle.low = Math.min(candle.low, price);
        candle.close = price;
      }

      assetCurrent.set(tf, candle);
    });
  }

  public getCandles(assetId: string, tf: string): Candle[] {
    const assetHistory = this.history.get(assetId);
    const history = assetHistory?.get(tf) || [];
    
    const assetCurrent = this.current.get(assetId);
    const current = assetCurrent?.get(tf);

    return current ? [...history, current] : history;
  }

  public clearAll() {
    this.history.clear();
    this.current.clear();
  }
}
