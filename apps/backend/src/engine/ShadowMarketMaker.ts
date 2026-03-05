import { MatchingEngine } from './MatchingEngine';

export class ShadowMarketMaker {
  private engine: MatchingEngine;
  private assetIds: string[];
  private interval: NodeJS.Timeout | null = null;
  
  constructor(engine: MatchingEngine, assetIds: string[]) {
    this.engine = engine;
    this.assetIds = assetIds;
  }

  public start() {
    // Every 5 seconds, inject some noise
    this.interval = setInterval(() => {
      this.assetIds.forEach(id => {
        const direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
        // Random volatility between 0.01% and 0.1%
        const magnitude = (Math.random() * 0.0009) + 0.0001; 
        
        this.engine.injectVolatility(id, direction, magnitude);
      });
    }, 5000);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
