import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { MatchingEngine } from './engine/MatchingEngine.js';
import { ShadowMarketMaker } from './engine/ShadowMarketMaker.js';
import { CandleStore } from './store/CandleStore.js';
import { PositionManager, PositionSide } from './manager/PositionManager.js';

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
const posManager = new PositionManager(engine);

const initialAssets = [
  { id: '1', ticker: 'GOON', name: 'GoonCoin', type: 'CRYPTO', price: 142.32 },
  { id: '2', ticker: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 64231.50 },
  { id: '3', ticker: 'ETH', name: 'Ethereum', type: 'CRYPTO', price: 3451.20 },
  { id: '4', ticker: 'PUMPKIN', name: 'PumpkinCoin', type: 'CRYPTO', price: 0.042 },
  { id: '5', ticker: 'MOSSAD', name: 'MossadCoin', type: 'CRYPTO', price: 1.00 },
  { id: '6', ticker: 'NVDA', name: 'Nvidia', type: 'STOCK', price: 892.12 },
  { id: '7', ticker: 'ORCL', name: 'Oracle', type: 'STOCK', price: 125.40 },
  { id: '8', ticker: 'AAPL', name: 'Apple', type: 'STOCK', price: 172.10 },
  { id: '9', ticker: 'TSLA', name: 'Tesla', type: 'STOCK', price: 165.30 },
  { id: '10', ticker: 'PLTR', name: 'Palantir', type: 'STOCK', price: 24.15 },
  { id: '11', ticker: 'GOLD', name: 'Gold', type: 'COMMODITY', price: 2145.00 },
];

initialAssets.forEach(asset => {
  engine.initAsset(asset.id, asset.ticker, asset.price);
});

const assetConfigs = initialAssets.map(a => ({
  id: a.id,
  volatility: a.ticker === 'GOON' ? 5 : (a.ticker === 'MOSSAD' || a.ticker === 'PUMPKIN' ? 10 : 1)
}));

const shadowMarketMaker = new ShadowMarketMaker(engine, assetConfigs);
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

app.post('/trade/open', (req, res) => {
  const { userId, assetId, side, margin, leverage } = req.body;
  const position = posManager.openPosition(userId, assetId, side as PositionSide, margin, leverage);
  res.json(position);
});

app.post('/trade/close', (req, res) => {
  const { positionId } = req.body;
  const result = posManager.closePosition(positionId);
  if (!result) return res.status(404).json({ error: 'Position not found' });
  res.json(result);
});

// Real-time price and candle update loop
setInterval(() => {
  const currentPrices = initialAssets.reduce((acc, asset) => {
    const currentPrice = engine.getCurrentPrice(asset.id);
    acc[asset.ticker] = currentPrice;
    candleStore.update(asset.id, currentPrice);
    return acc;
  }, {} as Record<string, number>);
  
  // Check liquidations
  const liquidations = posManager.checkLiquidations();
  if (liquidations.length > 0) {
    io.emit('market:liquidations', liquidations);
  }

  // Live PnL for active positions
  const activePositions = posManager.getActivePositions().map(p => ({
    ...p,
    pnl: posManager.calculatePnL(p),
    currentPrice: engine.getCurrentPrice(p.assetId)
  }));

  io.emit('market:prices', currentPrices);
  io.emit('user:positions', activePositions);
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
