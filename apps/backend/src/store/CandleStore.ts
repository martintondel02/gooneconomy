interface Candle {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = '1s' | '5s' | '15s' | '1m' | '5m' | '15m' | '1h' | '3h' | '12h' | '24h';

const TF_SECONDS: Record<Timeframe, number> = {
  '1s': 1,
  '5s': 5,
  '15s': 15,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '3h': 10800,
  '12h': 43200,
  '24h': 86400,
};

export class CandleStore {
  // assetId -> timeframe -> candles
  private history: Map<string, Map<Timeframe, Candle[]>> = new Map();
  // assetId -> timeframe -> current candle
  private current: Map<string, Map<Timeframe, Candle>> = new Map();

  public update(assetId: string, marketCap: number) {
    const nowSec = Math.floor(Date.now() / 1000);

    if (!this.history.has(assetId)) this.history.set(assetId, new Map());
    if (!this.current.has(assetId)) this.current.set(assetId, new Map());

    const assetHistory = this.history.get(assetId)!;
    const assetCurrent = this.current.get(assetId)!;

    (Object.keys(TF_SECONDS) as Timeframe[]).forEach(tf => {
      const duration = TF_SECONDS[tf];
      const candleStartTime = Math.floor(nowSec / duration) * duration;
      
      let candle = assetCurrent.get(tf);

      if (!candle || candle.time !== candleStartTime) {
        if (candle) {
          if (!assetHistory.has(tf)) assetHistory.set(tf, []);
          const history = assetHistory.get(tf)!;
          history.push(candle);
          if (history.length > 500) history.shift();
        }

        candle = {
          time: candleStartTime,
          open: marketCap,
          high: marketCap,
          low: marketCap,
          close: marketCap
        };
      } else {
        candle.high = Math.max(candle.high, marketCap);
        candle.low = Math.min(candle.low, marketCap);
        candle.close = marketCap;
      }

      assetCurrent.set(tf, candle);
    });
  }

  public getCandles(assetId: string, tf: Timeframe): Candle[] {
    const assetHistory = this.history.get(assetId);
    const history = assetHistory?.get(tf) || [];
    
    const assetCurrent = this.current.get(assetId);
    const current = assetCurrent?.get(tf);

    return current ? [...history, current] : history;
  }
}
