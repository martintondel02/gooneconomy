import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { MatchingEngine } from './engine/MatchingEngine.js';
import { ShadowMarketMaker } from './engine/ShadowMarketMaker.js';
import { CandleStore } from './store/CandleStore.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 28081;

// Initialize Market Engines
const engine = new MatchingEngine();
const candleStore = new CandleStore();

const initialAssets = [
  { id: '1', ticker: 'GOON', name: 'GoonCoin', type: 'CRYPTO', price: 142.32 },
  { id: '2', ticker: 'TSLAX', name: 'Teslala', type: 'STOCK', price: 420.69 },
  { id: '3', ticker: 'GOLD', name: 'Gold', type: 'COMMODITY', price: 2145.00 },
];

initialAssets.forEach(asset => {
  engine.initAsset(asset.id, asset.ticker, asset.price);
});

const shadowMarketMaker = new ShadowMarketMaker(engine, initialAssets.map(a => a.id));
shadowMarketMaker.start();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/assets', (req, res) => {
  const assets = initialAssets.map(asset => ({
    ...asset,
    currentPrice: engine.getCurrentPrice(asset.id)
  }));
  res.json(assets);
});

app.get('/candles/:assetId', (req, res) => {
  const { assetId } = req.params;
  const candles = candleStore.getCandles(assetId);
  res.json(candles);
});

// Real-time price and candle update loop
setInterval(() => {
  const prices = initialAssets.reduce((acc, asset) => {
    const currentPrice = engine.getCurrentPrice(asset.id);
    acc[asset.ticker] = currentPrice;
    
    // Update candle store
    candleStore.update(asset.id, currentPrice);
    
    return acc;
  }, {} as Record<string, number>);
  
  io.emit('market:prices', prices);
}, 1000);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`GoonEconomy Backend listening on port ${port}`);
});
