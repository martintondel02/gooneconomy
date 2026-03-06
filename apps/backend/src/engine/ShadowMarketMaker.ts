import { MatchingEngine } from './MatchingEngine.js';

interface MarketEvent {
  magnitude: number; // Percentage shift per tick (e.g., 0.001 for 0.1% per 100ms)
  endTime: number;   // Timestamp when the event expires
}

export class ShadowMarketMaker {
  private engine: MatchingEngine;
  private momentums: Map<string, number> = new Map();
  private activeEvents: Map<string, MarketEvent> = new Map();
  
  constructor(engine: MatchingEngine) {
    this.engine = engine;
  }

  public tick() {
    const assets = this.engine.getAssets();
    const now = Date.now();
    
    assets.forEach(asset => {
      // 1. Momentum-based Random Walk
      let currentMomentum = this.momentums.get(asset.id) || 0;
      const impulse = (Math.random() - 0.5) * 0.0002 * (asset.volatility || 1.0);
      currentMomentum = (currentMomentum * 0.95) + impulse;
      
      // 2. TIMED MARKET EVENTS (The new Pump/Crash logic)
      let eventShift = 0;
      const event = this.activeEvents.get(asset.id);
      
      if (event) {
        if (now < event.endTime) {
          eventShift = event.magnitude;
        } else {
          // Event expired
          this.activeEvents.delete(asset.id);
        }
      }

      // 3. PERSISTENT MANUAL BIAS (The old logic, keeping for legacy)
      const biasShift = asset.manualBias || 0;

      // 4. Final Calculation
      const totalShift = 1 + currentMomentum + biasShift + eventShift;
      const newPrice = asset.currentPrice * totalShift;

      if (newPrice > 0.000001) {
        this.engine.updatePrice(asset.id, newPrice);
        this.momentums.set(asset.id, currentMomentum);
      } else {
        this.engine.updatePrice(asset.id, 0.01);
        this.momentums.set(asset.id, 0);
      }
    });
  }

  public setMarketEvent(assetId: string, magnitude: number, durationSeconds: number) {
    this.activeEvents.set(assetId, {
      magnitude,
      endTime: Date.now() + (durationSeconds * 1000)
    });
  }

  public clearEvents(assetId: string) {
    this.activeEvents.delete(assetId);
  }
}
