import { MatchingEngine } from './MatchingEngine';

interface AssetConfig {
  id: string;
  volatility: number;
}

export class ShadowMarketMaker {
  private engine: MatchingEngine;
  private assets: AssetConfig[];
  private interval: NodeJS.Timeout | null = null;
  
  constructor(engine: MatchingEngine, assets: AssetConfig[]) {
    this.engine = engine;
    this.assets = assets;
  }

  public start() {
    // Every 5 seconds, inject some noise
    this.interval = setInterval(() => {
      this.assets.forEach(asset => {
        const direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
        // Base volatility modified by asset specific multiplier
        const baseVol = (Math.random() * 0.0009) + 0.0001; 
        const magnitude = baseVol * asset.volatility;
        
        this.engine.injectVolatility(asset.id, direction, magnitude);
      });
    }, 5000);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
