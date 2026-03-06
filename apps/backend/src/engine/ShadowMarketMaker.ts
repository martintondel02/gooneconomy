import { MatchingEngine } from './MatchingEngine.js';

export class ShadowMarketMaker {
  private engine: MatchingEngine;
  private momentums: Map<string, number> = new Map();
  
  constructor(engine: MatchingEngine) {
    this.engine = engine;
  }

  public tick() {
    const assets = this.engine.getAssets();
    
    assets.forEach(asset => {
      // 1. Momentum-based Random Walk
      // We keep track of a "velocity" for each asset so it trends naturally
      let currentMomentum = this.momentums.get(asset.id) || 0;
      
      // Random impulse (The "noise")
      const impulse = (Math.random() - 0.5) * 0.0002 * (asset.volatility || 1.0);
      
      // Decay momentum slightly (friction) + add new impulse
      currentMomentum = (currentMomentum * 0.95) + impulse;
      
      // 2. Manual Bias (Persistent drift from Admin Panel)
      const biasShift = asset.manualBias || 0;

      // 3. Mean Reversion (Institutional Anchor)
      // Pulls price back if it drifts > 50% from its base (not implemented yet, but keeping factor)
      
      // 4. Final Delta
      const totalShift = 1 + currentMomentum + biasShift;
      const newPrice = asset.currentPrice * totalShift;

      // Prevent zero/negative prices
      if (newPrice > 0.000001) {
        this.engine.updatePrice(asset.id, newPrice);
        this.momentums.set(asset.id, currentMomentum);
      } else {
        this.engine.updatePrice(asset.id, 0.01);
        this.momentums.set(asset.id, 0);
      }
    });
  }
}
