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

  public tick() {
    this.assets.forEach(asset => {
      const direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
      const baseVol = (Math.random() * 0.0009) + 0.0001; 
      const magnitude = baseVol * asset.volatility;
      this.engine.injectVolatility(asset.id, direction, magnitude);
    });
  }

  public start() {
    // Legacy support, but we'll use tick() directly
    this.interval = setInterval(() => this.tick(), 5000);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
