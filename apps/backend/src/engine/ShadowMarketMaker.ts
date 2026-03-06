import { MatchingEngine, LiveTrade } from './MatchingEngine.js';
import { redisClient } from '../store/RedisManager.js';

interface MarketEvent {
  magnitude: number; 
  endTime: number;   
}

export class ShadowMarketMaker {
  private engine: MatchingEngine;
  private momentums: Map<string, number> = new Map();
  private activeEvents: Map<string, MarketEvent> = new Map();
  private isRecovered = false;
  
  constructor(engine: MatchingEngine) {
    this.engine = engine;
  }

  public async recoverState() {
    try {
      const savedMomentums = await redisClient.hGetAll('market:momentums');
      for (const [assetId, momentum] of Object.entries(savedMomentums)) {
        this.momentums.set(assetId, parseFloat(momentum));
      }
      this.isRecovered = true;
      console.log('ShadowMarketMaker state recovered from Redis');
    } catch (e) {
      console.warn('Failed to recover MarketMaker state from Redis');
      this.isRecovered = true; 
    }
  }

  public async tick() {
    if (!this.isRecovered) return;

    const assets = this.engine.getAssets();
    const now = Date.now();
    
    const priceUpdates: Record<string, string> = {};
    const momentumUpdates: Record<string, string> = {};

    assets.forEach(asset => {
      // 1. Momentum-based Random Walk
      let currentMomentum = this.momentums.get(asset.id) || 0;
      const impulse = (Math.random() - 0.5) * 0.0002 * (asset.volatility || 1.0);
      currentMomentum = (currentMomentum * 0.95) + impulse;
      
      // 2. TIMED MARKET EVENTS
      let eventShift = 0;
      const event = this.activeEvents.get(asset.id);
      if (event) {
        if (now < event.endTime) {
          eventShift = event.magnitude;
        } else {
          this.activeEvents.delete(asset.id);
        }
      }

      // 3. PERSISTENT MANUAL BIAS
      const biasShift = asset.manualBias || 0;

      // 4. Final Calculation
      const totalShift = 1 + currentMomentum + biasShift + eventShift;
      const newPrice = asset.currentPrice * totalShift;

      if (newPrice > 0.000001) {
        this.engine.updatePrice(asset.id, newPrice);
        this.momentums.set(asset.id, currentMomentum);
        priceUpdates[asset.id] = newPrice.toString();
        momentumUpdates[asset.id] = currentMomentum.toString();
      } else {
        this.engine.updatePrice(asset.id, 0.01);
        this.momentums.set(asset.id, 0);
        priceUpdates[asset.id] = '0.01';
        momentumUpdates[asset.id] = '0';
      }

      // Randomly inject a bot trade (5% chance per tick per asset)
      if (Math.random() > 0.95) {
         const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
         const quantity = Math.random() * (100 / newPrice);
         
         const botTrade: LiveTrade = {
            id: Math.random().toString(36).substring(2, 9),
            assetId: asset.id,
            userId: 'SYSTEM_BOT',
            username: 'Shadow_Node',
            type,
            price: newPrice,
            quantity,
            timestamp: Date.now()
         };
         this.engine.recordTrade(botTrade);
      }
    });

    if (redisClient.isOpen && Object.keys(priceUpdates).length > 0) {
      redisClient.hSet('market:prices', priceUpdates).catch(e => console.error('Redis Price Sync Error', e));
      redisClient.hSet('market:momentums', momentumUpdates).catch(e => console.error('Redis Momentum Sync Error', e));
    }
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

  public async hardReset() {
    this.momentums.clear();
    this.activeEvents.clear();
    if (redisClient.isOpen) {
      await redisClient.del('market:momentums');
      await redisClient.del('market:prices');
    }
  }
}
